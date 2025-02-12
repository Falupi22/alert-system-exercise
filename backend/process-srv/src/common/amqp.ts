import { Connection, connect } from 'amqplib';
import { Settings } from "../config";
import { AlertEvent } from "./types";

const QUEUE_NAME = Settings.from_listener_queue_name;
const RETRY_DELAY = 2000;

let connection: Connection;

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
