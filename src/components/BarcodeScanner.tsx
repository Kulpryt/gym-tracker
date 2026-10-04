"use client";
import { useEffect, useRef, useState } from "react";

export default function BarcodeScanner({
  onDetected
}: {
  onDetected: (code: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const scannedRef = useRef(false);

  useEffect(() => {
    let scanner: import("html5-qrcode").Html5Qrcode | null = null;
    let isStarted = false;

    (async () => {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        scanner = new Html5Qrcode("barcode-scanner-region");
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 260, height: 160 } },
          (decodedText) => {
            if (scannedRef.current) return;
            scannedRef.current = true;
            onDetected(decodedText);
          },
          () => {
            // erreur de lecture par frame : on ignore, c'est normal
          }
        );
        isStarted = true;
      } catch (e) {
        setError("Impossible d'accéder à la caméra. Vérifie les permissions ou utilise la saisie manuelle.");
      }
    })();

    return () => {
      if (scanner) {
        if (isStarted) {
          scanner.stop().then(() => scanner!.clear()).catch(() => {});
        } else {
          try {
            scanner.clear();
          } catch {
            // ignore cleanup errors if not started
          }
        }
      }
    };
  }, [onDetected]);

  return (
    <div className="space-y-2">
      <div id="barcode-scanner-region" ref={ref} className="rounded-xl overflow-hidden bg-black" />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <p className="text-white/40 text-xs text-center">Vise le code-barres du produit</p>
    </div>
  );
}
