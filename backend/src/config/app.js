import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './db.js';

import authRoutes      from '../routes/auth.js';
import warehouseRoutes from '../routes/warehouse.js';
import manufacturerRoutes from '../routes/manufacturer.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth',      authRoutes);
app.use('/warehouse', warehouseRoutes);
app.use('/manufacturer', manufacturerRoutes);

// DB test route
app.get('/test-db', async (req, res) => {
  try {
    const user = await prisma.user.findFirst();
    res.json({
      message: 'Successfully connected to PostgreSQL via Prisma!',
      data: user
    });
  } catch (err) {
    res.status(500).json({
      message: 'Database connection failed',
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});