"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import type { MediaTile } from "@/lib/cms";
import Lightbox from "./Lightbox";
import ParallaxImage from "./ParallaxImage";
import Reveal from "./Reveal";

/* Full-bleed mosaic: edge to edge, no gap between tiles and none around them.

   Rows are sized in vw rather than px so the whole thing scales with the
   viewport and the tiles keep their proportions instead of squashing.

   `spans` repeats over the items. Each pattern is built so its areas divide
   evenly by the column count at both breakpoints — otherwise the last row
   comes up short and the flush bottom edge breaks. Keep the item count a
   multiple of the pattern length (cms.ts trims CMS lists to whole blocks).

   Every tile opens the Lightbox, which steps through the whole set. Video
   tiles (a clip or a film link) carry a play badge so they read as playable. */
export default function MediaMosaic({ items, spans }: { items: MediaTile[]; spans: string[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    /* One Reveal around the whole grid, not one per tile: the mosaic is a
       single picture built out of nine pieces, and staggering them made it
       assemble itself in front of you. It arrives as one block instead.

       The low threshold matters here — the grid is several viewports tall on
       mobile, so it can never reach a high intersection ratio. */
    <Reveal>
      <div className="grid w-full auto-rows-[42vw] grid-cols-2 lg:auto-rows-[15vw] lg:grid-cols-4">
        {items.map((m, i) => {
          const isVideo = Boolean(m.video || m.href);
          /* Plain grid item carrying the span classes. Stretched by default,
             so it takes the row height, which is what lets the frame inside
             resolve its h-full. */
          return (
            <div key={`${m.src}-${i}`} className={spans[i % spans.length]}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={
                  isVideo
                    ? m.alt ? `Play: ${m.alt}` : "Play the video"
                    : m.alt ? `View: ${m.alt}` : "View the photo"
                }
                className="group relative block h-full w-full cursor-zoom-in"
              >
                <ParallaxImage src={m.src} video={m.video} alt={m.alt} />
                {isVideo && (
                  <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/40 backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
                    <Play size={22} fill="currentColor" className="ml-1" />
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
      <Lightbox items={items} index={open} onIndex={setOpen} />
    </Reveal>
  );
}
