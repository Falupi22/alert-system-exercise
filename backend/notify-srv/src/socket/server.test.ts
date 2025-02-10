import { Server } from 'socket.io';
import http from 'http';
import createServer from './server';
import { createServer as createHttpServer } from 'http';
import { AddressInfo } from 'net';
import supertest from 'supertest';
import TestAgent from "supertest/lib/agent";
import client  from "socket.io-client";

describe('Socket Server', () => {
    let httpServer: http.Server;
    let ioServer: Server;
    let request: TestAgent;
    let clientSocket: any;

    beforeAll((done) => {
        httpServer = createHttpServer();
        ioServer = createServer(httpServer);
        httpServer.listen(() => {
            const { port } = httpServer.address() as AddressInfo;
            request = supertest(`http://localhost:${port}`);
            clientSocket = client(`http://localhost:${port}`);
            done();
        });
    });

    afterAll((done) => {
        ioServer.close();
        httpServer.close(done);
    });

    test('should create a socket server', (done) => {
        expect(ioServer).toBeInstanceOf(Server);
        done();
    });

    test('should allow a client to connect and disconnect', (done) => {
        clientSocket.on('connect', () => {
            expect(clientSocket.connected).toBe(true);
            clientSocket.close();
        });

        clientSocket.on('disconnect', () => {
            expect(clientSocket.connected).toBe(false);
            done();
        });
    });
});