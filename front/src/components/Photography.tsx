import { ACCENT, ACCENT_WASH, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { PHOTO_DISCIPLINES, PHOTO_TILES } from "@/lib/content";
import MediaMosaic from "./MediaMosaic";
import Reveal from "./Reveal";

/* A different arrangement from the video mosaic on purpose — the anchor tile
   lands third here instead of first, so the two sections don't read as the
   same block twice.

   Same tiling rule: the areas must divide by the column count. At 2 columns
   this is 1+1+4+2+2+2+2+1+1 = 16 (8 rows); at 4 columns the spans are
   unchanged, so it is 16 again (4 rows). */
const PHOTO_SPANS = [
  "",
  "",
  "col-span-2 row-span-2",
  "col-span-2",
  "col-span-2",
  "row-span-2",
  "row-span-2",
  "",
  "",
];

export default function Photography() {
  return (
    <section id="photography" style={{ backgroundColor: ACCENT_WASH }}>
      <div className="mx-auto max-w-[1180px] px-5 pb-14 pt-20 sm:px-8 lg:pb-20 lg:pt-28">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Reveal>
              <p
                className="mb-4 text-sm font-semibold uppercase tracking-[0.22em]"
                style={{ color: ACCENT }}
              >
                Photography
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h2
                className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight text-[rgb(10,11,16)] sm:text-5xl lg:text-[64px]"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                Stills with a
                <span className="block" style={{ fontFamily: FONT_SCRIPT }}>
                  job to do.
                </span>
              </h2>
            </Reveal>
          </div>

          <Reveal delay={160}>
            <p className="max-w-md text-base leading-relaxed text-[rgb(74,74,86)]">
              Shot for where they are going — the grid, the menu, the ad set, the deck. We light for
              the crop you actually need, then hand over a library that is already sized and named
              for it.
            </p>
          </Reveal>
        </div>
      </div>

      <MediaMosaic items={PHOTO_TILES} spans={PHOTO_SPANS} />

      <div className="mx-auto max-w-[1180px] px-5 py-14 sm:px-8 lg:py-20">
        <div className="flex flex-wrap justify-center gap-3">
          {PHOTO_DISCIPLINES.map((d, i) => (
            <Reveal key={d} delay={i * 70}>
              <span
                className="inline-block rounded-full border border-[rgb(10,11,16)]/12 bg-white/70 px-5 py-2.5 text-sm font-semibold text-[rgb(10,11,16)]"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                {d}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
