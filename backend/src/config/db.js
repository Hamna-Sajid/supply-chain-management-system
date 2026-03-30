import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { PrismaClient } = require('../generated/prisma/index.js');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;