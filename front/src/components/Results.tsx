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
    <section id="results" className="bg-[rgb(10,11,16)] py-14 lg:py-16">
      <div className="mx-auto mb-6 flex max-w-[1180px] flex-col gap-6 px-5 sm:px-8 lg:mb-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <div className="lg:shrink-0">
          <Reveal>
            <p
              className="mb-3 text-sm font-semibold uppercase tracking-[0.22em]"
              style={{ color: ACCENT }}
            >
              {h.eyebrow}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2
              className="text-4xl font-bold leading-[1.05] tracking-tight text-[rgb(254,254,254)] lg:text-5xl"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              {h.title}
              <span
                className="block text-2xl font-normal sm:text-3xl lg:text-4xl"
                style={{ fontFamily: FONT_SCRIPT, color: ACCENT_TINT }}
              >
                {h.accent}
              </span>
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-3 gap-4 lg:gap-10">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={120 + i * 70}>
              <div
                className="text-3xl font-bold tracking-tight text-[rgb(254,254,254)] lg:text-4xl"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                {s.figure}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[rgb(120,120,132)]">
                {s.label}
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Outside the width cap, so the banner runs edge to edge. */}
      <Reveal delay={100}>
        <ResultsWall results={results} />
      </Reveal>
    </section>
  );
}
