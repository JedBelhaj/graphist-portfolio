"use client";

import { useEffect, useRef } from "react";
import { HERO_ORBIT } from "@/lib/content";

/* Sticker scale where it leaves the head and where it reaches the laptop. */
const SCALE_FROM = 0.15;
const SCALE_TO = 1;

/* Points sampled along the curve to space the stickers by distance travelled
   rather than by Bézier parameter, which bunches them on the tight bends. */
const SAMPLES = 64;

/* Fraction of a lap the stream starts at, so the first paint already shows
   most of the stickers out in the open rather than one bunched at each end. */
const START = 0.1;

/* Tool stickers streaming from behind the subject's head to behind the laptop
   (HERO_ORBIT), evenly spaced and growing as they go. Each one starts over
   from the head once it is hidden behind the laptop, so the stream never runs
   out and no icon is ever on screen twice. They all ride under the photo
   (z-5), which hides both ends. Positions are written straight to each
   sticker's transform every frame, outside React. The loop only runs while
   the stream is on screen, and reduced motion holds it still. */
export default function HeroOrbit({
  stickers,
  delay,
  step,
}: {
  stickers: string[];
  delay: number;
  step: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    const items = Array.from(box.children) as HTMLElement[];
    const { from, c1, c2, to, lap } = HERO_ORBIT;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let pts: { x: number; y: number; at: number }[] = [];
    let elapsed = 0;
    let last = 0;
    let frame = 0;

    const measure = () => {
      const w = box.offsetWidth;
      const h = box.offsetHeight;
      pts = [];
      for (let i = 0; i <= SAMPLES; i++) {
        const t = i / SAMPLES;
        const u = 1 - t;
        const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
        const x = w * (k[0] * from[0] + k[1] * c1[0] + k[2] * c2[0] + k[3] * to[0]);
        const y = h * (k[0] * from[1] + k[1] * c1[1] + k[2] * c2[1] + k[3] * to[1]);
        const prev = pts[i - 1];
        pts.push({ x, y, at: prev ? prev.at + Math.hypot(x - prev.x, y - prev.y) : 0 });
      }
    };

    // The point a given fraction of the way along the curve, by distance.
    const pointAt = (p: number) => {
      const target = p * pts[SAMPLES].at;
      let i = 1;
      while (i < SAMPLES && pts[i].at < target) i++;
      const a = pts[i - 1];
      const b = pts[i];
      const f = (target - a.at) / (b.at - a.at || 1);
      return [a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f];
    };

    const place = () => {
      const run = elapsed / 1000 / lap + START;
      items.forEach((el, i) => {
        // The first sticker leads, the rest follow at even gaps behind it.
        const p = (run + (items.length - 1 - i) / items.length) % 1;
        const [x, y] = pointAt(p);
        const scale = SCALE_FROM + (SCALE_TO - SCALE_FROM) * p;
        el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
      });
    };

    const tick = (now: number) => {
      elapsed += now - last;
      last = now;
      place();
      frame = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(() => {
      measure();
      place();
    });
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (!entry.isIntersecting || still) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    });
    ro.observe(box);
    io.observe(box);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
    };
  }, [stickers.length]);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0">
      {stickers.map((src, i) => (
        <div key={i} className="absolute left-0 top-0 z-[1] w-12 will-change-transform lg:w-[84px]">
          <div className="pop-in" style={{ animationDelay: `${delay + i * step}ms` }}>
            {/* The shadow keeps white tiles visible where the stream crosses
                onto the white page. */}
            <img src={src} alt="" className="w-full drop-shadow-[0_8px_14px_rgba(22,28,39,0.18)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
