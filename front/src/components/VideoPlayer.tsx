"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Maximize, Minimize, Pause, Play, Volume2, VolumeX } from "lucide-react";

const fmt = (s: number) => {
  if (!Number.isFinite(s)) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
};

/* Same frosted round button as the Lightbox's arrows and close. */
const BUTTON =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/25 backdrop-blur-md transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/* Keys pressed on these keep their own meaning instead of the shortcuts. */
const INTERACTIVE = "button, a, input, textarea, select, [role='slider']";

/* The Lightbox's player for uploaded clips, in place of the browser's own
   controls, which look different in every browser and can't be styled.

   Clicking the picture plays or pauses it. While playing, the controls fade
   out after a moment without the pointer moving. Shortcuts: Space or K
   play/pause, M mute, F fullscreen; on the progress bar, ←/→ seek 5s (and
   stop there, so they don't also change slides). */
export default function VideoPlayer({ src, poster, label }: { src: string; poster?: string; label?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [full, setFull] = useState(false);
  const [idle, setIdle] = useState(false);

  /* timeupdate only fires a few times a second, which makes the bar step;
     follow the frame rate while playing instead. */
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      setTime(videoRef.current?.currentTime ?? 0);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  useEffect(() => {
    const onChange = () => setFull(document.fullscreenElement === wrapRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      clearTimeout(idleTimer.current);
    };
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const toggleMute = () => setMuted((m) => !m);

  const toggleFull = () => {
    const wrap = wrapRef.current;
    const v = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (wrap?.requestFullscreen) wrap.requestFullscreen().catch(() => {});
    /* iPhone Safari only lets the <video> itself go fullscreen, with its own UI. */
    else v?.webkitEnterFullscreen?.();
  };

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.target as HTMLElement).closest?.(INTERACTIVE)) return;
      const key = e.key.toLowerCase();
      if (key === " " || key === "k") {
        e.preventDefault();
        toggle();
      } else if (key === "m") toggleMute();
      else if (key === "f") toggleFull();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Any pointer movement brings the controls back; they hide again 2.5s later. */
  const wake = () => {
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), 2500);
  };
  const hidden = playing && idle;

  const seekTo = (t: number) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.currentTime = Math.min(duration, Math.max(0, t));
    setTime(v.currentTime);
  };

  const seekToPointer = (e: PointerEvent<HTMLDivElement>) => {
    const r = barRef.current!.getBoundingClientRect();
    seekTo(((e.clientX - r.left) / r.width) * duration);
  };

  const onBarKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 5, ArrowLeft: -5, ArrowUp: 5, ArrowDown: -5 }[e.key];
    if (step !== undefined) seekTo(time + step);
    else if (e.key === "Home") seekTo(0);
    else if (e.key === "End") seekTo(duration);
    else return;
    e.preventDefault();
    e.stopPropagation();
  };

  const pct = duration ? (time / duration) * 100 : 0;

  return (
    <div
      ref={wrapRef}
      onPointerMove={wake}
      onPointerDown={wake}
      onPointerLeave={() => playing && setIdle(true)}
      className={`relative overflow-hidden rounded-lg bg-black [&:fullscreen]:flex [&:fullscreen]:items-center [&:fullscreen]:justify-center [&:fullscreen]:rounded-none ${hidden ? "cursor-none" : ""}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        aria-label={label || undefined}
        autoPlay
        playsInline
        muted={muted}
        onClick={toggle}
        onPlay={() => {
          setPlaying(true);
          wake();
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => !playing && setTime(e.currentTarget.currentTime)}
        className="block max-h-[80vh] max-w-[92vw] cursor-pointer [:fullscreen_&]:max-h-screen [:fullscreen_&]:max-w-[100vw]"
      />

      {/* Paused: a big play button in the middle, like the gallery tiles. */}
      {!playing && (
        <button
          type="button"
          aria-label="Play"
          onClick={toggle}
          className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/40 backdrop-blur-md transition-transform duration-300 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Play size={26} fill="currentColor" className="ml-1" />
        </button>
      )}

      <div
        data-controls
        className={`absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-12 transition-opacity duration-300 sm:px-4 ${
          hidden ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <div
          ref={barRef}
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            seekToPointer(e);
          }}
          onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && seekToPointer(e)}
          onKeyDown={onBarKey}
          className="group/bar relative flex h-4 cursor-pointer touch-none items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/25 transition-[height] duration-200 group-hover/bar:h-1.5">
            <div className="h-full bg-white" style={{ width: `${pct}%` }} />
          </div>
          <div
            className="absolute h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-white opacity-0 shadow transition-opacity group-hover/bar:opacity-100 group-focus-visible/bar:opacity-100"
            style={{ left: `${pct}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <button type="button" aria-label={playing ? "Pause" : "Play"} onClick={toggle} className={BUTTON}>
            {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
          </button>
          <button type="button" aria-label={muted ? "Unmute" : "Mute"} onClick={toggleMute} className={BUTTON}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <span className="ml-1 text-xs tabular-nums text-white/85">
            {fmt(time)} / {fmt(duration)}
          </span>
          <button
            type="button"
            aria-label={full ? "Exit fullscreen" : "Fullscreen"}
            onClick={toggleFull}
            className={`${BUTTON} ml-auto`}
          >
            {full ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
