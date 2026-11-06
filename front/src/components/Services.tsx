"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import type { ServiceBubble } from "@/lib/cms";

/* Spots are relative to the 820px ring box (photo centred in it), so the
   bubbles hug the figure instead of spreading across the whole column. */
const BUBBLE_POSITIONS = [
  "top-[-6%] right-[18%] w-[144px]",
  "right-[20%] bottom-[22%] w-[100px]",
  "right-[4%] bottom-[50%] w-[108px]",
  "right-[2%] bottom-[12%] w-[128px]",
  "right-[52%] bottom-[84%] w-[100px]",
  "right-[76%] bottom-[76%] w-[116px]",
  "right-[63%] bottom-[56%] w-[100px]",
  "right-[84%] bottom-[50%] w-[160px]",
  "right-[88%] bottom-[8%] w-[160px]",
  "right-[68%] bottom-[10%] w-[160px]",
  "right-[2%] bottom-[80%] w-[100px]",
];

/* Gap between each bubble popping in, in ms. */
const POP_STEP = 70;

/* Lead-in before the first bubble, so the group reads as a reaction to the
   scroll instead of something already in flight when it comes into view. */
const POP_DELAY = 180;

/* Idle float timing per bubble: durations of 5-8s and phases spread across
   the cycle, so neighbours never rise and fall together. The negative delay
   starts each one mid-cycle rather than all from rest. */
const float = (i: number) => ({
  ["--float-dur" as string]: `${5 + ((i * 1.3) % 3)}s`,
  ["--float-delay" as string]: `${-((i * 1.7) % 6)}s`,
});

/* Client component (it watches its own scroll position), so the content comes
   in as props from the page rather than being fetched here. The desktop ring
   has one tuned spot per bubble; any past the last spot are left to the
   mobile pills, which wrap freely. */
export default function Services({
  bubbles,
  title,
  accent,
  photo,
}: {
  bubbles: ServiceBubble[];
  title: string;
  accent: string;
  photo: string;
}) {
  const revealRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = revealRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect(); // one-shot: it pops on the way in, not on every pass
      },
      /* Watches the bubbles rather than the section: the heading above them is
         tall enough that a section-level trigger fired while they were still
         below the fold. The negative bottom margin holds off until they are
         properly on screen; the threshold stays low because a block taller
         than the viewport can never reach a high ratio. */
      { threshold: 0.1, rootMargin: "0px 0px -15% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Held at opacity 0 until the bubbles are in view, then the keyframe takes
     over. Under prefers-reduced-motion the animation is a no-op, so clearing
     the inline opacity is what reveals them. */
  const pop = (i: number) => ({
    className: shown ? "pop-in" : "",
    style: {
      opacity: shown ? undefined : 0,
      animationDelay: `${POP_DELAY + i * POP_STEP}ms`,
    },
  });

  return (
    <section id="services" className="px-5 pt-20 sm:px-8 lg:pt-24">
      <div className="mx-auto max-w-[940px]">
        <h2
          className="mb-12 text-center text-2xl font-semibold leading-tight tracking-tight text-[rgb(10,11,16)] sm:text-6xl lg:mb-16 lg:text-[80px]"
          style={{ fontFamily: FONT_DISPLAY }}
        >
          {title}
          {/* The large bottom margin is only for desktop, where the bubble ring
              floats up into this space; the mobile pills don't. */}
          <span className="block text-2xl sm:text-4xl lg:mb-20 lg:text-5xl" style={{ fontFamily: FONT_SCRIPT }}>
            {accent}
          </span>
        </h2>

        <div ref={revealRef}>
          {/* Mobile / tablet: wrapped pills */}
          <div className="flex flex-wrap justify-center gap-3 lg:hidden">
            {bubbles.map((s, i) => {
              const { className, style } = pop(i);
              return (
                <span
                  key={s.label}
                  className={`rounded-full px-5 py-3 text-center text-sm font-bold ${className}`}
                  style={{ backgroundColor: s.bg, color: s.fg, fontFamily: FONT_DISPLAY, ...style }}
                >
                  {s.label}
                </span>
              );
            })}
          </div>

          {/* Desktop: photo with floating bubbles */}
          <div className="relative mx-auto hidden w-[820px] justify-center lg:flex">
            {/* Fixed 575px box keeps the bubble ring's tuned positions intact, while
                object-bottom crops the cut-out's empty top so the subject fills it.
                The drop shadows follow the cut-out's outline: a tight one softens
                the masking edge, a wide one seats the figure on the page. */}
            <img
              src={photo}
              alt=""
              className="h-[575px] w-[400px] object-cover object-bottom"
              style={{
                filter:
                  "drop-shadow(0 0 2px rgba(10,11,16,0.35)) drop-shadow(0 18px 28px rgba(10,11,16,0.28))",
              }}
            />
            {bubbles.slice(0, BUBBLE_POSITIONS.length).map((s, i) => {
              const { className, style } = pop(i);
              return (
                <div key={s.label} className={`absolute ${BUBBLE_POSITIONS[i]} ${className}`} style={style}>
                  <div
                    className="bubble-float flex items-center justify-center rounded-full px-2 py-4 text-center text-sm font-bold"
                    style={{ backgroundColor: s.bg, color: s.fg, fontFamily: FONT_DISPLAY, ...float(i) }}
                  >
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* On home this is the teaser — the full breakdown lives on /services. */}
        <div className="mt-14 flex justify-center pb-4 lg:mt-24">
          <Link
            href="/services"
            className="rounded-full bg-[rgb(10,11,16)] px-6 py-3 text-base font-medium text-white transition-transform hover:scale-[1.03]"
          >
            See all services
          </Link>
        </div>
      </div>
    </section>
  );
}
