import { Check } from "lucide-react";
import { ACCENT, FONT_DISPLAY, FONT_SCRIPT, INK } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import Reveal from "./Reveal";

/* A lighter step than ACCENT_WASH, so the section stays distinct from the
   marquee belt that follows it. */
const SECTION_BG = "rgb(248,246,255)";

export default async function Packages() {
  const { services } = await getContent();
  const h = services.packagesHeading;

  return (
    <section id="packages" className="px-5 py-20 sm:px-8 lg:py-28" style={{ backgroundColor: SECTION_BG }}>
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-14 text-center lg:mb-20">
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
              className="text-4xl font-semibold leading-[1.05] tracking-tight text-[rgb(10,11,16)] sm:text-5xl lg:text-[64px]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              {h.title}
              <span className="block text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: FONT_SCRIPT }}>
                {h.accent}
              </span>
            </h2>
          </Reveal>
        </div>

        {/* Solid colour tiles: ink for the regular packages, the brand purple
            for the featured one. items-stretch + h-full so the three share a
            height and their buttons line up along the bottom regardless of
            feature count. */}
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 lg:gap-10">
          {services.packages.map((p, i) => {
            const featured = p.featured;
            return (
              <Reveal key={p.name} delay={i * 110}>
                <div
                  className="relative flex h-full flex-col rounded-2xl px-8 pb-10 pt-14 text-white shadow-[0_18px_40px_-20px_rgba(10,11,16,0.45)] lg:px-11 lg:pb-12 lg:pt-16"
                  style={{ backgroundColor: featured ? ACCENT : INK }}
                >
                  {featured && (
                    <span
                      className="absolute right-6 top-6 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
                      style={{ color: ACCENT }}
                    >
                      Most popular
                    </span>
                  )}

                  <h3
                    className="text-3xl font-bold leading-[1.1] tracking-tight lg:text-[40px]"
                    style={{ fontFamily: FONT_DISPLAY }}
                  >
                    {p.name}
                  </h3>
                  <p className={`mt-4 text-lg leading-relaxed ${featured ? "text-white/90" : "text-white/75"}`}>
                    {p.pitch}
                  </p>

                  <div className="mt-8 flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tight lg:text-5xl" style={{ fontFamily: FONT_DISPLAY }}>
                      {p.price}
                    </span>
                    {p.cadence && <span className="text-white/70">{p.cadence}</span>}
                  </div>

                  <ul className="mb-10 mt-8 flex flex-col gap-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-base">
                        <Check
                          size={18}
                          className="mt-0.5 shrink-0"
                          style={{ color: featured ? "#fff" : ACCENT }}
                        />
                        <span className="text-white/90">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#contact"
                    className="mt-auto rounded-full px-6 py-3 text-center text-base font-semibold transition-transform hover:scale-[1.03]"
                    style={featured ? { backgroundColor: "#fff", color: INK } : { backgroundColor: ACCENT, color: "#fff" }}
                  >
                    {p.price === "Custom" ? "Let's talk" : "Work with us"}
                  </a>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={200}>
          <p className="mt-12 text-center text-sm text-[rgb(122,122,132)]">
            {services.packagesFootnote}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
