"use client";

import { useEffect, useRef } from "react";

/* How far the layer sinks per pixel scrolled, so it trails the page by that
   share. Higher = more movement. */
const SPEED = 0;

/* Moves its whole contents a touch slower than the page. It only ever sinks,
   never rises, so whatever sits on the bottom edge of an overflow-hidden parent
   stays cut off by that edge and no gap opens under it. */
export default function ParallaxLayer({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = ref.current;
    if (!layer) return;

    /* No drift at all under the OS setting, and no listener either. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      layer.style.transform = `translate3d(0, ${(Math.max(0, window.scrollY) * SPEED).toFixed(1)}px, 0)`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
