export type Config = {
    mode: string;
    port: number;
    from_listener_queue_name: string;
    redis_pub_channel: string;
    redis_address: string;
};

export interface ProcessedAlertEvent {
    eventType: "open" | "closed"
    location: string;
    type: string;
    sentTime: string;
    duration: string;
    uuid?: string;
}