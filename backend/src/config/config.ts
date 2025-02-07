import { Config } from "../common"
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '../../../.env' });

const Settings: Config  = { 
    port: process.env.PORT ? parseInt(process.env.PORT) : 4000
}

export default Settings;