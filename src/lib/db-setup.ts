import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
const prisma = new PrismaClient();

async function main() {
  try {
    // Generate Prisma client
    await execAsync('npx prisma generate');

    // Deploy migrations
    await execAsync('npx prisma migrate deploy');

    // Connect and verify
    await prisma.$connect();
    console.log('Database connected successfully');

    // Create extension if needed
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    
    console.log('Database setup completed');
  } catch (error) {
    console.error('Database setup error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 