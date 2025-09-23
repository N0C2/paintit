import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

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
        customerFirstName VARCHAR(128),
        customerLastName VARCHAR(128),
        licensePlate VARCHAR(50),
        status VARCHAR(50) DEFAULT 'offen',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completionDate DATE,
        previousCompletionDate TEXT,
        branchId INT,
        vin VARCHAR(255),
        paintNumber VARCHAR(255),
        additionalOrderInfo TEXT,
        FOREIGN KEY (branchId) REFERENCES branches(id) ON DELETE SET NULL
      );
    `);
    console.log('- Tabelle "orders" erstellt.');

    // Order Items Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        order_id INT, 
        part VARCHAR(255), 
        code VARCHAR(255), 
        info VARCHAR(255), 
        additional_info TEXT, 
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      );
    `);
    console.log('- Tabelle "order_items" erstellt.');

    // Dropdown Tables
    await connection.query(`CREATE TABLE IF NOT EXISTS part (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL)`);
    console.log('- Tabelle "part" erstellt.');
    await connection.query(`CREATE TABLE IF NOT EXISTS code (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL)`);
    console.log('- Tabelle "code" erstellt.');
    await connection.query(`CREATE TABLE IF NOT EXISTS info (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL)`);
    console.log('- Tabelle "info" erstellt.');
    await connection.query(`CREATE TABLE IF NOT EXISTS roles (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) UNIQUE NOT NULL)`);
    console.log('- Tabelle "roles" erstellt.');

    console.log('Tabellen erfolgreich erstellt oder bereits vorhanden.');

    console.log('Füge Seed-Daten für Dropdowns hinzu (falls nicht vorhanden)...');
    
    // Using INSERT IGNORE to prevent errors if data already exists
    const branches = ['Heufeld', 'Rosenheim', 'München'];
    for (const name of branches) {
        await connection.query('INSERT IGNORE INTO branches (name) VALUES (?)', [name]);
    }

    const parts = ['Kotflügel VL.', 'Stoßstange vorne', 'Türe hinten rechts'];
    for (const name of parts) {
        await connection.query('INSERT IGNORE INTO part (name) VALUES (?)', [name]);
    }

    const codes = ['-S2', '-S3', '-L1'];
    for (const name of codes) {
        await connection.query('INSERT IGNORE INTO code (name) VALUES (?)', [name]);
    }

    const infos = ['Zusatzinfo', 'Kratzer', 'Delle'];
    for (const name of infos) {
        await connection.query('INSERT IGNORE INTO info (name) VALUES (?)', [name]);
    }
    
    const roles = ['Admin', 'Werkstattleiter', 'Lackierer', 'Buchhaltung', 'Mechaniker'];
    for (const name of roles) {
        await connection.query('INSERT IGNORE INTO roles (name) VALUES (?)', [name]);
    }
    
    console.log('Seed-Daten hinzugefügt.');

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