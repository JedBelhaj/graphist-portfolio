import { CLIENT_LOGOS } from "@/lib/content";
import Reveal from "./Reveal";

/* Gap between each logo fading up, in ms. */
const STEP = 70;

export default function TrustedBy() {
  return (
    <section className="border-y border-black/5 bg-white px-5 py-16 sm:px-8 lg:py-20">
      <div className="mx-auto max-w-[1180px]">
        <Reveal>
          <p className="mb-12 text-center text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(122,122,132)]">
            Trusted by the teams we shoot for
          </p>
        </Reveal>

        {/* A lattice rather than a loose row: eight marks this mismatched in
            shape need the structure, and the uniform cell is what makes the
            differing aspect ratios read as intentional.

            Borders sit on the top and left of the container and the bottom and
            right of each cell, so the outer edge never doubles up. */}
        <div className="grid grid-cols-2 border-l border-t border-black/8 sm:grid-cols-4">
          {CLIENT_LOGOS.map((l, i) => (
            <Reveal
              key={l.src}
              delay={i * STEP}
              className="border-b border-r border-black/8"
            >
              <div className="group flex h-24 items-center justify-center px-6 lg:h-28">
                {/* brightness-0 flattens every logo — white, black or colour —
                    to the same ink silhouette. object-contain plus the per-logo
                    cap keeps each one inside the cell without distortion. */}
                <img
                  src={l.src}
                  alt={`${l.name} logo`}
                  loading="lazy"
                  className={`${l.cap} w-auto max-w-[150px] object-contain opacity-45 brightness-0 transition-opacity duration-300 group-hover:opacity-100`}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
