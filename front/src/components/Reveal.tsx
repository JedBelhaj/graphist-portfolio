"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* One-shot scroll reveal. Holds its children at opacity 0 until they come into
   view, then hands over to the `reveal-in` keyframe.

   The observer deliberately pairs a low threshold with a negative bottom
   rootMargin rather than a high threshold: a block taller than the viewport can
   never reach a high intersection ratio, so a threshold-only trigger silently
   never fires on short screens. The margin delays the trigger instead, which
   works at any height.

   Under prefers-reduced-motion the keyframe is a no-op (see globals.css), so
   clearing the inline opacity is what actually reveals the content. */
export default function Reveal({
  delay = 0,
  className = "",
  children,
}: {
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect(); // reveals on the way in, not on every pass
      },
      { threshold: 0.1, rootMargin: "0px 0px -12% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${shown ? "reveal-in" : ""} ${className}`}
      style={{ opacity: shown ? undefined : 0, animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
