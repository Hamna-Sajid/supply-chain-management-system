import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './db.js';

import authRoutes from '../routes/auth.js';
import supplierRoutes from '../routes/supplier.js';
import warehouseRoutes from '../routes/warehouse.js';
import manufacturerRoutes from '../routes/manufacturer.js';
import analyticsRoutes from '../routes/analytics.js';
import notificationRoutes from '../routes/notifications.js';

dotenv.config();

const app = express();

// ─── Core middleware ──────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/manufacturer', manufacturerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── DB test ──────────────────────────────────────────────────────────────────
app.get('/test-db', async (req, res) => {
  try {
    const user = await prisma.user.findFirst();
    res.json({ message: 'Successfully connected to PostgreSQL via Prisma!', data: user });
  } catch (err) {
    res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});