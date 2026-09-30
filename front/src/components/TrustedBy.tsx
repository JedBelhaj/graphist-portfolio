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
            Brands we&apos;ve worked with
          </p>
        </Reveal>

        {/* A lattice rather than a loose row: fifteen marks this mismatched in
            shape need the structure, and the uniform cell is what makes the
            differing aspect ratios read as intentional. 3 and 5 columns both
            divide fifteen, so the last row is always full.

            Borders sit on the top and left of the container and the bottom and
            right of each cell, so the outer edge never doubles up. */}
        <div className="grid grid-cols-3 border-l border-t border-black/8 lg:grid-cols-5">
          {CLIENT_LOGOS.map((l, i) => (
            <Reveal
              key={l.src}
              delay={i * STEP}
              className="border-b border-r border-black/8"
            >
              <div className="group flex h-24 items-center justify-center px-4 sm:px-6 lg:h-28">
                {/* brightness-0 flattens every logo — white, black or colour —
                    to the same ink silhouette; grayscale ones keep their inner
                    detail (see CLIENT_LOGOS). object-contain plus the per-logo
                    cap keeps each one inside the cell without distortion. */}
                <img
                  src={l.src}
                  alt={`${l.name} logo`}
                  loading="lazy"
                  className={`${l.cap} w-auto max-w-full object-contain transition-[opacity,filter] duration-300 group-hover:opacity-100 sm:max-w-[150px] ${
                    l.tone === "grayscale" ? "opacity-60 grayscale group-hover:grayscale-0" : "opacity-45 brightness-0"
                  }`}
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
