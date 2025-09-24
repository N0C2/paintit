import { getDbPool } from '../database.js';
import bcrypt from 'bcrypt';

export const createUser = async (userData) => {
    const db = getDbPool();
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { firstName, lastName, branch, email, password, role } = userData;

        const [users] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            throw new Error('Email ist bereits vergeben.'); // This should be a custom error to be caught and handled with a 409 status
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await connection.query(
            'INSERT INTO users (email, password, role, firstName, lastName) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, role || 'user', firstName, lastName]
        );
        const userId = result.insertId;

        const branchArr = Array.isArray(branch) ? branch : [branch];
        for (const branchName of branchArr) {
            const [branchRows] = await connection.query('SELECT id FROM branch WHERE name = ?', [branchName]);
            if (branchRows.length > 0) {
                await connection.query('INSERT INTO user_branches (user_id, branch_id) VALUES (?, ?)', [userId, branchRows[0].id]);
            }
        }

        await connection.commit();
        return { id: userId, ...userData };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

export const getDropdowns = async () => {
    const db = getDbPool();
    const [branches] = await db.query('SELECT name FROM branch');
    const [roles] = await db.query('SELECT name FROM roles');
    return { branches: branches.map(b => b.name), roles: roles.map(r => r.name) };
};

export const getAllUsers = async () => {
    const db = getDbPool();
    const [users] = await db.query('SELECT id, email, role, firstName, lastName FROM users');
    const [userBranches] = await db.query(`
        SELECT ub.user_id, b.name as branchName
        FROM user_branches ub
        JOIN branch b ON ub.branch_id = b.id
    `);

    const userIdToBranches = {};
    for (const row of userBranches) {
        if (!userIdToBranches[row.user_id]) userIdToBranches[row.user_id] = [];
        userIdToBranches[row.user_id].push(row.branchName);
    }

    return users.map(u => ({ ...u, branches: userIdToBranches[u.id] || [] }));
};

export const updateUser = async (userId, userData) => {
    const db = getDbPool();
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const { email, role, firstName, lastName, branch } = userData;

        await connection.query(
            'UPDATE users SET email=?, role=?, firstName=?, lastName=? WHERE id=?',
            [email, role, firstName, lastName, userId]
        );

        await connection.query('DELETE FROM user_branches WHERE user_id=?', [userId]);
        const branchArr = Array.isArray(branch) ? branch : [branch];
        for (const branchName of branchArr) {
            const [branchRows] = await connection.query('SELECT id FROM branch WHERE name = ?', [branchName]);
            if (branchRows.length > 0) {
                await connection.query('INSERT INTO user_branches (user_id, branch_id) VALUES (?, ?)', [userId, branchRows[0].id]);
            }
        }

        await connection.commit();
        return { id: userId, ...userData };
    } catch (err) {
        await connection.rollback();
        throw err;
    } finally {
        connection.release();
    }
};

export const deleteUser = async (userId) => {
    const db = getDbPool();
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);
    return result.affectedRows > 0;
};
