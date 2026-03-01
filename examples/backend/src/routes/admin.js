import express from 'express';
import { Server } from '../models/Server.js';
import { Command } from '../models/Command.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get all servers
router.get('/servers', async (req, res) => {
    try {
        const servers = await Server.getAll();
        res.json(servers);
    } catch (error) {
        console.error('Error fetching servers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a new server
router.post('/servers', async (req, res) => {
    try {
        const { server_id, name } = req.body;

        if (!server_id) {
            return res.status(400).json({ error: 'server_id is required' });
        }

        const apiKey = uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '');

        // This is a simplified way to create a server using existing model structure, 
        // usually we'd add a create() method to Server.js
        const { getDB, getDBType } = await import('../config/db.js');
        let newServer;

        if (getDBType() === 'mongo') {
            const mongoose = (await import('mongoose')).default;
            const MongoServer = mongoose.model('Server');
            newServer = new MongoServer({ server_id, name, api_key: apiKey });
            await newServer.save();
        } else {
            const knex = getDB();
            await knex('servers').insert({
                server_id,
                name: name || null,
                api_key: apiKey,
                status: 'OFFLINE'
            });
            newServer = { server_id, name, api_key: apiKey };
        }

        res.json({ success: true, server: newServer });
    } catch (error) {
        console.error('Error creating server:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get recent commands log
router.get('/commands', async (req, res) => {
    try {
        const commands = await Command.getRecent(100);
        res.json(commands);
    } catch (error) {
        console.error('Error fetching commands:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a server
router.delete('/servers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { getDB, getDBType } = await import('../config/db.js');

        if (getDBType() === 'mongo') {
            const mongoose = (await import('mongoose')).default;
            const MongoServer = mongoose.model('Server');
            await MongoServer.deleteOne({ server_id: id });
        } else {
            const knex = getDB();
            await knex('servers').where({ server_id: id }).del();
        }

        if (getDBType() === 'mongo') {
            const mongoose = (await import('mongoose')).default;
            const MongoCommand = mongoose.model('Command');
            await MongoCommand.deleteMany({ server_id: id });
        } else {
            const knex = getDB();
            await knex('commands').where({ server_id: id }).del();
        }

        // Connected Servers is not directly exposed to locals in index.js, but we'll try to disconnect it if exposed
        // Or naturally it will disconnect when the server goes offline

        res.json({ success: true, message: 'Server deleted successfully' });
    } catch (error) {
        console.error('Error deleting server:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new command to explicitly push to a server
router.post('/commands', async (req, res) => {
    try {
        const { server_id, player_name, command, require_online } = req.body;

        if (!server_id || !command) {
            return res.status(400).json({ error: 'server_id and command are required' });
        }

        // Validate server exists
        const server = await Server.findByServerId(server_id);
        if (!server) {
            return res.status(404).json({ error: 'Server not found' });
        }

        let finalCommand = command;
        if (player_name) {
            finalCommand = finalCommand.replace('%player%', player_name);
        }

        // Insert into DB
        const cmdData = {
            server_id,
            player_name: player_name || null,
            command: finalCommand,
            require_online: require_online !== undefined ? require_online : true,
            status: 'PENDING'
        };

        const newCmd = await Command.create(cmdData);

        // Attempt Real-Time WS Push
        const pushed = req.app.locals.pushCommandToWS(server_id, newCmd);

        if (pushed) {
            await Command.updateStatus(newCmd.id || newCmd._id, 'SENT');
        }

        res.json({ success: true, command: newCmd, realtime_pushed: pushed });
    } catch (error) {
        console.error('Error creating command:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
