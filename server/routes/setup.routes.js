import express from 'express';
import fs from 'fs/promises';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const router = express.Router();

// This route is intentionally not validated as it's a one-time setup.
// In a production environment, you might restrict access to this endpoint.
router.post('/initialize', async (req, res) => {
    const { dbHost, dbUser, dbPassword, dbName, adminEmail, adminPassword, apiUrl } = req.body;
    if (!dbHost || !dbUser || !dbName || !adminEmail || !adminPassword) {
        return res.status(400).json({ message: "All fields are required." });
    }
    let serverConnection;
    try {
        serverConnection = await mysql.createConnection({ host: dbHost, user: dbUser, password: dbPassword });
        await serverConnection.execute(`DROP DATABASE IF EXISTS \`${dbName}\``);
        await serverConnection.execute(`CREATE DATABASE \`${dbName}\``);
        await serverConnection.end();

        const dbConnection = await mysql.createConnection({ host: dbHost, user: dbUser, password: dbPassword, database: dbName });
        const jwtSecret = crypto.randomBytes(64).toString('hex');
        let envContent = `DB_HOST=${dbHost}\nDB_USER=${dbUser}\nDB_PASSWORD=${dbPassword || ''}\nDB_NAME=${dbName}\nJWT_SECRET=${jwtSecret}`;
        if (apiUrl) {
            envContent += `\nVITE_API_URL=${apiUrl}`;
        }
        await fs.writeFile('./.env', envContent);


        // Create tables (richtige Reihenfolge für Foreign Keys)
        await dbConnection.execute(`CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, role VARCHAR(50) NOT NULL, firstName VARCHAR(255), lastName VARCHAR(255))`);
        await dbConnection.execute(`CREATE TABLE branch (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL)`);
        await dbConnection.execute(`CREATE TABLE user_branches (user_id INT, branch_id INT, PRIMARY KEY(user_id, branch_id), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (branch_id) REFERENCES branch(id) ON DELETE CASCADE)`);
        await dbConnection.execute(`CREATE TABLE orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customerFirstName VARCHAR(255),
            customerLastName VARCHAR(255),
            completionDate DATE,
            previousCompletionDate DATE,
            vin VARCHAR(255),
            orderNumber VARCHAR(255),
            paintNumber VARCHAR(255),
            branch VARCHAR(255),
            additionalOrderInfo TEXT,
            status VARCHAR(50)
        )`);
        await dbConnection.execute(`CREATE TABLE order_items (id INT AUTO_INCREMENT PRIMARY KEY, order_id INT, part VARCHAR(255), code VARCHAR(255), info VARCHAR(255), additional_info TEXT, FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE)`);
        await dbConnection.execute(`CREATE TABLE part (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL)`);
        await dbConnection.execute(`CREATE TABLE code (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL)`);
        await dbConnection.execute(`CREATE TABLE info (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL)`);
        await dbConnection.execute(`CREATE TABLE status (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL)`);

        // Seed data
        const branches = ['Heufeld', 'Rosenheim', 'München'];
        const parts = ['Kotflügel VL.', 'Stoßstange vorne', 'Türe hinten rechts'];
        const codes = ['-S2', '-S3', '-L1'];
        const infos = ['Zusatzinfo', 'Kratzer', 'Delle'];
        const statuses = ['Admin', 'Werkstattleiter', 'Lackierer', 'Buchhaltung', 'Mechaniker'];

        for (const name of branches) {
            await dbConnection.execute('INSERT INTO branch (name) VALUES (?)', [name]);
        }
        for (const name of parts) {
            await dbConnection.execute('INSERT INTO part (name) VALUES (?)', [name]);
        }
        for (const name of codes) {
            await dbConnection.execute('INSERT INTO code (name) VALUES (?)', [name]);
        }
        for (const name of infos) {
            await dbConnection.execute('INSERT INTO info (name) VALUES (?)', [name]);
        }
        for (const name of statuses) {
            await dbConnection.execute('INSERT INTO status (name) VALUES (?)', [name]);
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await dbConnection.execute('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [adminEmail, hashedPassword, 'admin']);
        
        await dbConnection.end();
        res.status(200).json({ message: "Setup successful!" });
    } catch (err) {
        if (serverConnection) await serverConnection.end();
        console.error("Setup failed:", err);
        res.status(500).json({ message: `Setup failed: ${err.message}` });
    }
});
export default router;
