import fs from 'fs';
import path from 'path';
import mariadb from 'mariadb';
import bcrypt from 'bcrypt';

const schemaFile = path.join(process.cwd(), 'sql/schema.sql');

export async function runSetup({ dbHost, dbUser, dbPass, dbName, adminEmail, adminPassword }) {
  const pool = mariadb.createPool({
    host: dbHost,
    user: dbUser,
    password: dbPass,
    connectionLimit: 10
  });

  let conn;
  try {
    conn = await pool.getConnection();

    // Create the database if it doesn't exist and use it
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await conn.query(`USE \`${dbName}\``);

    // Read the SQL schema file
    const sql = fs.readFileSync(schemaFile, 'utf8');

    // Split the SQL commands and filter out any empty strings
    const sqlCommands = sql.split(';').filter(s => s.trim().length > 0);

    // Execute each SQL command individually
    for (const command of sqlCommands) {
      await conn.query(command);
    }

    // Check if an admin user already exists
    const [rows] = await conn.query('SELECT id FROM users WHERE role = "admin" LIMIT 1');

    // Add a check to ensure 'rows' is not undefined or empty before checking its length
    if (!rows || rows.length === 0) {
      // Hash the admin password and create the admin user
      const hash = await bcrypt.hash(adminPassword, 10);
      await conn.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [
        'Admin', adminEmail, hash, 'admin'
      ]);
    }

    return { success: true };

  } finally {
    if (conn) conn.release();
    pool.end();
  }
}
