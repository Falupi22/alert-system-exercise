
import { Server } from 'socket.io';
import http from 'http';

const createServer = (server: http.Server): Server => { 
    const io = new Server(server, {
        cors: {
            origin: "*",  // Allow all origins (not recommended for production)
            methods: ["GET", "POST"]
        }
    });
    
    io.on('connection', (socket) => {
        console.log('a user connected');

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });

    console.log('Socket server created');

    return io;
}

export default createServer;