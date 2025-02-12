import request from 'supertest';
import express from 'express';
import { postAlertHandler } from './alerts';
import { sendMessage } from "../common";

jest.mock('../common/amqp', () => ({
    sendMessage: jest.fn().mockResolvedValue(async(message: string) => true)
}));

const app = express();
app.use(express.json());
app.post('/alert', postAlertHandler);

describe('postAlertHandler', () => {
    it('should return 400 if event data is invalid', async () => {
        const response = await request(app)
            .post('/alert')
            .send({
                location: 'Jerusalem',
                type: 'open',
                timestamp: '2023-10-01T00:00:00Z'
                // Missing duration
            });

        expect(response.status).toBe(400);
        //expect(response.text).toBe('Invalid event data');
    });

    it('should return 200 and process the event successfully', async () => {
        const sendMessageMock = sendMessage as jest.Mock;
        sendMessageMock.mockResolvedValue(true);

        const response = await request(app)
            .post('/alert')
            .send({
                location: 'Tel Aviv',
                type: 'open',
                timestamp: '2023-10-01T00:00:00Z',
                duration: 60
            });

        expect(response.status).toBe(200);
        const expectedPayload = JSON.stringify({
            location: 'Tel Aviv',
            type: 'open',
            timestamp: '2023-10-01T00:00:00Z',
            duration: 60
        });

        // Mocking randomUUID causes errors within the source code, so the uuid filed is removed totally.
        const actualPayload = sendMessageMock.mock.calls[0][0];
        const actualPayloadObj = JSON.parse(actualPayload);
        delete actualPayloadObj.uuid; // Assuming uuid is a part of the payload

        expect(actualPayloadObj).toEqual(JSON.parse(expectedPayload));
    });
});