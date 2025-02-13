
import { Server } from 'socket.io';
import http from 'http';

/**
 * Creates a new Socket.IO server instance.
 *
 * @param server - The HTTP server instance to attach the Socket.IO server to.
 * @returns The created Socket.IO server instance.
 *
 * @remarks
 * This function sets up a Socket.IO server with CORS configuration allowing all origins.
 * It listens for 'connection' and 'disconnect' events to log when a user connects or disconnects.
 * ```
 */
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