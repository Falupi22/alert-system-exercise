import amqp, { Connection } from 'amqplib';
import { Settings } from "../config";
import { AlertEvent } from "./types";

const RABBITMQ_URL = Settings.rabbit_address;
const QUEUE_NAME = Settings.from_listener_queue_name;

let connection: Connection;
export const consumeMessages = async(callback: (event: AlertEvent) => void): Promise<void> => {
    try {
        connection = await amqp.connect(RABBITMQ_URL);
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
