import asyncHandler from 'express-async-handler';
import { sendMessage } from "../common/amqp";
import { randomUUID } from "crypto";

interface AlertEvent {
    location: string;
    type: string;
    timestamp: string;
    duration: number;
    uuid?: string;
}

export const postAlertHandler = asyncHandler(async (req, res) => {
    const event: AlertEvent = req.body;

    // Validate the event
    if (
        !event.location ||
        !event.type ||
        !event.timestamp ||
        typeof event.duration !== 'number'
    ) {
        res.status(400).send('Invalid event data');
    }

    // Process the event (this is just a placeholder, replace with actual processing logic)
    console.log('Processing event:', event);

    // Add uuid to the event    
    event.uuid = randomUUID().toString();
    sendMessage(JSON.stringify(event));

    res.status(200).json('Event processed successfully');
});
