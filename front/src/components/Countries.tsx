import { CA, DE, FR, LB, US } from "country-flag-icons/react/3x2";
import { COUNTRIES } from "@/lib/content";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

/* SVG flags from country-flag-icons rather than flag emoji, which render as
   bare letter pairs on Windows. Imported by name so only these five end up in
   the bundle — a country added to COUNTRIES needs its flag added here too. */
const FLAGS: Record<string, typeof US> = { US, CA, FR, DE, LB };

/* Where we've shot, as a row of location slates. */
export default function Countries({ index }: { index?: string }) {
  return (
    <section className="bg-wash px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1220px]">
        <SectionHead
          index={index}
          label="Locations"
          title="Where we've"
          script="worked."
          aside="Shoots, campaigns and clients across five countries — and we're happy to add a sixth."
        />

        {/* Ruled grid: the container draws the top and left edge, each cell
            its own bottom and right, so no line ever doubles up. */}
        <div className="grid grid-cols-2 border-l border-t border-ink/15 sm:grid-cols-3 lg:grid-cols-5">
          {COUNTRIES.map((c, i) => {
            const Flag = FLAGS[c.code];
            return (
              <Reveal key={c.code} delay={i * 80} className="border-b border-r border-ink/15">
                <div className="group flex h-full flex-col justify-between bg-wash p-6 transition-colors duration-300 hover:bg-white lg:p-7">
                  <div className="readout flex items-center justify-between text-muted">
                    <span>LOC_{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-ink">{c.code}</span>
                  </div>
                  {/* The ring keeps white-edged flags (Canada, Lebanon, France)
                      from dissolving into the light cell. */}
                  <Flag
                    title={c.name}
                    className="my-8 w-14 ring-1 ring-ink/10 grayscale transition-[filter] duration-300 group-hover:grayscale-0 lg:w-16"
                  />
                  <div>
                    <div className="display text-xl text-ink">{c.name}</div>
                    {c.note && <div className="readout mt-2 text-muted">{c.note}</div>}
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
