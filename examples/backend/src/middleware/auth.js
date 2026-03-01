import { Server } from '../models/Server.js';

export const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const serverId = req.headers['x-server-id'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    if (!serverId) {
        return res.status(400).json({ error: 'Missing X-Server-Id header' });
    }

    const apiKey = authHeader.split(' ')[1];

    try {
        const server = await Server.findByServerId(serverId);
        if (!server || server.api_key !== apiKey) {
            return res.status(403).json({ error: 'Invalid server ID or API key' });
        }

        // Attach server info to request
        req.server = server;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Internal server error during authentication' });
    }
};
