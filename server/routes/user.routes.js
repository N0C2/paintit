import express from 'express';
import bcrypt from 'bcrypt';
import { getDbPool } from '../database.js';
import { body, validationResult } from 'express-validator';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Validation rules for user creation
const userValidationRules = [
  body('firstName').notEmpty().withMessage('Vorname ist erforderlich').trim().escape(),
  body('lastName').notEmpty().withMessage('Nachname ist erforderlich').trim().escape(),
  body('branch').notEmpty().withMessage('Filiale ist erforderlich').trim().escape(),
  // body('status').notEmpty().withMessage('Status ist erforderlich').trim().escape(),
  body('email').isEmail().withMessage('Bitte gültige Email angeben').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Passwort muss mindestens 6 Zeichen haben'),
];

// POST /api/users - Benutzer anlegen (nur für Admins)
router.post('/', authenticateToken, isAdmin, userValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const db = getDbPool();
  if (!db) return res.status(503).json({ message: 'Application not configured.' });
  const { firstName, lastName, branch, email, password } = req.body;
  try {
    // Check if email already exists
    const [users] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(409).json({ message: 'Email ist bereits vergeben.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    // Benutzer anlegen (ohne branch)
    const [result] = await db.query(
      'INSERT INTO users (email, password, role, firstName, lastName) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, 'user', firstName, lastName]
    );
    const userId = result.insertId;
    // Filialen zuordnen
    const branchArr = Array.isArray(branch) ? branch : [branch];
    for (const branchName of branchArr) {
      const [branchRows] = await db.query('SELECT id FROM branch WHERE name = ?', [branchName]);
      if (branchRows && branchRows.length > 0) {
        await db.query('INSERT INTO user_branches (user_id, branch_id) VALUES (?, ?)', [userId, branchRows[0].id]);
      }
    }
    res.status(201).json({ message: 'Benutzer erfolgreich erstellt.' });
  } catch (err) {
    console.error('Fehler beim Anlegen des Benutzers:', err);
    res.status(500).json({ message: 'Fehler beim Anlegen des Benutzers.' });
  }
});

// GET /api/users/dropdowns - Dropdown-Werte für Filiale und Status
router.get('/dropdowns', authenticateToken, isAdmin, async (req, res) => {
  const db = getDbPool();
  if (!db) return res.status(503).json({ message: 'Application not configured.' });
  try {
    const [branches] = await db.query('SELECT name FROM branch');
    const [statuses] = await db.query('SELECT name FROM status');
    res.json({ branches: branches.map(b => b.name), statuses: statuses.map(s => s.name) });
  } catch (err) {
    console.error('Fehler beim Laden der Dropdown-Werte:', err);
    res.status(500).json({ message: 'Fehler beim Laden der Dropdown-Werte.' });
  }
});


// GET /api/users/all - Alle Benutzer auflisten (nur Admin)
router.get('/all', authenticateToken, isAdmin, async (req, res) => {
  const db = getDbPool();
  if (!db) return res.status(503).json({ message: 'Application not configured.' });
  try {
    // Hole alle User
    const [users] = await db.query('SELECT id, email, role, firstName, lastName FROM users');
    // Hole alle Branch-Zuordnungen
    const [userBranches] = await db.query(`
      SELECT ub.user_id, b.name as branchName
      FROM user_branches ub
      JOIN branch b ON ub.branch_id = b.id
    `);
    // Mappe Branches zu Usern
    const userIdToBranches = {};
    for (const row of userBranches) {
      if (!userIdToBranches[row.user_id]) userIdToBranches[row.user_id] = [];
      userIdToBranches[row.user_id].push(row.branchName);
    }
    // Füge branches-Array zu jedem User hinzu
    const usersWithBranches = users.map(u => ({ ...u, branches: userIdToBranches[u.id] || [] }));
    res.json(usersWithBranches);
  } catch (err) {
    console.error('Fehler beim Laden der Benutzer:', err);
    res.status(500).json({ message: 'Fehler beim Laden der Benutzer.' });
  }
});

// PUT /api/users/:id - Benutzerinformationen und Rechte ändern (nur Admin)
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  const db = getDbPool();
  if (!db) return res.status(503).json({ message: 'Application not configured.' });
  const { id } = req.params;
  const { email, role, firstName, lastName, branch } = req.body;
  try {
    await db.query(
      'UPDATE users SET email=?, role=?, firstName=?, lastName=? WHERE id=?',
      [email, role, firstName, lastName, id]
    );
    // Filialen aktualisieren
    await db.query('DELETE FROM user_branches WHERE user_id=?', [id]);
    const branchArr = Array.isArray(branch) ? branch : [branch];
    for (const branchName of branchArr) {
      const [branchRows] = await db.query('SELECT id FROM branch WHERE name = ?', [branchName]);
      if (branchRows && branchRows.length > 0) {
        await db.query('INSERT INTO user_branches (user_id, branch_id) VALUES (?, ?)', [id, branchRows[0].id]);
      }
    }
    res.json({ message: 'Benutzer aktualisiert.' });
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Benutzers:', err);
    res.status(500).json({ message: 'Fehler beim Aktualisieren des Benutzers.' });
  }
});

export default router;
