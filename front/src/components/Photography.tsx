import { ACCENT, ACCENT_WASH, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { getContent } from "@/lib/cms";
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

export default async function Photography() {
  const { photography } = await getContent();
  const h = photography.heading;

  return (
    <section id="photography" style={{ backgroundColor: ACCENT_WASH }}>
      <div className="mx-auto max-w-[1180px] px-5 pb-6 pt-10 sm:px-8 lg:pb-8 lg:pt-12">
        <Reveal>
          <h2
            className="text-3xl font-semibold leading-[1.1] tracking-tight text-[rgb(10,11,16)] lg:text-4xl"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            {h.title}{" "}
            <span style={{ fontFamily: FONT_SCRIPT, color: ACCENT }}>{h.accent}</span>
          </h2>
        </Reveal>
      </div>

      <MediaMosaic items={photography.tiles} spans={PHOTO_SPANS} />

      <div className="mx-auto max-w-[1180px] px-5 py-14 sm:px-8 lg:py-20">
        <div className="flex flex-wrap justify-center gap-3">
          {photography.disciplines.map((d, i) => (
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
