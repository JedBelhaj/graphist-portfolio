"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { FONT_DISPLAY } from "@/lib/brand";
import type { ResultShot } from "@/lib/cms";
import Lightbox from "./Lightbox";
import Reveal from "./Reveal";

/* Below lg the wall is one or two columns, so all of it runs to several
   screens of scrolling; it shows this many until "Show all" is tapped. */
const PREVIEW = 6;

/* A slight, alternating tilt so the screenshots read as messages pinned up
   rather than a tidy gallery. They straighten on hover. */
const TILTS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

/* The screenshots wall. Each card opens the Lightbox at full size, and the
   arrows step through the rest, since most of these are too small to read in
   the column. */
export default function ResultsWall({ results }: { results: ResultShot[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [all, setAll] = useState(false);
  const more = !all && results.length > PREVIEW;

  return (
    <>
      {/* CSS columns rather than a grid: the screenshots are all different
          heights, and columns let them pack without row gaps. */}
      <div className="columns-1 gap-8 sm:columns-2 lg:columns-3">
        {results.map((r, i) => (
          <Reveal
            key={r.src}
            delay={(i % 3) * 120}
            className={`mb-8 break-inside-avoid ${more && i >= PREVIEW ? "max-lg:hidden" : ""}`}
          >
            <button
              type="button"
              onClick={() => setOpen(i)}
              aria-label={`View: ${r.alt || r.label}`}
              className={`group relative block w-full cursor-pointer rounded-2xl bg-white p-2 text-left shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-transform duration-500 ease-out hover:rotate-0 hover:scale-[1.03] focus-visible:rotate-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${
                TILTS[i % TILTS.length]
              }`}
            >
              <img src={r.src} alt={r.alt} loading="lazy" className="w-full rounded-xl" />
              <span className="flex items-center justify-between gap-3 px-2 pb-1 pt-3">
                <span className="text-sm font-semibold text-[rgb(10,11,16)]" style={{ fontFamily: FONT_DISPLAY }}>
                  {r.label}
                </span>
                <Maximize2
                  size={15}
                  aria-hidden
                  className="shrink-0 text-[rgb(122,122,132)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
                />
              </span>
            </button>
          </Reveal>
        ))}
      </div>
      {more && (
        <div className="flex justify-center lg:hidden">
          <button
            type="button"
            onClick={() => setAll(true)}
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[rgb(10,11,16)] transition-transform hover:scale-[1.03]"
          >
            Show all {results.length}
          </button>
        </div>
      )}
      <Lightbox items={results} index={open} onIndex={setOpen} />
    </>
  );
}
