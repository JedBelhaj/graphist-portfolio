import { Globe } from "lucide-react";
import * as FlagIcons from "country-flag-icons/react/3x2";
import { ACCENT, ACCENT_WASH, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import Reveal from "./Reveal";

/* SVG flags from country-flag-icons rather than flag emoji, which render as
   bare letter pairs on Windows. The whole set is imported because countries
   are added in the CMS; this is a server component, so the flags render to
   static SVG and none of the set reaches the browser bundle. */
const FLAGS = FlagIcons as unknown as Record<string, typeof FlagIcons.US | undefined>;

export default async function Countries() {
  const { about, countries } = await getContent();
  const h = about.countries;

  return (
    <section style={{ backgroundColor: ACCENT_WASH }} className="px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-12 flex flex-col gap-4 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <h2
              className="text-4xl font-semibold leading-[1.05] tracking-tight text-[rgb(10,11,16)] sm:text-5xl lg:text-[56px]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              {h.title}
              <span className="block" style={{ fontFamily: FONT_SCRIPT, color: ACCENT }}>
                {h.accent}
              </span>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="flex max-w-sm items-start gap-3 text-base leading-relaxed text-[rgb(74,74,86)]">
              <Globe size={20} className="mt-1 shrink-0" style={{ color: ACCENT }} />
              {h.body}
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {countries.map((c, i) => {
            const Flag = FLAGS[c.code];
            return (
              <Reveal key={c.code} delay={i * 80}>
                <div className="group flex h-full flex-col justify-between rounded-2xl bg-white p-6 transition-transform duration-300 hover:-translate-y-1 lg:p-7">
                  <div className="flex items-start justify-between gap-3">
                    {/* The ring keeps white-edged flags (Canada, Lebanon, France)
                        from dissolving into the white card. */}
                    {Flag ? (
                      <Flag
                        title={c.name}
                        className="w-16 overflow-hidden rounded-md shadow-sm ring-1 ring-black/10 transition-transform duration-300 group-hover:scale-105 lg:w-20"
                      />
                    ) : (
                      /* An unknown code keeps its slot rather than breaking the card. */
                      <Globe size={40} className="text-[rgb(122,122,132)]" aria-hidden="true" />
                    )}
                    <span className="text-xs font-semibold tracking-[0.14em] text-[rgb(122,122,132)]">
                      {c.code}
                    </span>
                  </div>
                  <div className="mt-10">
                    <div
                      className="text-xl font-bold tracking-tight text-[rgb(10,11,16)]"
                      style={{ fontFamily: FONT_DISPLAY }}
                    >
                      {c.name}
                    </div>
                    {c.note && <div className="mt-1 text-sm text-[rgb(122,122,132)]">{c.note}</div>}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
