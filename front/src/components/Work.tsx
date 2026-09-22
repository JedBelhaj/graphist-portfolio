"use client";

import { useState } from "react";
import { FONT_DISPLAY } from "@/lib/brand";
import { WORK_IMAGES, WORK_TABS } from "@/lib/content";
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

export default function Work() {
  const [activeTab, setActiveTab] = useState(1);

  return (
    <section id="work" className="px-5 py-20 sm:px-8 lg:py-24">
      <div className="mx-auto flex max-w-[940px] flex-col items-center gap-10 lg:gap-12">
        <Reveal>
          <h2
            className="text-4xl font-bold tracking-tight text-[rgb(47,38,29)] sm:text-5xl lg:text-[56px]"
            style={{ fontFamily: FONT_DISPLAY }}
          >
            Our work
          </h2>
        </Reveal>

        {/* Tabs */}
        <Reveal delay={90}>
          <div role="tablist" className="flex flex-wrap justify-center gap-1 border-b border-[rgb(167,68,255)]/30">
            {WORK_TABS.map((t, i) => (
              <button
                key={t}
                role="tab"
                aria-selected={activeTab === i}
                onClick={() => setActiveTab(i)}
                className={`px-4 py-3 text-center text-sm transition-colors ${
                  activeTab === i
                    ? "rounded-t-lg border border-b-0 border-[rgb(167,68,255)] font-semibold text-[rgb(167,68,255)]"
                    : "font-normal text-[rgb(34,34,34)] hover:text-[rgb(167,68,255)]"
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
          {WORK_IMAGES.map((src, i) => (
            <Reveal key={i} delay={i * 70} className={SPANS[i]}>
              <div className="group h-full overflow-hidden rounded-lg">
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
