"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import type { MediaTile } from "@/lib/cms";

/* Turns a YouTube or Vimeo link into its embeddable player, so the full film
   plays in place. Anything else (a client's own site, say) returns null and
   the viewer falls back to the clip or the still, with a link out. Shorts are
   vertical, so they get a portrait frame. */
function embed(href?: string): { src: string; tall: boolean } | null {
  if (!href) return null;
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www|m)\./, "");
  const path = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be" || host === "youtube.com" || host === "youtube-nocookie.com") {
    const id =
      host === "youtu.be"
        ? path[0]
        : (url.searchParams.get("v") ?? (["embed", "shorts", "live"].includes(path[0]) ? path[1] : undefined));
    if (!id) return null;
    return {
      src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`,
      tall: path[0] === "shorts",
    };
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const i = path.findIndex((p) => /^\d+$/.test(p));
    if (i < 0) return null;
    /* Unlisted videos carry a privacy hash, either as the next path segment or ?h=. */
    const hash = /^[0-9a-f]+$/i.test(path[i + 1] ?? "") ? path[i + 1] : url.searchParams.get("h");
    return { src: `https://player.vimeo.com/video/${path[i]}?autoplay=1${hash ? `&h=${hash}` : ""}`, tall: false };
  }

  return null;
}

const BUTTON =
  "absolute flex items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/25 backdrop-blur-md transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/* Full-screen viewer for the gallery tiles. `index` is the open tile, null
   when closed; `onIndex` is the parent's state setter, which keeps it stable
   for the effects below.

   Portaled to <body> because the galleries sit inside Reveal, whose
   transform animation would otherwise trap a `fixed` overlay inside the grid. */
export default function Lightbox({
  items,
  index,
  onIndex,
}: {
  items: MediaTile[];
  index: number | null;
  onIndex: (i: number | null) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const open = index !== null;
  const count = items.length;

  /* Lock the page behind, move focus into the viewer, and hand it back to
     the tile that opened it on close. */
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      root.style.overflow = overflow;
      opener?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onIndex(null);
      else if (e.key === "ArrowRight") onIndex((index + 1) % count);
      else if (e.key === "ArrowLeft") onIndex((index - 1 + count) % count);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, count, onIndex]);

  if (index === null) return null;

  const m = items[index];
  const film = embed(m.href);
  const multi = count > 1;
  const go = (step: number) => onIndex((index + step + count) % count);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={m.alt || (m.video || m.href ? "Video viewer" : "Photo viewer")}
      onClick={() => onIndex(null)}
      onTouchStart={(e) => {
        /* Not on the player: dragging its scrubber shouldn't change slides. */
        touchX.current = (e.target as HTMLElement).closest("video") ? null : e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null || !multi) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200"
    >
      {/* Keyed on the index so each slide mounts fresh: the previous video
          stops, and the next one starts from the top. */}
      <figure
        key={index}
        onClick={(e) => e.stopPropagation()}
        className="flex max-w-[92vw] flex-col items-center gap-3 motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-300"
      >
        {film ? (
          <iframe
            src={film.src}
            title={m.alt || "Video"}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            className={
              film.tall
                ? "aspect-[9/16] h-[80vh] max-w-[92vw] rounded-lg bg-black"
                : "aspect-video w-[min(92vw,calc(80vh*16/9))] rounded-lg bg-black"
            }
          />
        ) : m.video ? (
          <video
            src={m.video}
            poster={m.src}
            controls
            autoPlay
            playsInline
            className="max-h-[80vh] max-w-[92vw] rounded-lg bg-black"
          />
        ) : (
          <img src={m.src} alt={m.alt} className="max-h-[80vh] max-w-[92vw] rounded-lg object-contain" />
        )}

        {(m.alt || multi || (m.href && !film)) && (
          <figcaption className="flex w-full items-center justify-between gap-4 text-sm text-white/75">
            <span className="min-w-0 truncate">{m.alt}</span>
            <span className="flex shrink-0 items-center gap-4">
              {m.href && !film && (
                <a
                  href={m.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-semibold text-white hover:underline"
                >
                  Watch the full film <ExternalLink size={14} />
                </a>
              )}
              {multi && (
                <span className="tabular-nums">
                  {index + 1} / {count}
                </span>
              )}
            </span>
          </figcaption>
        )}
      </figure>

      <button
        ref={closeRef}
        type="button"
        aria-label="Close"
        onClick={(e) => {
          e.stopPropagation();
          onIndex(null);
        }}
        className={`${BUTTON} right-4 top-4 h-11 w-11 sm:right-6 sm:top-6`}
      >
        <X size={22} />
      </button>

      {multi && (
        <>
          <button
            type="button"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className={`${BUTTON} left-3 top-1/2 h-12 w-12 -translate-y-1/2 sm:left-6`}
          >
            <ChevronLeft size={26} />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className={`${BUTTON} right-3 top-1/2 h-12 w-12 -translate-y-1/2 sm:right-6`}
          >
            <ChevronRight size={26} />
          </button>
        </>
      )}
    </div>,
    document.body,
  );
}
