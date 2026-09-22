"use client";

import { useEffect, useRef } from "react";

/* Parallax that moves the picture inside a fixed frame, not the frame itself.

   The frame stays exactly where the layout puts it and clips; the image is
   oversized and slides within it, so it reads like a background drifting behind
   a window rather than a tile sliding around the page.

   The two numbers are tied together and must stay that way. The image is
   130% of the frame, offset -15%, leaving 15% of frame height as slack above
   and below. A transform percentage resolves against the image's own height,
   so the drift is capped at 11% of 130% = 14.3% of the frame — just inside the
   slack. Raise DRIFT past ~11 and an empty edge appears at the extremes. */
const DRIFT = 11;

export default function ParallaxImage({
  src,
  alt = "",
  className = "",
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img) return;

    /* No drift at all under the OS setting, and no listener either. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = frame.getBoundingClientRect();
      const viewport = window.innerHeight;

      /* +1 a full viewport below the fold, 0 as the frame's centre crosses the
         screen centre, -1 on the way out. Clamped so frames parked far off
         screen hold at the extreme instead of running away. */
      const travel = (viewport + rect.height) / 2;
      const raw = (rect.top + rect.height / 2 - viewport / 2) / travel;
      const progress = Math.max(-1, Math.min(1, raw));

      img.style.transform = `translate3d(0, ${(progress * DRIFT).toFixed(2)}%, 0)`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={frameRef} className={`relative h-full w-full overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        className="absolute left-0 h-[130%] w-full object-cover"
        style={{ top: "-15%", willChange: "transform" }}
      />
    </div>
  );
}
