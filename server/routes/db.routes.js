import { Router } from 'express';
import mariadb from 'mariadb';
import dotenv from 'dotenv';

const router = Router();

router.get('/db/status', async (req, res) => {
  // Load environment variables dynamically on each request
  dotenv.config();

  // Check if DB credentials are set in the .env file
  if (!process.env.DB_HOST || !process.env.DB_USER) {
    return res.json({ connected: false });
  }

  const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: 10
  });

  let conn;
  try {
    conn = await pool.getConnection();
    res.json({ connected: true });
  } catch (err) {
    console.error("Database connection failed:", err);
    res.status(503).json({ connected: false, message: 'Database connection failed' });
  } finally {
    if (conn) conn.release();
    if (pool) pool.end(); // Important: end the temporary pool
  }
});

export default router;
