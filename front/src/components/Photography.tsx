import { ACCENT, ACCENT_WASH, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { PHOTO_COLUMNS, PHOTO_DISCIPLINES } from "@/lib/content";
import Parallax from "./Parallax";
import Reveal from "./Reveal";

/* Per-column drift. The middle column runs against the outer two — counter
   motion is what sells the depth; three columns drifting together would just
   look like the whole grid is loose. */
const COLUMN_DRIFT = [34, -20, 48];

export default function Photography() {
  return (
    <section
      id="photography"
      className="overflow-hidden px-5 py-20 sm:px-8 lg:py-28"
      style={{ backgroundColor: ACCENT_WASH }}
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-14 flex flex-col gap-6 lg:mb-20 lg:flex-row lg:items-end lg:justify-between">
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {PHOTO_COLUMNS.map((column, ci) => (
            <Parallax key={ci} amount={COLUMN_DRIFT[ci]}>
              <div className="flex flex-col gap-4 lg:gap-6">
                {column.map((src, i) => (
                  <Reveal key={src} delay={ci * 90 + i * 60}>
                    <div className="group overflow-hidden rounded-2xl bg-black/5">
                      <img
                        src={src}
                        alt=""
                        className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    </div>
                  </Reveal>
                ))}
              </div>
            </Parallax>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-3">
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
