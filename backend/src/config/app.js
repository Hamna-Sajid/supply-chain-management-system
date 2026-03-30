import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import supabase from './config/db.js' // Import your new config

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Simple Test Route to verify DB connection
app.get('/test-db', async (req, res) => {
  try {
    // Replace 'users' with any table name you actually have in Supabase
    const { data, error } = await supabase.from('users').select('*').limit(1)
    
    if (error) throw error
    
    res.json({ message: "Successfully connected to Supabase!", data })
  } catch (err) {
    res.status(500).json({ message: "Database connection failed", error: err.message })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`)
})