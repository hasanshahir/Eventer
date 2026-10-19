// Shared check-in types. Safe to import from client components (no DB imports).

export type CheckinOutcome = 'SUCCESS' | 'ALREADY_CHECKED_IN' | 'INVALID' | 'CANCELLED';

export interface CheckinAttendee {
  name: string;
  university: string | null;
  eventTitle: string;
  teamName: string | null;
}

export interface CheckinResult {
  outcome: CheckinOutcome;
  message: string;
  attendee: CheckinAttendee | null;
  checkedInAt: string | null; // ISO (UTC)
}

export interface RecentCheckin extends CheckinAttendee {
  id: string;
  checkedInAt: string;
}
