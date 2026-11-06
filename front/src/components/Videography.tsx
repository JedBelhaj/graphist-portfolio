import { ACCENT, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import Reveal from "./Reveal";
import VideoSections from "./VideoSections";

/* A slim dark band (numbers on the left, title on the right on desktop), so the
   videos, grouped by category as set in the studio, come up quickly. */
export default async function Videography() {
  const { videography } = await getContent();
  const h = videography.heading;

  return (
    <>
      <section id="videography" className="bg-[rgb(10,11,16)]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-6 px-5 py-10 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:py-12">
          <Reveal className="lg:shrink-0">
            <h2
              className="text-3xl font-semibold leading-[1.05] tracking-tight text-[rgb(254,254,254)] lg:text-right lg:text-4xl"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              {h.title}
              <span className="block" style={{ fontFamily: FONT_SCRIPT, color: ACCENT }}>
                {h.accent}
              </span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-3 gap-4 lg:order-first lg:gap-10">
            {videography.stats.map((s, i) => (
              <Reveal key={s.label} delay={80 + i * 70}>
                <div
                  className="text-3xl font-bold tracking-tight text-[rgb(254,254,254)] lg:text-4xl"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  {s.figure}
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[rgb(120,120,132)]">
                  {s.label}
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
