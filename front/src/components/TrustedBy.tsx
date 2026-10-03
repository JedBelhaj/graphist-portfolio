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
        <li
          key={l.src}
          className="flex h-16 w-[124px] shrink-0 items-center justify-center px-4 sm:w-[180px] sm:px-6 lg:h-20 lg:w-[200px]"
        >
          {/* On the ink band every mark is flattened to white: brightness-0
              takes it to a black silhouette, invert flips that to white.
              Grayscale marks keep their inner detail (see CLIENT_LOGOS) and
              are inverted so their light shapes stay light. */}
          <img
            src={l.src}
            alt={duplicate ? "" : `${l.name} logo`}
            loading="lazy"
            className={`${l.cap} w-auto max-w-full object-contain opacity-55 transition-opacity duration-300 hover:opacity-100 ${
              l.tone === "grayscale" ? "grayscale invert" : "brightness-0 invert"
            }`}
          />
        </li>
      ))}
    </ul>
  );
}

/* Straight under the hero and on the same ink, so the opening reads as one
   dark block: the pitch, then who has already bought it. */
export default function TrustedBy() {
  return (
    <section aria-label="Brands we've worked with" className="bg-ink pb-14 pt-4 lg:pb-20">
      <div className="mx-auto mb-8 flex max-w-[1300px] items-center gap-4 px-5 sm:px-8 lg:mb-10 lg:px-10">
        <Reveal>
          <p className="readout whitespace-nowrap text-white/50">
            Trusted by {CLIENT_LOGOS.length} brands · {COUNTRIES.length} countries
          </p>
        </Reveal>
        <span className="h-px flex-1 bg-white/10" aria-hidden="true" />
      </div>

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
