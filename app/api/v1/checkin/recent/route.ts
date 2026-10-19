import { NextResponse } from 'next/server';
import { hasDatabase } from '@/lib/prisma';
import { recentCheckins } from '@/lib/checkin';

export const dynamic = 'force-dynamic';

/** GET → most recent check-ins, newest first. */
export async function GET() {
  if (!hasDatabase()) return NextResponse.json({ items: [] });
  try {
    return NextResponse.json({ items: await recentCheckins(15) });
  } catch (err) {
    console.error('[checkin/recent] failed', err);
    return NextResponse.json({ error: 'Could not load check-ins.' }, { status: 500 });
  }
}
