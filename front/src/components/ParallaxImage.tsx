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

/* `video` swaps the still for a silent loop clip, with `src` as its poster.
   It only plays while on screen, so a page of nine clips isn't decoding
   nine videos at once — and not at all under reduced motion, where the
   poster stays up. */
export default function ParallaxImage({
  src,
  video,
  alt = "",
  className = "",
}: {
  src: string;
  video?: string;
  alt?: string;
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement | null>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const img = mediaRef.current;
    if (!frame || !img) return;

    /* No drift at all under the OS setting, and no listener either. */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let io: IntersectionObserver | undefined;
    if (img instanceof HTMLVideoElement) {
      io = new IntersectionObserver(([entry]) => {
        /* play() rejects if the browser blocks autoplay; the poster stays. */
        if (entry.isIntersecting) img.play().catch(() => {});
        else img.pause();
      });
      io.observe(frame);
    }

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
      io?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={frameRef} className={`relative h-full w-full overflow-hidden ${className}`}>
      {video ? (
        <video
          ref={(el) => {
            mediaRef.current = el;
          }}
          src={video}
          poster={src}
          aria-label={alt || undefined}
          muted
          loop
          playsInline
          preload="none"
          className="absolute left-0 h-[130%] w-full object-cover"
          style={{ top: "-15%", willChange: "transform" }}
        />
      ) : (
        <img
          ref={(el) => {
            mediaRef.current = el;
          }}
          src={src}
          alt={alt}
          loading="lazy"
          className="absolute left-0 h-[130%] w-full object-cover"
          style={{ top: "-15%", willChange: "transform" }}
        />
      )}
    </div>
  );
}
