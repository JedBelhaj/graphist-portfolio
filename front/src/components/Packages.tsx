import { ACCENT, FONT_DISPLAY, INK } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import Reveal from "./Reveal";

/* A lighter step than ACCENT_WASH, so the section stays distinct from the
   marquee belt that follows it. */
const SECTION_BG = "rgb(248,246,255)";

export default async function Packages() {
  const { services } = await getContent();
  const h = services.packagesHeading;
  /* One centred line under the title: the heading's own body if the admin
     has one, otherwise the packages note. */
  const subtitle = h.body || services.packagesFootnote;

  return (
    <section id="packages" className="px-5 py-20 sm:px-8 lg:py-24" style={{ backgroundColor: SECTION_BG }}>
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-12 text-center lg:mb-20">
          <Reveal>
            <h2
              className="text-3xl font-bold tracking-tight text-[rgb(10,11,16)] sm:text-4xl lg:text-[44px]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              {h.title}
            </h2>
          </Reveal>
          {subtitle && (
            <Reveal delay={80}>
              <p className="mx-auto mt-6 max-w-2xl text-base text-[rgb(40,42,54)] lg:text-[17px]">{subtitle}</p>
            </Reveal>
          )}
        </div>

        {/* Plain colour tiles, name and pitch only: ink for the regular
            packages, the brand purple for the featured one. Content sits
            centred vertically, so tiles with shorter copy start lower, and
            items-stretch + h-full keeps the three the same height. */}
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 md:gap-8 lg:gap-20 xl:gap-36">
          {services.packages.map((p, i) => (
            <Reveal key={p.name} delay={i * 110}>
              <div
                className="flex h-full min-h-[300px] flex-col justify-center rounded-xl px-8 py-12 text-white shadow-[0_14px_30px_-18px_rgba(10,11,16,0.4)] lg:min-h-[380px] lg:px-10"
                style={{ backgroundColor: p.featured ? ACCENT : INK }}
              >
                <h3
                  className="text-2xl font-bold leading-[1.3] lg:text-[28px]"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  {p.name}
                </h3>
                <p className="mt-5 max-w-[290px] text-base leading-[1.75] text-white/90 lg:text-[17px]">{p.pitch}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
