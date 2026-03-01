import express from 'express';
import { Command } from '../models/Command.js';
import { Server } from '../models/Server.js';

const router = express.Router();

// Middleware to authenticate server requests
const authenticateServer = async (req, res, next) => {
    const serverId = req.headers['x-server-id'];
    const authHeader = req.headers['authorization'];

    if (!serverId || !authHeader) {
        return res.status(401).json({ error: 'Missing authentication headers' });
    }

    const apiKey = authHeader.replace('Bearer ', '');
    const server = await Server.findByServerId(serverId);

    if (!server || server.api_key !== apiKey) {
        return res.status(403).json({ error: 'Invalid Server ID or API Key' });
    }

    req.server = server;
    next();
};

// Apply auth middleware to all plugin routes
router.use('/server', authenticateServer);

// 1. Polling Mode: Get pending commands
router.get('/server/commands', async (req, res) => {
    try {
        const pendingCommands = await Command.getPending(req.server.server_id);

        // Update status to SENT as they are being returned
        for (const cmd of pendingCommands) {
            await Command.updateStatus(cmd.id || cmd._id, 'SENT');
        }

        // Format for the plugin
        const formattedCommands = pendingCommands.map(cmd => ({
            id: cmd.id || cmd._id,
            player_name: cmd.player_name,
            command: cmd.command,
            require_online: cmd.require_online
        }));

        res.json(formattedCommands);
    } catch (error) {
        console.error('Error fetching commands:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 2. Submit Result
router.post('/server/result', async (req, res) => {
    try {
        const { commandId, status, message } = req.body;

        if (!commandId || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        await Command.updateStatus(commandId, status, message);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating command result:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 3. Heartbeat
router.post('/server/heartbeat', async (req, res) => {
    try {
        await Server.updateStatus(req.server.server_id, 'ONLINE');
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating heartbeat:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
