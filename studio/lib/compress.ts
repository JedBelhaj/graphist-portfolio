/* Shrinks videos on this computer before they go to Sanity, using the browser's
   own video encoder through Mediabunny, which only loads when a video is
   compressed. Every video upload in the studio goes through prepareVideo: Bulk
   add, the Google Drive picker, and a file field's Upload button or drag and
   drop. scripts/bulk-upload.ts does the same with ffmpeg.

   Each video aims for at most 1080p and SIZE_LIMIT, lowering quality to fit but
   never below MIN_BITRATE. A video too long to fit that way can be cut to its
   first seconds: with the setting beside the compression switch, or by answering
   the popup (assetSources/compressedUpload.tsx) when a single video is uploaded.

   Settings were chosen on the site's real clips: at 6 Mbps, 1080p, a 52 MB 4K
   clip became 8 MB (VMAF 93.5) and a 128 MB one 81 MB (VMAF 96.8). */
import { useSyncExternalStore } from "react";

/* What the site's loop clips are meant to stay under. */
export const SIZE_LIMIT = 15 * 1024 * 1024;
/* Encoders drift from the bitrate they're given, so aim a little under. */
const SIZE_MARGIN = 0.95;
/* Vertical 1080×1920 and landscape 1920×1080 both fit. */
const MAX_LONG_EDGE = 1920;
const FULL_HD_PIXELS = 1920 * 1080;
const FULL_HD_BITRATE = 6_000_000;
const MIN_BITRATE = 1_500_000;
const AUDIO_BITRATE = 192_000;
/* Re-encoding always loses some quality, so it has to save at least this much
   (a clip already encoded efficiently is better left alone). */
const WORTHWHILE = 0.8;
/* The finished file is held in memory until it's complete. */
const MAX_OUTPUT = 1024 * 1024 * 1024;
/* A video that can't be compressed still uploads, unless it's bigger than this. */
const UNCOMPRESSED_LIMIT = 200 * 1024 * 1024;
/* Safe to keep as they are. HEVC isn't here: not every browser can play it. */
const WEB_CODECS = ["avc", "vp9", "av1"];

export const COMPRESSION_LABEL = "Compress videos before uploading (recommended)";

export const formatMb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

export function formatDuration(seconds: number) {
  const whole = Math.round(seconds);
  const minutes = Math.floor(whole / 60);
  return minutes ? `${minutes} min ${whole % 60} s` : `${whole} s`;
}

/* The settings, shared by every upload route. Reset each time the studio loads,
   so turning compression off or cutting for one upload doesn't quietly stick. */
let enabled = true;
export type CutSetting = { on: boolean; seconds: number };
let cut: CutSetting = { on: false, seconds: 15 };

const listeners = new Set<() => void>();
const changed = () => listeners.forEach((fn) => fn());
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export function setCompressionEnabled(on: boolean) {
  enabled = on;
  changed();
}

export function useCompressionEnabled() {
  return useSyncExternalStore(subscribe, () => enabled);
}

export const isCompressionEnabled = () => enabled;

export function setCutSetting(patch: Partial<CutSetting>) {
  cut = { ...cut, ...patch };
  changed();
}

export function useCutSetting() {
  return useSyncExternalStore(subscribe, () => cut);
}

/* Thrown when the person chooses "Cancel upload" in the popup. */
export class CompressionCancelled extends Error {
  constructor() {
    super("Upload cancelled.");
  }
}

export type VideoSource = { width: number; height: number; codec: string | null; size: number; hasAudio: boolean };

/* How to encode this many seconds of a video, and what would come out. `keep`
   means the original is better left as it is, `fits` that it can get under
   SIZE_LIMIT without going below MIN_BITRATE. */
export function planVideo(source: VideoSource, seconds: number, cutting = false) {
  const scale = Math.min(1, MAX_LONG_EDGE / Math.max(source.width, source.height));
  /* H.264 needs even dimensions. */
  const width = Math.round((source.width * scale) / 2) * 2;
  const height = Math.round((source.height * scale) / 2) * 2;
  const normal = Math.max(MIN_BITRATE, Math.round((FULL_HD_BITRATE * (width * height)) / FULL_HD_PIXELS));
  const audio = source.hasAudio ? AUDIO_BITRATE : 0;
  const budget = Math.round((SIZE_LIMIT * SIZE_MARGIN * 8) / seconds - audio);
  const bitrate = Math.max(MIN_BITRATE, Math.min(normal, budget));
  const bytes = (seconds * (bitrate + audio)) / 8;
  const playable = WEB_CODECS.includes(source.codec ?? "");
  return {
    width,
    height,
    bitrate,
    bytes,
    playable,
    fits: budget >= MIN_BITRATE,
    lowered: bitrate < normal,
    keep: !cutting && scale === 1 && playable && source.size <= SIZE_LIMIT && bytes >= source.size * WORTHWHILE,
  };
}

/* The popup's queue: the first request is on screen, assetSources/compressedUpload
   renders it and answers it. */
export type CutAnswer = number | "keep" | "cancel";
export type CutRequest = {
  id: number;
  name: string;
  duration: number;
  defaultSeconds: number;
  estimate: (seconds: number) => { bytes: number; lowered: boolean };
  answer: (answer: CutAnswer) => void;
};
let cutRequests: CutRequest[] = [];
let cutRequestId = 0;

export function useCutRequest() {
  return useSyncExternalStore(subscribe, () => cutRequests[0] ?? null);
}

function askToCut(details: Omit<CutRequest, "id" | "answer">, signal?: AbortSignal) {
  return new Promise<CutAnswer>((resolve, reject) => {
    const request: CutRequest = {
      ...details,
      id: ++cutRequestId,
      answer: (answer) => {
        close();
        resolve(answer);
      },
    };
    const onAbort = () => {
      close();
      reject(signal?.reason);
    };
    const close = () => {
      signal?.removeEventListener("abort", onAbort);
      cutRequests = cutRequests.filter((r) => r !== request);
      changed();
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    cutRequests = [...cutRequests, request];
    changed();
  });
}

type Options = {
  onProgress?: (fraction: number) => void;
  signal?: AbortSignal;
  /* Show the popup if the video can't fit. Off for batches, where the list just
     says so, rather than one popup per long video. */
  ask?: boolean;
};

type Compressed = { file: File; cutTo?: number; lowered?: boolean };

/* An MP4 of at most 1080p, or the same file if compressing isn't worth it. */
async function compress(file: File, { onProgress, signal, ask }: Options): Promise<Compressed> {
  const { ALL_FORMATS, BlobSource, BufferTarget, Conversion, Input, Mp4OutputFormat, Output, Quality, canEncodeAudio } =
    await import("mediabunny");

  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  const video = await input.getPrimaryVideoTrack();
  if (!video) throw new Error("no video track found");
  const audio = await input.getPrimaryAudioTrack();

  if (video.codec === "prores") {
    const { registerProresDecoder } = await import("@mediabunny/prores");
    registerProresDecoder();
  }
  if (audio && audio.codec !== "aac" && !(await canEncodeAudio("aac"))) {
    const { registerAacEncoder } = await import("@mediabunny/aac-encoder");
    registerAacEncoder();
  }

  const source: VideoSource = {
    width: await video.getDisplayWidth(),
    height: await video.getDisplayHeight(),
    codec: video.codec,
    size: file.size,
    hasAudio: Boolean(audio),
  };
  const duration = await input.computeDuration();

  let seconds = cut.on ? Math.min(cut.seconds, duration) : duration;
  if (!cut.on && ask && !planVideo(source, duration).fits) {
    const answer = await askToCut(
      {
        name: file.name,
        duration,
        defaultSeconds: cut.seconds,
        estimate: (s) => planVideo(source, s, true),
      },
      signal,
    );
    if (answer === "cancel") throw new CompressionCancelled();
    if (answer !== "keep") seconds = Math.min(answer, duration);
  }
  const cutting = seconds < duration;

  const plan = planVideo(source, seconds, cutting);
  if (plan.keep) return { file };
  if (plan.bytes > MAX_OUTPUT) throw new Error("it's too long to compress in the browser");

  const output = new Output({ format: new Mp4OutputFormat({ fastStart: "in-memory" }), target: new BufferTarget() });
  const conversion = await Conversion.init({
    input,
    output,
    video: {
      codec: "avc",
      width: plan.width,
      height: plan.height,
      fit: "fill",
      quality: new Quality({ bitrate: plan.bitrate }),
    },
    /* Audio that's already AAC is copied as it is. */
    audio: { codec: "aac" },
    ...(cutting ? { trim: { start: 0, end: seconds } } : {}),
  });
  const lost = conversion.discardedTracks.find((d) => d.track === video || d.track === audio);
  if (lost || !conversion.isValid) {
    throw new Error(`this browser can't process its ${lost?.track === audio ? "audio" : "video"} format`);
  }

  conversion.onProgress = (fraction) => onProgress?.(fraction);
  const cancel = () => void conversion.cancel();
  signal?.addEventListener("abort", cancel, { once: true });
  try {
    signal?.throwIfAborted();
    await conversion.execute();
  } finally {
    signal?.removeEventListener("abort", cancel);
  }

  const buffer = output.target.buffer;
  if (!buffer) throw new Error("the compressed file came out empty");
  const notWorthIt = buffer.byteLength >= file.size || (file.size <= SIZE_LIMIT && buffer.byteLength >= file.size * WORTHWHILE);
  if (plan.playable && !cutting && notWorthIt) return { file };
  return {
    file: new File([buffer], `${file.name.replace(/\.[^.]+$/, "")}.mp4`, { type: "video/mp4" }),
    cutTo: cutting ? seconds : undefined,
    lowered: plan.lowered,
  };
}

export type Prepared = {
  file: File;
  /* What happened, for the person uploading. */
  note?: string;
  /* Set when what's being uploaded isn't what it should be: compressing failed,
     or the result is still over SIZE_LIMIT. */
  warning?: string;
};

const OVER_LIMIT = `over the ${SIZE_LIMIT / 1024 / 1024} MB limit for loop clips`;

/* What to actually upload for this file. Anything that isn't a video, or any
   file while the switch is off, passes straight through. */
export async function prepareVideo(file: File, options: Options = {}): Promise<Prepared> {
  if (!enabled || !file.type.startsWith("video/")) return { file };
  try {
    const result = await compress(file, options);
    if (result.file === file) {
      return file.size > SIZE_LIMIT
        ? { file, warning: `${file.name} couldn't get any smaller: at ${formatMb(file.size)} it's ${OVER_LIMIT}.` }
        : { file, note: "already well compressed, kept as it is" };
    }
    const done = [
      result.cutTo && `cut to the first ${result.cutTo} s`,
      `compressed ${formatMb(file.size)} → ${formatMb(result.file.size)}`,
    ]
      .filter(Boolean)
      .join(", ");
    return result.file.size > SIZE_LIMIT
      ? { file: result.file, warning: `${file.name}: ${done}, still ${OVER_LIMIT}. Cut it shorter, or use a YouTube or Vimeo link.` }
      : { file: result.file, note: result.lowered ? `${done} (lower quality, to fit the limit)` : done };
  } catch (err) {
    if (options.signal?.aborted || err instanceof CompressionCancelled) throw err;
    const reason = err instanceof Error ? err.message : String(err);
    if (file.size > UNCOMPRESSED_LIMIT) {
      throw new Error(
        `Couldn't compress ${file.name} (${reason}), and at ${formatMb(file.size)} it's too big to upload as it is. ` +
          "Export it as an H.264 MP4, or turn compression off to upload it anyway.",
      );
    }
    return { file, warning: `Couldn't compress ${file.name} (${reason}), so the original was uploaded.` };
  }
}
