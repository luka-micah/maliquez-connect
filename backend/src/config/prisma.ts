import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { config } from 'dotenv';

config();

const isNeon = process.env.DB_URL?.includes('neon.tech');
const pool = new pg.Pool({
  connectionString: process.env.DB_URL,
  ...(isNeon && { ssl: { rejectUnauthorized: false } }),
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
