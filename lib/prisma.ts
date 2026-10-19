import { PrismaClient } from '@prisma/client';

/** Pooled connection strings (pgbouncer) need prepared statements disabled. */
function buildUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;
  if (raw.includes('pgbouncer=')) return raw;
  return raw + (raw.includes('?') ? '&' : '?') + 'pgbouncer=true';
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: buildUrl() ? { db: { url: buildUrl()! } } : undefined,
    log: ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
