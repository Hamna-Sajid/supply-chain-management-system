import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// loads the variables from .env file
dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

// Create a single supabase client that the whole app can share
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase