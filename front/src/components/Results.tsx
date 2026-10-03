import { RESULTS } from "@/lib/content";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

/* The receipts: real messages clients sent the day the work landed. The
   headline numbers already sit in the hero's status bar, so this section is
   only the evidence, filed like exhibits — numbered, captioned, straight. */
export default function Results() {
  return (
    <section id="results" className="bg-wash px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1220px]">
        <SectionHead
          index="01"
          label="Results"
          title="Proof,"
          script="not promises."
          aside="Screenshots straight from the group chat, sent the day the work went out. No staging, no rewrites."
        />

        {/* CSS columns rather than a grid: the screenshots are all different
            heights, and columns let them pack without row gaps. */}
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {RESULTS.map((r, i) => (
            <Reveal key={r.src} delay={i * 120} className="mb-6 break-inside-avoid">
              <figure className="group border border-ink/10 bg-white transition-colors duration-300 hover:border-ink">
                <div className="readout flex items-center justify-between border-b border-ink/10 px-4 py-3 text-muted">
                  <span>
                    <span className="text-brand">●</span> MSG_{String(i + 1).padStart(2, "0")}
                  </span>
                  <span>Client message</span>
                </div>
                <div className="p-3">
                  <img src={r.src} alt={r.alt} loading="lazy" className="w-full" />
                </div>
                <figcaption className="display border-t border-ink/10 px-4 py-4 text-lg text-ink">
                  {r.label}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
