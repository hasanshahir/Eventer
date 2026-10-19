import { PrismaClient } from '@prisma/client';
import { seedDatabase } from './seed-runner';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Add it in the workspace Secrets panel and re-run `npm run db:seed`.');
    process.exit(1);
  }
  const prisma = new PrismaClient();
  try {
    const res = await seedDatabase(prisma);
    console.log(`Seeded ${res.organizers} organizers, ${res.events} events and 1 demo user (dates relative to now).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
