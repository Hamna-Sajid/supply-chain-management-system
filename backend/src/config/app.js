import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './db.js';

import authRoutes         from '../routes/auth.routes.js';
import warehouseRoutes    from '../routes/warehouse.routes.js';
import manufacturerRoutes from '../routes/manufacturer.routes.js';
import analyticsRoutes    from '../routes/analytics.routes.js';
import notificationRoutes from '../routes/notification.routes.js';

dotenv.config();

const app = express();

// ─── Core middleware ──────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth',          authRoutes);
app.use('/warehouse',     warehouseRoutes);
app.use('/manufacturer',  manufacturerRoutes);
app.use('/analytics',     analyticsRoutes);
app.use('/notifications', notificationRoutes);

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