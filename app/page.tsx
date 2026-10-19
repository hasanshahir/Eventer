import { getFeed } from '@/lib/events';
import { getUrgency, URGENCY_LABEL, type Urgency } from '@/lib/urgency';

// The feed reads the database, so render on each request.
export const dynamic = 'force-dynamic';

const BADGE_STATES: Urgency[] = ['LIVE', 'H48', 'CLOSING_SOON'];

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; city?: string };
}) {
  const feed = await getFeed({ q: searchParams.q, city: searchParams.city });
  const now = new Date();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Radar Feed</h1>
      {feed.error && (
        <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">{feed.error}</p>
      )}
      {feed.events.length === 0 ? (
        <p className="text-neutral-500">No events match your filters yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {feed.events.map((e) => {
            const urgency = getUrgency(e, now);
            return (
              <li key={e.id} className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs">
                  {BADGE_STATES.includes(urgency) && (
                    <span className="rounded-full bg-radar-50 px-2 py-0.5 font-semibold text-radar-900">
                      {URGENCY_LABEL[urgency]}
                    </span>
                  )}
                  <span className="text-neutral-500">{e.city}</span>
                </div>
                <h2 className="mt-2 font-semibold">{e.title}</h2>
                <p className="text-sm text-neutral-600">{e.organizer.name}</p>
                {e.prizePool && <p className="mt-2 text-sm font-medium">🏆 {e.prizePool}</p>}
                {e.venueName && <p className="text-sm text-neutral-500">{e.venueName}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
