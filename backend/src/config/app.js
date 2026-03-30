import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import prisma from './db.js' 

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Simple Test Route to verify Prisma & Docker DB connection
app.get('/test-db', async (req, res) => {
  try {
    // Prisma uses the model name (User) defined in your schema.prisma
    // Using findFirst() to just grab one record to check the connection
    const user = await prisma.user.findFirst()
    
    res.json({ 
      message: "Successfully connected to PostgreSQL via Prisma!", 
      data: user 
    })
  } catch (err) {
    res.status(500).json({ 
      message: "Database connection failed", 
      error: err.message 
    })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})