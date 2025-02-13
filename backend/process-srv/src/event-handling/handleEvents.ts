import { getValue, publishMessage, setValue, ProcessedAlertEvent, AlertEvent, exists } from "../common";

/**
 * Handles incoming alert events by processing and storing them in Redis, and publishing messages
 * based on the event data. It ensures that duplicate alerts are not processed and updates existing
 * alerts if necessary.
 *
 * @param {AlertEvent} event - The alert event to be handled.
 * @returns {Promise<void>} - A promise that resolves when the event has been processed.
 *
 * @throws {Error} - Throws an error if there is an issue processing the event.
 *
 * The function performs the following steps:
 * 1. Constructs a Redis key based on the event location.
 * 2. Retrieves any existing value associated with the key from Redis.
 * 3. Converts the incoming alert event to a processed alert event.
 * 4. Checks if the alert already exists in Redis to prevent duplication.
 * 5. Publishes the processed alert event message.
 * 6. Updates the existing alert duration if the new duration is later.
 * 7. Stores the processed alert event in Redis with an expiration time.
 */
const handleEvents = async (event: AlertEvent) => {    
    try {
    // add the field to redis
    const key = `alerts:${event.location}`; 

    // Send the aggregated events
    const existingValue = await getValue(key)
    
    // Convert the alertevent to processedalertevent
    const processedAlertEvent: ProcessedAlertEvent = {
        location: event.location,
        type: event.type,
        sentTime: event.timestamp,
        // calculate duration so it is the timestamp plus the duration in minutes
        duration: new Date(new Date(event.timestamp).getTime() + event.duration * 60000).toISOString(),
        eventType: "open"
    }
    console.log('Publishing event:', event);

    // Check if the alert already exists in Redis, preventing it from being processed and transferred to the client
    if (!(await exists(`id:${event.uuid}`))) {
        publishMessage(JSON.stringify(processedAlertEvent)); 

         // Stores the ID on order to prevent data duplication.
        await setValue(`id:${event.uuid}`, '', new Date(Date.now() + 100));
    }

    let newSentTime: string = processedAlertEvent.sentTime;
    if (existingValue) {
        const existingObj: ProcessedAlertEvent = JSON.parse(existingValue)
        let newDuration;

        console.log(`${existingObj.duration} <=> ${processedAlertEvent.duration}`);
        
        // Checking in case the duration number is changed in the raw alert, assuming alerts might have
        // different lengths.
        // Update the alert if the new duration (timestamp + duration from the raw alert) is later than the existing one.
        if (new Date(existingObj.duration).getTime() < new Date(processedAlertEvent.duration).getTime()) {
            newDuration = new Date(existingObj.duration).toISOString();
            console.log('Alert already exists. Updating duration...');
            publishMessage(JSON.stringify({
                ...existingObj,
                location: event.location,
                type: event.type === existingObj.type ? event.type : "Mixed Threats",
                duration: newDuration,
                eventType: "close"
            }));

            newSentTime = existingObj.sentTime;
        }
    }

    await setValue(key, JSON.stringify({
        type: event.type,
        sentTime: newSentTime,
        duration: processedAlertEvent.duration,
    }), new Date(new Date(processedAlertEvent.duration).getTime()), "EX");
    }
    catch (error) {
        console.error("Error occurred in handleEvents:", error);
    }
};

export default handleEvents;