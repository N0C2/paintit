import { Router } from 'express';
import mariadb from 'mariadb';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query('SELECT password FROM users WHERE email = ? LIMIT 1', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.json({ message: 'Login successful!' });
    } else {
      res.status(401).json({ message: 'Invalid credentials.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  } finally {
    if (conn) conn.release();
  }
});

export default router;
