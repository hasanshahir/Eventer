import type { EventDTO } from './types';

export type Urgency = 'LIVE' | 'H48' | 'CLOSING_SOON' | 'OPEN' | 'CLOSED' | 'ENDED';

const HOUR = 3_600_000;

/**
 * Urgency rules (spec):
 *  - Live         = now is between start and end
 *  - 48h Left     = registration deadline within the next 48 hours
 *  - Closing Soon = registration deadline within the next 7 days
 */
export function getUrgency(e: Pick<EventDTO, 'startTime' | 'endTime' | 'registrationDeadline'>, now = new Date()): Urgency {
  const t = now.getTime();
  const start = new Date(e.startTime).getTime();
  const end = new Date(e.endTime).getTime();
  const deadline = new Date(e.registrationDeadline).getTime();

  if (t >= start && t <= end) return 'LIVE';
  if (t > end) return 'ENDED';
  const left = deadline - t;
  if (left <= 0) return 'CLOSED';
  if (left <= 48 * HOUR) return 'H48';
  if (left <= 7 * 24 * HOUR) return 'CLOSING_SOON';
  return 'OPEN';
}

export const URGENCY_LABEL: Record<Urgency, string> = {
  LIVE: 'Live',
  H48: '48h Left',
  CLOSING_SOON: 'Closing Soon',
  OPEN: 'Open',
  CLOSED: 'Registration Closed',
  ENDED: 'Ended',
};

/** Sort weight: live first, then most urgent deadlines. */
export const URGENCY_RANK: Record<Urgency, number> = {
  LIVE: 0,
  H48: 1,
  CLOSING_SOON: 2,
  OPEN: 3,
  CLOSED: 4,
  ENDED: 5,
};
