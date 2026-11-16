"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { FONT_DISPLAY } from "@/lib/brand";
import type { RecentTab } from "@/lib/cms";
import Lightbox from "./Lightbox";
import Reveal from "./Reveal";
import TileMedia from "./TileMedia";

/* Column spans on the six-column grid, by how many tiles the tab has, so every
   row fills whatever the count. A lone tile is centred rather than half a row. */
const HALF = "sm:col-span-3";
const THIRD = "sm:col-span-2";
const SPANS = [
  ["col-span-2 sm:col-span-4 sm:col-start-2"],
  [HALF, HALF],
  [THIRD, THIRD, THIRD],
  [HALF, HALF, HALF, HALF],
  [HALF, HALF, THIRD, THIRD, THIRD],
  [THIRD, THIRD, THIRD, THIRD, THIRD, THIRD],
  [HALF, HALF, THIRD, THIRD, THIRD, HALF, HALF],
];

/* Client component (the tabs hold state), so the page passes the content in. */
export default function Work({ title, tabs }: { title: string; tabs: RecentTab[] }) {
  const [activeTab, setActiveTab] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const tab = tabs[activeTab];
  const images = tab.tiles;

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
                key={t.label}
                role="tab"
                aria-selected={activeTab === i}
                onClick={() => {
                  setActiveTab(i);
                  setOpen(null);
                }}
                className={`px-4 py-3 text-center text-sm transition-colors ${
                  activeTab === i
                    ? "rounded-t-lg border border-b-0 border-[rgb(124,92,252)] font-semibold text-[rgb(124,92,252)]"
                    : "font-normal text-[rgb(34,34,34)] hover:text-[rgb(124,92,252)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Responsive grid, every tile the same height so rows line up. The
            span classes ride on the Reveal wrapper, since that is what the
            grid lays out. Video tiles loop their first seconds like the
            Videography page, rationed the same way (lib/playback.ts). */}
        <div role="tabpanel" className="grid w-full max-w-[720px] grid-cols-2 gap-4 sm:grid-cols-6">
          {images.map((m, i) => {
            const isVideo = Boolean(m.stream || m.video || m.href);
            return (
              <Reveal key={`${activeTab}-${i}`} delay={i * 70} className={SPANS[images.length - 1][i]}>
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={isVideo ? (m.alt ? `Play: ${m.alt}` : "Play the video") : m.alt ? `Open: ${m.alt}` : "Open in viewer"}
                  className="group relative block h-[240px] w-full cursor-pointer overflow-hidden rounded-lg sm:h-[380px]"
                >
                  <div className="absolute inset-0 transition-[transform,opacity] duration-700 ease-out group-hover:scale-[1.04] group-hover:opacity-90">
                    <TileMedia src={m.src} video={m.video} stream={m.stream} alt={m.alt} />
                  </div>
                  {isVideo && (
                    /* A tinted circle, not frosted glass: a backdrop blur over
                       a playing video is redrawn every frame. */
                    <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white ring-1 ring-white/50 opacity-0 transition-[opacity,transform] duration-500 group-hover:scale-110 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100">
                      <Play size={20} fill="currentColor" className="ml-0.5" />
                    </span>
                  )}
                </button>
              </Reveal>
            );
          })}
        </div>

        {tab.href && (
          <Link
            href={tab.href}
            className="inline-flex items-center gap-2 rounded-full border border-[rgb(10,11,16)]/15 px-6 py-3 text-sm font-semibold text-[rgb(10,11,16)] transition-colors hover:border-[rgb(124,92,252)] hover:text-[rgb(124,92,252)]"
          >
            See more {tab.label.toLowerCase()}
            <ArrowRight size={16} />
          </Link>
        )}
        <Lightbox items={images} index={open} onIndex={setOpen} />
      </div>
    </section>
  );
}
