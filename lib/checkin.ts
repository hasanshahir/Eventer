// Server-only check-in logic. Marks a Registration CHECKED_IN by ticketToken.
import { prisma } from './prisma';
import type { CheckinAttendee, CheckinResult, RecentCheckin } from './checkin-types';

type RegWithRelations = {
  id: string;
  status: string;
  checkedInAt: Date | null;
  user: { fullName: string; university: string | null };
  event: { title: string };
  team: { name: string } | null;
};

function toAttendee(reg: RegWithRelations): CheckinAttendee {
  return {
    name: reg.user.fullName,
    university: reg.user.university,
    eventTitle: reg.event.title,
    teamName: reg.team?.name ?? null,
  };
}

function result(
  outcome: CheckinResult['outcome'],
  message: string,
  reg: RegWithRelations | null,
  checkedInAt: Date | null = null,
): CheckinResult {
  return {
    outcome,
    message,
    attendee: reg ? toAttendee(reg) : null,
    checkedInAt: checkedInAt ? checkedInAt.toISOString() : null,
  };
}

/** Accepts a raw token or a URL ending in the token (in case a QR encodes a link). */
export function normalizeToken(raw: string): string {
  const trimmed = raw.trim();
  const last = trimmed.split('/').filter(Boolean).pop() ?? '';
  return last.slice(0, 128);
}

const include = { user: true, event: true, team: true } as const;

export async function checkInByToken(raw: string): Promise<CheckinResult> {
  const token = normalizeToken(raw);
  if (!token) return result('INVALID', 'Enter a ticket token to check in.', null);

  const reg = await prisma.registration.findUnique({
    where: { ticketToken: token },
    include,
  });
  if (!reg) return result('INVALID', 'No registration matches this token.', null);

  if (reg.status === 'CANCELLED') {
    return result('CANCELLED', 'This registration was cancelled. Do not admit.', reg);
  }
  if (reg.status === 'CHECKED_IN') {
    return result('ALREADY_CHECKED_IN', 'Already checked in.', reg, reg.checkedInAt);
  }
  if (reg.status !== 'CONFIRMED') {
    return result('INVALID', `Registration is ${reg.status.toLowerCase()}, not confirmed.`, reg);
  }

  // Conditional update so two scanners racing on the same ticket cannot both succeed.
  const updated = await prisma.registration.updateMany({
    where: { id: reg.id, status: 'CONFIRMED' },
    data: { status: 'CHECKED_IN', checkedInAt: new Date() },
  });
  const fresh = await prisma.registration.findUnique({ where: { id: reg.id }, include });
  if (!fresh) return result('INVALID', 'No registration matches this token.', null);

  if (updated.count === 0) {
    return result('ALREADY_CHECKED_IN', 'Already checked in.', fresh, fresh.checkedInAt);
  }
  return result('SUCCESS', 'Checked in. Welcome!', fresh, fresh.checkedInAt);
}

export async function recentCheckins(limit = 15): Promise<RecentCheckin[]> {
  const rows = await prisma.registration.findMany({
    where: { status: 'CHECKED_IN', checkedInAt: { not: null } },
    orderBy: { checkedInAt: 'desc' },
    take: Math.min(Math.max(limit, 1), 50),
    include,
  });
  return rows.map((r) => ({
    id: r.id,
    ...toAttendee(r),
    checkedInAt: (r.checkedInAt as Date).toISOString(),
  }));
}
