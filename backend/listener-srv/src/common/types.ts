export type Config = {
    port: number;
    from_listener_queue_name: string;
    rabbit_address: string;
};

export interface AlertEvent {
    location: string;
    type: string;
    timestamp: string;
    duration: number;
    uuid?: string;
}
