import type { EventDTO } from './types';

/** RFC 5545 helpers: UTC 'Z' timestamps, text escaping, 75-octet line folding, CRLF. */

export function toIcsUtc(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function escapeText(v: string): string {
  return v.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

/** Fold lines longer than 75 octets (UTF-8 safe: never splits a code point). */
export function foldLine(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let current = '';
  let bytes = 0;
  for (const ch of line) {
    const len = enc.encode(ch).length;
    const limit = parts.length === 0 ? 75 : 74; // continuation lines start with a space
    if (bytes + len > limit) {
      parts.push(current);
      current = '';
      bytes = 0;
    }
    current += ch;
    bytes += len;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

export function eventLocation(e: EventDTO): string {
  if (e.mode === 'ONLINE') return 'Online';
  return [e.venueName, e.venueAddress, e.city].filter(Boolean).join(', ');
}

export function buildIcs(e: EventDTO, opts: { baseUrl?: string; now?: Date } = {}): string {
  const now = opts.now ?? new Date();
  const url = e.externalUrl || (opts.baseUrl ? `${opts.baseUrl}/?q=${encodeURIComponent(e.title)}` : '');
  const desc = [
    e.description,
    e.prizePool ? `Prize pool: ${e.prizePool}` : '',
    e.perks.length ? `Perks: ${e.perks.join(', ')}` : '',
    `Organizer: ${e.organizer.name}`,
    url ? `More info: ${url}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const alarm = (trigger: string, label: string) => [
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeText(`${e.title} starts in ${label}`)}`,
    `TRIGGER:${trigger}`,
    'END:VALARM',
  ];

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Eventer//Tech Radar PK//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${e.id}@eventer.pk`,
    `DTSTAMP:${toIcsUtc(now)}`,
    `DTSTART:${toIcsUtc(e.startTime)}`,
    `DTEND:${toIcsUtc(e.endTime)}`,
    `SUMMARY:${escapeText(e.title)}`,
    `DESCRIPTION:${escapeText(desc)}`,
    `LOCATION:${escapeText(eventLocation(e))}`,
    ...(url ? [`URL:${url}`] : []),
    `ORGANIZER;CN=${escapeText(e.organizer.name)}:mailto:events@eventer.pk`,
    `CATEGORIES:${escapeText(e.type)}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    ...alarm('-PT24H', '24 hours'),
    ...alarm('-PT2H', '2 hours'),
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(foldLine).join('\r\n') + '\r\n';
}
