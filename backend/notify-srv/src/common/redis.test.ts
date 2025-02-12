import createClient from './redis';
import * as redis from 'redis';
import { Settings } from "../config";
import { ProcessedAlertEvent } from "./types";

jest.mock('redis');

describe('createClient', () => {
    let mockSubscriber: any;
    let messageCallback: jest.Mock;

    beforeEach(() => {
        mockSubscriber = {
            on: jest.fn(),
            connect: jest.fn(),
            subscribe: jest.fn(),
        };
        (redis.createClient as jest.Mock).mockReturnValue(mockSubscriber);
        messageCallback = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should create a Redis client and connect', async () => {
        await createClient(messageCallback);

        expect(redis.createClient).toHaveBeenCalledWith({ url: Settings.redis_address });
        expect(mockSubscriber.on).toHaveBeenCalledWith('error', expect.any(Function));
        expect(mockSubscriber.on).toHaveBeenCalledWith('connect', expect.any(Function));
        expect(mockSubscriber.connect).toHaveBeenCalled();
    });

    it('should subscribe to the Redis channel and handle messages', async () => {
        await createClient(messageCallback);

        const subscribeCallback = mockSubscriber.subscribe.mock.calls[0][1];
        const testMessage = JSON.stringify({ test: 'data' });
        subscribeCallback(testMessage, Settings.redis_pub_channel);

        expect(mockSubscriber.subscribe).toHaveBeenCalledWith(Settings.redis_pub_channel, expect.any(Function));
        expect(messageCallback).toHaveBeenCalledWith(JSON.parse(testMessage));
    });

    it('should log an error if subscription fails', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
        mockSubscriber.subscribe.mockImplementation(() => {
            throw new Error('Subscription error');
        });

        await createClient(messageCallback);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error subscribing to Redis channel:', expect.any(Error));
        consoleErrorSpy.mockRestore();
    });
});