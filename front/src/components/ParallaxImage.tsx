"use client";

import { useEffect, useRef, useState } from "react";
import { PREVIEW_SECONDS, muxPreview } from "@/lib/mux";
import { requestPlay } from "@/lib/playback";
import { useStream } from "@/lib/useStream";

/* Parallax that moves the picture inside a fixed frame, not the frame itself.

   The frame stays exactly where the layout puts it and clips; the image is
   oversized and slides within it, so it reads like a background drifting behind
   a window rather than a tile sliding around the page.

   The two numbers are tied together and must stay that way. The image is
   130% of the frame, offset -15%, leaving 15% of frame height as slack above
   and below. A transform percentage resolves against the image's own height,
   so the drift is capped at 11% of 130% = 14.3% of the frame — just inside the
   slack. Raise DRIFT past ~11 and an empty edge appears at the extremes. */
const DRIFT = 11;

/* How far beyond the screen a tile counts as near: one screen height above
   and below. Near tiles follow the scroll and keep a stream they've opened;
   the rest do nothing, so a page of 50 videos costs what the few around the
   screen cost. */
const NEAR = "100% 0px";

/* `src` is the still. `stream` (a Mux playback ID) or `video` (an uploaded
   file, from before Mux) adds a silent loop of the first PREVIEW_SECONDS over
   it, playing only while the tile is on screen and among the few nearest the
   middle (the others show the still). Under reduced motion there is
   no drift and no loop: the still stays up, or, for a file with no still, its
   first frame. On touch screens the loop plays but the picture doesn't
   drift, and the loop is fetched at the tile's on-screen size. */
export default function ParallaxImage({
  src,
  video,
  stream,
  alt = "",
  className = "",
}: {
  src: string;
  video?: string;
  stream?: string;
  alt?: string;
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  /* No drift on touch screens either: phones scroll on their own fast path,
     and moving every tile from script on each scroll frame made them stutter. */
  const [touch, setTouch] = useState(false);
  const drift = !reduced && !touch;

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setTouch(window.matchMedia("(hover: none)").matches);
    const frame = frameRef.current;
    if (!frame) return;
    const nearIo = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: NEAR });
    const viewIo = new IntersectionObserver(([e]) => setInView(e.isIntersecting));
    nearIo.observe(frame);
    viewIo.observe(frame);
    return () => {
      nearIo.disconnect();
      viewIo.disconnect();
    };
  }, []);

  /* The drift, only while near. */
  useEffect(() => {
    const frame = frameRef.current;
    const layer = layerRef.current;
    if (!near || !drift || !frame || !layer) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = frame.getBoundingClientRect();
      const viewport = window.innerHeight;

      /* +1 a full viewport below the fold, 0 as the frame's centre crosses the
         screen centre, -1 on the way out. Clamped so frames parked far off
         screen hold at the extreme instead of running away. */
      const travel = (viewport + rect.height) / 2;
      const raw = (rect.top + rect.height / 2 - viewport / 2) / travel;
      const progress = Math.max(-1, Math.min(1, raw));

      layer.style.transform = `translate3d(0, ${(progress * DRIFT).toFixed(2)}%, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [near, drift]);

  /* Playing is rationed (lib/playback.ts): an on-screen tile asks, and only
     the few nearest the middle of the screen are allowed. */
  const moving = Boolean(stream || video);
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const frame = frameRef.current;
    if (!inView || reduced || !moving || !frame) return;
    return requestPlay(frame, setAllowed);
  }, [inView, reduced, moving]);

  /* A tile only starts streaming once it has been allowed to play, and
     keeps the stream until it leaves the near zone, so tiles nudged in and
     out of the playing few while scrolling don't keep reconnecting. */
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!near) setArmed(false);
    else if (allowed) setArmed(true);
  }, [near, allowed]);

  /* What the <video> plays, if anything. An old file with no still loads its
     first frame as soon as it's near (#t nudges Safari into painting it). */
  const live = armed && !reduced;
  const url = !near
    ? undefined
    : stream
      ? live
        ? muxPreview(stream)
        : undefined
      : video
        ? !src
          ? `${video}#t=0.001`
          : live
            ? video
            : undefined
        : undefined;
  useStream(videoRef, url, touch);

  const play = allowed && !reduced;
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    /* Also on canplay: the stream may attach after the tile comes into view.
       play() rejects if the browser blocks autoplay; the still stays. */
    const sync = () => (play ? v.play().catch(() => {}) : v.pause());
    sync();
    v.addEventListener("canplay", sync);
    return () => v.removeEventListener("canplay", sync);
  }, [play, url]);

  return (
    <div ref={frameRef} className={`relative h-full w-full overflow-hidden ${className}`}>
      <div
        ref={layerRef}
        className="absolute left-0 h-[130%] w-full"
        style={{ top: "-15%", willChange: near && drift ? "transform" : undefined }}
      >
        {src ? (
          <img src={src} alt={alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          /* A video with a link but no still or clip: a plain tile. */
          !url && <div className="absolute inset-0 bg-neutral-900" aria-label={alt || undefined} />
        )}
        {url && (
          <video
            ref={videoRef}
            aria-hidden
            muted
            loop
            playsInline
            preload={src ? "none" : "metadata"}
            onTimeUpdate={(e) => {
              if (e.currentTarget.currentTime >= PREVIEW_SECONDS) e.currentTarget.currentTime = 0;
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>
    </div>
  );
}
