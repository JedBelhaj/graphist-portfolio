import { ACCENT, ACCENT_WASH, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import PhotoGallery from "./PhotoGallery";
import Reveal from "./Reveal";

export default async function Photography() {
  const { photography } = await getContent();
  const h = photography.heading;

  return (
    <section id="photography" style={{ backgroundColor: ACCENT_WASH }}>
      {/* One slim line under the page hero, which already introduces the
          page: the eyebrow and paragraph would only repeat it. */}
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

      {photography.sections.length > 0 ? (
        /* Categories set in the studio, laid out like the Videography page:
           a hairline with the number and count, the category in big type,
           then its photos in the collage. */
        photography.sections.map((s, i) => (
          <div key={s.key} aria-labelledby={`photo-category-${i + 1}`} role="group" className="pb-10 lg:pb-14">
            <Reveal>
              <div className="mx-auto max-w-[1180px] px-5 pb-8 pt-10 sm:px-8 lg:pb-12 lg:pt-16">
                <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(10,11,16)]/45">
                  <span className="tabular-nums" style={{ color: ACCENT }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span aria-hidden className="h-px flex-1 bg-[rgb(10,11,16)]/15" />
                  <span>
                    {s.photos.length} {s.photos.length === 1 ? "photo" : "photos"}
                  </span>
                </div>
                <h2
                  id={`photo-category-${i + 1}`}
                  className="mt-5 text-[44px] font-semibold leading-[0.95] tracking-[-0.04em] text-[rgb(10,11,16)] sm:text-7xl lg:text-[128px]"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  {s.title}
                </h2>
              </div>
            </Reveal>
            <PhotoGallery items={s.photos} />
          </div>
        ))
      ) : (
        <PhotoGallery items={photography.tiles} />
      )}

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
