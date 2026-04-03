import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './db.js';
import swaggerUI from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

import authRoutes      from '../routes/auth.js';
import warehouseRoutes from '../routes/warehouse.js';

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
        url: "http://localhost:5000"
      }
    ]
  },
  apis: ["src/routes/*.js"] // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Docs
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

// Routes
app.use('/auth',      authRoutes);
app.use('/warehouse', warehouseRoutes);

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