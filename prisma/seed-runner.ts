import type { PrismaClient } from '@prisma/client';
import { buildSeedEvents, seedOrganizers } from './seed-data';

/** Idempotent seed (upserts by slug/email). Used by `npm run db:seed` and first-load auto-seed. */
export async function seedDatabase(prisma: PrismaClient, now = new Date()) {
  const orgIds = new Map<string, string>();
  for (const o of seedOrganizers) {
    const { id, ...data } = o;
    const row = await prisma.organizer.upsert({ where: { slug: o.slug }, update: data, create: { id, ...data } });
    orgIds.set(o.slug, row.id);
  }

  const events = buildSeedEvents(now);
  for (const e of events) {
    const { id, organizerSlug, ...data } = e;
    const organizerId = orgIds.get(organizerSlug)!;
    await prisma.event.upsert({
      where: { slug: e.slug },
      update: { ...data, organizerId },
      create: { id, ...data, organizerId },
    });
  }

  // Demo account for judges (phase 2 wires the header switcher to it).
  await prisma.user.upsert({
    where: { email: 'hasan.shahir@neduet.edu.pk' },
    update: {},
    create: {
      id: 'usr_demo_hasan',
      email: 'hasan.shahir@neduet.edu.pk',
      fullName: 'Hasan Shahir',
      university: 'NEDUET',
      degreeProgram: 'BE Software Engineering',
      graduationYear: 2027,
      city: 'Karachi',
      techStack: ['Next.js', 'C++', 'Python', 'AI'],
    },
  });

  return { organizers: seedOrganizers.length, events: events.length };
}
