import mongoose from 'mongoose';
import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const DB_TYPE = process.env.DB_TYPE || 'sql';
let dbInstance = null;

export const initDB = async () => {
    if (DB_TYPE === 'mongo') {
        try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('MongoDB connected successfully');
            dbInstance = mongoose;
            return { type: 'mongo', instance: mongoose };
        } catch (error) {
            console.error('MongoDB connection error:', error);
            process.exit(1);
        }
    } else {
        try {
            const knexInstance = knex({
                client: process.env.SQL_CLIENT || 'mysql2',
                connection: {
                    host: process.env.SQL_HOST || '127.0.0.1',
                    port: process.env.SQL_PORT || 3306,
                    user: process.env.SQL_USER || 'root',
                    password: process.env.SQL_PASSWORD || '',
                    database: process.env.SQL_DATABASE || 'fluxbridge'
                },
                pool: { min: 2, max: 10 }
            });

            // Test connection and initialize tables
            await knexInstance.raw('SELECT 1+1 AS result');
            console.log(`SQL (${process.env.SQL_CLIENT}) connected successfully`);

            // Initialize Tables
            const hasServers = await knexInstance.schema.hasTable('servers');
            if (!hasServers) {
                await knexInstance.schema.createTable('servers', table => {
                    table.increments('id').primary();
                    table.string('server_id', 50).notNullable().unique();
                    table.string('name', 100);
                    table.string('api_key', 255).notNullable();
                    table.enum('status', ['ONLINE', 'OFFLINE']).defaultTo('OFFLINE');
                    table.datetime('last_heartbeat');
                    table.datetime('created_at').defaultTo(knexInstance.fn.now());
                });
                console.log('Created servers table');
            }

            const hasCommands = await knexInstance.schema.hasTable('commands');
            if (!hasCommands) {
                await knexInstance.schema.createTable('commands', table => {
                    table.increments('id').primary();
                    table.string('server_id', 50).notNullable();
                    table.string('player_name', 50);
                    table.text('command').notNullable();
                    table.boolean('require_online').defaultTo(true);
                    table.enum('status', ['PENDING', 'SENT', 'QUEUED', 'SUCCESS', 'FAILED']).defaultTo('PENDING');
                    table.text('response_message');
                    table.datetime('created_at').defaultTo(knexInstance.fn.now());
                    table.datetime('executed_at');
                });
                console.log('Created commands table');
            }

            dbInstance = knexInstance;
            return { type: 'sql', instance: knexInstance };
        } catch (error) {
            console.error('SQL connection error:', error);
            process.exit(1);
        }
    }
};

export const getDB = () => dbInstance;
export const getDBType = () => DB_TYPE;
