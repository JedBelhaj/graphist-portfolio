"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import type { MediaTile } from "@/lib/cms";
import Lightbox from "./Lightbox";
import Reveal from "./Reveal";

/* How many photos load straight away; the rest load as they scroll near. */
const EAGER = 8;

/* Bubble diameters at desktop size, in px, cycled over the photos. Mixed big
   and small so the cluster reads as loose and organic, not a grid of dots. */
const SIZES = [230, 150, 190, 120, 250, 160, 135, 205, 175, 125, 215, 145];

/* Vertical nudge per bubble (px at desktop size), so the rows don't line up. */
const NUDGE = [0, 34, -18, 26, -8, 44, 10, -22, 30, -4, 18, 38];

/* Grid copies don't need the 1800px file the lightbox shows; ~600px covers
   the largest bubble on a retina screen at a fraction of the weight. */
function thumb(src: string) {
  return src.includes("cdn.sanity.io") ? src.replace(/([?&])w=\d+/, "$1w=600") : src;
}

/* Idle float timing per bubble, the same feel as the home page's service
   bubbles: 5-8s cycles with phases spread so neighbours never move together. */
const float = (i: number) => ({
  ["--float-dur" as string]: `${5 + ((i * 1.3) % 3)}s`,
  ["--float-delay" as string]: `${-((i * 1.7) % 6)}s`,
});

/* The photography portfolio as a cluster of floating photo bubbles, echoing
   the service bubbles on the home page. Sizes and offsets follow fixed
   patterns (not random), so the layout is the same on every visit and on the
   server. Everything scales with --k: smaller bubbles on phones.

   Order follows the admin list, left to right. The same photo added twice in
   the admin shows once. Every bubble opens the Lightbox, which steps through
   the whole set. Under reduced motion the floating stops (globals.css). */
export default function PhotoGallery({ items: all }: { items: MediaTile[] }) {
  const items = all.filter((m, i) => all.findIndex((o) => o.src === m.src) === i);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <Reveal>
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-x-3 gap-y-7 px-3 pb-10 pt-4 [--k:0.52] sm:gap-x-5 sm:gap-y-8 sm:px-5 sm:[--k:0.75] lg:gap-x-6 lg:gap-y-8 lg:px-8 lg:[--k:1]">
        {items.map((m, i) => {
          const size = SIZES[i % SIZES.length];
          const nudge = NUDGE[i % NUDGE.length];
          const isVideo = Boolean(m.video || m.href);
          return (
            <div
              key={`${m.src}-${i}`}
              className="bubble-float shrink-0"
              style={{
                width: `calc(var(--k) * ${size}px)`,
                height: `calc(var(--k) * ${size}px)`,
                marginTop: `calc(var(--k) * ${nudge}px)`,
                ...float(i),
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={
                  isVideo
                    ? m.alt ? `Play: ${m.alt}` : "Play the video"
                    : m.alt ? `View: ${m.alt}` : "View the photo"
                }
                className="group relative block h-full w-full cursor-zoom-in overflow-hidden rounded-full shadow-[0_14px_30px_rgba(10,11,16,0.18)] ring-4 ring-white transition-transform duration-500 ease-out hover:scale-[1.08] focus-visible:scale-[1.08] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[rgb(124,92,252)]"
              >
                {m.video ? (
                  <video
                    src={m.video}
                    poster={m.src}
                    aria-label={m.alt || undefined}
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="none"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={thumb(m.src)}
                    alt={m.alt}
                    loading={i < EAGER ? "eager" : "lazy"}
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                )}
                {isVideo && (
                  <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/40 backdrop-blur-md">
                    <Play size={20} fill="currentColor" className="ml-1" />
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
      <Lightbox items={items} index={open} onIndex={setOpen} />
    </Reveal>
  );
}
