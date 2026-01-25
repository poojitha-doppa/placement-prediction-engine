import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

try {
  prisma = new PrismaClient();
  // Test connection
  prisma.$connect().catch((err) => {
    console.warn('⚠️  Database connection failed. Running in mock mode.');
    console.warn('   Install PostgreSQL or use Docker to enable persistence.');
  });
} catch (error) {
  console.warn('⚠️  Prisma not initialized. Running in mock mode.');
}

export default prisma!;
