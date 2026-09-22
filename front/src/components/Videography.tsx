import { ACCENT, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { VIDEO_CAPABILITIES, VIDEO_STATS, VIDEO_TILES } from "@/lib/content";
import MediaMosaic from "./MediaMosaic";
import Reveal from "./Reveal";

/* Tile shapes, repeated over VIDEO_TILES. Deliberately uneven — the 2x2 anchor
   up front, a tall one and a couple of wides after it.

   The areas have to divide by the column count or the last row leaves a hole:
   at 2 columns this repeat is 4+1+1+2+2+1+1+1+1 = 14 (7 rows), and at 4 columns
   the lg: spans push it to 4+1+1+2+2+2+1+1+2 = 16 (4 rows). Change a span and
   both sums need rechecking. */
const VIDEO_SPANS = [
  "col-span-2 row-span-2",
  "",
  "",
  "col-span-2",
  "row-span-2",
  "lg:col-span-2",
  "",
  "",
  "lg:col-span-2",
];

export default function Videography() {
  return (
    <section id="videography" className="bg-[rgb(10,11,16)]">
      {/* Copy stays inside the content column; only the mosaic goes full bleed. */}
      <div className="mx-auto max-w-[1180px] px-5 pb-14 pt-20 sm:px-8 lg:pb-20 lg:pt-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <p
                className="mb-4 text-sm font-semibold uppercase tracking-[0.22em]"
                style={{ color: ACCENT }}
              >
                Videography
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h2
                className="text-4xl font-semibold leading-[1.05] tracking-tight text-[rgb(254,254,254)] sm:text-5xl lg:text-[64px]"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                Motion that earns
                <span className="block" style={{ fontFamily: FONT_SCRIPT }}>
                  the second watch.
                </span>
              </h2>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[rgb(176,176,186)]">
                We shoot, direct and cut in-house — which means the person framing the shot already
                knows where it lands and how long it has to hold someone. No brief survives three
                vendors; ours never has to.
              </p>
            </Reveal>
          </div>

          <div className="flex flex-col gap-8">
            {VIDEO_CAPABILITIES.map((c, i) => (
              <Reveal key={c.title} delay={220 + i * 90}>
                <div className="flex gap-4 border-t border-white/10 pt-6">
                  <div className="text-sm tabular-nums text-[rgb(120,120,132)]">0{i + 1}</div>
                  <div className="flex flex-col gap-2">
                    <div
                      className="text-lg font-bold text-[rgb(254,254,254)]"
                      style={{ fontFamily: FONT_DISPLAY }}
                    >
                      {c.title}
                    </div>
                    <p className="text-base leading-relaxed text-[rgb(176,176,186)]">{c.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <MediaMosaic items={VIDEO_TILES} spans={VIDEO_SPANS} />

      <div className="mx-auto max-w-[1180px] px-5 py-14 sm:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {VIDEO_STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 90}>
              <div>
                <div
                  className="text-4xl font-bold tracking-tight text-[rgb(254,254,254)] lg:text-5xl"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  {s.figure}
                </div>
                <div className="mt-2 text-sm uppercase tracking-[0.14em] text-[rgb(120,120,132)]">
                  {s.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
