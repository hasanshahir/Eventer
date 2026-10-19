import { hasDatabase, prisma } from './prisma';
import type { EventDTO, FeedResult } from './types';
import { buildSeedEvents, seedOrganizers } from '@/prisma/seed-data';
import { seedDatabase } from '@/prisma/seed-runner';
import { getUrgency, URGENCY_RANK } from './urgency';

export const CITY_FILTERS = ['All', 'Karachi', 'Lahore', 'Islamabad', 'Hybrid'] as const;

const include = { organizer: true, _count: { select: { registrations: true } } } as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDTO(e: any): EventDTO {
  return {
    id: e.id,
    title: e.title,
    slug: e.slug,
    description: e.description,
    type: e.type,
    mode: e.mode,
    venueName: e.venueName,
    venueAddress: e.venueAddress,
    city: e.city,
    startTime: new Date(e.startTime).toISOString(),
    endTime: new Date(e.endTime).toISOString(),
    registrationDeadline: new Date(e.registrationDeadline).toISOString(),
    capacity: e.capacity,
    pricePkr: e.pricePkr,
    prizePool: e.prizePool,
    perks: e.perks ?? [],
    eligibility: e.eligibility,
    externalUrl: e.externalUrl,
    tags: e.tags ?? [],
    isFeatured: e.isFeatured,
    organizer: {
      name: e.organizer.name,
      slug: e.organizer.slug,
      verified: e.organizer.verified,
      logoUrl: e.organizer.logoUrl,
    },
    registrationCount: e._count?.registrations ?? 0,
  };
}

/** In-memory copy of the seed, used only when the database is unreachable. */
let fallbackCache: EventDTO[] | null = null;
function fallbackEvents(): EventDTO[] {
  if (!fallbackCache) {
    fallbackCache = buildSeedEvents(new Date()).map((e) => {
      const org = seedOrganizers.find((o) => o.slug === e.organizerSlug)!;
      return toDTO({ ...e, organizer: org, _count: { registrations: 0 } });
    });
  }
  return fallbackCache;
}

let seedAttempted = false;

async function loadAll(): Promise<FeedResult> {
  if (!hasDatabase()) {
    return { events: fallbackEvents(), source: 'fallback', error: 'DATABASE_URL is not set — showing built-in demo events.' };
  }
  try {
    let rows = await prisma.event.findMany({ where: { isPublished: true }, include });
    if (rows.length === 0 && !seedAttempted) {
      // First run on an empty database: seed once so the demo works end to end.
      seedAttempted = true;
      await seedDatabase(prisma);
      rows = await prisma.event.findMany({ where: { isPublished: true }, include });
    }
    return { events: rows.map(toDTO), source: 'database' };
  } catch (err) {
    console.error('[events] database query failed, using fallback:', err);
    return {
      events: fallbackEvents(),
      source: 'fallback',
      error: 'Database tables are not ready yet (migration pending?) — showing built-in demo events.',
    };
  }
}

export function matchesCity(e: EventDTO, city: string): boolean {
  if (!city || city === 'All') return true;
  if (city === 'Hybrid') return e.mode === 'HYBRID';
  if (city === 'Remote') return e.mode === 'ONLINE' || e.city === 'Remote';
  return e.city.toLowerCase() === city.toLowerCase();
}

export function matchesQuery(e: EventDTO, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const hay = [e.title, e.description, e.city, e.venueName ?? '', e.organizer.name, e.type, ...e.tags, ...e.perks]
    .join(' ')
    .toLowerCase();
  return needle.split(/\s+/).every((w) => hay.includes(w));
}

export async function getFeed(opts: { q?: string; city?: string } = {}): Promise<FeedResult> {
  const res = await loadAll();
  const now = new Date();
  const events = res.events
    .filter((e) => getUrgency(e, now) !== 'ENDED')
    .filter((e) => matchesCity(e, opts.city ?? 'All'))
    .filter((e) => matchesQuery(e, opts.q ?? ''))
    .sort((a, b) => {
      const r = URGENCY_RANK[getUrgency(a, now)] - URGENCY_RANK[getUrgency(b, now)];
      return r !== 0 ? r : a.startTime.localeCompare(b.startTime);
    });
  return { ...res, events };
}

export async function getEventById(id: string): Promise<EventDTO | null> {
  if (hasDatabase()) {
    try {
      const row = await prisma.event.findFirst({ where: { OR: [{ id }, { slug: id }] }, include });
      if (row) return toDTO(row);
    } catch (err) {
      console.error('[events] getEventById failed, trying fallback:', err);
    }
  }
  return fallbackEvents().find((e) => e.id === id || e.slug === id) ?? null;
}
