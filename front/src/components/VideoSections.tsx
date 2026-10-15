"use client";

import { Fragment, useState, type ReactNode } from "react";
import { Play } from "lucide-react";
import { ACCENT, FONT_SCRIPT } from "@/lib/brand";
import type { VideoSection, VideoTile } from "@/lib/cms";
import Lightbox from "./Lightbox";
import ParallaxImage from "./ParallaxImage";
import Reveal from "./Reveal";

/* The Videography page's client sections: one per client, their photo (logo
   already edited on) on one side and their videos on the other, with a hairline
   between clients. The side alternates and the photo style rotates (cms.ts
   resolves "auto"), so no two neighbours look the same. The photo is never
   cropped beyond a height cap, so the logo on it always survives. */

/* Padding that lines a column's outer edge up with the page's content column
   on wide screens; on small screens every column gets the plain gutter. */
const GUTTER = "px-5 sm:px-8";
const OUTER_L = "lg:pl-[max(2rem,calc((100vw_-_1180px)/2_+_2rem))]";
const OUTER_R = "lg:pr-[max(2rem,calc((100vw_-_1180px)/2_+_2rem))]";

export default function VideoSections({ sections }: { sections: VideoSection[] }) {
  return (
    <div className="bg-[rgb(10,11,16)] pb-10 lg:pb-16">
      {sections.map((s, i) => (
        <Fragment key={s.key}>
          <div className={`mx-auto max-w-[1180px] ${GUTTER}`}>
            <hr className="border-white/10" />
          </div>
          <Section s={s} n={i + 1} />
        </Fragment>
      ))}
    </div>
  );
}

function Section({ s, n }: { s: VideoSection; n: number }) {
  const [open, setOpen] = useState<number | null>(null);
  const left = s.side === "left";
  const edge = s.style === "edge";

  return (
    <section aria-labelledby={`client-${n}`} className="py-16 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/* Stretched to the row so the photo can stick while a long run of
            videos scrolls past; centred against a short one. */}
        <div
          className={`self-stretch lg:col-span-5 ${left ? "" : "lg:order-last"} ${
            edge ? "" : `${GUTTER} ${left ? `${OUTER_L} lg:pr-0` : `${OUTER_R} lg:pl-0`}`
          }`}
        >
          <Reveal className="lg:sticky lg:top-28">
            <Photo s={s} left={left} />
          </Reveal>
        </div>

        <div className={`self-center lg:col-span-7 ${GUTTER} ${left ? `${OUTER_R} lg:pl-0` : `${OUTER_L} lg:pr-0`}`}>
          <Reveal>
            <h2
              id={`client-${n}`}
              className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold uppercase tracking-[0.22em] text-white"
            >
              <span aria-hidden className="tabular-nums" style={{ color: ACCENT }}>
                {String(n).padStart(2, "0")}
              </span>
              <span aria-hidden className="h-px w-8 bg-white/30" />
              {s.client}
              <span className="font-normal text-white/45">
                · {s.videos.length} {s.videos.length === 1 ? "video" : "videos"}
              </span>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <Videos videos={s.videos} open={setOpen} />
          </Reveal>
        </div>
      </div>
      <Lightbox items={s.videos} index={open} onIndex={setOpen} />
    </section>
  );
}

/* ---------- The photo, in its three styles ---------- */

function Photo({ s, left }: { s: VideoSection; left: boolean }) {
  const img = (cls: string) => (
    <img src={s.photo} alt={s.client} loading="lazy" className={`block max-h-[85vh] w-full object-cover ${cls}`} />
  );

  /* Edge: square corners, running off the side of the screen. */
  if (s.style === "edge") return img("");

  /* Framed: rounded, over a purple plate knocked out towards the videos. */
  if (s.style === "framed")
    return (
      <div className="relative">
        <div
          aria-hidden
          className={`absolute inset-0 translate-y-3 rounded-3xl lg:translate-y-5 ${
            left ? "translate-x-3 lg:translate-x-5" : "-translate-x-3 lg:-translate-x-5"
          }`}
          style={{ background: ACCENT }}
        />
        {img("relative rounded-3xl")}
      </div>
    );

  /* Print: a white-bordered print, tilted away from the videos, the client's
     name handwritten along the bottom border. */
  return (
    <div
      className={`mx-auto max-w-md rounded-md bg-white p-2.5 pb-3 shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)] ${
        left ? "-rotate-2" : "rotate-2"
      }`}
    >
      {img("rounded-sm")}
      <p className="mt-2 text-center text-2xl text-[rgb(10,11,16)]" style={{ fontFamily: FONT_SCRIPT }}>
        {s.client}
      </p>
    </div>
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

/* The column count follows what the client sent: verticals sit up to three
   abreast, one or two landscape films stack full width, and anything else
   splits into two columns. A lone vertical is held to a phone-ish width
   rather than filling the column at 9:16. */
function Videos({ videos, open }: { videos: VideoTile[]; open: (i: number) => void }) {
  const tall = videos.filter((v) => v.tall).length;
  const cols = tall === videos.length ? Math.min(3, videos.length) : tall === 0 && videos.length <= 2 ? 1 : 2;

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
