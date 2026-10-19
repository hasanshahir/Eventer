import type { Metadata } from 'next';
import { ScanConsole } from '@/components/scan/ScanConsole';

export const metadata: Metadata = {
  title: 'Check-in Scanner — Eventer Organizer Studio',
};

export default function ScanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Check-in Scanner</h1>
        <p className="text-sm text-neutral-600">
          Scan an attendee&apos;s DevPassport QR or paste their ticket token.
        </p>
      </div>
      <ScanConsole />
    </div>
  );
}
