import { connect, Connection } from 'amqplib';
import { Settings } from "../config";


let connection: Connection;
const RETRY_DELAY = 2000; // 2 seconds

/**
 * Establishes a connection to RabbitMQ and retries indefinitely if the connection fails.
 *
 * @async
 * @function connectRabbit
 * @returns {Promise<void>} A promise that resolves when the connection is successfully established.
 *
 * @throws Will log an error message and retry if the connection attempt fails.
 */
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

/**
 * Sends a message to a RabbitMQ queue.
 *
 * @param message - The message to be sent to the queue.
 * @returns A promise that resolves to a boolean indicating whether the message was successfully sent.
 *
 * @remarks
 * This function attempts to send a message to a RabbitMQ queue specified by `Settings.from_listener_queue_name`.
 * If the initial attempt fails, it enters a retry mechanism that continuously attempts to resend the message
 * until it succeeds. The message and queue are configured to be persistent, ensuring they survive RabbitMQ restarts.
 *
 * @throws Will log an error if the message cannot be sent initially or after retries.
 */
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