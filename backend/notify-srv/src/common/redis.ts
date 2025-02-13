import * as redis from 'redis';
import { Settings } from "../config";
import { ProcessedAlertEvent } from "./types";

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
let redisClient: redis.RedisClientType;

const connectRedis = async() => { 
    const connectWithRetry = async () => {
        try {
            redisClient = redis.createClient({ url: Settings.redis_address });
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
 * Creates a Redis client and subscribes to a specified Redis channel.
 * 
 * @param messageCallback - A callback function that processes the received message from the Redis channel.
 * 
 * @returns A promise that resolves to the Redis subscriber client.
 * 
 * @throws Will log an error if there is an issue subscribing to the Redis channel.
 */
const createClient = async (messageCallback: (event: ProcessedAlertEvent) => void) => {
    const subscriber = await connectRedis();
    console.log('Creating Redis client...');
    if (subscriber) {
    try {
        await subscriber.subscribe(Settings.redis_pub_channel, (message, channel) => {
            console.log('Message from Redis channel:', channel, message);
            if (channel === Settings.redis_pub_channel) {
                console.log(`Received message: ${message} from channel: ${channel}. Now broadcasting...`);
                messageCallback(JSON.parse(message));
            }
        });
        console.log('Subscribed to Redis channel:', Settings.redis_pub_channel);
    } catch (error) {
        console.error('Error subscribing to Redis channel:', error);
    }}
    
    return subscriber;
}

export default createClient;