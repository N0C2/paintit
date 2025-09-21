import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getDbPool, isSetupComplete } from './database.js';
import setupRouter from './routes/setup.routes.js';

if (isSetupComplete()) {
    dotenv.config();
}

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/status', (req, res) => {
    res.json({ setupComplete: isSetupComplete() });
});

app.use('/api', setupRouter);

app.post('/api/login', async (req, res) => {
    const db = getDbPool();
    if (!db) return res.status(503).json({ message: "Application is not configured yet." });

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
        console.error("Login Error:", err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const createDropdownRoute = (endpoint, tableName) => {
    app.get(`/api/${endpoint}`, authenticateToken, async (req, res) => {
        const db = getDbPool();
        try {
            const [rows] = await db.query(`SELECT name FROM ${tableName}`);
            res.json(rows.map(r => r.name));
        } catch (err) {
            res.status(500).json({ message: `Error loading ${endpoint}` });
        }
    });
};
createDropdownRoute('branches', 'branches');
createDropdownRoute('parts', 'parts');
createDropdownRoute('codes', 'codes');
createDropdownRoute('infos', 'infos');

app.get('/api/orders', authenticateToken, async (req, res) => {
    const db = getDbPool();
    try {
        const [orders] = await db.query("SELECT * FROM orders ORDER BY id DESC");
        res.json({ message: "success", data: orders });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
    const db = getDbPool();
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const {
            customerFirstName, customerLastName, completionDate, vin,
            orderNumber, paintNumber, branch, additionalOrderInfo, items
        } = req.body;
        
        const orderSql = `
            INSERT INTO orders (customerFirstName, customerLastName, completionDate, vin, orderNumber, paintNumber, branch, additionalOrderInfo, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [orderResult] = await connection.execute(orderSql, [
            customerFirstName, customerLastName, completionDate || null, vin,
            orderNumber, paintNumber, branch, additionalOrderInfo, 'new'
        ]);

        const orderId = orderResult.insertId;

        const itemSql = `
            INSERT INTO order_items (order_id, part, code, info, additional_info)
            VALUES (?, ?, ?, ?, ?)
        `;
        if (items && items.length > 0) {
            for (const item of items) {
                if (item.part || item.code || item.info || item.additional_info) {
                     await connection.execute(itemSql, [orderId, item.part, item.code, item.info, item.additional_info]);
                }
            }
        }
        
        await connection.commit();
        
        res.status(201).json({ message: "Order created successfully", data: { id: orderId } });

    } catch (err) {
        await connection.rollback();
        console.error("Error creating order:", err);
        res.status(500).json({ message: "Failed to create order" });
    } finally {
        connection.release();
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}.`);
    if (isSetupComplete()) {
        getDbPool();
    } else {
        console.log("Setup not complete. Please navigate to the frontend to begin setup process.");
    }
});

