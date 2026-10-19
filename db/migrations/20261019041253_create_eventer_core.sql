DO $$ BEGIN CREATE TYPE "EventType" AS ENUM ('HACKATHON','WORKSHOP','MEETUP','CONFERENCE'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "EventMode" AS ENUM ('IN_PERSON','ONLINE','HYBRID'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING','CONFIRMED','WAITLISTED','CANCELLED','CHECKED_IN'); EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "phoneNumber" TEXT,
  "university" TEXT,
  "degreeProgram" TEXT,
  "graduationYear" INTEGER,
  "city" TEXT,
  "techStack" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Organizer" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "logoUrl" TEXT,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "contactEmail" TEXT,
  "websiteUrl" TEXT,
  CONSTRAINT "Organizer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Organizer_slug_key" ON "Organizer"("slug");

CREATE TABLE IF NOT EXISTS "Event" (
  "id" TEXT NOT NULL,
  "organizerId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" "EventType" NOT NULL,
  "mode" "EventMode" NOT NULL,
  "venueName" TEXT,
  "venueAddress" TEXT,
  "city" TEXT NOT NULL,
  "startTime" TIMESTAMP(3) NOT NULL,
  "endTime" TIMESTAMP(3) NOT NULL,
  "registrationDeadline" TIMESTAMP(3) NOT NULL,
  "capacity" INTEGER,
  "pricePkr" INTEGER NOT NULL DEFAULT 0,
  "prizePool" TEXT,
  "perks" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "eligibility" TEXT,
  "externalUrl" TEXT,
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Event_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "Organizer"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Event_slug_key" ON "Event"("slug");
CREATE INDEX IF NOT EXISTS "Event_city_idx" ON "Event"("city");
CREATE INDEX IF NOT EXISTS "Event_startTime_idx" ON "Event"("startTime");

CREATE TABLE IF NOT EXISTS "Team" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "inviteCode" TEXT NOT NULL,
  "leaderId" TEXT NOT NULL,
  "maxMembers" INTEGER NOT NULL DEFAULT 4,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Team_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Team_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Team_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Team_inviteCode_key" ON "Team"("inviteCode");

CREATE TABLE IF NOT EXISTS "Registration" (
  "id" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "teamId" TEXT,
  "status" "RegistrationStatus" NOT NULL DEFAULT 'CONFIRMED',
  "ticketToken" TEXT NOT NULL,
  "checkedInAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Registration_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Registration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Registration_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "Registration_ticketToken_key" ON "Registration"("ticketToken");
CREATE UNIQUE INDEX IF NOT EXISTS "Registration_eventId_userId_key" ON "Registration"("eventId","userId");
