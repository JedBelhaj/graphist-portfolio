"use client";

import { useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { ACCENT, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import type { VideoSection, VideoTile } from "@/lib/cms";
import Lightbox from "./Lightbox";
import ParallaxImage from "./ParallaxImage";
import Reveal from "./Reveal";

/* The Videography page's sections, one after another. Each one picks a layout
   and a background in the studio (cms.ts resolves "auto"), so the page reads
   as a run of different spreads rather than one long grid. Every layout keeps
   the same pieces: a numbered heading, the cover image, and the videos, which
   open the Lightbox and step through that section's set. */

/* Text colours per background. ACCENT is too light for small type on lilac,
   so the eyebrow there takes the ink instead. */
const TONES = {
  light: {
    bg: "bg-white",
    title: "text-[rgb(10,11,16)]",
    body: "text-[rgb(74,74,86)]",
    eyebrow: ACCENT,
    button: "bg-[rgb(10,11,16)]/5 text-[rgb(10,11,16)] hover:bg-[rgb(10,11,16)]/10",
  },
  lilac: {
    bg: "bg-[rgb(238,234,255)]",
    title: "text-[rgb(10,11,16)]",
    body: "text-[rgb(74,74,86)]",
    eyebrow: "rgb(10,11,16)",
    button: "bg-white/70 text-[rgb(10,11,16)] hover:bg-white",
  },
  dark: {
    bg: "bg-[rgb(10,11,16)]",
    title: "text-[rgb(254,254,254)]",
    body: "text-[rgb(176,176,186)]",
    eyebrow: ACCENT,
    button: "bg-white/10 text-white hover:bg-white/20",
  },
} as const;

type Tone = (typeof TONES)[keyof typeof TONES];
type LayoutProps = { s: VideoSection; t: Tone; n: number; open: (i: number) => void };

const CONTAINER = "mx-auto max-w-[1180px] px-5 sm:px-8";

export default function VideoSections({ sections }: { sections: VideoSection[] }) {
  return sections.map((s, i) => <Section key={s.key} s={s} n={i + 1} />);
}

function Section({ s, n }: { s: VideoSection; n: number }) {
  const [open, setOpen] = useState<number | null>(null);
  const Layout = LAYOUTS[s.layout];

  return (
    /* overflow-x-clip, not overflow-hidden: hidden would make the section a
       scroll container and break the sticky image in the Split layout. */
    <section aria-label={s.title} className={`${TONES[s.tone].bg} overflow-x-clip py-20 lg:py-28`}>
      <Layout s={s} t={TONES[s.tone]} n={n} open={setOpen} />
      <Lightbox items={s.videos} index={open} onIndex={setOpen} />
    </section>
  );
}

/* ---------- Shared pieces ---------- */

function Header({ s, t, n, center = false }: { s: VideoSection; t: Tone; n: number; center?: boolean }) {
  const count = s.videos.length;
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <p
        className={`mb-4 flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] ${center ? "justify-center" : ""}`}
        style={{ color: t.eyebrow }}
      >
        <span className="tabular-nums">{String(n).padStart(2, "0")}</span>
        <span aria-hidden className="h-px w-8 bg-current opacity-50" />
        <span>
          {count} {count === 1 ? "video" : "videos"}
        </span>
      </p>
      <h2
        className={`text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[60px] ${t.title}`}
        style={{ fontFamily: FONT_DISPLAY }}
      >
        {s.title}
        {s.accent && (
          <span className="block" style={{ fontFamily: FONT_SCRIPT, color: ACCENT }}>
            {s.accent}
          </span>
        )}
      </h2>
      {s.body && <p className={`mt-5 text-base leading-relaxed ${t.body}`}>{s.body}</p>}
    </Reveal>
  );
}

/* One video. Landscape is 16:9 and vertical 9:16, never cropped to the other.
   The title slides up on hover (always shown on touch screens, which have no
   hover), and a play badge marks anything with a clip or a film link. */
function Tile({ v, onOpen, className = "" }: { v: VideoTile; onOpen: () => void; className?: string }) {
  const isVideo = Boolean(v.video || v.href);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={isVideo ? (v.alt ? `Play: ${v.alt}` : "Play the video") : v.alt ? `View: ${v.alt}` : "View"}
      className={`group relative block cursor-pointer overflow-hidden bg-black/10 ${v.tall ? "aspect-[9/16]" : "aspect-video"} ${className}`}
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

/* Masonry for mixed landscape and vertical tiles. Desktop: `cols` columns,
   each tile going to whichever is shortest so the bottoms stay close, and
   `offsets` stagger the columns. Below lg the columns dissolve (display:
   contents) into a two-up grid where landscape tiles take the full width;
   the `order` style keeps that grid in the original order. */
type Piece = { node: ReactNode; tall: boolean; h: number };

function Columns({ pieces, cols, offsets = [] }: { pieces: Piece[]; cols: number; offsets?: string[] }) {
  const heights = Array<number>(cols).fill(0);
  const buckets: number[][] = Array.from({ length: cols }, () => []);
  pieces.forEach((p, i) => {
    const c = heights.indexOf(Math.min(...heights));
    buckets[c].push(i);
    heights[c] += p.h + 0.06; // the gap, as a share of column width
  });

  return (
    <div className="grid grid-flow-dense grid-cols-2 gap-3 sm:gap-4 lg:flex lg:items-start lg:gap-6">
      {buckets.map((b, c) => (
        <div key={c} className={`contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:gap-6 ${offsets[c] ?? ""}`}>
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

const videoPieces = (s: VideoSection, open: (i: number) => void, tile = "rounded-2xl"): Piece[] =>
  s.videos.map((v, i) => ({
    node: <Tile v={v} onOpen={() => open(i)} className={`w-full ${tile}`} />,
    tall: v.tall,
    h: v.tall ? 16 / 9 : 9 / 16,
  }));

/* ---------- Layouts ---------- */

/* Heading, a wide letterbox banner, and the videos riding up over its bottom edge. */
function Cinema({ s, t, n, open }: LayoutProps) {
  return (
    <div className={CONTAINER}>
      <Header s={s} t={t} n={n} />
      <Reveal className="mt-10 lg:mt-14">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl sm:aspect-[21/9]">
          <ParallaxImage src={s.image.src} alt={s.image.alt} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      </Reveal>
      <Reveal className="relative -mt-10 px-3 sm:-mt-16 sm:px-8 lg:-mt-28 lg:px-14">
        <Columns
          pieces={videoPieces(s, open, "rounded-2xl shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)]")}
          cols={Math.min(3, s.videos.length)}
        />
      </Reveal>
    </div>
  );
}

/* An arched portrait that holds still while the videos scroll past it.
   Every other section mirrors it, so two Splits in a row still differ. */
function Split({ s, t, n, open }: LayoutProps) {
  const flip = n % 2 === 0;
  return (
    <div className={`${CONTAINER} grid gap-12 lg:grid-cols-12 lg:gap-16`}>
      <div className={`lg:col-span-5 ${flip ? "lg:order-last" : ""}`}>
        <div className="lg:sticky lg:top-28">
          <Reveal>
            <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-b-3xl rounded-t-[999px] lg:max-w-none">
              <ParallaxImage src={s.image.src} alt={s.image.alt} />
            </div>
          </Reveal>
          <div className="mt-10">
            <Header s={s} t={t} n={n} />
          </div>
        </div>
      </div>
      <div className="lg:col-span-7">
        <Reveal>
          <Columns pieces={videoPieces(s, open)} cols={Math.min(2, s.videos.length)} offsets={["", "lg:mt-24"]} />
        </Reveal>
      </div>
    </div>
  );
}

/* A strip of film you scroll sideways: sprocket holes along both edges,
   the cover set in a round reel next to the heading. */
const SPROCKETS = {
  backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.28) 0 12px, transparent 12px 30px)",
};
/* Lines the first frame up with the page's content column on wide screens. */
const EDGE = "max(1.25rem, calc((100vw - 1180px) / 2 + 2rem))";

function Filmstrip({ s, t, n, open }: LayoutProps) {
  const strip = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) =>
    strip.current?.scrollBy({ left: dir * strip.current.clientWidth * 0.75, behavior: "smooth" });

  return (
    <>
      <div className={`${CONTAINER} flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between`}>
        <Header s={s} t={t} n={n} />
        <Reveal className="shrink-0 self-center lg:mr-10">
          <div className="relative">
            <span
              aria-hidden
              className="spin-slow absolute -inset-4 rounded-full border-2 border-dashed"
              style={{ borderColor: ACCENT }}
            />
            <div className="relative h-44 w-44 overflow-hidden rounded-full sm:h-56 sm:w-56 lg:h-64 lg:w-64">
              <ParallaxImage src={s.image.src} alt={s.image.alt} />
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-14 lg:mt-20">
        <div className="relative border-y border-white/10 bg-[rgb(10,11,16)] py-7 sm:py-9">
          <div aria-hidden className="absolute inset-x-0 top-2.5 h-2.5 sm:top-3" style={SPROCKETS} />
          <div aria-hidden className="absolute inset-x-0 bottom-2.5 h-2.5 sm:bottom-3" style={SPROCKETS} />
          <div
            ref={strip}
            className="flex h-56 snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] sm:h-72 sm:gap-4 lg:h-[380px] [&::-webkit-scrollbar]:hidden"
            style={{ paddingInline: EDGE, scrollPaddingInline: EDGE }}
          >
            {s.videos.map((v, i) => (
              <Tile key={i} v={v} onOpen={() => open(i)} className="h-full w-auto shrink-0 snap-start rounded-md" />
            ))}
          </div>
        </div>
      </Reveal>

      {s.videos.length > 1 && (
        <div className={`${CONTAINER} mt-6 flex justify-end gap-3`}>
          {[-1, 1].map((dir) => (
            <button
              key={dir}
              type="button"
              aria-label={dir < 0 ? "Scroll back" : "Scroll forward"}
              onClick={() => scroll(dir)}
              className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full transition-colors ${t.button}`}
            >
              {dir < 0 ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/* Centred heading over three staggered columns, with the cover pinned in
   among the videos like a print on a moodboard. */
function Collage({ s, t, n, open }: LayoutProps) {
  const cover: Piece = {
    node: (
      <div className="mx-auto max-w-xs -rotate-2 rounded-2xl bg-white p-3 pb-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)] lg:max-w-none">
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
          <ParallaxImage src={s.image.src} alt={s.image.alt} />
        </div>
        {s.accent && (
          <p className="mt-3 text-center text-2xl text-[rgb(10,11,16)]" style={{ fontFamily: FONT_SCRIPT }}>
            {s.accent}
          </p>
        )}
      </div>
    ),
    tall: false,
    h: 5 / 4 + 0.2,
  };

  return (
    <div className={CONTAINER}>
      <Header s={s} t={t} n={n} center />
      <Reveal className="mt-14 lg:mt-20">
        <Columns
          pieces={[cover, ...videoPieces(s, open)]}
          cols={Math.min(3, s.videos.length + 1)}
          offsets={["lg:mt-16", "", "lg:mt-32"]}
        />
      </Reveal>
    </div>
  );
}

const LAYOUTS: Record<VideoSection["layout"], (p: LayoutProps) => ReactNode> = {
  cinema: Cinema,
  split: Split,
  filmstrip: Filmstrip,
  collage: Collage,
};
