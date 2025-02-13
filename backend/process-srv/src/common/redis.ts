import { createClient, RedisClientType } from 'redis';
import { Settings } from "../config";
import dayjs from "dayjs";

let redisClient: RedisClientType;

/**
 * Connects to a Redis server with retry logic.
 * 
 * This function attempts to connect to a Redis server using the URL specified in the `Settings.redis_address`.
 * If the connection fails, it will retry every 5 seconds until a successful connection is established. Useful when deploying the first time.
 * 
 * @returns {Promise<RedisClientType>} A promise that resolves to the connected Redis client.
 * 
 * @throws Will log an error message if the connection fails and will retry after 5 seconds.
 **/
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

/**
 * Sets a value in Redis with an expiry time.
 *
 * @param key - The key under which the value is stored.
 * @param value - The value to be stored.
 * @param expiryDate - The date and time when the key should expire.
 * @param format - The format of the expiry time. "PX" for milliseconds (default) or "EX" for seconds.
 * @returns A promise that resolves when the value has been set.
 */
export const setValue = async (key: string, value: string, expiryDate: Date, format: "PX" | "EX" = "PX"): Promise<void> => {
    const time = dayjs(expiryDate.getTime()).subtract(Date.now()).get('milliseconds');
    console.log("time of expiry", time)

    if (format === "PX") {
    await redisClient.set(key, value, { PX: time }); 
}   
else {
    await redisClient.set(key, value, { EX: time });  // EX: Set key to expire after time in seconds.
}
};


/**
 * Checks if a given key exists in the Redis database.
 *
 * @param {string} key - The key to check for existence in the Redis database.
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the key exists, otherwise `false`.
 *
 * @throws Will log an error message if there is an issue checking the key's existence.
 */
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


/**
 * Retrieves the value associated with the given key from the Redis database.
 *
 * @param key - The key whose associated value is to be returned.
 * @returns A promise that resolves to the value associated with the specified key, 
 *          or null if the key does not exist.
 */
export const getValue = async (key: string): Promise<string | null> => {
    return redisClient.get(key);
};


/**
 * Publishes a message to the specified Redis channel.
 *
 * @param message - The message to be published.
 * @returns A promise that resolves when the message has been published.
 */
export const publishMessage = async (message: string): Promise<void> => {
    await redisClient.publish(Settings.redis_pub_channel, message);
};
