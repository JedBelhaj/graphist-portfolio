import { VIDEO_CAPABILITIES, VIDEO_STATS, VIDEO_TILES } from "@/lib/content";
import Eyebrow from "./Eyebrow";
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
    <section id="videography" className="bg-ink text-white">
      {/* Copy stays inside the content column; only the mosaic goes full bleed. */}
      <div className="mx-auto max-w-[1300px] px-5 pb-14 pt-20 sm:px-8 lg:px-10 lg:pb-20 lg:pt-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Reveal>
              <Eyebrow dark className="mb-5">
                Videography
              </Eyebrow>
            </Reveal>

            <Reveal delay={80}>
              <h2 className="display text-[clamp(2.4rem,7vw,5rem)]">
                Motion that earns
                <span className="script block text-tint">the second watch.</span>
              </h2>
            </Reveal>

            <Reveal delay={160}>
              <p className="mt-8 max-w-xl text-base leading-relaxed text-white/65">
                We shoot, direct and cut in-house — which means the person framing the shot already
                knows where it lands and how long it has to hold someone. No brief survives three
                vendors; ours never has to.
              </p>
            </Reveal>
          </div>

          <div className="flex flex-col">
            {VIDEO_CAPABILITIES.map((c, i) => (
              <Reveal key={c.title} delay={220 + i * 90}>
                <div className="flex gap-5 border-t border-white/10 py-6">
                  <div className="readout pt-1 text-brand">0{i + 1}</div>
                  <div className="flex flex-col gap-2">
                    <div className="display text-xl">{c.title}</div>
                    <p className="text-base leading-relaxed text-white/65">{c.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <MediaMosaic items={VIDEO_TILES} spans={VIDEO_SPANS} />

      <div className="mx-auto max-w-[1300px] px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-3">
          {VIDEO_STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 90}>
              <div
                className={`flex flex-col-reverse gap-2 border-white/10 py-6 sm:py-2 ${
                  i > 0 ? "border-t sm:border-l sm:border-t-0 sm:pl-8" : ""
                }`}
              >
                <div className="readout text-white/50">{s.label}</div>
                <div className="display text-5xl">{s.figure}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
