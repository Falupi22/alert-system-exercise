import { Connection, connect } from 'amqplib';
import { Settings } from "../config";
import { AlertEvent } from "./types";

const QUEUE_NAME = Settings.from_listener_queue_name;
const RETRY_DELAY = 2000;

let connection: Connection;

/**
 * Establishes a connection to RabbitMQ and sets up message consumption.
 * Retries the connection in case of failure with a specified delay.
 *
 * @param callback - A function to be called with each received AlertEvent.
 * @returns A promise that resolves when the connection is successfully established and message consumption is set up.
 */
export const connectRabbit = async (callback: (event: AlertEvent) => void): Promise<void> => {

    while (true) {
        try {
            connection = await connect(Settings.rabbit_address);
            console.log('Connected to RabbitMQ');
            break;
        } catch (error) {
            console.error('Error connecting to RabbitMQ:', error);
            console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
    }

    await consumeMessages(callback);
}

/**
 * Consumes messages from a specified AMQP queue and processes them using a provided callback function.
 *
 * @param callback - A function that processes the consumed message. It takes an `AlertEvent` object as an argument.
 * @returns A promise that resolves when the message consumption setup is complete.
 *
 * @throws Will log an error message if there is an issue with creating the channel or consuming messages.
 */
const consumeMessages = async(callback: (event: AlertEvent) => void): Promise<void> => {
    try {
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        console.log(`Waiting for messages in ${QUEUE_NAME}.`);

        channel.consume(QUEUE_NAME, (msg) => {
            if (msg !== null) {
                try {
                console.log(`Received message: ${msg.content.toString()}`);
                channel.ack(msg);

                const event: AlertEvent = JSON.parse(msg.content.toString());
                callback(event); 

                } catch (error) { 
                    console.error('Error processing message:', error);
                    channel.nack(msg);
                }
            }
        }, { noAck: false });
    } catch (error) {
        console.error('Error consuming messages:', error);
    }
}
