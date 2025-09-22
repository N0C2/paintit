import { getDbPool } from '../database.js';

export const getAllOrders = async () => {
    const db = getDbPool();
    const [orders] = await db.query("SELECT * FROM orders ORDER BY id DESC");
    return orders;
};

export const getOrderById = async (id) => {
    const db = getDbPool();
    const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [id]);
    if (orders.length === 0) return null;

    const [items] = await db.query("SELECT part, code, info, additional_info FROM order_items WHERE order_id = ?", [id]);
    
    // Format completionDate to YYYY-MM-DD for the input[type=date]
    const order = orders[0];
    if (order.completionDate) {
        order.completionDate = new Date(order.completionDate).toISOString().split('T')[0];
    }
    
    return { ...order, items };
};

export const createOrder = async (orderData) => {
    const db = getDbPool();
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { customerFirstName, customerLastName, completionDate, vin, orderNumber, paintNumber, branch, additionalOrderInfo, items } = orderData;
        
        const orderSql = `INSERT INTO orders (customerFirstName, customerLastName, completionDate, vin, orderNumber, paintNumber, branch, additionalOrderInfo, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [orderResult] = await connection.execute(orderSql, [customerFirstName, customerLastName, completionDate || null, vin, orderNumber, paintNumber, branch, additionalOrderInfo, 'new']);
        const orderId = orderResult.insertId;
        
        const itemSql = `INSERT INTO order_items (order_id, part, code, info, additional_info) VALUES (?, ?, ?, ?, ?)`;
        if (items && items.length > 0) {
            for (const item of items) {
                if (item.part || item.code || item.info || item.additional_info) {
                     await connection.execute(itemSql, [orderId, item.part, item.code, item.info, item.additional_info]);
                }
            }
        }
        await connection.commit();
        return { id: orderId, ...orderData };
    } catch (err) {
        await connection.rollback();
        console.error("Error in createOrder service:", err);
        throw new Error("Database transaction failed.");
    } finally {
        connection.release();
    }
};

export const updateOrder = async (id, orderData) => {
    const db = getDbPool();
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { customerFirstName, customerLastName, completionDate, vin, orderNumber, paintNumber, branch, additionalOrderInfo, items } = orderData;

        // Check if order exists
        const [orderExists] = await connection.query("SELECT id FROM orders WHERE id = ?", [id]);
        if (orderExists.length === 0) {
            await connection.rollback();
            return null; // Not found
        }
        
        const orderSql = `UPDATE orders SET customerFirstName = ?, customerLastName = ?, completionDate = ?, vin = ?, orderNumber = ?, paintNumber = ?, branch = ?, additionalOrderInfo = ? WHERE id = ?`;
        await connection.execute(orderSql, [customerFirstName, customerLastName, completionDate || null, vin, orderNumber, paintNumber, branch, additionalOrderInfo, id]);
        
        // Easiest way to handle items is to delete old ones and insert new ones
        await connection.execute('DELETE FROM order_items WHERE order_id = ?', [id]);

        const itemSql = `INSERT INTO order_items (order_id, part, code, info, additional_info) VALUES (?, ?, ?, ?, ?)`;
        if (items && items.length > 0) {
            for (const item of items) {
                if (item.part || item.code || item.info || item.additional_info) {
                     await connection.execute(itemSql, [id, item.part, item.code, item.info, item.additional_info]);
                }
            }
        }
        await connection.commit();
        return { id, ...orderData };
    } catch (err) {
        await connection.rollback();
        console.error(`Error in updateOrder service for id ${id}:`, err);
        throw new Error("Database transaction failed.");
    } finally {
        connection.release();
    }
};

export const deleteOrder = async (id) => {
    const db = getDbPool();
    // Transaction not strictly necessary here since ON DELETE CASCADE handles items, but good practice.
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.execute('DELETE FROM orders WHERE id = ?', [id]);
        await connection.commit();
        return result.affectedRows > 0;
    } catch (err) {
        await connection.rollback();
        console.error(`Error in deleteOrder service for id ${id}:`, err);
        throw new Error("Database transaction failed.");
    } finally {
        connection.release();
    }
};
