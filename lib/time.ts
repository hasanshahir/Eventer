/** All user-facing times are shown in Pakistan Standard Time. */
export const PKT = 'Asia/Karachi';

const dateFmt = new Intl.DateTimeFormat('en-PK', {
  timeZone: PKT,
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});
const timeFmt = new Intl.DateTimeFormat('en-PK', {
  timeZone: PKT,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});
const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone: PKT, year: 'numeric', month: '2-digit', day: '2-digit' });

export function formatPktDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

export function formatPktTime(iso: string): string {
  return timeFmt.format(new Date(iso));
}

/** "Sat, 14 Mar · 9:00 AM – 6:00 PM PKT" or multi-day range. */
export function formatPktRange(startIso: string, endIso: string): string {
  const sameDay = dayKey.format(new Date(startIso)) === dayKey.format(new Date(endIso));
  if (sameDay) {
    return `${formatPktDate(startIso)} · ${formatPktTime(startIso)} – ${formatPktTime(endIso)} PKT`;
  }
  return `${formatPktDate(startIso)} ${formatPktTime(startIso)} → ${formatPktDate(endIso)} ${formatPktTime(endIso)} PKT`;
}

/** "in 3d 4h" / "in 5h" style countdown (no seconds, render-stable). */
export function countdown(targetIso: string, now = new Date()): string {
  const ms = new Date(targetIso).getTime() - now.getTime();
  if (ms <= 0) return 'closed';
  const h = Math.floor(ms / 3_600_000);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h`;
  if (h > 0) return `${h}h`;
  return `${Math.max(1, Math.floor(ms / 60_000))}m`;
}
