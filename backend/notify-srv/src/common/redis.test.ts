import redisMock from "redis-mock";
import redis from "./redis";
import { Settings } from "../config";
import { ProcessedAlertEvent } from "./types";

describe("redis", () => {
    it("should create a redis client", async () => {
        const messageCallback = jest.fn();
        const client = await redis(messageCallback);
        expect(client).toBeDefined();
        expect(client.isOpen).toBe(true);
    });
});