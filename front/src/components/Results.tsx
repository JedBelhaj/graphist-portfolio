import { ACCENT, ACCENT_TINT, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { getContent } from "@/lib/cms";
import ResultsWall from "./ResultsWall";
import Reveal from "./Reveal";

/* The proof, right after the logos: numbers first, then the messages clients
   actually sent. Written testimonials follow in their own section. */
export default async function Results() {
  const { home, logos, countries, results } = await getContent();
  const h = home.results;

  /* Figures lead the section, then the receipts. Two of the three are
     counted from the data so they can't drift out of step with the logo band
     and the countries list. */
  const stats = [
    { figure: home.projectsDelivered, label: "Projects delivered" },
    { figure: String(logos.length), label: "Brands on the roster" },
    { figure: String(countries.length), label: "Countries shot in" },
  ];

  return (
    <section id="results" className="bg-[rgb(10,11,16)] px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-14 flex flex-col gap-6 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div>
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
                className="text-4xl font-bold leading-[1.05] tracking-tight text-[rgb(254,254,254)] sm:text-5xl lg:text-[64px]"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                {h.title}
                <span
                  className="block text-3xl font-normal sm:text-4xl lg:text-5xl"
                  style={{ fontFamily: FONT_SCRIPT, color: ACCENT_TINT }}
                >
                  {h.accent}
                </span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={160}>
            <p className="max-w-sm text-base leading-relaxed text-[rgb(160,160,172)]">{h.body}</p>
          </Reveal>
        </div>

        <div className="mb-16 grid grid-cols-3 gap-4 border-y border-white/10 py-10 lg:mb-20">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 90}>
              <div className="text-center">
                <div
                  className="text-4xl font-bold tracking-tight text-[rgb(254,254,254)] sm:text-5xl lg:text-6xl"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  {s.figure}
                </div>
                <div className="mt-2 text-xs uppercase tracking-[0.14em] text-[rgb(120,120,132)] sm:text-sm">
                  {s.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <ResultsWall results={results} />
      </div>
    </section>
  );
}
