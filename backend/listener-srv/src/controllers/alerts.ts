import asyncHandler from 'express-async-handler';
import { sendMessage } from "../common/amqp";
import { randomUUID } from "crypto";
import { AlertEvent } from "../common";

/**
 * Handles the posting of an alert event.
 * 
 * This function validates the incoming alert event data, assigns a UUID to the event,
 * and sends the event to a message queue. If the event data is invalid, it responds
 * with a 400 status code. If the event is successfully processed, it responds with
 * a 200 status code. If there is an error with the message queue, it responds with
 * a 500 status code.
 * 
 * @param req - The request object containing the alert event data in the body.
 * @param res - The response object used to send back the appropriate HTTP status and message.
 * 
 * @throws Will log an error and respond with a 500 status code if an unexpected error occurs.
 */
export const postAlertHandler = asyncHandler(async (req, res) => {
    try {
    const event: AlertEvent = req.body;

    // Validate the event
    if (
        !event.location || event.location.trim() === '' ||
        !event.type || event.type.trim() === '' ||
        !event.timestamp || event.timestamp.trim() === '' ||
        typeof event.duration !== 'number' || event.duration <= 0 ||
        isNaN(Date.parse(event.timestamp))
    ) {
        res.status(400).json('Invalid event data');
        res.end();
        return;
    }

    // Add uuid to the event    
    event.uuid = randomUUID().toString();

    if (await sendMessage(JSON.stringify(event))) {
        res.status(200).json('Event processed successfully');
        res.end();

    }
    else {
        res.status(500).json('RabbitMQ error occurred');
        res.end();
    }
}
catch(error) {
    console.error("Error occurred in alerts.ts", error);
    res.status(500).json('RabbitMQ error occurred');
    res.end();
}
});
