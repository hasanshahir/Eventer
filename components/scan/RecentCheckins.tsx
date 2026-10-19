'use client';

import { Loader2 } from 'lucide-react';
import type { RecentCheckin } from '@/lib/checkin-types';

export function RecentCheckins({ items, loading }: { items: RecentCheckin[]; loading: boolean }) {
  return (
    <section aria-labelledby="recent-heading" className="rounded-xl border border-neutral-200 bg-white p-4">
      <h2 id="recent-heading" className="text-sm font-semibold text-neutral-900">
        Recent check-ins
      </h2>
      {loading && items.length === 0 ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading…
        </div>
      ) : items.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-500">No check-ins yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-neutral-100">
          {items.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-neutral-900">{c.name}</p>
                <p className="truncate text-xs text-neutral-500">
                  {c.eventTitle}
                  {c.teamName ? ` · ${c.teamName}` : ''}
                </p>
              </div>
              <time dateTime={c.checkedInAt} className="shrink-0 text-xs tabular-nums text-neutral-500">
                {new Date(c.checkedInAt).toLocaleTimeString('en-PK', {
                  timeZone: 'Asia/Karachi',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
