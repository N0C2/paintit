import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import { getDbPool, isSetupComplete } from './database.js';

// Import routes
import setupRouter from './routes/setup.routes.js';
import authRouter from './routes/auth.routes.js';
import orderRouter from './routes/order.routes.js';
import dropdownRouter from './routes/dropdown.routes.js';
import userRouter from './routes/user.routes.js';
 
// Lade Umgebungsvariablen immer am Anfang
dotenv.config();

const app = express();
const port = 3001;

// Security and Core Middleware
app.use(helmet());
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN : '*',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// API Status Route
app.get('/api/status', async (req, res) => {
    res.json({ setupComplete: await isSetupComplete() });
});

// API Routes
app.use('/api/setup', setupRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', orderRouter);
app.use('/api/dropdowns', dropdownRouter);
app.use('/api/users', userRouter);

// --- Frontend Serving ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something broke!', error: err.message });
});

// Start server
app.listen(port, '0.0.0.0', async () => {
    console.log(`Server is running on port ${port}.`);
    if (await isSetupComplete()) {
        await getDbPool(); // Initialize pool on startup
    } else {
        console.log("Setup not complete. Please navigate to the frontend to begin setup process.");
    }
});
