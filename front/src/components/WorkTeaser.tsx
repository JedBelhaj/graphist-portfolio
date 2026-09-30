import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ACCENT, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { PHOTO_TILES, VIDEO_TILES } from "@/lib/content";
import Reveal from "./Reveal";

const CARDS = [
  {
    title: "Photography",
    blurb: "Brand, product, portrait and event stills.",
    href: "/work/photography",
    img: PHOTO_TILES[0],
  },
  {
    title: "Videography",
    blurb: "Brand films, reels and event coverage.",
    href: "/work/videography",
    img: VIDEO_TILES[0],
  },
];

/* Two doors into the portfolio. On home it carries its own heading; /work
   already has a PageHero above it, so it renders bare there. */
export default function WorkTeaser({ heading = true }: { heading?: boolean }) {
  return (
    <section className={`bg-white px-5 sm:px-8 ${heading ? "py-20 lg:py-28" : "pb-20 lg:pb-28"}`}>
      <div className="mx-auto max-w-[1180px]">
        {heading && (
          <div className="mb-12 flex flex-col gap-4 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
            <Reveal>
              <h2
                className="text-4xl font-semibold leading-[1.05] tracking-tight text-[rgb(10,11,16)] sm:text-5xl lg:text-[64px]"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                Our work
                <span className="block text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: FONT_SCRIPT }}>
                  [pick a lane]
                </span>
              </h2>
            </Reveal>
            <Reveal delay={100}>
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {CARDS.map((c, i) => (
            <Reveal key={c.href} delay={i * 120}>
              <Link
                href={c.href}
                className="group relative block aspect-[4/5] overflow-hidden rounded-[28px] sm:aspect-[5/4]"
              >
                <img
                  src={c.img}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 lg:p-8">
                  <div>
                    <div
                      className="text-3xl font-bold tracking-tight text-white lg:text-4xl"
                      style={{ fontFamily: FONT_DISPLAY }}
                    >
                      {c.title}
                    </div>
                    <p className="mt-1 text-base text-white/80">{c.blurb}</p>
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
