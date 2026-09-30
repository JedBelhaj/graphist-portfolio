import { ACCENT, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { CLIENT_LOGOS, COUNTRIES, RESULTS } from "@/lib/content";
import CommentCarousel from "./CommentCarousel";
import Reveal from "./Reveal";

/* Figures lead the section, then the receipts. Two of the three are counted
   from the data so they can't drift out of step with the logo wall and the
   countries list. */
const STATS = [
  { figure: "120+", label: "Projects delivered" },
  { figure: String(CLIENT_LOGOS.length), label: "Brands on the roster" },
  { figure: String(COUNTRIES.length), label: "Countries shot in" },
];

/* A slight, alternating tilt so the screenshots read as messages pinned up
   rather than a tidy gallery. They straighten on hover. */
const TILTS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

export default function WallOfLove() {
  return (
    <section id="results" className="bg-[rgb(10,11,16)] px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-14 text-center lg:mb-16">
          <Reveal>
            <p
              className="mb-4 text-sm font-semibold uppercase tracking-[0.22em]"
              style={{ color: ACCENT }}
            >
              Results
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2
              className="text-4xl font-bold tracking-tight text-[rgb(254,254,254)] sm:text-5xl lg:text-[64px]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Wall of Love
              <span
                className="block text-3xl font-normal text-[rgb(214,205,255)] sm:text-4xl lg:text-5xl"
                style={{ fontFamily: FONT_SCRIPT }}
              >
                [straight from the group chat]
              </span>
            </h2>
          </Reveal>
        </div>

        <div className="mb-16 grid grid-cols-3 gap-4 border-y border-white/10 py-10 lg:mb-20">
          {STATS.map((s, i) => (
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

        {/* CSS columns rather than a grid: the screenshots are all different
            heights, and columns let them pack without row gaps. */}
        <div className="columns-1 gap-8 sm:columns-2 lg:columns-3">
          {RESULTS.map((r, i) => (
            <Reveal key={r.src} delay={i * 120} className="mb-8 break-inside-avoid">
              <figure
                className={`group rounded-2xl bg-white p-2 shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-transform duration-500 ease-out hover:rotate-0 hover:scale-[1.03] ${
                  TILTS[i % TILTS.length]
                }`}
              >
                <img src={r.src} alt={r.alt} loading="lazy" className="w-full rounded-xl" />
                <figcaption
                  className="px-2 pb-1 pt-3 text-sm font-semibold text-[rgb(10,11,16)]"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  {r.label}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120} className="mt-8 lg:mt-12">
          <CommentCarousel />
        </Reveal>
      </div>
    </section>
  );
}
