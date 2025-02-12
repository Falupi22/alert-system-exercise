// test amqp sendMessage using jest

import { sendMessage } from './amqp';
import { AlertEvent } from './types';

jest.mock('./amqp', () => ({
    sendMessage: jest.fn()
}));

const { sendMessage: mockSendMessage } = require('./amqp');

mockSendMessage.mockResolvedValue(true);

describe('amqp sendMessage', () => {

    it('should call sendMessage function', async () => {
        const event: AlertEvent = {
            location: 'Tel Aviv',
            type: 'open',
            timestamp: '2023-10-01T00:00:00Z',
            duration: 60
        };

        await sendMessage(JSON.stringify(event));

        expect(mockSendMessage).toHaveBeenCalledTimes(1);
        expect(mockSendMessage).toHaveBeenCalledWith(JSON.stringify(event));

    });
});
