"use client";

import { useEffect, useRef, useState } from "react";
import { ACCENT, ACCENT_WASH } from "@/lib/brand";
import Logo from "./Logo";

/* Shortest time the loader stays up, so a cached visit doesn't flash it. */
const MIN_MS = 700;

/* Longest it can hold the page, whatever is still loading. */
const MAX_MS = 10000;

/* Covers the first page view until the page has fully loaded (the window
   load event plus the web fonts), with a bar that fills as the images above
   the fold arrive. Lives in the root layout, so client-side navigation never
   shows it again.

   While it is up, the hero's entrance keyframes are held (globals.css,
   .page-loader), so they play once it lifts instead of behind it. The bar is
   written to straight from the frame loop, outside React. */
export default function PageLoader() {
  const fillRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const start = performance.now();
    // Lazy images don't hold up the load event, so they don't count here either.
    const imgs = Array.from(document.images).filter((img) => img.loading !== "lazy");
    let fontsReady = false;
    let loaded = document.readyState === "complete";
    let shown = 0;
    let frame = 0;

    const target = () => {
      if (loaded && fontsReady) return 1;
      const ready = imgs.filter((img) => img.complete).length + (fontsReady ? 1 : 0);
      // Hold back the last stretch for the load event itself.
      return (ready / (imgs.length + 1)) * 0.9;
    };

    const tick = (now: number) => {
      shown += (target() - shown) * 0.12;
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${shown})`;
      const finished = shown > 0.995 && now - start > MIN_MS;
      if (finished || now - start > MAX_MS) {
        if (fillRef.current) fillRef.current.style.transform = "scaleX(1)";
        setDone(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    const onLoad = () => (loaded = true);
    window.addEventListener("load", onLoad);
    document.fonts.ready.then(() => (fontsReady = true));
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  // Unmount once the fade-out has finished.
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setGone(true), 600);
    return () => clearTimeout(t);
  }, [done]);

  if (gone) return null;

  return (
    <div
      className={`page-loader fixed inset-0 z-[1100] flex flex-col items-center justify-center gap-6 bg-white transition-opacity duration-500 ${
        done ? "is-done pointer-events-none opacity-0" : ""
      }`}
      aria-hidden
    >
      <Logo className="h-5 sm:h-6" />
      <div className="h-[3px] w-44 overflow-hidden rounded-full" style={{ backgroundColor: ACCENT_WASH }}>
        <div
          ref={fillRef}
          className="h-full w-full origin-left rounded-full"
          style={{ backgroundColor: ACCENT, transform: "scaleX(0)" }}
        />
      </div>
    </div>
  );
}
