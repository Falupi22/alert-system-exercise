import { getValue, publishMessage, setValue, ProcessedAlertEvent, AlertEvent, exists } from "../common";

const handleEvents = async (event: AlertEvent) => {    
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
    }), new Date(processedAlertEvent.duration));
};

export default handleEvents;