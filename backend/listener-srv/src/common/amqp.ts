import { connect, Connection } from 'amqplib';
import { Settings } from "../config";


let connection: Connection;
const RETRY_DELAY = 2000; // 2 seconds

export const connectRabbit = async (): Promise<void> => {

    while (true) {
        try {
            connection = await connect(Settings.rabbit_address);
            console.log('Connected to RabbitMQ');
            return;
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
            console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }
}

export const sendMessage = async(message: string): Promise<boolean> => {
    let channel;
    try {
    console.log('inside send');
    channel = await connection.createChannel();

    await channel.assertQueue( Settings.from_listener_queue_name, {
        durable: true, // Ensures the queue survives RabbitMQ restarts
    });

    // Send a message to the queue
    channel.sendToQueue( Settings.from_listener_queue_name, Buffer.from(message), {
        persistent: true, // Ensures the message survives RabbitMQ restarts
    });
    console.log('Sent:', message);

    return true;

    } catch (error) { 
        console.error('Error sending message:', error);

        // Retry mechanism
        while (true) {
            try {
                // Send a message to the queue
            channel?.sendToQueue( Settings.from_listener_queue_name, Buffer.from(message), {
                persistent: true, // Ensures the message survives RabbitMQ restarts
            });

                break;
            } catch (retryError) {
                console.error('Error sending message after retry:', retryError);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
        }


        return false;
    }
}