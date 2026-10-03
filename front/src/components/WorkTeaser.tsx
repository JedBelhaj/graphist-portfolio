import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PHOTO_TILES, VIDEO_TILES, WEB_SHOTS } from "@/lib/content";
import BrowserFrame from "./BrowserFrame";
import PlayMark from "./PlayMark";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";
import Viewfinder from "./Viewfinder";

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
   still; web design is a browser window on ink, so the three lanes are told
   apart before anyone reads a word. */
function Media({ lane }: { lane: Lane }) {
  if (lane.kind === "web") {
    return (
      <div className="absolute inset-0 bg-ink">
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand/35 blur-[90px]" />
        <div className="absolute inset-x-[10%] top-[14%] h-[40%] transition-transform duration-700 ease-out group-hover:-translate-y-2 md:inset-x-[24%] md:top-[12%] md:h-[46%] lg:inset-x-[10%] lg:top-[14%] lg:h-[40%]">
          <BrowserFrame src={lane.img} className="h-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <img
        src={lane.img}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover grayscale-[35%] transition-[transform,filter] duration-700 ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
      />
      {lane.kind === "video" && (
        <span className="absolute left-1/2 top-[40%] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-brand text-xl text-white transition-transform duration-500 group-hover:scale-110">
          <PlayMark className="ml-0.5" />
        </span>
      )}
    </>
  );
}

/* Three doors into the portfolio. On home it carries its own heading; /work
   already has a PageHero above it, so it renders bare there. */
export default function WorkTeaser({ heading = true }: { heading?: boolean }) {
  return (
    <section
      id="work"
      className={`bg-white px-5 sm:px-8 lg:px-10 ${heading ? "py-20 lg:py-28" : "pb-20 lg:pb-28"}`}
    >
      <div className="mx-auto max-w-[1220px]">
        {heading && (
          <SectionHead
            index="03"
            label="My work"
            title="Three lanes,"
            script="one standard."
            aside={
              <Link
                href="/work"
                className="readout inline-flex items-center gap-2 text-ink underline decoration-brand decoration-2 underline-offset-[6px] transition-colors hover:text-brand"
              >
                See all work <ArrowUpRight size={14} />
              </Link>
            }
          />
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {LANES.map((c, i) => (
            <Reveal key={c.href} delay={i * 120} className={c.span}>
              <Link href={c.href} className="group block">
                <Viewfinder className={`aspect-[4/5] bg-ink ${c.aspect ?? ""}`}>
                  <Media lane={c} />
                  {/* Dark at both ends: the caption at the bottom, the readout at the top. */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/40" />

                  <span className="readout absolute left-9 top-9 text-white lg:left-11 lg:top-11">
                    0{i + 1} <span className="text-white/50">/ {c.kind}</span>
                  </span>

                  {/* Padding clears the viewfinder's corner marks. */}
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-9 lg:p-11">
                    <div>
                      <h3 className="display text-3xl text-white lg:text-[2.1rem]">{c.title}</h3>
                      <p className="mt-2 text-base text-white/70">{c.blurb}</p>
                      <p className="readout mt-4 text-white/50">{c.tags.join(" · ")}</p>
                    </div>
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-white text-ink transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                      <ArrowUpRight size={20} />
                    </span>
                  </div>
                </Viewfinder>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
