import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import dotenv from "dotenv";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = path.resolve(__dirname, '.env');
console.log('Looking for .env at:', envPath);
const result = dotenv.config({ path: envPath });
console.log('Dotenv config result:', result.error || 'Success');

import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import creatorRoutes from './routes/creators.js';
import uploadRoutes from './routes/upload.js';
import analyticsRoutes from './routes/analytics.js';
import usersRoutes from './routes/users.js';

const app = express();
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 3001;

connectDB();

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
app.use('/api/auth', authRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', usersRoutes);

app.get('/', (req, res) => res.send({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
