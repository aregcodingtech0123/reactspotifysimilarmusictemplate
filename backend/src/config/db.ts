/**
 * Prisma client singleton.
 * Prevents multiple instances in development (hot reload).
 */
import { PrismaClient } from '@prisma/client';
import { isDev } from './env';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: isDev ? ['query', 'error', 'warn'] : ['error'],
  });

if (isDev) {
  globalThis.prisma = prisma;
}

/**
 * Test database connection on startup.
 * Logs error but doesn't throw to allow server to start.
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Please check:');
    console.error('  1. Is PostgreSQL running?');
    console.error('  2. Is DATABASE_URL correct in .env?');
    console.error('  3. Have you run: npx prisma generate && npx prisma migrate dev');
    return false;
  }
}
