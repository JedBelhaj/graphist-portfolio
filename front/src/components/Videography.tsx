import { ACCENT, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import {
  VIDEO_CAPABILITIES,
  VIDEO_FEATURE,
  VIDEO_STATS,
  VIDEO_STILL_TALL,
} from "@/lib/content";
import Parallax from "./Parallax";
import Reveal from "./Reveal";

export default function Videography() {
  return (
    /* overflow-hidden is load-bearing: the parallax layers drift past the
       section edges, and without it that drift becomes page scroll. */
    <section
      id="videography"
      className="overflow-hidden bg-[rgb(10,11,16)] px-5 py-20 sm:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-16">
          {/* Copy */}
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

            <div className="mt-10 flex flex-col gap-8">
              {VIDEO_CAPABILITIES.map((c, i) => (
                <Reveal key={c.title} delay={220 + i * 90}>
                  <div className="flex gap-4 border-t border-white/10 pt-6">
                    <div className="text-sm tabular-nums text-[rgb(120,120,132)]">
                      0{i + 1}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div
                        className="text-lg font-bold text-[rgb(254,254,254)]"
                        style={{ fontFamily: FONT_DISPLAY }}
                      >
                        {c.title}
                      </div>
                      <p className="text-base leading-relaxed text-[rgb(176,176,186)]">
                        {c.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Stills. Two layers drifting at different rates — the depth comes
              from the difference between them, not from either on its own. */}
          <Reveal delay={120}>
            <div className="relative">
              <Parallax amount={28}>
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src={VIDEO_FEATURE}
                    alt="Frame from a Soltani Media brand film"
                    className="w-full object-cover"
                  />
                </div>
              </Parallax>

              {/* Hidden below lg: at narrow widths it would cover the feature
                  frame rather than sit beside it. */}
              <Parallax
                amount={66}
                className="absolute -bottom-12 -left-10 hidden w-44 lg:block xl:w-52"
              >
                <div className="overflow-hidden rounded-2xl border-4 border-[rgb(10,11,16)] shadow-2xl">
                  <img
                    src={VIDEO_STILL_TALL}
                    alt="Vertical cut from a short-form edit"
                    className="w-full object-cover"
                  />
                </div>
              </Parallax>
            </div>
          </Reveal>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 gap-8 border-t border-white/10 pt-10 sm:grid-cols-3">
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
