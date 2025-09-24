import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

let pool;
let setupStatus = null; // Cache the setup status

export const isSetupComplete = async () => {
    if (setupStatus !== null) return setupStatus; // Return cached status

    if (!fs.existsSync('./.env')) {
        setupStatus = false;
        return false;
    }

    dotenv.config(); // Load .env variables if not already loaded

    const dbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    };

    let connection;
    try {
        // Try to connect to the database
        connection = await mysql.createConnection(dbConfig);
        // Check if the 'users' table exists
        const [rows] = await connection.query("SHOW TABLES LIKE 'users'");
        setupStatus = rows.length > 0;
        return setupStatus;
    } catch (error) {
        console.error("Error checking database setup:", error.message);
        setupStatus = false;
        return false;
    } finally {
        if (connection) connection.end();
    }
};

export const getDbPool = async () => { // Make getDbPool async
    if (pool) return pool;

    // Ensure .env is loaded before checking setup status
    dotenv.config();

    if (await isSetupComplete()) { // Await the async function
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