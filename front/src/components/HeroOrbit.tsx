"use client";

import { useEffect, useRef } from "react";
import { HERO_ORBIT } from "@/lib/content";

/* Sticker scale at the far and near points of the ring. */
const SCALE_FAR = 0.6;
const SCALE_NEAR = 1.1;

/* On arrival the ring spins SPIN_BOOST times its normal speed, then eases
   down to normal over SPIN_SETTLE ms. */
const SPIN_BOOST = 8;
const SPIN_SETTLE = 2600;

/* The hero photo sits at z-5: far-side stickers stay under it, near-side ones
   over it, each band ordered by depth so overlapping stickers stack right. */
function depthZ(depth: number) {
  return depth > 0 ? 6 + Math.round(depth * 4) : 1 + Math.round((depth + 1) * 3);
}

/* Tool stickers circling the subject on a tilted ring (HERO_ORBIT), spaced
   evenly and shrinking as they pass behind. The positions are written straight
   to each sticker's transform every frame, outside React. The loop only runs
   while the ring is on screen, and reduced motion holds them still on the
   ring. The container sets no z-index, so the stickers' z-indexes interleave
   with the photo's instead of stacking as one layer.

   The ring holds still until the first sticker's pop-in actually starts, then
   whips round and settles. Keying it off the pop-in keeps the two in step
   however long the page loader or the mobile in-view gate holds them. */
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
    const { cx, cy, rx, ry, tilt, period } = HERO_ORBIT;
    const cos = Math.cos((tilt * Math.PI) / 180);
    const sin = Math.sin((tilt * Math.PI) / 180);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    // Distance travelled round the ring, in ms at normal speed.
    let elapsed = 0;
    let last = 0;
    let frame = 0;
    let spinFrom = -1;

    const speed = (now: number) => {
      if (spinFrom < 0) return 0;
      const p = Math.min(1, (now - spinFrom) / SPIN_SETTLE);
      const ease = 1 - (1 - p) ** 3;
      return SPIN_BOOST + (1 - SPIN_BOOST) * ease;
    };

    const onPop = (e: AnimationEvent) => {
      if (spinFrom < 0 && e.animationName === "pop-in") spinFrom = performance.now();
    };
    box.addEventListener("animationstart", onPop);

    const place = () => {
      const lap = (elapsed / 1000 / period) * 2 * Math.PI;
      items.forEach((el, i) => {
        // Start the first sticker at the top of the ring, the rest evenly behind.
        const t = lap + (i / items.length) * 2 * Math.PI - Math.PI / 2;
        const x = rx * w * Math.cos(t);
        const y = ry * w * Math.sin(t);
        const depth = Math.sin(t);
        const scale = SCALE_FAR + ((SCALE_NEAR - SCALE_FAR) * (depth + 1)) / 2;
        el.style.transform = `translate3d(${cx * w + x * cos - y * sin}px, ${cy * h + x * sin + y * cos}px, 0) translate(-50%, -50%) scale(${scale})`;
        el.style.zIndex = String(depthZ(depth));
      });
    };

    const tick = (now: number) => {
      elapsed += (now - last) * speed(now);
      last = now;
      place();
      frame = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(() => {
      w = box.offsetWidth;
      h = box.offsetHeight;
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
      box.removeEventListener("animationstart", onPop);
      ro.disconnect();
      io.disconnect();
    };
  }, [stickers.length]);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0">
      {stickers.map((src, i) => (
        <div key={i} className="absolute left-0 top-0 w-12 will-change-transform lg:w-[84px]">
          <div className="pop-in" style={{ animationDelay: `${delay + i * step}ms` }}>
            {/* The shadow keeps white tiles visible where the ring crosses
                onto the white page, and sells the depth. */}
            <img src={src} alt="" className="w-full drop-shadow-[0_8px_14px_rgba(22,28,39,0.18)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
