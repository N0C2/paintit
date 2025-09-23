
import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware.js';
import { orderValidationRules, validate } from '../utils/validators.js';
import * as OrderService from '../services/order.service.js';
import { getDbPool } from '../database.js';

const router = express.Router();

// GET all orders
router.get('/', async (req, res) => {
    try {
        const db = getDbPool();
        const [orders] = await db.query('SELECT * FROM orders ORDER BY id DESC');
        res.json({ message: 'success', data: orders });
    } catch (err) {
        console.log('[ERROR] Failed to retrieve orders:', err);
        res.status(500).json({ message: 'Failed to retrieve orders.' });
    }
});

// GET only completed orders
router.get('/completed', async (req, res) => {
    try {
        const db = getDbPool();
        const [orders] = await db.query("SELECT * FROM orders WHERE status = 'abgeschlossen' ORDER BY id DESC");
        res.json({ message: "success", data: orders });
    } catch (err) {
        console.log("[ERROR] Failed to retrieve completed orders:", err);
        res.status(500).json({ message: "Failed to retrieve completed orders." });
    }
});

// GET single order by id
router.get('/:id', async (req, res) => {
    try {
        const db = getDbPool();
        // Use a LEFT JOIN to get the branch name directly
        const [orders] = await db.query(`
            SELECT o.*, b.name as branchName 
            FROM orders o
            LEFT JOIN branches b ON o.branchId = b.id
            WHERE o.id = ?
        `, [req.params.id]);

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        const order = orders[0];

        // Fetch associated items
        const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
        order.items = items || [];

        res.json({ message: 'success', data: order });
    } catch (err) {
        console.log('[ERROR] Failed to retrieve order:', err);
        res.status(500).json({ message: 'Failed to retrieve order.' });
    }
});

// PATCH: Mark order as completed (status = 'abgeschlossen')
router.patch('/:id/complete', async (req, res) => {
    try {
        const db = getDbPool();
        const [result] = await db.query("UPDATE orders SET status = 'abgeschlossen' WHERE id = ?", [req.params.id]);
        if (result.affectedRows === 0) {
            console.log("[ERROR] Order not found for id:", req.params.id);
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.json({ message: 'Order marked as completed.' });
    } catch (err) {
        console.log("[ERROR] Failed to complete order:", err);
        res.status(500).json({ message: 'Failed to complete order.' });
    }
});

// POST a new order
router.post('/', orderValidationRules(), validate, async (req, res) => {
    try {
        const newOrder = await OrderService.createOrder(req.body);
        res.status(201).json({ message: "Order created successfully", data: newOrder });
    } catch (err) {
    console.log('[ERROR] Failed to create order:', err);
    res.status(500).json({ message: "Failed to create order." });
    }
});

// PUT (update) an existing order
router.put('/:id', orderValidationRules(), validate, async (req, res) => {
    try {
        const db = getDbPool();
        // Hole das aktuelle Fertigstellungsdatum
        const [orders] = await db.query('SELECT completionDate FROM orders WHERE id = ?', [req.params.id]);
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'Order not found.'});
        }
        const oldCompletionDate = orders[0].completionDate;
        // Wenn das Datum geändert wurde, speichere das alte Datum in previousCompletionDate
        let updateSql = 'UPDATE orders SET customerFirstName=?, customerLastName=?, orderNumber=?, status=?, completionDate=?, branch=?';
        let params = [req.body.customerFirstName, req.body.customerLastName, req.body.orderNumber, req.body.status, req.body.completionDate, req.body.branch];
        if (req.body.completionDate && req.body.completionDate !== oldCompletionDate) {
            updateSql += ', previousCompletionDate=?';
            params.push(oldCompletionDate);
        }
        updateSql += ' WHERE id=?';
        params.push(req.params.id);
        await db.query(updateSql, params);
        // Gib den neuen und alten Wert zurück
        res.json({ message: 'Order updated successfully', data: { ...req.body, previousCompletionDate: oldCompletionDate } });
    } catch (err) {
        console.log('[ERROR] Failed to update order:', err);
        res.status(500).json({ message: 'Failed to update order.' });
    }
});

// DELETE an order
router.delete('/:id', async (req, res) => {
    try {
        const result = await OrderService.deleteOrder(req.params.id);
         if (!result) {
            return res.status(404).json({ message: 'Order not found.'});
        }
        res.status(200).json({ message: 'Order deleted successfully.' });
    } catch (err) {
    console.log('[ERROR] Failed to delete order:', err);
    res.status(500).json({ message: 'Failed to delete order.' });
    }
});

export default router;
