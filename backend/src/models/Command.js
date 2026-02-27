import mongoose from 'mongoose';
import { getDB, getDBType } from '../config/db.js';

// MongoDB Schema
const commandSchema = new mongoose.Schema({
    server_id: { type: String, required: true },
    player_name: { type: String },
    command: { type: String, required: true },
    require_online: { type: Boolean, default: true },
    status: {
        type: String,
        enum: ['PENDING', 'SENT', 'QUEUED', 'SUCCESS', 'FAILED'],
        default: 'PENDING'
    },
    response_message: { type: String },
    created_at: { type: Date, default: Date.now },
    executed_at: { type: Date }
});

const MongoCommand = mongoose.model('Command', commandSchema);

export const Command = {
    async create(data) {
        if (getDBType() === 'mongo') {
            const cmd = new MongoCommand(data);
            const saved = await cmd.save();
            return { id: saved._id, ...saved.toObject() };
        } else {
            const knex = getDB();
            const [id] = await knex('commands').insert(data);
            // In SQL, return ID and data
            return { id, ...data };
        }
    },

    async getPending(serverId) {
        if (getDBType() === 'mongo') {
            return await MongoCommand.find({ server_id: serverId, status: 'PENDING' });
        } else {
            const knex = getDB();
            return await knex('commands')
                .where({ server_id: serverId, status: 'PENDING' })
                .select('*');
        }
    },

    async getRecent(limit = 100) {
        if (getDBType() === 'mongo') {
            return await MongoCommand.find({}).sort({ created_at: -1 }).limit(limit);
        } else {
            const knex = getDB();
            return await knex('commands').orderBy('created_at', 'desc').limit(limit).select('*');
        }
    },

    async updateStatus(id, status, responseMessage = null) {
        const updateData = { status, response_message: responseMessage };
        if (status === 'SUCCESS' || status === 'FAILED') {
            updateData.executed_at = new Date();
        }

        if (getDBType() === 'mongo') {
            return await MongoCommand.updateOne({ _id: id }, updateData);
        } else {
            const knex = getDB();
            return await knex('commands').where({ id }).update(updateData);
        }
    }
};
