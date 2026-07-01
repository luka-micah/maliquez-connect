import prisma from './prisma.js';

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL Connected via Prisma');
  } catch (error) {
    console.error('Database connection error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

export default connectDB;
