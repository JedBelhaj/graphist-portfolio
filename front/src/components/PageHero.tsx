import type { ReactNode } from "react";
import { ACCENT, FONT_DISPLAY, FONT_SCRIPT } from "@/lib/brand";

/* Opening block for every page except home. Always light: the header is
   transparent at the top of the page, so the first thing under it has to be a
   surface its ink links read on. The top padding clears the fixed bar. */
export default function PageHero({
  eyebrow,
  title,
  accent,
  children,
}: {
  eyebrow: string;
  title: string;
  /* Second line, set in the script face. */
  accent?: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-white px-5 pb-12 pt-36 sm:px-8 lg:pb-16 lg:pt-48">
      <div className="mx-auto max-w-[1180px]">
        <p
          className="hero-rise mb-5 text-sm font-semibold uppercase tracking-[0.22em]"
          style={{ color: ACCENT }}
        >
          {eyebrow}
        </p>
        <h1
          className="hero-rise max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.03em] text-[rgb(10,11,16)] sm:text-6xl lg:text-[88px]"
          style={{ fontFamily: FONT_DISPLAY, animationDelay: "80ms" }}
        >
          {title}
          {accent && (
            <span className="block" style={{ fontFamily: FONT_SCRIPT, color: ACCENT }}>
              {accent}
            </span>
          )}
        </h1>
        {children && (
          <div
            className="hero-rise mt-8 max-w-2xl text-lg leading-relaxed text-[rgb(74,74,86)]"
            style={{ animationDelay: "160ms" }}
          >
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
