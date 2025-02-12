// test amqp sendMessage using jest

import { connectRabbit } from './amqp';
import { connect } from 'amqplib';

jest.mock('amqplib', () => ({
    connect: jest.fn()
}));

describe('connectRabbit', () => {
    let mockConnect: jest.Mock;
    let mockChannel: any;
    let mockConnection: any;

    beforeEach(() => {
        mockConnect = connect as jest.Mock;
        mockChannel = {
            assertQueue: jest.fn(),
            consume: jest.fn(),
            ack: jest.fn(),
            nack: jest.fn(),
            createChannel: jest.fn().mockResolvedValue({
                assertQueue: jest.fn(),
                consume: jest.fn(),
                ack: jest.fn(),
                nack: jest.fn()
            })
        };
        mockConnection = {
            createChannel: jest.fn().mockResolvedValue(mockChannel)
        };
        mockConnect.mockResolvedValue(mockConnection);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should connect to RabbitMQ and consume messages', async () => {
        const callback = jest.fn();
        await connectRabbit(callback);

        expect(mockConnect).toHaveBeenCalledWith(expect.any(String));
        expect(mockConnection.createChannel).toHaveBeenCalled();
        expect(mockChannel.assertQueue).toHaveBeenCalledWith(expect.any(String), { durable: true });
        expect(mockChannel.consume).toHaveBeenCalledWith(expect.any(String), expect.any(Function), { noAck: false });
    });

    it('should retry connection on failure', async () => {
        mockConnect.mockRejectedValueOnce(new Error('Connection failed'));
        const callback = jest.fn();
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        const connectPromise = connectRabbit(callback);

        await new Promise(resolve => setTimeout(resolve, 2100)); // Wait for retry delay

        expect(mockConnect).toHaveBeenCalledTimes(2);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error connecting to RabbitMQ:', expect.any(Error));
        expect(consoleLogSpy).toHaveBeenCalledWith('Retrying in 2 seconds...');

        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });

    it('should call the callback with the parsed event', async () => {
        const callback = jest.fn();
        await connectRabbit(callback);

        const message = {
            content: Buffer.from(JSON.stringify({ type: 'ALERT', message: 'Test alert' }))
        };

        const consumeCallback = mockChannel.consume.mock.calls[0][1];
        consumeCallback(message);

        expect(callback).toHaveBeenCalledWith({ type: 'ALERT', message: 'Test alert' });
        expect(mockChannel.ack).toHaveBeenCalledWith(message);
    });

    it('should nack the message on processing error', async () => {
        const callback = jest.fn();
        await connectRabbit(callback);

        const message = {
            content: Buffer.from('Invalid JSON')
        };

        const consumeCallback = mockChannel.consume.mock.calls[0][1];
        consumeCallback(message);

        expect(callback).not.toHaveBeenCalled();
        expect(mockChannel.nack).toHaveBeenCalledWith(message);
    });
});

