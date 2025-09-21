const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Datenbankverbindung
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

// API-Endpunkte
app.get('/api/db-status', (req, res) => {
    res.json({ status: 'Database is connected' });
});

// Login-Endpunkt
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    const sql = "SELECT * FROM users WHERE email = ?";
    db.get(sql, [email], (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Database error.' });
        }
        if (!user) {
            return res.status(401).json({ message: 'Email or password is incorrect.' });
        }

        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error comparing passwords.' });
            }
            if (result) {
                res.status(200).json({ message: 'Login successful', user: { email: user.email, role: user.role } });
            } else {
                res.status(401).json({ message: 'Email or password is incorrect.' });
            }
        });
    });
});

// Bestellungen abrufen
app.get('/api/orders', (req, res) => {
    db.all("SELECT * FROM orders", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Bestellung erstellen
app.post('/api/orders', (req, res) => {
    const { customerName, color, quantity } = req.body;
    const sql = 'INSERT INTO orders (customerName, color, quantity, status) VALUES (?,?,?,?)';
    const params = [customerName, color, quantity, 'new'];
    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": { id: this.lastID, ...req.body },
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});