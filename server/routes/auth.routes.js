import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDbPool } from '../database.js';
import { loginValidationRules, validate } from '../utils/validators.js';

const router = express.Router();

router.post('/login', loginValidationRules(), validate, async (req, res) => {
    const db = await getDbPool();
    if (!db) return res.status(503).json({ message: "Application not configured." });

    try {
        const { email, password } = req.body;
        const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ message: 'Incorrect email or password.' });
        }
        
        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );
            res.status(200).json({ message: 'Login successful', token });
        } else {
            res.status(401).json({ message: 'Incorrect email or password.' });
        }
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

export default router;
