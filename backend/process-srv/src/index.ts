import { connectRedis, getValue, publishMessage, setValue, connectRabbit, ProcessedAlertEvent, AlertEvent } from "./common";

console.log("Processor has started!");

connectRedis();
connectRabbit(async (event: AlertEvent) => {    
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
    publishMessage(JSON.stringify(processedAlertEvent));

    let newSentTime: string = processedAlertEvent.sentTime;
    if (existingValue) {
        const existingObj: ProcessedAlertEvent = JSON.parse(existingValue)
        let newDuration;

        // Checking in case the duration number is changed in the raw alert
        console.log(`${existingObj.duration} <=> ${processedAlertEvent.duration}`);
        
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
});