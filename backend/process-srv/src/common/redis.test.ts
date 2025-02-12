import { Settings } from "../config";
import { connectRedis, setValue, getValue, publishMessage } from "./redis";

// Mock the redis package
jest.mock("redis", () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn(),
    disconnect: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    publish: jest.fn(),
    isOpen: true, // Simulating the Redis client being open
  }),
}));

describe("redis", () => {
    let mockRedisClient: any;

    beforeAll(() => {
        // Before all tests, create a mock instance of the Redis client
        mockRedisClient = require("redis").createClient();
    });

    it("should create a redis client", async () => {
        const client = await connectRedis();
        expect(client).toBeDefined();
        expect(client.isOpen).toBe(true);
        await client.disconnect();
    });

    it("should set a key-value pair in Redis", async () => {
        const key = "testKey";
        const value = "testValue";
        const expiryDate = new Date(Date.now() + 10000); // 10 seconds from now
        
        // Mock the Redis set command
        mockRedisClient.set.mockResolvedValue("OK"); // Simulate successful set

        await connectRedis();
        await setValue(key, value, expiryDate);

        // Check if set was called with the correct arguments
        // Ignore the { EX: number } because it is unpredictable  
        expect(mockRedisClient.set).toHaveBeenCalledWith(key, value, expect.objectContaining({ EX: expect.any(Number) })); // Redis set with expiry
    });

    it("should retrieve a value by key from Redis", async () => {
        const key = "testKey";
        const value = "testValue";
        const expiryDate = new Date(Date.now() + 10000); // 10 seconds from now

        // Mock the Redis get command
        mockRedisClient.get.mockResolvedValue(value); // Simulate Redis returning the value

        await connectRedis();
        await setValue(key, value, expiryDate); // Assume value is set
        const result = await getValue(key);

        // Assert that the result matches the expected value
        expect(result).toBe(value);
        expect(mockRedisClient.get).toHaveBeenCalledWith(key);
    });

    it("should publish a message to a Redis channel", async () => {
        const message = "testMessage";

        // Mock the Redis publish command
        mockRedisClient.publish.mockResolvedValue(1); // Simulate successful publish

        const publishSpy = jest.spyOn(mockRedisClient, "publish");

        await publishMessage(message);

        // Ensure the publish method is called with the correct arguments
        expect(publishSpy).toHaveBeenCalledWith(Settings.redis_pub_channel, message);
    });
});
