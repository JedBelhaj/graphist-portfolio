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

/* Width weights for the tiles in a row, cycled down the gallery. Varying them
   row to row is what staggers the joins like brickwork, so no two rows split
   in the same places. Three per row from tablets up, two on phones. */
const BRICKS: Record<"small" | "wide", number[][]> = {
  wide: [
    [1.45, 1, 0.85],
    [1, 1.15, 1],
    [0.85, 1, 1.45],
    [1.2, 0.85, 1.15],
  ],
  small: [
    [1.25, 0.8],
    [0.8, 1.25],
    [1, 1],
  ],
};

/* How wide the tiles of one row add up to, in row heights. The same for
   every row, so every row is the same height: wider than the photos' own
   shapes, which keeps the rows low enough to see a few at a time. */
const ROW_SPAN = { wide: 3.3, small: 2.1 };

type Box = { w: number; h: number; crop: boolean };

/* Lays the photos out as a brick wall for a given width: rows of three (two
   on phones), every row the same height and flush on both edges, tile widths
   following the BRICKS pattern, nudged wider for landscape photos and
   narrower for portraits so each is cropped less. A lone photo left at the
   end joins the row before it rather than stretching across a row alone. */
function brick(ratios: number[], width: number, gap: number): Box[] {
  const kind = width < 600 ? "small" : "wide";
  const per = kind === "small" ? 2 : 3;
  const sizes: number[] = [];
  for (let used = 0; used < ratios.length; used += per) sizes.push(Math.min(per, ratios.length - used));
  if (sizes.length > 1 && sizes[sizes.length - 1] === 1) {
    sizes.pop();
    sizes[sizes.length - 1] += 1;
  }

  const boxes: Box[] = [];
  let start = 0;
  sizes.forEach((size, n) => {
    const pattern = BRICKS[kind][n % BRICKS[kind].length];
    const rs = ratios.slice(start, start + size);
    /* The row's pattern (stretched or cut to its length), times a softened
       version of each photo's own shape. */
    const raw = rs.map((r, k) => (pattern[k] ?? 1) * Math.sqrt(Math.min(1.8, Math.max(0.6, r))));
    const total = raw.reduce((a, b) => a + b, 0);
    const shapes = raw.map((s) => (s / total) * ROW_SPAN[kind]);
    const room = width - gap * (size - 1);
    const h = (width - gap * (per - 1)) / ROW_SPAN[kind];
    let usedW = 0;
    shapes.forEach((s, k) => {
      /* Whole pixels; the last tile takes the remainder so the right edge is
         exactly flush. */
      const w = k === size - 1 ? room - usedW : Math.floor((s / ROW_SPAN[kind]) * room);
      usedW += w;
      boxes.push({ w, h: Math.round(h), crop: rs[k] < w / h });
    });
    start += size;
  });
  return boxes;
}

/* The photography portfolio as a brick wall: rows of three (two on phones),
   all the same height, each filling the width, with tile widths that change
   from row to row so the joins stagger, and a clear gap between tiles. It
   reads left to right in the admin's order, so the first photo in the list
   is the one that opens the gallery.

   Every tile is filled edge to edge (object-cover), so photos are cropped to
   their tile. The crop sits just above centre, which keeps both standing and
   crouching subjects in frame across this set. The full, uncropped photo
   opens in the Lightbox on click.

   The rows are worked out in the browser from the gallery's width (and again
   when it changes); the server render shows a simple wrap until then. The
   gap is read back from the CSS so the maths always matches it. */
export default function PhotoGallery({ items: all }: { items: MediaTile[] }) {
  /* The same photo added twice in the admin shows once: a repeat reads as a
     mistake in a portfolio. */
  const items = all.filter((m, i) => all.findIndex((o) => o.src === m.src) === i);
  const [open, setOpen] = useState<number | null>(null);
  const [boxes, setBoxes] = useState<Box[] | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ratios = items.map((m) => ratio(m.src));
  const key = ratios.join(",");

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const rs = key.split(",").map(Number);
    let last = 0;
    const measure = () => {
      /* The content box: the side margin is padding, so it's excluded. */
      const css = getComputedStyle(el);
      const width = Math.floor(el.clientWidth - parseFloat(css.paddingLeft) * 2);
      const gap = parseFloat(css.columnGap) || 0;
      if (width > 0 && width !== last) {
        last = width;
        setBoxes(brick(rs, width, gap));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [key]);

  return (
    <Reveal>
      <div ref={gridRef} className="flex flex-wrap gap-1.5 px-3 sm:gap-2 sm:px-5 lg:gap-2.5 lg:px-8">
        {items.map((m, i) => {
          const box = boxes?.[i];
          const isVideo = Boolean(m.video || m.href);
          const fit = `h-full w-full object-cover ${box?.crop ? "object-[50%_42%]" : ""}`;
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
              className="group relative block cursor-zoom-in overflow-hidden"
              style={
                box
                  ? { flex: "none", width: box.w, height: box.h }
                  : { flex: "1 1 30%", aspectRatio: 1 }
              }
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
                  className={fit}
                />
              ) : (
                <img
                  src={thumb(m.src)}
                  alt={m.alt}
                  loading={i < EAGER ? "eager" : "lazy"}
                  decoding="async"
                  className={`${fit} transition-transform duration-700 ease-out group-hover:scale-[1.03]`}
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
      <Lightbox items={items} index={open} onIndex={setOpen} />
    </Reveal>
  );
}
