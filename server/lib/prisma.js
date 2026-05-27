import { PrismaClient } from '@prisma/client';
import { createHttpError } from './http.js';

const globalForPrisma = globalThis;

function getRuntimeDatabaseUrl() {
  if (!process.env.DATABASE_URL) {
    return undefined;
  }

  const url = new URL(process.env.DATABASE_URL);

  if (url.port === '6543') {
    url.searchParams.set('pgbouncer', 'true');
    url.searchParams.set('connection_limit', '1');
  }

  return url.toString();
}

const runtimeDatabaseUrl = getRuntimeDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: runtimeDatabaseUrl
      ? {
          db: {
            url: runtimeDatabaseUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export function requireDatabase() {
  if (!process.env.DATABASE_URL) {
    throw createHttpError(503, 'database_not_configured', 'Banco de dados nao configurado.');
  }
}
