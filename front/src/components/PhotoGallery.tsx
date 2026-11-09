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

/* Grid copies don't need the 1800px file the lightbox shows; ~1000px covers
   the largest tile on a retina screen at a fraction of the weight. */
function thumb(src: string) {
  return src.includes("cdn.sanity.io") ? src.replace(/([?&])w=\d+/, "$1w=1000") : src;
}

/* Target row height for a gallery this wide. Rows land near it, never exactly. */
const targetRow = (width: number) => (width < 600 ? 260 : width < 1000 ? 280 : 380);

type Box = { w: number; h: number };

const total = (rs: number[]) => rs.reduce((a, b) => a + b, 0);

/* Splits the photos into justified rows for a given width: each row scales so
   its photos fill the width exactly at one shared height. A row closes at the
   photo that brings its height closest to the target, which keeps every row
   near the same height (instead of the odd giant row a plain wrap produces).

   A last row that would fill less than ~60% of the width joins the row above
   (which just runs a little shorter), so the gallery never ends on one stray
   photo. A fuller last row keeps the target height and sits left-aligned. */
function justify(ratios: number[], width: number): Box[] {
  const target = targetRow(width);
  const rows: number[][] = [];
  let row: number[] = [];

  for (const r of ratios) {
    const withIt = width / (total(row) + r);
    if (row.length > 0 && withIt < target) {
      /* Close the row here, keeping whichever of with/without this photo
         lands nearer the target height. */
      if (Math.abs(withIt - target) < Math.abs(width / total(row) - target)) {
        rows.push([...row, r]);
        row = [];
      } else {
        rows.push(row);
        row = [r];
      }
    } else {
      row.push(r);
    }
  }
  if (row.length) {
    if (rows.length && (total(row) * target) / width < 0.6) rows[rows.length - 1].push(...row);
    else rows.push(row);
  }

  const boxes: Box[] = [];
  rows.forEach((rs, n) => {
    const fitted = width / total(rs);
    /* Only a final row that's still short is left unstretched. */
    const fill = !(n === rows.length - 1 && fitted > target);
    const h = fill ? fitted : target;
    let used = 0;
    rs.forEach((r, k) => {
      /* Whole pixels; the last photo of a full row takes the remainder so
         the right edge is exactly flush. */
      const w = fill && k === rs.length - 1 ? width - used : Math.floor(r * h);
      used += w;
      boxes.push({ w, h: Math.round(h) });
    });
  });
  return boxes;
}

/* The photography portfolio as justified rows, the layout most photographers'
   sites use: every photo shown whole at its own proportions (never cropped
   into a fixed tile), all photos in a row the same height, and each row
   filling the width so both edges stay flush. It reads left to right in the
   admin's order, so the first photo in the list is the one that opens the
   gallery.

   The rows are worked out in the browser from the gallery's width (and again
   when it changes). Before that (the server render), a CSS approximation
   stands in: each photo's flex-basis is its ratio x the row height and it
   grows in proportion to its ratio.

   Flush tiles (no gutter), held in from the page's left and right edges by a
   side margin. Every photo opens the Lightbox, which steps through the set. */
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
      const width = Math.floor(el.clientWidth - parseFloat(getComputedStyle(el).paddingLeft) * 2);
      if (width > 0 && width !== last) {
        last = width;
        setBoxes(justify(rs, width));
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
        className="flex flex-wrap px-3 [--row-h:190px] after:grow-[999] after:content-[''] sm:px-5 sm:[--row-h:280px] lg:px-8 lg:[--row-h:380px]"
      >
        {items.map((m, i) => {
          const r = ratios[i];
          const box = boxes?.[i];
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
