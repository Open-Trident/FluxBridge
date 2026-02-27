import mongoose from 'mongoose';
import { getDB, getDBType } from '../config/db.js';

// MongoDB Schema
const serverSchema = new mongoose.Schema({
    server_id: { type: String, required: true, unique: true },
    name: { type: String },
    api_key: { type: String, required: true },
    status: { type: String, enum: ['ONLINE', 'OFFLINE'], default: 'OFFLINE' },
    last_heartbeat: { type: Date },
    created_at: { type: Date, default: Date.now }
});

const MongoServer = mongoose.model('Server', serverSchema);

export const Server = {
    async findByServerId(serverId) {
        if (getDBType() === 'mongo') {
            return await MongoServer.findOne({ server_id: serverId });
        } else {
            const knex = getDB();
            return await knex('servers').where({ server_id: serverId }).first();
        }
    },

    async updateStatus(serverId, status, heartbeatTime = new Date()) {
        if (getDBType() === 'mongo') {
            return await MongoServer.updateOne(
                { server_id: serverId },
                { status, last_heartbeat: heartbeatTime }
            );
        } else {
            const knex = getDB();
            return await knex('servers')
                .where({ server_id: serverId })
                .update({ status, last_heartbeat: heartbeatTime });
        }
    },

    async getAll() {
        if (getDBType() === 'mongo') {
            return await MongoServer.find({});
        } else {
            const knex = getDB();
            return await knex('servers').select('*');
        }
    }
};
