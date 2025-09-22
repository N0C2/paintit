import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

let pool;

export const isSetupComplete = () => {
    return fs.existsSync('./.env');
};

export const getDbPool = () => {
    if (pool) return pool;
    if (isSetupComplete()) {
        dotenv.config();
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
        console.log("Database connection pool created successfully.");
        return pool;
    }
    return null;
};
