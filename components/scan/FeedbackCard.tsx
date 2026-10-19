'use client';

import { AlertTriangle, Ban, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import type { CheckinResult } from '@/lib/checkin-types';

const STYLES = {
  SUCCESS: { box: 'border-green-300 bg-green-50', text: 'text-green-800', Icon: CheckCircle2, label: 'Checked in' },
  ALREADY_CHECKED_IN: { box: 'border-amber-300 bg-amber-50', text: 'text-amber-800', Icon: AlertTriangle, label: 'Already checked in' },
  INVALID: { box: 'border-red-300 bg-red-50', text: 'text-red-800', Icon: XCircle, label: 'Invalid ticket' },
  CANCELLED: { box: 'border-neutral-400 bg-neutral-100', text: 'text-neutral-800', Icon: Ban, label: 'Cancelled' },
} as const;

function formatTime(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-PK', {
    timeZone: 'Asia/Karachi',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function FeedbackCard({ result, busy }: { result: CheckinResult | null; busy: boolean }) {
  if (busy) {
    return (
      <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-5 text-neutral-600">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        Checking ticket…
      </div>
    );
  }
  if (!result) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 p-5 text-center text-sm text-neutral-500">
        Scan a QR code or enter a token to see attendee details here.
      </div>
    );
  }

  const style = STYLES[result.outcome];
  const { Icon } = style;
  return (
    <div role="alert" aria-live="assertive" className={`rounded-xl border-2 p-5 ${style.box}`}>
      <div className={`flex items-center gap-2 text-lg font-bold ${style.text}`}>
        <Icon className="h-6 w-6" aria-hidden />
        {style.label}
      </div>
      <p className={`mt-1 text-sm ${style.text}`}>{result.message}</p>

      {result.attendee && (
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm text-neutral-800">
          <dt className="text-neutral-500">Attendee</dt>
          <dd className="font-semibold">{result.attendee.name}</dd>
          <dt className="text-neutral-500">University</dt>
          <dd>{result.attendee.university ?? '—'}</dd>
          <dt className="text-neutral-500">Event</dt>
          <dd>{result.attendee.eventTitle}</dd>
          <dt className="text-neutral-500">Team</dt>
          <dd>{result.attendee.teamName ?? 'Solo'}</dd>
          {result.checkedInAt && (
            <>
              <dt className="text-neutral-500">Checked in</dt>
              <dd>{formatTime(result.checkedInAt)} PKT</dd>
            </>
          )}
        </dl>
      )}
    </div>
  );
}
