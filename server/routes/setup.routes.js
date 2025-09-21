import express from 'express';
import fs from 'fs/promises';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const router = express.Router();

router.post('/initialize-setup', async (req, res) => {
    const { dbHost, dbUser, dbPassword, dbName, adminEmail, adminPassword } = req.body;

    if (!dbHost || !dbUser || !dbName || !adminEmail || !adminPassword) {
        return res.status(400).json({ message: "All fields are required." });
    }

    let serverConnection;
    try {
        serverConnection = await mysql.createConnection({
            host: dbHost, user: dbUser, password: dbPassword,
        });
        console.log("Connection to database server successful.");

        await serverConnection.execute(`DROP DATABASE IF EXISTS \`${dbName}\``);
        await serverConnection.execute(`CREATE DATABASE \`${dbName}\``);
        await serverConnection.end();

        const dbConnection = await mysql.createConnection({
            host: dbHost, user: dbUser, password: dbPassword, database: dbName,
        });
        console.log(`Connected to new database '${dbName}'.`);

        const jwtSecret = crypto.randomBytes(64).toString('hex');
        const envContent = `DB_HOST=${dbHost}\nDB_USER=${dbUser}\nDB_PASSWORD=${dbPassword || ''}\nDB_NAME=${dbName}\nJWT_SECRET=${jwtSecret}`;
        await fs.writeFile('./.env', envContent);
        console.log(".env file created with a secure JWT secret.");

        // Create all tables
        await dbConnection.execute(`CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(255) UNIQUE NOT NULL, password VARCHAR(255) NOT NULL, role VARCHAR(50) NOT NULL)`);
        await dbConnection.execute(`CREATE TABLE orders (id INT AUTO_INCREMENT PRIMARY KEY, customerFirstName VARCHAR(255), customerLastName VARCHAR(255), completionDate DATE, vin VARCHAR(255), orderNumber VARCHAR(255), paintNumber VARCHAR(255), branch VARCHAR(255), additionalOrderInfo TEXT, status VARCHAR(50))`);
        await dbConnection.execute(`CREATE TABLE order_items (id INT AUTO_INCREMENT PRIMARY KEY, order_id INT, part VARCHAR(255), code VARCHAR(255), info VARCHAR(255), additional_info TEXT, FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE)`);
        await dbConnection.execute(`CREATE TABLE branches (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) UNIQUE)`);
        await dbConnection.execute(`CREATE TABLE user_branches (user_id INT, branch_id INT, PRIMARY KEY (user_id, branch_id), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE)`);
        await dbConnection.execute(`CREATE TABLE parts (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))`);
        await dbConnection.execute(`CREATE TABLE codes (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))`);
        await dbConnection.execute(`CREATE TABLE infos (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))`);
        
        // Insert default data
        await dbConnection.execute(`INSERT INTO branches (name) VALUES ('Heufeld'), ('Rosenheim'), ('München')`);
        await dbConnection.execute(`INSERT INTO parts (name) VALUES ('Kotflügel VL.'), ('Stoßstange vorne'), ('Türe hinten rechts')`);
        await dbConnection.execute(`INSERT INTO codes (name) VALUES ('-S2'), ('-S3'), ('-L1')`);
        await dbConnection.execute(`INSERT INTO infos (name) VALUES ('Zusatzinfo'), ('Kratzer'), ('Delle')`);

        // Create admin user and assign branches
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const [adminResult] = await dbConnection.execute('INSERT INTO users (email, password, role) VALUES (?, ?, ?)', [adminEmail, hashedPassword, 'admin']);
        const [branches] = await dbConnection.query('SELECT id FROM branches');
        for (const branch of branches) {
            await dbConnection.execute('INSERT INTO user_branches (user_id, branch_id) VALUES (?, ?)', [adminResult.insertId, branch.id]);
        }
        
        await dbConnection.end();
        res.status(200).json({ message: "Setup successful! The application is ready." });

    } catch (err) {
        console.error("Error during setup:", err.message);
        if (serverConnection) await serverConnection.end();
        res.status(500).json({ message: `Setup failed: ${err.message}` });
    }
});

export default router;

