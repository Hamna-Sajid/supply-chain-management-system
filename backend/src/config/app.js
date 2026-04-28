import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './db.js';
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

import authRoutes from '../routes/auth.js';
import supplierRoutes from '../routes/supplier.js';
import warehouseRoutes from '../routes/warehouse.js';
import manufacturerRoutes from '../routes/manufacturer.js';
import analyticsRoutes from '../routes/analytics.js';
import notificationRoutes from '../routes/notifications.js';

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Supply Chain Management API",
      version: "1.0.0",
      description: "API endpoints for the Supply Chain Management System"
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    servers: [
      {
        url: "http://localhost:${process.env.PORT || 5000}",
        description: "Local development server"
      }
    ]
  },
  apis: ["src/routes/*.js"] // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

dotenv.config();

const REQUIRED_ENV_VARS = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const app = express();

// ─── Core middleware ──────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json());

// Swagger Docs
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/supplier', supplierRoutes);
app.use('/warehouse', warehouseRoutes);
app.use('/manufacturer', manufacturerRoutes);
app.use('/analytics', analyticsRoutes);
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