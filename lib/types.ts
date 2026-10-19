export type EventTypeName = 'HACKATHON' | 'WORKSHOP' | 'MEETUP' | 'CONFERENCE';
export type EventModeName = 'IN_PERSON' | 'ONLINE' | 'HYBRID';

/** Serializable event shape shared by server pages, API routes and client cards. */
export interface EventDTO {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: EventTypeName;
  mode: EventModeName;
  venueName: string | null;
  venueAddress: string | null;
  city: string;
  startTime: string; // ISO (UTC)
  endTime: string;
  registrationDeadline: string;
  capacity: number | null;
  pricePkr: number;
  prizePool: string | null;
  perks: string[];
  eligibility: string | null;
  externalUrl: string | null;
  tags: string[];
  isFeatured: boolean;
  organizer: { name: string; slug: string; verified: boolean; logoUrl: string | null };
  registrationCount: number;
}

export type DataSource = 'database' | 'fallback';

export interface FeedResult {
  events: EventDTO[];
  source: DataSource;
  error?: string;
}
