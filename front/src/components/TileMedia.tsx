"use client";

import { useEffect, useRef, useState } from "react";
import { PREVIEW_SECONDS, muxPreview } from "@/lib/mux";
import { requestSlot, type Slot } from "@/lib/playback";
import { useStream } from "@/lib/useStream";

/* How far beyond the screen a tile counts as near: one screen height above
   and below. Near tiles may load their loop ahead of time; the rest do
   nothing, so a page of 50 videos costs what the few around the screen
   cost. */
const NEAR = "100% 0px";

/* The picture inside a gallery tile, filling it edge to edge.

   `src` is the still. `stream` (a Mux playback ID) or `video` (an uploaded
   file, from before Mux) adds a silent loop of the first PREVIEW_SECONDS over
   it. lib/playback.ts decides which near tiles load the loop and which play
   it; a tile that is loaded but not playing shows the loop's first frame,
   the same picture as the still. Under reduced motion there is no loop: the
   still stays up, or, for a file with no still, its first frame. On touch
   screens the loop is fetched at the tile's on-screen size. */
export default function TileMedia({
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setTouch(window.matchMedia("(hover: none)").matches);
    const frame = frameRef.current;
    if (!frame) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: NEAR });
    io.observe(frame);
    return () => io.disconnect();
  }, []);

  /* Loading and playing are rationed (lib/playback.ts): a near tile asks,
     and is told whether it may load its loop, and whether it may play it. */
  const moving = Boolean(stream || video);
  const [slot, setSlot] = useState<Slot>({ load: false, play: false });
  useEffect(() => {
    const frame = frameRef.current;
    if (!near || reduced || !moving || !frame) return;
    return requestSlot(frame, setSlot);
  }, [near, reduced, moving]);

  /* What the <video> plays, if anything. An old file with no still loads its
     first frame as soon as it's near (#t nudges Safari into painting it). */
  const live = slot.load && !reduced;
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
  useStream(videoRef, url, { light: touch });

  const play = slot.play && !reduced;
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
          /* "auto" so Safari fetches a loaded tile's loop before it's
             asked to play (hls.js fetches regardless). */
          preload={src ? "auto" : "metadata"}
          onTimeUpdate={(e) => {
            if (e.currentTarget.currentTime >= PREVIEW_SECONDS) e.currentTarget.currentTime = 0;
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
