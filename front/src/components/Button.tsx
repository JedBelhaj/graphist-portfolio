import Link from "next/link";
import type { ReactNode } from "react";
import PlayMark from "./PlayMark";

const VARIANTS = {
  brand: "bg-brand text-white hover:bg-ink",
  ink: "bg-ink text-white hover:bg-brand",
  light: "bg-white text-ink hover:bg-brand hover:text-white",
  outline: "border border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-white",
  "outline-light": "border border-white/30 text-white hover:border-white hover:bg-white hover:text-ink",
} as const;

/* Square, caps, with the play mark that nudges forward on hover. Internal
   routes go through Link; anchors and mailto stay plain <a>. */
export default function Button({
  href,
  variant = "ink",
  children,
  className = "",
  onClick,
}: {
  href: string;
  variant?: keyof typeof VARIANTS;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const cls = `group inline-flex items-center justify-center gap-3 px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] transition-colors duration-200 ${VARIANTS[variant]} ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      <PlayMark className="text-[11px] transition-transform duration-200 group-hover:translate-x-1" />
    </>
  );

  return href.startsWith("/") ? (
    <Link href={href} className={cls} onClick={onClick}>
      {inner}
    </Link>
  ) : (
    <a href={href} className={cls} onClick={onClick}>
      {inner}
    </a>
  );
}
