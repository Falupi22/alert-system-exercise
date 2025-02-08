import { Config } from '../common';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '../../../.env' });

const Settings: Config = {
    port: process.env.PORT ? parseInt(process.env.PORT) : 4000,
    from_listener_queue_name: process.env.FROM_LISTENER_QUEUE_NAME || 'raw-alerts',
};

export default Settings;
