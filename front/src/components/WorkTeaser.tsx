import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";
import { ACCENT, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { PHOTO_TILES, VIDEO_TILES, WEB_SHOTS } from "@/lib/content";
import BrowserFrame from "./BrowserFrame";
import Reveal from "./Reveal";

type Lane = {
  kind: "photo" | "video" | "web";
  title: string;
  blurb: string;
  tags: string[];
  href: string;
  img: string;
  /* Overrides for the grid cell and the card's shape. Web Design takes the
     full row at md, where two columns would otherwise leave it alone next to
     an empty cell, and goes landscape to suit the wider slot. */
  span?: string;
  aspect?: string;
};

const LANES: Lane[] = [
  {
    kind: "photo",
    title: "Photography",
    blurb: "Brand, product, portrait and event stills.",
    tags: ["Brand", "Product", "Events"],
    href: "/work/photography",
    img: PHOTO_TILES[0],
  },
  {
    kind: "video",
    title: "Videography",
    blurb: "Brand films, reels and event coverage.",
    tags: ["Films", "Reels", "Recaps"],
    href: "/work/videography",
    img: VIDEO_TILES[0],
  },
  {
    kind: "web",
    title: "Web Design",
    blurb: "Sites built around the content we shoot.",
    tags: ["Brand sites", "Stores", "SEO"],
    href: "/work/web-design",
    img: WEB_SHOTS[0],
    span: "md:col-span-2 lg:col-span-1",
    aspect: "md:aspect-[16/9] lg:aspect-[4/5]",
  },
];

/* What sits behind each card's caption. Photo and video are a full-bleed
   still; web design is a browser window on a dark ground, so the three lanes
   are told apart before anyone reads a word. */
function Media({ lane }: { lane: Lane }) {
  if (lane.kind === "web") {
    return (
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 80% at 80% 0%, ${ACCENT} 0%, rgb(44,30,110) 38%, rgb(10,11,16) 75%)`,
        }}
      >
        <div className="absolute inset-x-[10%] top-[16%] h-[38%] -rotate-3 transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:rotate-0 md:inset-x-[24%] md:top-[12%] md:h-[46%] lg:inset-x-[10%] lg:top-[16%] lg:h-[38%]">
          <BrowserFrame src={lane.img} className="h-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <img src={lane.img} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]" />
      {lane.kind === "video" && (
        <span className="absolute left-1/2 top-[40%] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/40 backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
          <Play size={24} fill="currentColor" className="ml-1" />
        </span>
      )}
    </>
  );
}

/* Three doors into the portfolio. On home it carries its own heading; /work
   already has a PageHero above it, so it renders bare there. */
export default function WorkTeaser({ heading = true }: { heading?: boolean }) {
  return (
    <section id="work" className={`bg-white px-5 sm:px-8 ${heading ? "py-20 lg:py-28" : "pb-20 lg:pb-28"}`}>
      <div className="mx-auto max-w-[1180px]">
        {heading && (
          <div className="mb-12 flex flex-col gap-4 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Reveal>
                <p
                  className="mb-4 text-sm font-semibold uppercase tracking-[0.22em]"
                  style={{ color: ACCENT }}
                >
                  My work
                </p>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="text-4xl font-semibold leading-[1.05] tracking-tight text-[rgb(10,11,16)] sm:text-5xl lg:text-[64px]"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  Three lanes,
                  <span className="block text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: FONT_SCRIPT }}>
                    one standard.
                  </span>
                </h2>
              </Reveal>
            </div>
            <Reveal delay={140}>
              <Link
                href="/work"
                className="inline-flex items-center gap-2 text-base font-semibold transition-opacity hover:opacity-70"
                style={{ color: ACCENT }}
              >
                See all work <ArrowUpRight size={18} />
              </Link>
            </Reveal>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {LANES.map((c, i) => (
            <Reveal key={c.href} delay={i * 120} className={c.span}>
              <Link
                href={c.href}
                className={`group relative block aspect-[4/5] overflow-hidden rounded-[28px] bg-[rgb(10,11,16)] ${c.aspect ?? ""}`}
              >
                <Media lane={c} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                <span className="absolute left-6 top-6 rounded-full bg-black/30 px-3 py-1 text-xs font-semibold tabular-nums text-white ring-1 ring-white/25 backdrop-blur-md lg:left-7 lg:top-7">
                  0{i + 1}
                </span>

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 lg:p-7">
                  <div>
                    <div
                      className="text-3xl font-bold tracking-tight text-white lg:text-[34px]"
                      style={{ fontFamily: FONT_DISPLAY }}
                    >
                      {c.title}
                    </div>
                    <p className="mt-1 text-base text-white/80">{c.blurb}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {c.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-white/12 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur-sm"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[rgb(10,11,16)] transition-transform duration-300 group-hover:rotate-45">
                    <ArrowUpRight size={22} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
