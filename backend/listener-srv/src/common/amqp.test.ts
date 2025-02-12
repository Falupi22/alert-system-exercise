import { connectRabbit, sendMessage } from './amqp';
import { connect, Connection, Channel } from 'amqplib';
import { Settings } from "../config";

jest.mock('amqplib', () => ({
    connect: jest.fn()
}));

describe('AMQP Tests', () => {
    let mockConnect: jest.Mock;
    let mockConnection: any;
    let mockChannel: any;

    beforeEach(() => {
        mockConnect = connect as jest.Mock;
        mockChannel = {
            assertQueue: jest.fn(),
            sendToQueue: jest.fn(),
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
    
    test('connectRabbit should connect to RabbitMQ', async () => {
        await connectRabbit();
        expect(connect).toHaveBeenCalledWith(Settings.rabbit_address);
    });

    test('connectRabbit should retry on failure', async () => {
        mockConnect.mockRejectedValueOnce(new Error('Connection failed'));
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        const connectPromise = connectRabbit();

        await new Promise(resolve => setTimeout(resolve, 2100)); // Wait for retry delay

        expect(mockConnect).toHaveBeenCalledTimes(2);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Error connecting to RabbitMQ:', expect.any(Error));
        expect(consoleLogSpy).toHaveBeenCalledWith('Retrying in 2 seconds...');

        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });

    /*test('sendMessage should send a message to the queue', async () => {
        const message = 'test message';
        const result = await sendMessage(message);

        //expect(mockConnection.createChannel).toHaveBeenCalled();
        //expect(mockChannel.assertQueue).toHaveBeenCalledWith(Settings.from_listener_queue_name, { durable: true });
        //expect(mockChannel.sendToQueue).toHaveBeenCalledWith(Settings.from_listener_queue_name, Buffer.from(message), { persistent: true });
        expect(result).toBe(true);
    });

    test('sendMessage should retry on failure', async () => {
        const message = 'test message';
        mockChannel.sendToQueue.mockImplementationOnce(() => {
            throw new Error('Send failed');
        });

        const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

        const resultPromise = sendMessage(message);
        await new Promise(resolve => setTimeout(resolve, 2100)); // Wait for retry

        expect(mockChannel.sendToQueue).toHaveBeenCalledTimes(2);
        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 2000);

    });*/
});