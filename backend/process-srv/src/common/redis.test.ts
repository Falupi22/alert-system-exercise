import redisMock from "redis-mock";
import { Settings } from "../config";
import { ProcessedAlertEvent } from "./types";
import {connectRedis, setValue, getValue, publishMessage } from "./redis";
import dayjs from "dayjs";

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
            const client = await connectRedis();

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
        })
});