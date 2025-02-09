export type Config = {
    port: number;
    from_listener_queue_name: string;
    redis_pub_channel: string;
};

export interface ProcessedAlertEvent {
    eventType: "open" | "closed"
    location: string;
    type: string;
    sentTime: string;
    duration: string;
    uuid?: string;
}