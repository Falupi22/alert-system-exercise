import { createClient, RedisClientType } from 'redis';
import { Settings } from "../config";
import dayjs from "dayjs";

let redisClient: RedisClientType;

export const connectRedis = async(): Promise<void> => { 
    const connectWithRetry = async () => {
        try {
            redisClient = createClient({ url: 'redis://redis-cluster-ip-srv:6379' });
            redisClient.on('error', (err) => {
                console.log('Redis Client Error', err);
                setTimeout(connectWithRetry, 5000); // Retry connection after 5 seconds
            });
            redisClient.on('connect', () => console.log('Redis Client Connected'));
            await redisClient.connect();
        } catch (err) {
            console.log('Failed to connect to Redis, retrying in 5 seconds...', err);
            setTimeout(connectWithRetry, 5000); // Retry connection after 5 seconds
        }
    };

    await connectWithRetry();
}

// Function to set a key-value pair in Redis
export const setValue = async (key: string, value: string, expiryDate: Date): Promise<void> => {
    const time = dayjs().subtract(expiryDate.getTime()).get('milliseconds')
    console.log("time of expiry", time)
    await redisClient.set(key, value, { EX: time });
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
