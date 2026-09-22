"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* Drifts its children against the scroll.

   `amount` is the peak offset in px: the element sits at +amount when it is a
   full viewport below the fold, passes 0 as its centre crosses the centre of
   the screen, and reaches -amount on the way out. Keep it small — past roughly
   80px the drift stops reading as depth and starts looking like a layout bug.

   Writes transform straight to the node inside a rAF rather than through state,
   so scrolling never queues a React render. The wrapper owns the transform
   outright, which is why Reveal (which also animates transform) must sit on a
   different element — nest them, don't merge them. */
export default function Parallax({
  amount = 40,
  className = "",
  children,
}: {
  amount?: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* Respect the OS setting: no drift at all, and no scroll listener either. */
    const motionOff = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionOff.matches) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;

      /* -1 when the element's centre is a viewport above the screen centre,
         +1 when it is a viewport below. Clamped so anything parked far off
         screen holds at the extreme instead of running away. */
      const travel = (viewport + rect.height) / 2;
      const raw = (rect.top + rect.height / 2 - viewport / 2) / travel;
      const progress = Math.max(-1, Math.min(1, raw));

      el.style.transform = `translate3d(0, ${(progress * amount).toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [amount]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
