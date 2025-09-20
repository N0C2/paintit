import { Router } from 'express';
import fs from 'fs';
import { runSetup } from '../setup.js';

const router = Router();
const flagFile = './.setupDone';
const envFile = './.env'; // New variable for the .env file

router.post('/setup', async (req, res) => {
  if (fs.existsSync(flagFile)) {
    return res.status(400).json({ message: 'Setup is already complete.' });
  }

  try {
    // Write the database credentials to the .env file
    const envContent = `DB_HOST=${req.body.dbHost}\nDB_USER=${req.body.dbUser}\nDB_PASS=${req.body.dbPass}\nDB_NAME=${req.body.dbName}`;
    fs.writeFileSync(envFile, envContent);

    // Run the setup with the provided credentials
    await runSetup(req.body);

    // Create the .setupDone flag file
    fs.writeFileSync(flagFile, 'done');
    res.json({ message: 'Setup completed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/setup/status', (req, res) => {
  res.json({ done: fs.existsSync(flagFile) });
});

export default router;
