import { NextResponse } from 'next/server';
import { hasDatabase } from '@/lib/prisma';
import { checkInByToken } from '@/lib/checkin';

export const dynamic = 'force-dynamic';

/** POST { token } → check-in outcome (SUCCESS | ALREADY_CHECKED_IN | INVALID | CANCELLED). */
export async function POST(req: Request) {
  if (!hasDatabase()) {
    return NextResponse.json({ error: 'DATABASE_URL is not configured.' }, { status: 503 });
  }

  let body: { token?: unknown };
  try {
    body = (await req.json()) as { token?: unknown };
  } catch {
    return NextResponse.json({ error: 'Request body must be JSON.' }, { status: 400 });
  }
  if (typeof body.token !== 'string') {
    return NextResponse.json({ error: 'token must be a string.' }, { status: 400 });
  }

  try {
    const result = await checkInByToken(body.token);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[checkin] failed', err);
    return NextResponse.json({ error: 'Check-in failed. Try again.' }, { status: 500 });
  }
}
