import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Eventer — Tech Radar for Pakistani Developers',
  description: 'Find hackathons, workshops and meetups across Pakistan and RSVP in one tap.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="text-xl font-bold text-radar-600">
              Eventer
            </Link>
            <nav className="flex items-center gap-4 text-sm font-medium text-neutral-700">
              <Link href="/" className="hover:text-radar-600">Radar Feed</Link>
              <Link href="/cities" className="hover:text-radar-600">City Hubs</Link>
              <Link href="/passport" className="hover:text-radar-600">DevPassport</Link>
              <Link href="/organizer/new" className="hover:text-radar-600">Organizer Studio</Link>
              <Link href="/organizer/scan" className="hover:text-radar-600">Check-in</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
