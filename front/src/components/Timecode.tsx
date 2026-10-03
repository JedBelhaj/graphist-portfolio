"use client";

import { useEffect, useState } from "react";

const FPS = 24;

const pad = (n: number) => String(n).padStart(2, "0");

/* A running SMPTE-style timecode (HH:MM:SS:FF at 24fps) for the viewfinder.
   Starts at `start` seconds so it doesn't open on a row of zeros, and holds
   still under prefers-reduced-motion. Rendered static on the server and only
   starts ticking after hydration, so the markup matches. */
export default function Timecode({ start = 754, className = "" }: { start?: number; className?: string }) {
  const [frames, setFrames] = useState(start * FPS);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t0 = performance.now();
    const id = window.setInterval(() => {
      setFrames(start * FPS + Math.floor(((performance.now() - t0) / 1000) * FPS));
    }, 1000 / FPS);
    return () => window.clearInterval(id);
  }, [start]);

  const f = frames % FPS;
  const s = Math.floor(frames / FPS);
  return (
    <span className={`tabular-nums ${className}`} aria-hidden="true">
      {pad(Math.floor(s / 3600))}:{pad(Math.floor(s / 60) % 60)}:{pad(s % 60)}:{pad(f)}
    </span>
  );
}
