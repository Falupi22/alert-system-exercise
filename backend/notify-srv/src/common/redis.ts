import * as redis from 'redis';
import { Settings } from "../config";
import { ProcessedAlertEvent } from "./types";

/**
 * Creates a Redis client and subscribes to a specified Redis channel.
 * 
 * @param messageCallback - A callback function that processes the received messages from the Redis channel.
 * @returns A promise that resolves to the Redis client instance.
 * 
 * @throws Will throw an error if there is an issue connecting to or subscribing to the Redis channel.
 * 
 * @example
 * ```typescript
 * const handleMessage = (event: ProcessedAlertEvent) => {
 *     console.log('Processed alert event:', event);
 * };
 * 
 * createClient(handleMessage)
 *     .then(client => console.log('Redis client created and subscribed'))
 *     .catch(error => console.error('Error creating Redis client:', error));
 * ```
 */
const createClient = async (messageCallback: (event: ProcessedAlertEvent) => void) => {
    const subscriber = redis.createClient({ url: Settings.redis_address });
    console.log('Creating Redis client...');
    subscriber.on('error', (err) => console.error('Redis Client Error:', err));
    subscriber.on('connect', () => console.log('Connected to Redis'));
    await subscriber.connect();

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
    }
    
    return subscriber;
}

export default createClient;