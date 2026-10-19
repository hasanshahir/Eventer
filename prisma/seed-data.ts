/**
 * Canonical seed data. Dates are RELATIVE to the moment the seed runs so every
 * urgency badge (Live, 48h Left, Closing Soon) shows up in the demo.
 * Shared by prisma/seed.ts and the in-memory fallback feed.
 */
type EventType = 'HACKATHON' | 'WORKSHOP' | 'MEETUP' | 'CONFERENCE';
type EventMode = 'IN_PERSON' | 'ONLINE' | 'HYBRID';

export interface SeedOrganizer {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  verified: boolean;
  contactEmail: string | null;
  websiteUrl: string | null;
}

export interface SeedEvent {
  id: string;
  organizerSlug: string;
  title: string;
  slug: string;
  description: string;
  type: EventType;
  mode: EventMode;
  venueName: string | null;
  venueAddress: string | null;
  city: string;
  startTime: Date;
  endTime: Date;
  registrationDeadline: Date;
  capacity: number | null;
  pricePkr: number;
  prizePool: string | null;
  perks: string[];
  eligibility: string | null;
  externalUrl: string | null;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
}

export const seedOrganizers: SeedOrganizer[] = [
  { id: 'org_ned_acm', name: 'NED ACM Student Chapter', slug: 'ned-acm', logoUrl: null, verified: true, contactEmail: 'acm@neduet.edu.pk', websiteUrl: 'https://www.neduet.edu.pk' },
  { id: 'org_gdg_kolachi', name: 'GDG Kolachi', slug: 'gdg-kolachi', logoUrl: null, verified: true, contactEmail: 'hello@gdgkolachi.com', websiteUrl: 'https://gdg.community.dev/gdg-kolachi/' },
  { id: 'org_softec', name: 'SOFTEC — FAST NUCES Lahore', slug: 'softec', logoUrl: null, verified: true, contactEmail: 'info@softec.org.pk', websiteUrl: 'https://softecnu.org' },
  { id: 'org_nust_olympiad', name: 'NUST Olympiad', slug: 'nust-olympiad', logoUrl: null, verified: true, contactEmail: 'olympiad@nust.edu.pk', websiteUrl: 'https://nust.edu.pk' },
  { id: 'org_lums_acm', name: 'LUMS ACM', slug: 'lums-acm', logoUrl: null, verified: true, contactEmail: 'acm@lums.edu.pk', websiteUrl: 'https://lums.edu.pk' },
  { id: 'org_peshawar_devs', name: 'Peshawar Developers Circle', slug: 'peshawar-devs', logoUrl: null, verified: false, contactEmail: null, websiteUrl: null },
];

const H = 3_600_000;
const D = 24 * H;

/** Round to the hour so times look natural in PKT. */
function at(now: Date, offsetMs: number): Date {
  const d = new Date(now.getTime() + offsetMs);
  d.setUTCMinutes(0, 0, 0);
  return d;
}

export function buildSeedEvents(now = new Date()): SeedEvent[] {
  const base = { isPublished: true, capacity: null as number | null, eligibility: null as string | null, externalUrl: null as string | null };
  return [
    {
      ...base,
      id: 'evt_ned_ai_hackathon',
      organizerSlug: 'ned-acm',
      title: 'NED Tech Fest: AI Hackathon',
      slug: 'ned-tech-fest-ai-hackathon',
      description: '36-hour AI hackathon at NED University. Build GenAI and ML solutions for Pakistani civic and fintech challenges with mentors from local industry.',
      type: 'HACKATHON', mode: 'IN_PERSON',
      venueName: 'NED University of Engineering & Technology', venueAddress: 'University Road, Gulshan-e-Iqbal', city: 'Karachi',
      registrationDeadline: at(now, 30 * H), startTime: at(now, 3 * D), endTime: at(now, 3 * D + 36 * H),
      capacity: 300, pricePkr: 0, prizePool: 'PKR 250,000',
      perks: ['Free Lunch', 'Swag Kits', 'Mentorship'],
      eligibility: 'Undergraduate students, teams of up to 4',
      tags: ['AI', 'Python', 'Machine Learning', 'GenAI', 'Next.js'], isFeatured: true,
    },
    {
      ...base,
      id: 'evt_gdg_kolachi_devfest',
      organizerSlug: 'gdg-kolachi',
      title: 'GDG Kolachi DevFest 2026',
      slug: 'gdg-kolachi-devfest-2026',
      description: "Karachi's biggest community developer festival: talks on Android, Flutter, Cloud, Firebase and Gemini, plus hands-on codelabs.",
      type: 'CONFERENCE', mode: 'IN_PERSON',
      venueName: 'NASTP', venueAddress: 'National Aerospace Science & Technology Park, Shahrah-e-Faisal', city: 'Karachi',
      registrationDeadline: at(now, -1 * D), startTime: at(now, -2 * H), endTime: at(now, 7 * H),
      capacity: 1200, pricePkr: 0, prizePool: null,
      perks: ['Badges', 'Swag', 'Networking'],
      tags: ['Android', 'Flutter', 'Firebase', 'Cloud', 'Gemini'], isFeatured: true,
    },
    {
      ...base,
      id: 'evt_softec_26',
      organizerSlug: 'softec',
      title: "SOFTEC '26 Hackathon",
      slug: 'softec-26-hackathon',
      description: "Pakistan's largest student software competition returns to FAST NUCES Lahore. 24-hour hackathon across web, mobile and AI tracks.",
      type: 'HACKATHON', mode: 'IN_PERSON',
      venueName: 'FAST NUCES Lahore', venueAddress: 'Block B, Faisal Town', city: 'Lahore',
      registrationDeadline: at(now, 5 * D), startTime: at(now, 10 * D), endTime: at(now, 11 * D),
      capacity: 500, pricePkr: 1500, prizePool: 'PKR 400,000',
      perks: ['Accommodation Subsidy', 'Shields'],
      eligibility: 'Students from any Pakistani university',
      tags: ['Web', 'React', 'Node.js', 'Mobile', 'AI', 'C++'], isFeatured: true,
    },
    {
      ...base,
      id: 'evt_nust_codesprint',
      organizerSlug: 'nust-olympiad',
      title: 'NUST Olympiad CodeSprint',
      slug: 'nust-olympiad-codesprint',
      description: 'Competitive programming sprint at NUST H-12 with an online qualifier round. ICPC-style problems, solo or teams of three.',
      type: 'HACKATHON', mode: 'HYBRID',
      venueName: 'NUST SEECS', venueAddress: 'H-12 Sector', city: 'Islamabad',
      registrationDeadline: at(now, 18 * D), startTime: at(now, 24 * D), endTime: at(now, 24 * D + 10 * H),
      capacity: 400, pricePkr: 1000, prizePool: 'PKR 150,000',
      perks: ['Certificates', 'Free Food'],
      tags: ['C++', 'Algorithms', 'Competitive Programming', 'Python'], isFeatured: false,
    },
    {
      ...base,
      id: 'evt_lums_flutter_workshop',
      organizerSlug: 'lums-acm',
      title: 'LUMS Flutter & Firebase Workshop',
      slug: 'lums-flutter-firebase-workshop',
      description: 'Hands-on Saturday workshop: ship a production-ready Flutter app with Firebase Auth and Firestore in one day.',
      type: 'WORKSHOP', mode: 'IN_PERSON',
      venueName: 'LUMS SBASSE', venueAddress: 'DHA Phase 5', city: 'Lahore',
      registrationDeadline: at(now, 40 * H), startTime: at(now, 4 * D), endTime: at(now, 4 * D + 6 * H),
      capacity: 80, pricePkr: 500, prizePool: null,
      perks: ['Certificates', 'Free Food'],
      tags: ['Flutter', 'Firebase', 'Dart', 'Mobile'], isFeatured: false,
    },
    {
      ...base,
      id: 'evt_peshawar_devs_meetup',
      organizerSlug: 'peshawar-devs',
      title: 'Peshawar Devs Meetup: Shipping with Next.js',
      slug: 'peshawar-devs-meetup-nextjs',
      description: 'Monthly community meetup with lightning talks on Next.js App Router, Postgres and deploying on a student budget.',
      type: 'MEETUP', mode: 'IN_PERSON',
      venueName: 'Durshal Peshawar', venueAddress: 'University Road', city: 'Peshawar',
      registrationDeadline: at(now, 6 * D), startTime: at(now, 7 * D), endTime: at(now, 7 * D + 3 * H),
      capacity: 60, pricePkr: 0, prizePool: null,
      perks: ['Networking', 'Chai'],
      tags: ['Next.js', 'React', 'PostgreSQL', 'TypeScript'], isFeatured: false,
    },
    {
      ...base,
      id: 'evt_remote_genai_bootcamp',
      organizerSlug: 'gdg-kolachi',
      title: 'Build with Gemini: Remote GenAI Bootcamp',
      slug: 'build-with-gemini-remote-bootcamp',
      description: 'Two-evening online bootcamp on prompt design, function calling and multimodal apps with the Gemini API.',
      type: 'WORKSHOP', mode: 'ONLINE',
      venueName: 'Google Meet', venueAddress: null, city: 'Remote',
      registrationDeadline: at(now, 12 * D), startTime: at(now, 14 * D), endTime: at(now, 14 * D + 3 * H),
      capacity: null, pricePkr: 0, prizePool: null,
      perks: ['Certificates', 'Cloud Credits'],
      tags: ['AI', 'GenAI', 'Gemini', 'Python', 'JavaScript'], isFeatured: false,
    },
  ];
}
