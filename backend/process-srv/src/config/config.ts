import { Config } from '../common';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '../../../.env' });

const Settings: Config = {
    port: process.env.PORT ? parseInt(process.env.PORT) : 4002,
    from_listener_queue_name: process.env.FROM_LISTENER_QUEUE_NAME || 'raw-alerts',
    mode: process.env.MODE || 'production',
    redis_address: process.env.MODE === 'development' ? 'redis://host.docker.internal:6379' : 'redis://redis-cluster-ip-srv:6379',
    rabbit_address: process.env.MODE === 'development' ? 'amqp://host.docker.internal' : `amqp://admin:password@rabbitmq-cluster-ip-srv`,
    redis_pub_channel: process.env.REDIS_PUB_CHANNEL || 'processed-alerts',
};

export default Settings;
