import asyncHandler from 'express-async-handler';
import { sendMessage } from "../common/amqp";
import { randomUUID } from "crypto";
import { AlertEvent } from "../common";

export const postAlertHandler = asyncHandler(async (req, res) => {
    const event: AlertEvent = req.body;

    // Validate the event
    if (
        !event.location ||
        !event.type ||
        !event.timestamp ||
        typeof event.duration !== 'number'
    ) {
        res.status(400).json('Invalid event data');
        return;
    }

    // Add uuid to the event    
    event.uuid = randomUUID().toString();

    if (await sendMessage(JSON.stringify(event))) {
        res.status(200).json('Event processed successfully');
    }
    else {
        res.status(500).json('RabbitMQ error occurred');
    }
});
