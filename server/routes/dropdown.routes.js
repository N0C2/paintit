import express from 'express';
import { getDbPool } from '../database.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();


// Neue Version: Liest aus Einzeltabellen
router.get('/:type', authenticateToken, async (req, res) => {
    const { type } = req.params;
    const allowedTypes = ['branch', 'part', 'code', 'info', 'status'];

    if (!allowedTypes.includes(type)) {
        return res.status(400).json({ message: 'Invalid dropdown type requested.' });
    }

    try {
        const db = getDbPool();
            const [rows] = await db.query(`SELECT name FROM \`${type}\``);
        res.json(rows.map(r => r.name));
    } catch (err) {
        console.error(`Error fetching dropdown for type ${type}:`, err);
        res.status(500).json({ message: 'Failed to fetch dropdown data.' });
    }
});

export default router;
