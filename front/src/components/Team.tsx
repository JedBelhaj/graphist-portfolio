import { ACCENT, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { TEAM } from "@/lib/content";
import Reveal from "./Reveal";

export default function Team() {
  return (
    <section id="team" className="bg-white px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-14 text-center lg:mb-20">
          <Reveal>
            <p
              className="mb-4 text-sm font-semibold uppercase tracking-[0.22em]"
              style={{ color: ACCENT }}
            >
              The crew
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h2
              className="text-4xl font-semibold leading-[1.05] tracking-tight text-[rgb(10,11,16)] sm:text-5xl lg:text-[64px]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Meet the team
              <span className="block text-3xl sm:text-4xl lg:text-5xl" style={{ fontFamily: FONT_SCRIPT }}>
                [the whole roster]
              </span>
            </h2>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[rgb(74,74,86)]">
              Four people, no account layer. You talk to whoever is doing the work.
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {TEAM.map((m, i) => (
            <Reveal key={m.name} delay={i * 110}>
              {/* h-full so the cards in a row line up even when the focus line
                  wraps to a different number of lines. */}
              <div className="group flex h-full flex-col">
                <div className="mb-5 overflow-hidden rounded-2xl bg-black/5">
                  <img
                    src={m.photo}
                    alt={`${m.name} — ${m.role}`}
                    className="aspect-[4/5] w-full object-cover grayscale transition-all duration-700 ease-out group-hover:grayscale-0 group-hover:scale-[1.03]"
                  />
                </div>

                <div
                  className="text-xl font-bold tracking-tight text-[rgb(10,11,16)]"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  {m.name}
                </div>
                <div className="mt-1 text-sm font-semibold" style={{ color: ACCENT }}>
                  {m.role}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[rgb(74,74,86)]">{m.focus}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
