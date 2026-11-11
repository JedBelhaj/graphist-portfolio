"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import type { MediaTile } from "@/lib/cms";
import Lightbox from "./Lightbox";
import Reveal from "./Reveal";

/* How many photos load straight away; the rest load as they scroll near. */
const EAGER = 8;

/* Width/height of a photo, read from its address so the layout is settled
   before anything downloads (no jump as photos arrive). Sanity asset names
   carry the original size (`…-4000x6000.jpg`); a `rect=` crop overrides it.
   Anything else falls back to a 2:3 portrait, the most common frame here. */
function ratio(src: string) {
  const rect = src.match(/[?&]rect=\d+,\d+,(\d+),(\d+)/);
  if (rect) return Number(rect[1]) / Number(rect[2]);
  const size = src.match(/-(\d+)x(\d+)\.\w+(?:\?|$)/);
  if (size) return Number(size[1]) / Number(size[2]);
  return 2 / 3;
}

/* Grid copies don't need the 1800px file the lightbox shows; ~1200px covers
   the widest tile on a retina screen at a fraction of the weight. */
function thumb(src: string) {
  return src.includes("cdn.sanity.io") ? src.replace(/([?&])w=\d+/, "$1w=1200") : src;
}

/* Screen-size bands. Which photos share a row is decided once per band, for
   that band's typical gallery width; across the band the rows just scale. So
   the arrangement only changes at these few widths, never from one pixel to
   the next. Per band: the gallery width the rows are planned for, the row
   height aimed for there, and the most photos a row may hold. Phones keep
   rows tall (one or two photos, big enough to look at); very wide screens fit
   many smaller photos rather than a few huge ones. */
const BANDS = [
  { upTo: 600, plan: 360, target: 300, per: 2 },
  { upTo: 1000, plan: 760, target: 320, per: 4 },
  { upTo: 1500, plan: 1376, target: 420, per: 6 },
  { upTo: 2100, plan: 1856, target: 460, per: 7 },
  { upTo: Infinity, plan: 2496, target: 430, per: 10 },
];
const bandFor = (width: number) => BANDS.findIndex((b) => width < b.upTo);

/* The band used for the server render and first paint, before the browser
   reports the real width: the laptop one. */
const DEFAULT_BAND = 2;

/* Row planning gap, in px: close to the CSS gaps below. Only used to plan. */
const PLAN_GAP = 10;

const total = (rs: number[]) => rs.reduce((a, b) => a + b, 0);

/* Splits the photos into rows for one band. Every row will fill the width
   (CSS does that, below), so the only choice is where the rows break: of all
   the ways to split the set, this picks the one whose rows come out closest
   to the band's target height (a small dynamic programme over the whole set,
   so the last row never ends up a giant single photo or a thin strip). A row
   too short costs three times one too tall: small photos are the hard ones
   to see. Returns [start, end) index pairs. */
function plan(ratios: number[], band: number): [number, number][] {
  const n = ratios.length;
  const { plan: width, target, per } = BANDS[band];
  const height = (i: number, j: number) => (width - PLAN_GAP * (j - i - 1)) / total(ratios.slice(i, j));

  const best = new Array<number>(n + 1).fill(Infinity);
  const from = new Array<number>(n + 1).fill(0);
  best[0] = 0;
  for (let j = 1; j <= n; j++) {
    for (let i = Math.max(0, j - per); i < j; i++) {
      const miss = (height(i, j) - target) / target;
      const cost = best[i] + (miss < 0 ? 3 : 1) * miss ** 2;
      if (cost < best[j]) {
        best[j] = cost;
        from[j] = i;
      }
    }
  }
  const rows: [number, number][] = [];
  for (let j = n; j > 0; j = from[j]) rows.unshift([from[j], j]);
  return rows;
}

/* The photography portfolio as justified rows with a gap between photos:
   each photo shown whole at its own proportions, the photos in a row at one
   height, and every row filling the width edge to edge. It reads left to
   right in the admin's order, so the first photo in the list is the one that
   opens the gallery. On phones the rows hold one or two photos, so each is
   big enough to see. Clicking opens the Lightbox, which steps through the
   set.

   How each row fills the width: it's its own flex line, and every photo in it
   grows in proportion to its shape (flex-grow = 100 x width/height) from a
   zero basis, with that same aspect ratio. The browser shares the row's width out
   exactly, gaps included, so the photos land at one height and the row is
   flush at any width, fractional pixels and display scaling included. Rows
   are separate lines, so nothing can ever wrap onto the next one. */
export default function PhotoGallery({ items: all }: { items: MediaTile[] }) {
  /* The same photo added twice in the admin shows once: a repeat reads as a
     mistake in a portfolio. */
  const items = all.filter((m, i) => all.findIndex((o) => o.src === m.src) === i);
  const [open, setOpen] = useState<number | null>(null);
  const [band, setBand] = useState(DEFAULT_BAND);
  const gridRef = useRef<HTMLDivElement>(null);
  const ratios = items.map((m) => ratio(m.src));
  const rows = plan(ratios, band);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => setBand(bandFor(el.getBoundingClientRect().width));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <Reveal>
      <div ref={gridRef} className="flex flex-col gap-1.5 px-3 sm:gap-2 sm:px-5 lg:gap-2.5 lg:px-8">
        {rows.map(([start, end]) => (
          <div key={start} className="flex gap-1.5 sm:gap-2 lg:gap-2.5">
            {items.slice(start, end).map((m, k) => {
              const i = start + k;
              const r = ratios[i];
              const isVideo = Boolean(m.video || m.href);
              return (
                <button
                  key={`${m.src}-${i}`}
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={
                    isVideo
                      ? m.alt ? `Play: ${m.alt}` : "Play the video"
                      : m.alt ? `View: ${m.alt}` : "View the photo"
                  }
                  className="group relative block min-w-0 cursor-zoom-in overflow-hidden"
                  /* Grow is the shape x100: same proportions, but a row's
                     grows always add up past 1. Below 1 the browser hands
                     out only that fraction of the space, which left a lone
                     portrait (0.67) at two thirds of its row. */
                  style={{ flex: `${r * 100} 1 0%`, aspectRatio: r }}
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
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  )}
                  {/* A light veil on hover says "click me" without hiding the photo. */}
                  <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/15" />
                  {isVideo && (
                    <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/40 backdrop-blur-md">
                      <Play size={22} fill="currentColor" className="ml-1" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <Lightbox items={items} index={open} onIndex={setOpen} />
    </Reveal>
  );
}
