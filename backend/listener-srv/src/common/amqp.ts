import { connect, Connection } from 'amqplib';
import { Settings } from "../config";

/**age(message) {
 * Sends a message to a RabbitMQ queue.t connection = await amqp.connect('amqp://localhost');
 *hannel();
 * @remarks
 * This function connects to a RabbitMQ server, creates a channel, asserts a queue,= 'task_queue';  // Name of the queue
 * sends the provided message to the queue, and logs the sent message.
 * The connection to the RabbitMQ server is closed after 500 milliseconds.
 *
 * @param message - The message to be sent to the queue.
 * @returns {Promise<void>} - A promise that resolves when the message is sent.
 *
 * @exampleersistent: true,  // Ensures the message survives RabbitMQ restarts
 * ```typescript
 * sendMessage('Task 1');
 * sendMessage('Task 2');ge);
 * ```*/

export const sendMessage = async(message: string): Promise<void> => {
    const connection: Connection = await connect('amqp://admin:password@rabbitmq-cluster-ip-srv');
    const channel = await connection.createChannel();

    const queue = Settings.from_listener_queue_name; // Name of the queue
    await channel.assertQueue(queue, {
        durable: true, // Ensures the queue survives RabbitMQ restarts
    });

    // Send a message to the queue
    channel.sendToQueue(queue, Buffer.from(message), {
        persistent: true, // Ensures the message survives RabbitMQ restarts
    });

    console.log('Sent:', message);
}