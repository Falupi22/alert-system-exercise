import asyncHandler from "express-async-handler";

interface AlertEvent {
    location: string;
    type: string;
    timestamp: string;
    duration: number;
}

export const postAlertHandler = asyncHandler(async (req, res) => {
    const event: AlertEvent = req.body;
    
    // Validate the event
    if (!event.location || !event.type || !event.timestamp || typeof event.duration !== 'number') {
        res.status(400).send('Invalid event data');
    }

    // Process the event (this is just a placeholder, replace with actual processing logic)
    console.log('Processing event:', event);

    res.status(200).json('Event processed successfully');
});