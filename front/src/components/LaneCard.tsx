import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";
import { ACCENT, FONT_DISPLAY } from "@/lib/brand";
import BrowserFrame from "./BrowserFrame";

export type LaneCardData = {
  kind: "photo" | "video" | "web";
  title: string;
  blurb: string;
  tags: string[];
  img: string;
  /* Without one the card isn't a link and drops the arrow. */
  href?: string;
  /* Web only: false while the card still shows a mock still, which gets the
     wireframe overlay (see BrowserFrame). */
  real?: boolean;
};

/* What sits behind each card's caption. Photo and video are a full-bleed
   still; web design is a browser window on a dark ground, so the three lanes
   are told apart before anyone reads a word. */
function Media({ lane }: { lane: LaneCardData }) {
  if (lane.kind === "web") {
    return (
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 80% at 80% 0%, ${ACCENT} 0%, rgb(44,30,110) 38%, rgb(10,11,16) 75%)`,
        }}
      >
        <div className="absolute inset-x-[10%] top-[16%] h-[38%] -rotate-3 transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:rotate-0 md:inset-x-[24%] md:top-[12%] md:h-[46%] lg:inset-x-[10%] lg:top-[16%] lg:h-[38%]">
          <BrowserFrame src={lane.img} wireframe={!lane.real} className="h-full" />
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
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
      />
      {lane.kind === "video" && (
        <span className="absolute left-1/2 top-[40%] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/40 backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
          <Play size={24} fill="currentColor" className="ml-1" />
        </span>
      )}
    </>
  );
}

/* The tall picture card used by the home/work teaser and the services page.
   The caption is in normal flow (pinned to the bottom with justify-end), so
   if a longer blurb or more tags don't fit, the card grows past its aspect
   ratio instead of clipping. */
export default function LaneCard({
  lane,
  index,
  aspect = "",
  className = "",
  titleTag: Title = "div",
}: {
  lane: LaneCardData;
  /* Zero-based; shown as 01, 02… in the corner. */
  index: number;
  /* Extra aspect-ratio classes for wider breakpoints. */
  aspect?: string;
  className?: string;
  titleTag?: "div" | "h2" | "h3";
}) {
  const cls = `group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[28px] bg-[rgb(10,11,16)] ${aspect} ${className}`;

  const inner = (
    <>
      <Media lane={lane} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      <span className="absolute left-6 top-6 rounded-full bg-black/30 px-3 py-1 text-xs font-semibold tabular-nums text-white ring-1 ring-white/25 backdrop-blur-md lg:left-7 lg:top-7">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="relative flex items-end justify-between gap-4 p-6 lg:p-7">
        <div>
          <Title
            className="text-3xl font-bold tracking-tight text-white lg:text-[34px]"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            {lane.title}
          </Title>
          {lane.blurb && <p className="mt-1 text-base text-white/80">{lane.blurb}</p>}
          {lane.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {lane.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/12 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/20 backdrop-blur-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        {lane.href && (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[rgb(10,11,16)] transition-transform duration-300 group-hover:rotate-45">
            <ArrowUpRight size={22} />
          </span>
        )}
      </div>
    </>
  );

  return lane.href ? (
    <Link href={lane.href} className={cls}>
      {inner}
    </Link>
  ) : (
    <article className={cls}>{inner}</article>
  );
}
