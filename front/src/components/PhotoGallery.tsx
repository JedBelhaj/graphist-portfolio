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

/* Row sizes, repeated down the gallery: 3 then 2 on tablets and up, 2 then 1
   on phones. The alternation is what gives the collage its rhythm. */
const pattern = (small: boolean) => (small ? [2, 1] : [3, 2]);

/* How wide a tile may be relative to its height, by how many share its row.
   A photo's own shape is used when it falls inside the range; outside it, the
   tile is clamped and the photo is cropped to fit (object-cover). That keeps
   a row of three tall portraits from towering, and a pair of portraits from
   filling the whole screen, so every row lands at a comfortable height. */
const RANGE: Record<number, [number, number]> = {
  1: [1.2, 1.8],
  2: [1.15, 1.9],
  3: [0.95, 1.6],
  4: [0.8, 1.4],
};
const SMALL_PAIR: [number, number] = [0.75, 1.3];

type Box = { w: number; h: number; crop: boolean };

/* Groups the photos into the alternating rows, then sizes each row so its
   tiles (and the gaps between them) fill the width exactly at one shared
   height: every row is flush on both edges, like the reference collage.
   A lone photo left at the end on a wide screen joins the row before it. */
function collage(ratios: number[], width: number, gap: number): Box[] {
  const small = width < 600;
  const sizes: number[] = [];
  for (let used = 0, p = 0; used < ratios.length; p++) {
    const size = Math.min(pattern(small)[p % 2], ratios.length - used);
    sizes.push(size);
    used += size;
  }
  if (!small && sizes.length > 1 && sizes[sizes.length - 1] === 1) {
    sizes.pop();
    sizes[sizes.length - 1] += 1;
  }

  const boxes: Box[] = [];
  let start = 0;
  for (const size of sizes) {
    const [min, max] = small && size === 2 ? SMALL_PAIR : RANGE[size];
    const rs = ratios.slice(start, start + size);
    const shapes = rs.map((r) => Math.min(max, Math.max(min, r)));
    const room = width - gap * (size - 1);
    const h = room / shapes.reduce((a, b) => a + b, 0);
    let usedW = 0;
    shapes.forEach((s, k) => {
      /* Whole pixels; the last tile takes the remainder so the right edge is
         exactly flush. */
      const w = k === size - 1 ? room - usedW : Math.floor(s * h);
      usedW += w;
      boxes.push({ w, h: Math.round(h), crop: rs[k] < s });
    });
    start += size;
  }
  return boxes;
}

/* The photography portfolio as an organised collage: rows of three, then
   two, alternating, each row filling the width at one height with a thin gap
   between tiles. It reads left to right in the admin's order, so the first
   photo in the list is the one that opens the gallery.

   Tile shapes follow the photos where they can and are evened out where they
   can't (see RANGE), so a tall portrait in a wide tile is cropped. The crop
   sits just above centre, which keeps both standing and crouching subjects
   in frame across this set. The full, uncropped
   photo opens in the Lightbox on click.

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
        setBoxes(collage(rs, width, gap));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [key]);

  return (
    <Reveal>
      <div ref={gridRef} className="flex flex-wrap gap-1 px-3 sm:gap-2 sm:px-5 lg:px-8">
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
