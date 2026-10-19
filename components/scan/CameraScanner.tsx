'use client';

import { useEffect, useRef } from 'react';

const REGION_ID = 'eventer-qr-region';

/**
 * Camera QR reader built on html5-qrcode. Loaded dynamically so the library
 * never runs during server rendering. Camera permission errors are reported
 * via onError; manual token entry remains available.
 */
export function CameraScanner({
  onDecode,
  onError,
}: {
  onDecode: (text: string) => void;
  onError: (message: string) => void;
}) {
  const onDecodeRef = useRef(onDecode);
  const onErrorRef = useRef(onError);
  onDecodeRef.current = onDecode;
  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;
    let scanner: { stop: () => Promise<void>; clear: () => void } | null = null;

    (async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (cancelled) return;
        const instance = new Html5Qrcode(REGION_ID);
        scanner = instance;
        await instance.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (text) => onDecodeRef.current(text),
          () => {},
        );
      } catch {
        if (!cancelled) {
          onErrorRef.current('Camera unavailable. Allow camera access or use the manual token box.');
        }
      }
    })();

    return () => {
      cancelled = true;
      if (scanner) {
        const s = scanner;
        s.stop().then(() => s.clear()).catch(() => {});
      }
    };
  }, []);

  return <div id={REGION_ID} className="mt-3 aspect-square w-full max-w-sm overflow-hidden rounded-lg bg-neutral-900" />;
}
