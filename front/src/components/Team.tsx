import { TEAM } from "@/lib/content";
import Reveal from "./Reveal";
import SectionHead from "./SectionHead";

/* The crew, credited like the end of a film: photo, name, role, one line on
   what they own. */
export default function Team() {
  return (
    <section id="team" className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-[1220px]">
        <SectionHead
          label="The crew"
          title="Meet"
          script="the team."
          aside="Four people, no account layer. You talk to whoever is doing the work."
        />

        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((m, i) => (
            <Reveal key={m.name} delay={i * 110}>
              {/* h-full so the cards in a row line up even when the focus line
                  wraps to a different number of lines. */}
              <div className="group flex h-full flex-col">
                <div className="mb-5 overflow-hidden bg-ink">
                  <img
                    src={m.photo}
                    alt={`${m.name} — ${m.role}`}
                    className="aspect-[4/5] w-full object-cover grayscale transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:grayscale-0"
                  />
                </div>
                <div className="readout mb-2 text-brand">{String(i + 1).padStart(2, "0")}</div>
                <div className="display text-2xl text-ink">{m.name}</div>
                <div className="readout mt-2 text-muted">{m.role}</div>
                <p className="mt-4 border-t border-ink/10 pt-4 text-sm leading-relaxed text-muted">{m.focus}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
