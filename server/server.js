import express from 'express';
import cors from 'cors';
import setupRoutes from './routes/setup.routes.js';
import dbRoutes from './routes/db.routes.js';

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

app.use('/api', setupRoutes);
app.use('/api', dbRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
