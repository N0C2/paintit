import express from 'express';
import { authenticateToken, isAdmin } from '../middleware/auth.middleware.js';
import { orderValidationRules, validate } from '../utils/validators.js';
import * as OrderService from '../services/order.service.js';

const router = express.Router();

// GET all non-completed orders
router.get('/', authenticateToken, async (req, res, next) => {
    try {
        const orders = await OrderService.getAllOrders();
        res.json({ message: 'success', data: orders });
    } catch (err) {
        console.log('[ERROR] Failed to retrieve orders:', err);
        next(err); // Pass error to global error handler
    }
});

// GET only completed orders
router.get('/completed', authenticateToken, async (req, res, next) => {
    try {
        const orders = await OrderService.getCompletedOrders();
        res.json({ message: "success", data: orders });
    } catch (err) {
        console.log("[ERROR] Failed to retrieve completed orders:", err);
        next(err);
    }
});

// GET single order by id
router.get('/:id', authenticateToken, async (req, res, next) => {
    try {
        const order = await OrderService.getOrderById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.json({ message: 'success', data: order });
    } catch (err) {
        console.log('[ERROR] Failed to retrieve order:', err);
        next(err);
    }
});

// PATCH: Mark order as completed
router.patch('/:id/complete', authenticateToken, isAdmin, async (req, res, next) => {
    try {
        const success = await OrderService.completeOrder(req.params.id);
        if (!success) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.json({ message: 'Order marked as completed.' });
    } catch (err) {
        console.log("[ERROR] Failed to complete order:", err);
        next(err);
    }
});

// POST a new order
router.post('/', authenticateToken, orderValidationRules(), validate, async (req, res, next) => {
    try {
        const newOrder = await OrderService.createOrder(req.body);
        res.status(201).json({ message: "Order created successfully", data: newOrder });
    } catch (err) {
        console.log('[ERROR] Failed to create order:', err);
        next(err);
    }
});


// PUT (update) an existing order
router.put('/:id', authenticateToken, orderValidationRules(), validate, async (req, res, next) => {
    try {
        const updatedOrder = await OrderService.updateOrder(req.params.id, req.body);
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        res.json({ message: 'Order updated successfully', data: updatedOrder });
    } catch (err) {
        console.log('[ERROR] Failed to update order:', err);
        next(err);
    }
});

// DELETE an order
router.delete('/:id', authenticateToken, isAdmin, async (req, res, next) => {
    try {
        const result = await OrderService.deleteOrder(req.params.id);
         if (!result) {
            return res.status(404).json({ message: 'Order not found.'});
        }
        res.status(200).json({ message: 'Order deleted successfully.' });
    } catch (err) {
        console.log('[ERROR] Failed to delete order:', err);
        next(err);
    }
});

export default router;