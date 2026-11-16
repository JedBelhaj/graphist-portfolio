"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* One-shot scroll reveal. Holds its children at opacity 0 until they come into
   view, then hands over to the `reveal-in` keyframe.

   The observer fires on any overlap (threshold 0) and lets a negative bottom
   rootMargin delay it instead: a block can never show more of itself than a
   screen's worth, so any ratio threshold fails for blocks tall enough (10%
   did, for a phone's one-column Videography section of a dozen verticals,
   which then stayed invisible). The margin works at any height.

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
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
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
