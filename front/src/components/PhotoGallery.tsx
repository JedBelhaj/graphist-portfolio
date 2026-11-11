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

/* The row height the layout aims for at a given gallery width. Phones get
   tall rows, so photos wrap one or two to a row and are big enough to look
   at; wider screens fit three to five. */
const targetRow = (width: number) =>
  width < 600 ? 300 : width < 1000 ? 320 : width < 1300 ? 360 : 440;

/* Most photos a row may hold: two on phones, so none shrink to a sliver. */
const maxPerRow = (width: number) => (width < 600 ? 2 : 6);

type Box = { w: number; h: number };

const total = (rs: number[]) => rs.reduce((a, b) => a + b, 0);

/* Justified rows: every photo keeps its own shape (nothing is cropped), the
   photos in a row share one height, and every row, the last one included,
   fills the width exactly, so no row has empty space at its end.

   Where to break the rows is worked out over the whole set at once (a small
   dynamic programme): of all the ways to split the photos into full rows, it
   picks the one whose row heights stay closest to the target. That's what
   keeps the last row from ending up as one giant photo or a near-empty
   strip, which a simple left-to-right fill can't avoid. */
function justify(ratios: number[], width: number, gap: number): Box[] {
  const n = ratios.length;
  if (n === 0) return [];
  const target = targetRow(width);
  const heightOf = (i: number, j: number) =>
    (width - gap * (j - i - 1)) / total(ratios.slice(i, j));

  /* best[j]: lowest cost of laying out the first j photos; from[j]: where
     its last row starts. */
  const per = maxPerRow(width);
  const best = new Array<number>(n + 1).fill(Infinity);
  const from = new Array<number>(n + 1).fill(0);
  best[0] = 0;
  for (let j = 1; j <= n; j++) {
    for (let i = Math.max(0, j - per); i < j; i++) {
      /* Relative miss from the target, squared. A row that comes out too
         short costs three times as much as one too tall: small photos are
         the hard ones to see, a bigger one is just a bigger photo. */
      const miss = (heightOf(i, j) - target) / target;
      const cost = best[i] + (miss < 0 ? 3 : 1) * miss ** 2;
      if (cost < best[j]) {
        best[j] = cost;
        from[j] = i;
      }
    }
  }

  const rows: [number, number][] = [];
  for (let j = n; j > 0; j = from[j]) rows.unshift([from[j], j]);

  const boxes: Box[] = [];
  for (const [i, j] of rows) {
    const h = heightOf(i, j);
    const room = width - gap * (j - i - 1);
    let used = 0;
    for (let k = i; k < j; k++) {
      /* Whole pixels; the last photo takes the remainder so the right edge
         is exactly flush. */
      const w = k === j - 1 ? room - used : Math.floor(ratios[k] * h);
      used += w;
      boxes.push({ w, h: Math.round(h) });
    }
  }
  return boxes;
}

/* The photography portfolio as justified rows, with a gap between photos:
   each photo shown whole at its own proportions, the photos in a row at one
   height, and every row filling the width edge to edge. It reads left to
   right in the admin's order, so the first photo in the list is the one that
   opens the gallery. On phones the rows wrap to one or two photos each, so
   every photo is big enough to see properly. Clicking opens the Lightbox,
   which steps through the set.

   The rows are worked out in the browser from the gallery's width (and again
   when it changes); before that (the server render) a CSS approximation
   stands in, each photo growing in proportion to its shape. The gap is read
   back from the CSS so the maths always matches it. */
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
        setBoxes(justify(rs, width, gap));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [key]);

  return (
    <Reveal>
      <div
        ref={gridRef}
        className="flex flex-wrap gap-1.5 px-3 [--row-h:300px] sm:gap-2 sm:px-5 sm:[--row-h:320px] lg:gap-2.5 lg:px-8 lg:[--row-h:360px] xl:[--row-h:440px]"
      >
        {items.map((m, i) => {
          const box = boxes?.[i];
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
              className="group relative block cursor-zoom-in overflow-hidden"
              style={
                box
                  ? { flex: "none", width: box.w, height: box.h }
                  : { flexGrow: r, flexBasis: `calc(var(--row-h) * ${r})`, aspectRatio: r }
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
      <Lightbox items={items} index={open} onIndex={setOpen} />
    </Reveal>
  );
}
