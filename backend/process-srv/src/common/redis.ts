import { createClient, RedisClientType } from 'redis';
import { Settings } from "../config";
import dayjs from "dayjs";

let redisClient: RedisClientType;

export const connectRedis = async() => { 
    const connectWithRetry = async () => {
        try {
            redisClient = createClient({ url: Settings.redis_address });
            redisClient.on('error', (err) => {
                console.log('Redis Client Error', err);
                setTimeout(connectWithRetry, 5000); // Retry connection after 5 seconds
            });
            redisClient.on('connect', () => console.log('Redis Client Connected'));
            await redisClient.connect();
        } catch (err) {
            console.log('Failed to connect to Redis, retrying in 5 seconds...', err);
        }
    };

    await connectWithRetry();
    return redisClient
}

// Function to set a key-value pair in Redis
export const setValue = async (key: string, value: string, expiryDate: Date): Promise<void> => {
    const time = dayjs(expiryDate.getTime()).subtract(Date.now()).get('seconds')
    console.log("time of expiry", time)
    await redisClient.set(key, value, { EX: time });
};

// Checks if an item exists in redis

export const exists = async (key: string): Promise<boolean> => {
    try {
        const exists = await redisClient.exists(key);
        return exists == 1;
    }
    catch (err) {
        console.error('Error checking key existence:', err);
        return false;
    }
};

// Function to retrieve a value by key from Redis
// Function to retrieve a value by key from Redis
export const getValue = async (key: string): Promise<string | null> => {
    return redisClient.get(key);
};

// Function to publish a message to a Redis channel
export const publishMessage = async (message: string): Promise<void> => {
    await redisClient.publish(Settings.redis_pub_channel, message);
};
