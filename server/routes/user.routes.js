import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware.js';
import { userCreationValidationRules, userUpdateValidationRules, validate } from '../utils/validators.js';
import * as UserService from '../services/user.service.js';

const router = express.Router();

// POST /api/users - Create a new user (Admin only)
router.post('/', authenticateToken, isAdmin, userCreationValidationRules(), validate, async (req, res, next) => {
    try {
        const newUser = await UserService.createUser(req.body);
        res.status(201).json({ message: 'Benutzer erfolgreich erstellt.', data: newUser });
    } catch (err) {
        if (err.message.includes('Email ist bereits vergeben')) {
            return res.status(409).json({ message: err.message });
        }
        next(err);
    }
});

// GET /api/users/dropdowns - Get dropdown values for branches and statuses (Admin only)
router.get('/dropdowns', authenticateToken, isAdmin, async (req, res, next) => {
    try {
        const dropdowns = await UserService.getDropdowns();
        res.json(dropdowns);
    } catch (err) {
        next(err);
    }
});

// GET /api/users/all - List all users (Admin only)
router.get('/all', authenticateToken, isAdmin, async (req, res, next) => {
    try {
        const users = await UserService.getAllUsers();
        res.json(users);
    } catch (err) {
        next(err);
    }
});

// PUT /api/users/:id - Update user information (Admin only)
router.put('/:id', authenticateToken, isAdmin, userUpdateValidationRules(), validate, async (req, res, next) => {
    try {
        const updatedUser = await UserService.updateUser(req.params.id, req.body);
        res.json({ message: 'Benutzer aktualisiert.', data: updatedUser });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/users/:id - Delete a user (Admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res, next) => {
    const { id } = req.params;

    if (req.user.userId === parseInt(id, 10)) {
        return res.status(400).json({ message: 'Admins können sich nicht selbst löschen.' });
    }

    try {
        const success = await UserService.deleteUser(id);
        if (!success) {
            return res.status(404).json({ message: 'Benutzer nicht gefunden.' });
        }
        res.status(200).json({ message: 'Benutzer erfolgreich gelöscht.' });
    } catch (err) {
        next(err);
    }
});

export default router;