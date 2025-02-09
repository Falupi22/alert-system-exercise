import * as redis from 'redis';
import { Settings } from "../config";
import { ProcessedAlertEvent } from "./types";

const createClient = async (messageCallback: (event: ProcessedAlertEvent) => void) => {
    const subscriber = redis.createClient({ url: 'redis://redis-cluster-ip-srv:6379' });
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