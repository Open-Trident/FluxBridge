import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './config/db.js';
import { Server } from './models/Server.js';

import apiRoutes from './routes/api.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Track connected servers
// Map<serverId, WebSocket>
const connectedServers = new Map();

wss.on('connection', (ws) => {
    let serverId = null;

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message.toString());

            // Authentication flow
            if (data.type === 'auth') {
                const { serverId: sId, apiKey } = data;
                const s = await Server.findByServerId(sId);

                if (s && s.api_key === apiKey) {
                    serverId = sId;
                    connectedServers.set(serverId, ws);
                    await Server.updateStatus(serverId, 'ONLINE');

                    ws.send(JSON.stringify({ type: 'auth_success' }));
                    console.log(`[WS] Server connected: ${serverId}`);
                } else {
                    ws.send(JSON.stringify({ type: 'auth_failed', error: 'Invalid ID or API Key' }));
                    ws.close();
                }
            }

            // Client Result Reporting
            else if (data.type === 'result') {
                if (!serverId) return ws.close();

                // Directly pass to the regular HTTP result route logic
                // Avoid rewriting models update logic - just update it
                const { Command } = await import('./models/Command.js');
                await Command.updateStatus(data.commandId, data.status, data.message);
            }
        } catch (err) {
            console.error('[WS] Message error:', err);
        }
    });

    ws.on('close', async () => {
        if (serverId) {
            console.log(`[WS] Server disconnected: ${serverId}`);
            connectedServers.delete(serverId);
            await Server.updateStatus(serverId, 'OFFLINE');
        }
    });

    // PING to keep connection alive
    ws.on('pong', () => {
        if (serverId) Server.updateStatus(serverId, 'ONLINE');
    });
});

// Provide a way for Express to tell WS to push commands realtime
app.locals.pushCommandToWS = (targetServerId, commandObj) => {
    const ws = connectedServers.get(targetServerId);
    if (ws && ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
            type: 'execute',
            commandId: commandObj.id || commandObj._id,
            playerName: commandObj.player_name,
            command: commandObj.command,
            requireOnline: commandObj.require_online
        }));
        return true;
    }
    return false;
};

setInterval(() => {
    wss.clients.forEach(ws => {
        if (ws.readyState === ws.OPEN) {
            ws.ping();
        }
    });
}, 30000); // 30 second ping

initDB().then(() => {
    server.listen(port, () => {
        console.log(`FluxBridge Backend running on http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
