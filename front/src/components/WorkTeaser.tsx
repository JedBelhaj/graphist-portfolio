import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ACCENT, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import LaneCard, { type LaneCardData } from "./LaneCard";
import Reveal from "./Reveal";

/* Three doors into the portfolio. On home it carries its own heading; /work
   already has a PageHero above it, so it renders bare there. */
export default async function WorkTeaser({ heading = true }: { heading?: boolean }) {
  const { home, work } = await getContent();
  const h = home.work;
  const { photo, video, web } = work.lanes;

  /* Copy and pictures from the CMS; the routes and layout stay fixed here. */
  const LANES: LaneCardData[] = [
    { kind: "photo", ...photo, href: "/work/photography" },
    { kind: "video", ...video, href: "/work/videography" },
    { kind: "web", ...web, href: "/work/web-design" },
  ];

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
                  {h.eyebrow}
                </p>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="text-4xl font-semibold leading-[1.05] tracking-tight text-[rgb(10,11,16)] sm:text-5xl lg:text-[64px]"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  {h.title}
                  <span className="block text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: FONT_SCRIPT }}>
                    {h.accent}
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
          {LANES.map((c, i) => {
            /* Web Design takes the full row at md, where two columns would
               otherwise leave it alone next to an empty cell, and goes
               landscape to suit the wider slot. */
            const wide = c.kind === "web";
            return (
              <Reveal key={c.href} delay={i * 120} className={wide ? "md:col-span-2 lg:col-span-1" : ""}>
                <LaneCard lane={c} index={i} aspect={wide ? "md:aspect-[16/9] lg:aspect-[4/5]" : ""} />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
