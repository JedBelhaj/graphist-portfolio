import { PHOTO_DISCIPLINES, PHOTO_TILES } from "@/lib/content";
import MediaMosaic from "./MediaMosaic";
import PlayMark from "./PlayMark";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

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
    <section id="photography" className="bg-wash">
      <div className="mx-auto max-w-[1300px] px-5 pt-20 sm:px-8 lg:px-10 lg:pt-28">
        <SectionHead
          label="Photography"
          title="Stills with"
          script="a job to do."
          aside="Shot for where they are going — the grid, the menu, the ad set, the deck. We light for the crop you actually need, then hand over a library already sized and named for it."
        />
      </div>

      <MediaMosaic items={PHOTO_TILES} spans={PHOTO_SPANS} />

      <div className="mx-auto max-w-[1300px] px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
        <ul className="grid grid-cols-2 border-l border-t border-ink/15 lg:grid-cols-4">
          {PHOTO_DISCIPLINES.map((d, i) => (
            <li key={d} className="border-b border-r border-ink/15">
              <Reveal delay={i * 70}>
                <div className="flex items-center gap-3 p-5 lg:p-6">
                  <PlayMark className="text-[10px] text-brand" />
                  <span className="display text-base text-ink lg:text-lg">{d}</span>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
