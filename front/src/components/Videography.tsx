import { ACCENT, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import Reveal from "./Reveal";
import VideoSections from "./VideoSections";

/* The dark intro (heading, capabilities, stats), then the videos grouped by
   category, as set in the studio. */
export default async function Videography() {
  const { videography } = await getContent();
  const h = videography.heading;

  return (
    <>
      <section id="videography" className="bg-[rgb(10,11,16)]">
        <div className="mx-auto max-w-[1180px] px-5 py-20 sm:px-8 lg:py-28">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
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
                  className="text-4xl font-semibold leading-[1.05] tracking-tight text-[rgb(254,254,254)] sm:text-5xl lg:text-[64px]"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  {h.title}
                  <span className="block" style={{ fontFamily: FONT_SCRIPT }}>
                    {h.accent}
                  </span>
                </h2>
              </Reveal>

              <Reveal delay={160}>
                <p className="mt-6 max-w-xl text-base leading-relaxed text-[rgb(176,176,186)]">{h.body}</p>
              </Reveal>
            </div>

            <div className="flex flex-col gap-8">
              {videography.capabilities.map((c, i) => (
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

          <div className="mt-16 grid grid-cols-1 gap-8 border-t border-white/10 pt-12 sm:grid-cols-3 lg:mt-20 lg:pt-16">
            {videography.stats.map((s, i) => (
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

      <VideoSections sections={videography.sections} />
    </>
  );
}
