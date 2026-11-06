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
    <section id="results" className="bg-[rgb(10,11,16)] py-14 lg:py-20">
      {/* One compact header: the title on the left, the figures beside it on
          wide screens (under it below that), then straight into the banner. */}
      <div className="mx-auto mb-6 flex max-w-[1180px] flex-col gap-8 px-5 sm:px-8 lg:mb-8 xl:flex-row xl:items-end xl:justify-between xl:gap-12">
        <div className="max-w-xl xl:max-w-none">
          <Reveal>
            <p
              className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] sm:text-sm"
              style={{ color: ACCENT }}
            >
              {h.eyebrow}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2
              className="text-3xl font-bold leading-[1.05] tracking-tight text-[rgb(254,254,254)] sm:text-4xl lg:text-5xl xl:whitespace-nowrap"
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
          <Reveal delay={160}>
            <p className="mt-4 text-sm leading-relaxed text-[rgb(160,160,172)] sm:text-base">{h.body}</p>
          </Reveal>
        </div>

        <div className="grid shrink-0 grid-cols-3 gap-4 border-t border-white/10 pt-6 lg:gap-10 xl:border-l xl:border-t-0 xl:pb-2 xl:pl-10 xl:pt-0">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 90}>
              <div className="text-center xl:text-left">
                <div
                  className="text-3xl font-bold tracking-tight text-[rgb(254,254,254)] sm:text-4xl lg:text-5xl xl:whitespace-nowrap"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  {s.figure}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[rgb(120,120,132)] sm:text-xs">
                  {s.label}
                </div>
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
