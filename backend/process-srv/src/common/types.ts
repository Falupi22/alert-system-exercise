export type Config = {
    mode: string;
    port: number;
    from_listener_queue_name: string;
    redis_pub_channel: string;
    redis_address: string;
    rabbit_address: string;
};

export interface AlertEvent {
    location: string;
    type: string;
    timestamp: string;
    duration: number;
    uuid?: string;
}

export interface ProcessedAlertEvent {
    eventType: "open" | "close"
    location: string;
    type: string;
    sentTime: string;
    duration: string;
    uuid?: string;
}
