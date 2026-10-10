import { CLIENT_LOGOS, COUNTRIES } from "@/lib/content";
import Reveal from "./Reveal";

/* Seconds for one full pass of the logo set. Higher = slower. */
const LOOP_SECONDS = 50;

/* One pass of every logo. Rendered twice so the -50% translate wraps
   seamlessly — same trick as the testimonial rail, and for the same reason
   the spacing lives inside each slot rather than as a gap on the row. */
function Row({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={duplicate || undefined}>
      {CLIENT_LOGOS.map((l) => (
        /* Fixed-width slots so the band has an even beat, whatever shape the
           mark is. object-contain plus the per-logo cap keeps each one inside
           without distortion. */
        <li key={l.src} className="flex h-16 w-[124px] shrink-0 items-center justify-center px-4 sm:w-[180px] sm:px-6 lg:h-20 lg:w-[200px]">
          {/* brightness-0 flattens every logo — white, black or colour — to
              the same ink silhouette; grayscale ones keep their inner detail
              (see CLIENT_LOGOS). */}
          <img
            src={l.src}
            alt={duplicate ? "" : `${l.name} logo`}
            loading="lazy"
            className={`${l.cap} w-auto max-w-full object-contain transition-[opacity,filter] duration-300 hover:opacity-100 ${
              l.tone === "grayscale" ? "opacity-60 grayscale hover:grayscale-0" : "opacity-50 brightness-0"
            }`}
          />
        </li>
      ))}
    </ul>
  );
}

/* Straight under the hero: the first thing after the pitch is who has
   already bought it. A moving band rather than the old logo lattice, so it
   reads as a strip of proof instead of a section you have to stop and read. */
export default function TrustedBy() {
  return (
    <section aria-label="Brands we've worked with" className="border-b border-black/5 bg-white py-12 lg:py-16">
      <Reveal>
        <p className="mb-8 text-balance px-5 text-center text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(122,122,132)] lg:mb-10">
          Trusted by {CLIENT_LOGOS.length} brands across {COUNTRIES.length} countries
        </p>
      </Reveal>

      <Reveal delay={100}>
        <div className="logo-viewport overflow-hidden">
          <div className="logo-track flex w-max" style={{ ["--loop" as string]: `${LOOP_SECONDS}s` }}>
            <Row />
            <Row duplicate />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
