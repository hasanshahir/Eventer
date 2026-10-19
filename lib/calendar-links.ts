import type { EventDTO } from './types';
import { eventLocation, toIcsUtc } from './ics';

export function googleCalendarUrl(e: EventDTO): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${toIcsUtc(e.startTime)}/${toIcsUtc(e.endTime)}`,
    details: `${e.description}${e.prizePool ? `\n\n🏆 ${e.prizePool}` : ''}${e.externalUrl ? `\n${e.externalUrl}` : ''}`,
    location: eventLocation(e),
    ctz: 'Asia/Karachi',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function icsUrl(e: Pick<EventDTO, 'id'>): string {
  return `/api/v1/calendar/${encodeURIComponent(e.id)}`;
}
