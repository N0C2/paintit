
import fs from 'fs';
import crypto from 'crypto';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// --- .env File Creation ---
const envPath = '.env';

// Check if .env file exists
if (!fs.existsSync(envPath)) {
    console.log('Keine .env-Datei gefunden. Erstelle eine neue .env-Datei mit Standardwerten...');
    
    // Generate a secure JWT secret
    const jwtSecret = crypto.randomBytes(32).toString('hex');
    
    // Define default .env content
    const envContent = `
# ==================================================================
# Paint.IT Konfiguration
# ==================================================================

# --- Datenbank-Konfiguration ---
# Passe diese Werte an deine lokale MySQL-Installation an.
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=paintit

# --- JWT-Geheimnis ---
# Dieses Geheimnis wird zur Sicherung der Benutzer-Logins verwendet.
# Es wurde automatisch generiert.
JWT_SECRET=${jwtSecret}

# --- CORS Origin für die Produktion ---
# Wenn du das Frontend auf einer anderen Domain als das Backend hostest,
# trage hier die URL des Frontends ein (z.B. http://example.com).
# Für den lokalen Betrieb ist keine Änderung notwendig.
CORS_ORIGIN=
    `.trim();

    // Write the new .env file
    fs.writeFileSync(envPath, envContent);
    
    console.log(`
    ------------------------------------------------------------------
    .env-Datei erfolgreich erstellt!

    WICHTIG: Bitte überprüfe die Datenbank-Anmeldeinformationen in der
    neuen ".env"-Datei und passe sie bei Bedarf an.

    Führe danach das Setup erneut aus mit: npm run setup
    ------------------------------------------------------------------
    `);
    
    // Exit the script so the user can check the .env file
    process.exit(0);
}

// Load environment variables from .env file
dotenv.config();

// --- Database Setup ---
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
    // Connect without specifying the database first to create it
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS 
${dbConfig.database}
 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE 
${dbConfig.database}
;`);
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
    console.log('- Tabelle 