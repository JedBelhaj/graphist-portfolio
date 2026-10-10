"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* Holds every entrance keyframe inside it (hero-rise, hero-in-right, pop-in)
   until the block scrolls into view, then lets them all run with their own
   delays. For entrances that can start below the fold — Reveal only fades its
   own wrapper, it can't postpone animations already running inside it.

   The holding rule lives in globals.css under .in-view-gate. */
export default function InViewGate({
  className = "",
  children,
}: {
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
        io.disconnect();
      },
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`in-view-gate ${shown ? "is-shown" : ""} ${className}`}>
      {children}
    </div>
  );
}
