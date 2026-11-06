"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { FONT_DISPLAY } from "@/lib/brand";
import type { ResultShot } from "@/lib/cms";
import Lightbox from "./Lightbox";

/* Seconds each screenshot takes to drift past, so the speed stays the same
   however many there are. Higher = slower. */
const SECONDS_PER_CARD = 6;

/* A Row needs at least this many cards to stay wider than a wide monitor;
   short lists repeat inside the Row until they reach it. */
const MIN_CARDS = 8;

/* A slight, alternating tilt so the screenshots read as messages pinned up
   rather than a tidy gallery. They straighten on hover. */
const TILTS = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

/* One set of cards. Rendered twice so the -50% translate wraps seamlessly;
   spacing lives on the cards (mr-*) rather than a container gap, or the wrap
   point would land mid-gap and the loop would visibly jump. */
function Row({
  cards,
  count,
  duplicate = false,
  onOpen,
}: {
  cards: ResultShot[];
  count: number;
  duplicate?: boolean;
  onOpen: (i: number) => void;
}) {
  return (
    <div className="flex shrink-0 items-center">
      {cards.map((r, i) => {
        /* Only the first pass of the first Row is announced; every repeat is
           decoration for the loop. */
        const repeat = duplicate || i >= count;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onOpen(i % count)}
            aria-hidden={repeat || undefined}
            tabIndex={repeat ? -1 : undefined}
            aria-label={`View: ${r.alt || r.label}`}
            className={`group mr-5 flex shrink-0 cursor-pointer flex-col rounded-2xl bg-white p-2 text-left shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-transform duration-500 ease-out hover:rotate-0 hover:scale-[1.03] focus-visible:rotate-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:mr-8 ${
              TILTS[i % TILTS.length]
            }`}
          >
            {/* Every card is the same size. The screenshot is shown whole
                (contained, never cropped) over a blurred, enlarged copy of
                itself, so a wide message or a tall ad fills the frame with
                its own colours instead of an empty grey margin. */}
            <span className="relative block h-[230px] w-[300px] overflow-hidden rounded-xl sm:h-[300px] sm:w-[420px]">
              <img
                src={r.src}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full scale-150 object-cover blur-2xl saturate-150"
              />
              <img
                src={r.src}
                alt={repeat ? "" : r.alt}
                className="relative h-full w-full object-contain p-2 drop-shadow-[0_6px_14px_rgba(0,0,0,0.25)]"
              />
            </span>
            <span className="flex items-center justify-between gap-3 px-2 pb-1 pt-3">
              <span
                className="whitespace-nowrap text-sm font-semibold text-[rgb(10,11,16)]"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                {r.label}
              </span>
              <Maximize2
                size={15}
                aria-hidden
                className="shrink-0 text-[rgb(122,122,132)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
              />
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* The screenshots banner: one drifting row, so the section keeps a fixed
   height however many results there are. It pauses under the cursor so a card
   can be clicked; each one opens the Lightbox at full size, and the arrows
   step through the rest, since most of these are too small to read in the row. */
export default function ResultsWall({ results }: { results: ResultShot[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const passes = Math.max(1, Math.ceil(MIN_CARDS / results.length));
  const cards = Array.from({ length: passes }, () => results).flat();

  return (
    <>
      <div className="logo-viewport overflow-hidden py-6">
        <div
          className="logo-track results-track flex w-max"
          style={{ ["--loop" as string]: `${cards.length * SECONDS_PER_CARD}s` }}
        >
          <Row cards={cards} count={results.length} onOpen={setOpen} />
          <Row cards={cards} count={results.length} onOpen={setOpen} duplicate />
        </div>
      </div>
      <Lightbox items={results} index={open} onIndex={setOpen} />
    </>
  );
}
