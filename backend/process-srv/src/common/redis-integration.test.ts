/*
Used for cases where there is a running local instance of Redis with its address configured in the .env file
However this one is more precise than the one with the mocks.
*/

import { Settings } from "../config";
import {connectRedis, setValue, getValue, publishMessage } from "./redis";

describe("redis", () => {
    it("should create a redis client", async () => {
        const client = await connectRedis();
        expect(client).toBeDefined();
        expect(client.isOpen).toBe(true);
        await client.disconnect()
    });

    it("should set a key-value pair in Redis", async () => {
        const key = "testKey";
        const value = "testValue";
        const expiryDate = new Date(Date.now() + 10000); // 10 seconds from now
        await connectRedis();

        await setValue(key, value, expiryDate);
        const result = await getValue(key);

        expect(result).toBe(value);
    });

    it("should retrieve a value by key from Redis", async () => {
        const key = "testKey";
        const value = "testValue";
        const expiryDate = new Date(Date.now() + 10000); // 10 seconds from now
        await connectRedis();

        await setValue(key, value, expiryDate);
        const result = await getValue(key);

        expect(result).toBe(value);
    });

    it("should publish a message to a Redis channel", async () => {
        const message = "testMessage";
        const client = await connectRedis();

        const publishSpy = jest.spyOn(client, 'publish');

        await publishMessage(message);

        expect(publishSpy).toHaveBeenCalledWith(Settings.redis_pub_channel, message);
    });
});