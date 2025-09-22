import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

const saltRounds = 10;

async function setupDatabase() {
  let connection;
  try {
    console.log('Verbinde mit der Datenbank...');
    // Zuerst ohne Datenbank verbinden, um sie zu erstellen
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbConfig.database}\`;`);
    console.log(`Datenbank '${dbConfig.database}' ist bereit.`);

    console.log('Erstelle Tabellen...');

    // Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        firstName VARCHAR(100),
        lastName VARCHAR(100),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('- Tabelle "users" erstellt.');

    // Branches Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS branches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE
      );
    `);
    console.log('- Tabelle "branches" erstellt.');

    // User-Branch Mapping Table (Many-to-Many)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_branches (
        userId INT,
        branchId INT,
        PRIMARY KEY (userId, branchId),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (branchId) REFERENCES branches(id) ON DELETE CASCADE
      );
    `);
    console.log('- Tabelle "user_branches" erstellt.');

    // Orders Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        orderNumber VARCHAR(100) NOT NULL UNIQUE,
        customerName VARCHAR(255) NOT NULL,
        licensePlate VARCHAR(50),
        status VARCHAR(50) DEFAULT 'offen',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completionDate DATE,
        previousCompletionDate TEXT,
        branchId INT,
        FOREIGN KEY (branchId) REFERENCES branches(id)
      );
    `);
    console.log('- Tabelle "orders" erstellt.');

    console.log('Tabellen erfolgreich erstellt oder bereits vorhanden.');

  } catch (error) {
    console.error('Fehler beim Datenbank-Setup:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Datenbankverbindung geschlossen.');
    }
    console.log('Datenbank-Setup abgeschlossen.');
  }
}

setupDatabase();