"use client";

import { useEffect, useRef, useState } from "react";
import { FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";
import { SERVICES, SERVICES_PHOTO } from "@/lib/content";

const BUBBLE_POSITIONS = [
  "top-[-13%] right-[17%] w-[180px]",
  "right-[20%] bottom-[21%] w-[120px]",
  "right-[1%] bottom-[52%] w-[130px]",
  "right-[-1%] bottom-[9%] w-40",
  "right-[52%] bottom-[91%] w-[120px]",
  "right-[78%] bottom-[83%] w-[140px]",
  "right-[64%] bottom-[60%] w-[120px]",
  "right-[87%] bottom-[53%] w-[200px]",
  "right-[90%] bottom-[5%] w-[200px]",
  "right-[67%] bottom-[9%] w-[200px]",
  "right-[-3%] bottom-[89%] w-[120px]",
];

/* Gap between each bubble popping in, in ms. */
const POP_STEP = 70;

export default function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect(); // one-shot: it pops on the way in, not on every pass
      },
      { threshold: 0.15 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Held at opacity 0 until the section is in view, then the keyframe takes
     over. Under prefers-reduced-motion the animation is a no-op, so clearing
     the inline opacity is what reveals them. */
  const pop = (i: number) => ({
    className: shown ? "pop-in" : "",
    style: {
      opacity: shown ? undefined : 0,
      animationDelay: `${i * POP_STEP}ms`,
    },
  });

  return (
    <section ref={sectionRef} id="services" className="px-5 pt-20 sm:px-8 lg:pt-24">
      <div className="mx-auto max-w-[940px]">
        <h2
          className="mb-12 text-center text-2xl font-semibold leading-tight tracking-tight text-[rgb(10,11,16)] sm:text-6xl lg:mb-16 lg:text-[80px]"
          style={{ fontFamily: FONT_DISPLAY }}
        >
          THE SH** WE GET DONE
          <span className="block mb-30 text-2xl sm:text-4xl lg:text-5xl" style={{ fontFamily: FONT_SCRIPT }}>
            [aka what we do]
          </span>
        </h2>

        {/* Mobile / tablet: wrapped pills */}
        <div className="flex flex-wrap justify-center gap-3 lg:hidden">
          {SERVICES.map((s, i) => {
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
        <div className="relative mx-auto hidden justify-center lg:flex">
          {/* Fixed 460px box keeps the bubble ring's tuned positions intact, while
              object-bottom crops the cut-out's empty top so the subject fills it. */}
          <img
            src={SERVICES_PHOTO}
            alt=""
            className="h-[460px] w-[320px] object-cover object-bottom"
          />
          {SERVICES.map((s, i) => {
            const { className, style } = pop(i);
            return (
              <div
                key={s.label}
                className={`absolute flex items-center justify-center rounded-full px-2 py-6 text-center text-base font-bold ${BUBBLE_POSITIONS[i]} ${className}`}
                style={{ backgroundColor: s.bg, color: s.fg, fontFamily: FONT_DISPLAY, ...style }}
              >
                {s.label}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
