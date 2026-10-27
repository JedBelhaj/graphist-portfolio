"use client";

import { useState, type ReactNode } from "react";
import { Play } from "lucide-react";
import { ACCENT, FONT_DISPLAY } from "@/lib/brand";
import type { VideoSection, VideoTile } from "@/lib/cms";
import Lightbox from "./Lightbox";
import ParallaxImage from "./ParallaxImage";
import Reveal from "./Reveal";

/* The Videography page's categories (Restaurants, Medical…): a hairline
   carrying the number and video count, the category in big type, then its
   videos across the full content width. Nothing else, so the work carries
   the page. */
export default function VideoSections({ sections }: { sections: VideoSection[] }) {
  return (
    <div className="bg-[rgb(10,11,16)] pb-10 lg:pb-16">
      {sections.map((s, i) => (
        <Section key={s.key} s={s} n={i + 1} />
      ))}
    </div>
  );
}

function Section({ s, n }: { s: VideoSection; n: number }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section aria-labelledby={`category-${n}`} className="mx-auto max-w-[1180px] px-5 py-16 sm:px-8 lg:py-24">
      <Reveal>
        <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
          <span className="tabular-nums" style={{ color: ACCENT }}>
            {String(n).padStart(2, "0")}
          </span>
          <span aria-hidden className="h-px flex-1 bg-white/15" />
          <span>
            {s.videos.length} {s.videos.length === 1 ? "video" : "videos"}
          </span>
        </div>
        <h2
          id={`category-${n}`}
          className="mt-5 text-[44px] font-semibold leading-[0.95] tracking-[-0.04em] text-white sm:text-7xl lg:text-[128px]"
          style={{ fontFamily: FONT_DISPLAY }}
        >
          {s.title}
        </h2>
      </Reveal>
      <Reveal delay={120}>
        <div className="mt-10 lg:mt-14">
          <Videos videos={s.videos} open={setOpen} />
        </div>
      </Reveal>
      <Lightbox items={s.videos} index={open} onIndex={setOpen} />
    </section>
  );
}

/* ---------- The videos ---------- */

/* One video. Landscape is 16:9 and vertical 9:16, never cropped to the other.
   The title slides up on hover (always shown on touch screens, which have no
   hover), and a play badge marks anything with a clip or a film link. */
function Tile({ v, onOpen }: { v: VideoTile; onOpen: () => void }) {
  const isVideo = Boolean(v.video || v.href);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={isVideo ? (v.alt ? `Play: ${v.alt}` : "Play the video") : v.alt ? `View: ${v.alt}` : "View"}
      className={`group relative block w-full cursor-pointer overflow-hidden rounded-2xl bg-white/5 ${v.tall ? "aspect-[9/16]" : "aspect-video"}`}
    >
      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]">
        <ParallaxImage src={v.src} video={v.video} alt={v.alt} />
      </div>
      {v.alt && (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-black/75 to-transparent px-4 pb-3 pt-12 text-left text-sm font-semibold text-white opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
          {v.alt}
        </span>
      )}
      {isVideo && (
        <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/40 backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
          <Play size={22} fill="currentColor" className="ml-1" />
        </span>
      )}
    </button>
  );
}

/* The column count follows what the category holds, now the videos have the
   full width: verticals sit up to four abreast, landscape films two (or one
   alone), and a mix splits into three. A lone vertical is held to a
   phone-ish width rather than filling the row at 9:16. */
function Videos({ videos, open }: { videos: VideoTile[]; open: (i: number) => void }) {
  const tall = videos.filter((v) => v.tall).length;
  const cols =
    tall === videos.length ? Math.min(4, videos.length) : tall === 0 ? Math.min(2, videos.length) : 3;

  return (
    <div className={tall === 1 && videos.length === 1 ? "max-w-xs" : ""}>
      <Columns
        cols={cols}
        pieces={videos.map((v, i) => ({
          node: <Tile v={v} onOpen={() => open(i)} />,
          tall: v.tall,
          h: v.tall ? 16 / 9 : 9 / 16,
        }))}
      />
    </div>
  );
}

/* Masonry for mixed landscape and vertical tiles. Desktop: `cols` columns,
   each tile going to whichever is shortest so the bottoms stay close. Below
   lg the columns dissolve (display: contents) into a two-up grid where
   landscape tiles take the full width; the `order` style keeps that grid in
   the original order. */
type Piece = { node: ReactNode; tall: boolean; h: number };

function Columns({ pieces, cols }: { pieces: Piece[]; cols: number }) {
  const heights = Array<number>(cols).fill(0);
  const buckets: number[][] = Array.from({ length: cols }, () => []);
  pieces.forEach((p, i) => {
    const c = heights.indexOf(Math.min(...heights));
    buckets[c].push(i);
    heights[c] += p.h + 0.06; // the gap, as a share of column width
  });

  return (
    <div className="grid grid-flow-dense grid-cols-2 gap-3 sm:gap-4 lg:flex lg:items-start lg:gap-5">
      {buckets.map((b, c) => (
        <div key={c} className="contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:gap-5">
          {b.map((i) => (
            <div key={i} style={{ order: i }} className={pieces[i].tall ? "" : "col-span-2"}>
              {pieces[i].node}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
