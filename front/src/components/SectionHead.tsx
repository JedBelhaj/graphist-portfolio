import type { ReactNode } from "react";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";

/* Every section opens the same way: the slate label, a headline in the wide
   caps, and an optional short paragraph pushed to the right on desktop.

   `title` is the solid line; `script` is an optional second line in the
   handwritten face, purple on light grounds and lavender on dark. */
export default function SectionHead({
  index,
  label,
  title,
  script,
  aside,
  dark = false,
  as: Tag = "h2",
  className = "",
}: {
  index?: string;
  label: string;
  title: ReactNode;
  script?: ReactNode;
  aside?: ReactNode;
  dark?: boolean;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div
      className={`mb-12 flex flex-col gap-6 lg:mb-16 lg:flex-row lg:items-end lg:justify-between lg:gap-16 ${className}`}
    >
      <div className="min-w-0">
        <Reveal>
          <Eyebrow index={index} dark={dark} className="mb-5">
            {label}
          </Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <Tag
            className={`display text-[clamp(2.4rem,7vw,5rem)] ${dark ? "text-white" : "text-ink"}`}
          >
            {title}
            {script && (
              <span className={`script block ${dark ? "text-tint" : "text-brand"}`}>{script}</span>
            )}
          </Tag>
        </Reveal>
      </div>
      {aside && (
        <Reveal delay={160} className="lg:max-w-sm lg:shrink-0 lg:pb-2">
          <div className={`text-base leading-relaxed ${dark ? "text-white/65" : "text-muted"}`}>
            {aside}
          </div>
        </Reveal>
      )}
    </div>
  );
}
