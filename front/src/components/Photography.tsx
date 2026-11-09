import { ACCENT, ACCENT_WASH, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import PhotoGallery from "./PhotoGallery";
import Reveal from "./Reveal";

export default async function Photography() {
  const { photography } = await getContent();
  const h = photography.heading;

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
                {h.eyebrow}
              </p>
            </Reveal>

            <Reveal delay={80}>
              <h2
                className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight text-[rgb(10,11,16)] sm:text-5xl lg:text-[64px]"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                {h.title}
                <span className="block" style={{ fontFamily: FONT_SCRIPT }}>
                  {h.accent}
                </span>
              </h2>
            </Reveal>
          </div>

          <Reveal delay={160}>
            <p className="max-w-md text-base leading-relaxed text-[rgb(74,74,86)]">{h.body}</p>
          </Reveal>
        </div>
      </div>

      <PhotoGallery items={photography.tiles} />

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
