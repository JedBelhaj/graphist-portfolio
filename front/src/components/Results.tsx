import { ACCENT, ACCENT_TINT, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { CLIENT_LOGOS, COUNTRIES, RESULTS } from "@/lib/content";
import Reveal from "./Reveal";

/* Figures lead the section, then the receipts. Two of the three are counted
   from the data so they can't drift out of step with the logo band and the
   countries list. */
const STATS = [
  { figure: "120+", label: "Projects delivered" },
  { figure: String(CLIENT_LOGOS.length), label: "Brands on the roster" },
  { figure: String(COUNTRIES.length), label: "Countries shot in" },
];

/* A slight, alternating tilt so the screenshots read as messages pinned up
   rather than a tidy gallery. They straighten on hover. */
const TILTS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

/* The proof, right after the logos: numbers first, then the messages clients
   actually sent. Written testimonials follow in their own section. */
export default function Results() {
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
                Results
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="text-4xl font-bold leading-[1.05] tracking-tight text-[rgb(254,254,254)] sm:text-5xl lg:text-[64px]"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                Proof, not promises
                <span
                  className="block text-3xl font-normal sm:text-4xl lg:text-5xl"
                  style={{ fontFamily: FONT_SCRIPT, color: ACCENT_TINT }}
                >
                  [straight from the group chat]
                </span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={160}>
            <p className="max-w-sm text-base leading-relaxed text-[rgb(160,160,172)]">
              Real messages from real clients, sent the day the work landed. No staging, no
              rewrites.
            </p>
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
      </div>
    </section>
  );
}
