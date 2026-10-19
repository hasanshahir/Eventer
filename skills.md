# SKILLS.md — Eventer agent skills

Reusable playbooks for AI coding agents working on this repo. Read `AGENTS.md` first.

## Skill: add-page
**When:** adding a route under `app/`.
1. Read `prisma/schema.prisma` and `lib/ev.ts` to learn the real field names.
2. Server components fetch with `(prisma as any).event.findMany({ include: { organizer: true } })` and map through `toCard`.
3. Anything using `useState`, `localStorage` or `useSearchParams` is a client component (`"use client"`). Wrap `useSearchParams` consumers in `<Suspense>`.
4. Never import `@/lib/prisma` into a client component.
5. Use the dark design tokens below. Add the link to `components/Nav.tsx`.

## Skill: add-api-route
**When:** adding or editing `app/api/v1/**/route.ts`.
1. Export `const dynamic = "force-dynamic"`.
2. Validate input, return `NextResponse.json` with proper status codes (400, 404, 409, 500).
3. Keep routes idempotent where possible. RSVP returns the existing registration instead of creating a duplicate.
4. Wrap handlers in try/catch and return `{ error }` instead of throwing.

## Skill: ticket-token-flow
**When:** touching registrations, passport or check-in.
- `POST /api/v1/registrations` creates a `Registration` with a `crypto.randomUUID()` `ticketToken`.
- `/passport` renders `QRCodeSVG` with `value = ticketToken` on a white padded background.
- `/organizer/scan` validates by the token's last path segment, so a bare UUID works.
- Status lifecycle: PENDING -> CONFIRMED / WAITLISTED / CANCELLED -> CHECKED_IN. Check-in must be idempotent (a second scan returns ALREADY_CHECKED_IN).
- Never change the token format without testing the full RSVP -> Passport -> Scan chain.

## Skill: ai-event-parser
**When:** editing `app/api/v1/events/ai-parse/route.ts`.
- Input `{ text?, imageBase64?, mimeType? }`. Output `{ ok: true, source: