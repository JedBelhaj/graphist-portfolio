import { ACCENT, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import Reveal from "./Reveal";

export default async function Team() {
  const { about, team } = await getContent();
  const h = about.team;

  return (
    <section id="team" className="bg-white px-5 pt-20 pb-6 sm:px-8 lg:pt-28 lg:pb-8">
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

          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[rgb(74,74,86)]">
              {h.body}
            </p>
          </Reveal>
        </div>

        {/* Two across on phones so each photo is half the screen wide, not the
            full width. */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {team.map((m, i) => (
            <Reveal key={m.name} delay={i * 110}>
              {/* h-full so the cards in a row line up even when the focus line
                  wraps to a different number of lines. */}
              <div className="group flex h-full flex-col">
                <div className="mb-3 overflow-hidden rounded-xl bg-black/5 sm:mb-5 sm:rounded-2xl">
                  <img
                    src={m.photo}
                    alt={`${m.name} — ${m.role}`}
                    className="aspect-[4/5] w-full object-cover grayscale transition-all duration-700 ease-out group-hover:grayscale-0 group-hover:scale-[1.03]"
                  />
                </div>

                <div
                  className="text-base font-bold tracking-tight text-[rgb(10,11,16)] sm:text-xl"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  {m.name}
                </div>
                <div className="mt-1 text-xs font-semibold sm:text-sm" style={{ color: ACCENT }}>
                  {m.role}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[rgb(74,74,86)] sm:mt-3 sm:text-sm">{m.focus}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
