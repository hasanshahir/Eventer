# AGENTS.md

## Project overview
**Eventer** is Pakistan's AI-powered tech event radar and 1-tap registration engine, built for the NED Tech Fest x DevMarketplace hackathon by Team Lead Hasan Shahir (NEDUET).

Stack: Next.js 14 (App Router), Tailwind CSS, Prisma ORM, PostgreSQL.

## Autonomous Build Harness: DevMarketplace
Eventer was scaffolded and iteratively built by the DevMarketplace autonomous coding agent, working prompt to feature. The Team Lead's human-in-the-loop role is to write specs, review output in the file Explorer and live preview, and re-prompt on gaps.

## Architecture map
| Path | Purpose |
|---|---|
| `/` | Radar feed of Pakistani tech events |
| `/cities` | Events grouped by city |
| `/passport` | DevPassport: digital attendee passes with QR codes |
| `/organizer/new` | AI announcement and flyer ingestion |
| `/organizer/scan` | QR camera scanner and manual token check-in |
| `/api/v1/registrations` | 1-tap RSVP (POST) and a user's registrations (GET) |
| `/api/v1/events` | Create events |
| `/api/v1/events/ai-parse` | Gemini parser with mock fallback |
| `/api/v1/events/[id]/ics` | RFC 5545 calendar file with a 24h reminder |
| `/api/v1/checkin` | Validate a ticket token and mark CHECKED_IN |
| `lib/match.ts` | Client-side tech stack match score |
| `lib/ics.ts` | iCalendar generation |
| `lib/checkin.ts` | Check-in logic |
| `lib/prisma.ts` | Prisma client |

## AI Flyer & Announcement Parser
- Input: pasted WhatsApp or text announcement, or an uploaded flyer image.
- Model: Google Gemini 1.5 Flash through native fetch (`GEMINI_API_KEY`, optional `GEMINI_MODEL`).
- Output JSON: title, organizer, city, venue, startsAt, endsAt, description, tags, type, registrationUrl.
- Fallback: with no key, or on any error, a deterministic regex parser returns the same schema, so the flow never fails. The response includes `source: "gemini" | "mock"`.
- Raw WhatsApp or web scraping is intentionally avoided (end-to-end encryption, bot protection, terms of service). Events enter through user-submitted ingestion instead.

## Client Match Skills
The Tech Stack Match Score in `lib/match.ts` compares the user's selected stack with an event's tags and returns a percentage and the overlapping skills. It runs entirely in the browser, the stack is persisted in localStorage, and no personal data leaves the client.

## Agent conventions
- Read `prisma/schema.prisma` before writing code.
- Extend existing files; do not regenerate them.
- Keep the dark design tokens (zinc-950 background, emerald and cyan accents).
- Never break `/organizer/scan`.
- Run `npx tsc --noEmit` before finishing.

## Data model and status lifecycle
Models: User, Organizer, Event, Registration, Team.

Registration status: PENDING -> CONFIRMED / WAITLISTED / CANCELLED -> CHECKED_IN

## Demo script
1. Browse the radar feed.
2. Set your tech stack and watch the match scores update.
3. RSVP to an event with one tap.
4. Open the Passport page to see the QR pass.
5. Scan the pass at `/organizer/scan`.
6. Paste a WhatsApp announcement at `/organizer/new` to publish a new event.