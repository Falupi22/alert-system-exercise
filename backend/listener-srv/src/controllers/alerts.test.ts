import request from 'supertest';
import express from 'express';
import { postAlertHandler } from './alerts';
import { Settings } from "../config";

jest.mock('../common/amqp');
jest.mock('crypto', () => ({
    randomUUID: jest.fn(() => 'test-uuid')
}));

const app = express();
app.use(express.json());
app.post('/alert', postAlertHandler);

describe('postAlertHandler', () => {
    it('should return 400 if event data is invalid', async () => {
        const response = await request(app)
            .post('/alert')
            .send({
                location: 'Location1',
                type: 'Type1',
                timestamp: '2023-10-01T00:00:00Z'
                // Missing duration
            });

        expect(response.status).toBe(400);
        //expect(response.text).toBe('Invalid event data');
    });

    it('should return 200 and process the event successfully', async () => {
        const sendMessage = jest.fn().mockResolvedValue(true);
        console.log(Settings.rabbit_address)

        const response = await request(app)
            .post('/alert')
            .send({
                location: 'Location1',
                type: 'Type1',
                timestamp: '2023-10-01T00:00:00Z',
                duration: 60
            });

        expect(response.status).toBe(200);
        expect(sendMessage).toHaveBeenCalledWith(JSON.stringify({
            location: 'Location1',
            type: 'Type1',
            timestamp: '2023-10-01T00:00:00Z',
            duration: 60,
            uuid: 'test-uuid'
        }));
    });
});