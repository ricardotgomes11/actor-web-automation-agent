import { log } from 'crawlee';
import express from 'express';
import http from 'node:http';
import { WebSocketServer, WebSocket } from 'ws';
import type { Page } from 'puppeteer';

const PORT = process.env.ACTOR_WEB_SERVER_PORT ? Number.parseInt(process.env.ACTOR_WEB_SERVER_PORT, 10) : 4000;

const CLIENT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page live view</title>
</head>
<body>
<img id="frame" />
<script>
    const wsUrl = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws';
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
        document.getElementById('frame').src = 'data:image/jpeg;base64,' + event.data;
    };
</script>
</body>
</html>`;

/**
 * Create server which streams screenshots from Puppeteer page using WebSockets.
 * Uses this for server live view of the page in Apify live view.
 */
export const createServer = async (page: Page) => {
    const app = express();
    const server = http.createServer(app);
    const wss = new WebSocketServer({ server, path: '/ws' });
    const sockets = new Set<WebSocket>();

    wss.on('connection', (socket) => {
        sockets.add(socket);
        socket.on('close', () => sockets.delete(socket));
    });

    app.get('/', (_, res) => {
        res.status(200).send(CLIENT_HTML);
    });

    const client = await page.target().createCDPSession();
    const startOptions = {
        format: 'jpeg',
        quality: 50,
        everyNthFrame: 1,
    };

    client.on('Page.screencastFrame', async (frameObject) => {
        for (const socket of sockets) {
            if (socket.readyState === WebSocket.OPEN) socket.send(frameObject.data);
        }
        await client.send('Page.screencastFrameAck', {
            sessionId: frameObject.sessionId,
        });
    });
    await client.send('Page.startScreencast', startOptions as any);

    server.listen(PORT, () => {
        log.debug(`Server listening on ${PORT}`);
    });

    return {
        destroy: async () => {
            await client.send('Page.stopScreencast');
            await client.detach();
            for (const socket of sockets) socket.close();
            wss.close();
            server.close();
        },
    };
};
