import type { ReactNode } from "react";
import Eyebrow from "./Eyebrow";

/* Opening block for every page except home: the slate label, the title in
   the wide caps, an optional hollow second line, and a short intro. Paper
   ground under the ink header bar. The top padding clears the fixed bar. */
export default function PageHero({
  eyebrow,
  title,
  accent,
  children,
}: {
  eyebrow: string;
  title: string;
  /* Second line, in the script face. */
  accent?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-ink/10 bg-wash px-5 pb-14 pt-36 sm:px-8 lg:px-10 lg:pb-20 lg:pt-48">
      <div className="mx-auto max-w-[1220px]">
        <Eyebrow className="hero-rise mb-6">{eyebrow}</Eyebrow>
        <h1
          className="display hero-rise max-w-5xl text-[clamp(2.75rem,9vw,7rem)] text-ink"
          style={{ animationDelay: "80ms" }}
        >
          {title}
          {accent && <span className="script block text-brand">{accent}</span>}
        </h1>
        {children && (
          <div
            className="hero-rise mt-8 max-w-2xl text-lg leading-relaxed text-muted"
            style={{ animationDelay: "160ms" }}
          >
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
