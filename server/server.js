import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDbPool, isSetupComplete } from './database.js';

// Import routes
import setupRouter from './routes/setup.routes.js';
import authRouter from './routes/auth.routes.js';
import orderRouter from './routes/order.routes.js';
import dropdownRouter from './routes/dropdown.routes.js';
import userRouter from './routes/user.routes.js';

if (isSetupComplete()) {
    dotenv.config();
}

const app = express();
const port = 3001;

// Core Middleware
app.use(cors());
app.use(express.json());

// API Status Route
app.get('/api/status', (req, res) => {
    res.json({ setupComplete: isSetupComplete() });
});

// Register Routes
app.use('/api/setup', setupRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', orderRouter);
app.use('/api/dropdowns', dropdownRouter);
app.use('/api/users', userRouter);

// Start server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}.`);
    if (isSetupComplete()) {
        getDbPool(); // Initialize pool on startup
    } else {
        console.log("Setup not complete. Please navigate to the frontend to begin setup process.");
    }
});
