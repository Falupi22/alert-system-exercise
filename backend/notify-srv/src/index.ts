import express from 'express';
import http from 'http';
import { createServer } from "./socket";
import { createClient } from "./common";
import { Settings } from "./config";

const app = express();
const server = http.createServer(app);
const io = createServer(server);

// broadcast message to all connected clients in socket server
const createRedisClient = async () => {
    try {
    await createClient((event) => { 
        console.log('Emission attempt...');
        io.emit('alert', event); }); 
    }
    catch(error) {
        console.error("Error occurred in index.ts", error)
    }
}

server.listen(Settings.port, async () => {
    console.log(`Server is running on port ${Settings.port}`);
    await createRedisClient();
});