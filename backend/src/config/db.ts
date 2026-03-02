import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;
let connectionAttempted = false;
let connectionSuccessful = false;

try {
  prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
  
  // Test connection immediately
  prisma.$connect()
    .then(() => {
      connectionAttempted = true;
      connectionSuccessful = true;
      console.log('✅ MongoDB connected successfully');
      console.log('📊 Database:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[1]?.split('?')[0]);
    })
    .catch((err) => {
      connectionAttempted = true;
      connectionSuccessful = false;
      console.error('❌ Database connection failed:', err.message);
      console.error('   Running in mock mode.');
      console.error('   Check your DATABASE_URL in .env file');
    });
} catch (error: any) {
  console.error('❌ Prisma initialization failed:', error.message);
  console.error('   Running in mock mode.');
}

export default prisma!;
export { connectionSuccessful };
