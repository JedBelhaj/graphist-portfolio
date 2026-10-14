"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { FONT_DISPLAY } from "@/lib/brand";
import type { MediaTile } from "@/lib/cms";
import Lightbox from "./Lightbox";
import Reveal from "./Reveal";

const SPANS = [
  "sm:col-span-3",
  "sm:col-span-3",
  "sm:col-span-2",
  "sm:col-span-2",
  "sm:col-span-2",
  "sm:col-span-3",
  "sm:col-span-3",
];

/* Client component (the tabs hold state), so the page passes the content in. */
export default function Work({ title, tabs, images }: { title: string; tabs: string[]; images: MediaTile[] }) {
  const [activeTab, setActiveTab] = useState(1);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="work" className="px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto flex max-w-[940px] flex-col items-center gap-10 lg:gap-12">
        <Reveal>
          <h2
            className="text-4xl font-bold tracking-tight text-[rgb(47,38,29)] sm:text-5xl lg:text-[56px]"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            {title}
          </h2>
        </Reveal>

        {/* Tabs */}
        <Reveal delay={90}>
          <div role="tablist" className="flex flex-wrap justify-center gap-1 border-b border-[rgb(124,92,252)]/30">
            {tabs.map((t, i) => (
              <button
                key={t}
                role="tab"
                aria-selected={activeTab === i}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-3 text-center text-sm transition-colors ${
                  activeTab === i
                    ? "rounded-t-lg border border-b-0 border-[rgb(124,92,252)] font-semibold text-[rgb(124,92,252)]"
                    : "font-normal text-[rgb(34,34,34)] hover:text-[rgb(124,92,252)]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Masonry-ish responsive grid. The span classes ride on the Reveal
            wrapper, since that is what the grid now lays out. */}
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-6">
          {images.map((m, i) => (
            <Reveal key={i} delay={i * 70} className={SPANS[i]}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={m.alt ? `Open: ${m.alt}` : "Open in viewer"}
                className="group relative block h-full w-full cursor-zoom-in overflow-hidden rounded-lg"
              >
                <img
                  src={m.src}
                  alt={m.alt}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                {(m.video || m.href) && (
                  <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/40 backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
                    <Play size={20} fill="currentColor" className="ml-0.5" />
                  </span>
                )}
              </button>
            </Reveal>
          ))}
        </div>
        <Lightbox items={images} index={open} onIndex={setOpen} />
      </div>
    </section>
  );
}
