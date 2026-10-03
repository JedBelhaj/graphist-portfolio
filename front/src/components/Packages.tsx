import { PACKAGES } from "@/lib/content";
import Button from "./Button";
import PlayMark from "./PlayMark";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

/* Three tiers as ruled columns. `index` is the section number on home; on
   /services the page has its own hero, so it is left off. */
export default function Packages({ index }: { index?: string }) {
  return (
    <section id="packages" className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1220px]">
        <SectionHead
          index={index}
          label="Packages"
          title="Pick your pace,"
          script="or build one."
          aside="Monthly plans for brands that need content every month, not once. One-off shoots are quoted on their own."
        />

        {/* items-stretch + h-full so the cards share a height and their
            buttons line up along the bottom regardless of feature count. */}
        <div className="grid grid-cols-1 items-stretch border border-ink/15 md:grid-cols-3">
          {PACKAGES.map((p, i) => {
            const dark = p.featured;
            return (
              <Reveal
                key={p.name}
                delay={i * 110}
                className={i > 0 ? "border-t border-ink/15 md:border-l md:border-t-0" : ""}
              >
                <div
                  className={`relative flex h-full flex-col p-8 lg:p-10 ${dark ? "bg-ink text-white" : "text-ink"}`}
                >
                  <div className="readout mb-10 flex h-6 items-center justify-between">
                    <span className={dark ? "text-white/50" : "text-muted"}>
                      Tier {String(i + 1).padStart(2, "0")}
                    </span>
                    {dark && <span className="bg-brand px-2.5 py-1 text-white">Most booked</span>}
                  </div>

                  <h3 className="display text-3xl">{p.name}</h3>
                  <p className={`mt-3 text-base leading-relaxed ${dark ? "text-white/65" : "text-muted"}`}>
                    {p.pitch}
                  </p>

                  <div className={`mt-8 flex items-baseline gap-2 border-y py-6 ${dark ? "border-white/10" : "border-ink/10"}`}>
                    <span className="display text-5xl lg:text-6xl">{p.price}</span>
                    {p.cadence && (
                      <span className={`readout ${dark ? "text-white/50" : "text-muted"}`}>{p.cadence}</span>
                    )}
                  </div>

                  <ul className="mb-10 mt-8 flex flex-col gap-3.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-base">
                        <PlayMark className="mt-1 text-[10px] text-brand" />
                        <span className={dark ? "text-white/85" : ""}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button href="#contact" variant={dark ? "brand" : "outline"} className="mt-auto w-full">
                    {p.price === "Custom" ? "Let's talk" : "Start here"}
                  </Button>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
