'use client';

import { Camera, CameraOff, Keyboard, ScanLine } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CheckinResult, RecentCheckin } from '@/lib/checkin-types';
import { FeedbackCard } from './FeedbackCard';
import { RecentCheckins } from './RecentCheckins';
import { CameraScanner } from './CameraScanner';

const DUPLICATE_WINDOW_MS = 3000;

export function ScanConsole() {
  const [manual, setManual] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [recent, setRecent] = useState<RecentCheckin[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const lastScan = useRef<{ token: string; at: number } | null>(null);

  const loadRecent = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/checkin/recent', { cache: 'no-store' });
      const data = (await res.json()) as { items?: RecentCheckin[] };
      setRecent(data.items ?? []);
    } catch {
      /* keep previous list */
    } finally {
      setLoadingRecent(false);
    }
  }, []);

  useEffect(() => {
    void loadRecent();
  }, [loadRecent]);

  const submit = useCallback(
    async (token: string) => {
      const value = token.trim();
      if (!value) return;
      // Ignore the same QR being re-read by the camera within a short window.
      const now = Date.now();
      const last = lastScan.current;
      if (last && last.token === value && now - last.at < DUPLICATE_WINDOW_MS) return;
      lastScan.current = { token: value, at: now };

      setBusy(true);
      setError(null);
      try {
        const res = await fetch('/api/v1/checkin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: value }),
        });
        const data = (await res.json()) as CheckinResult & { error?: string };
        if (!res.ok) {
          setError(data.error ?? 'Check-in failed.');
        } else {
          setResult(data);
          void loadRecent();
        }
      } catch {
        setError('Network error. Check your connection and try again.');
      } finally {
        setBusy(false);
      }
    },
    [loadRecent],
  );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <section className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
              <ScanLine className="h-4 w-4" aria-hidden /> Camera scan
            </h2>
            <button
              type="button"
              onClick={() => setCameraOn((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
            >
              {cameraOn ? <CameraOff className="h-4 w-4" aria-hidden /> : <Camera className="h-4 w-4" aria-hidden />}
              {cameraOn ? 'Stop camera' : 'Start camera'}
            </button>
          </div>
          {cameraOn ? (
            <CameraScanner onDecode={(text) => void submit(text)} onError={(msg) => setError(msg)} />
          ) : (
            <p className="mt-3 text-sm text-neutral-500">
              Camera is off. You can also type the token below.
            </p>
          )}
        </section>

        <form
          className="rounded-xl border border-neutral-200 bg-white p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void submit(manual);
            setManual('');
          }}
        >
          <label htmlFor="manual-token" className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
            <Keyboard className="h-4 w-4" aria-hidden /> Manual token
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="manual-token"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="Paste ticket token"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-lg border border-neutral-300 px-3 py-2 font-mono text-sm focus:border-radar-600 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !manual.trim()}
              className="rounded-lg bg-radar-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Check in
            </button>
          </div>
        </form>

        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <FeedbackCard result={result} busy={busy} />
        <RecentCheckins items={recent} loading={loadingRecent} />
      </div>
    </div>
  );
}
