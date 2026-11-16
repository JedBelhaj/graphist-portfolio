"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import type Hls from "hls.js";

const HLS = "application/vnd.apple.mpegurl";
const isHls = (url: string) => /\.m3u8(\?|$)/.test(url);

/* Only Apple's browsers (Safari, and every iPhone browser, which all run on
   Safari's engine) get the stream handed over directly. Chrome on Android
   also answers "maybe" to canPlayType for HLS, but then plays nothing, so
   anything with "Android" or a desktop "Chrome/" in its user agent goes
   through hls.js instead. iPhone Chrome says "CriOS", so it stays native. */
const playsHlsItself = (video: HTMLVideoElement) =>
  Boolean(video.canPlayType(HLS)) && !/Android|Chrome\//i.test(navigator.userAgent);

/* How often a stream that has stopped is restarted before giving up, waiting
   1s, 2s, 3s between tries. hls.js already retries single segments on its
   own; these cover what it gives up on: the playlist not arriving, a run of
   lost segments on a bad connection, a decoding hiccup. */
const NET_RETRIES = 3;
const MEDIA_RETRIES = 2;

type Options = {
  /* Pick the size for the element's on-screen size alone, not × the screen's
     pixel density: for the gallery loops on phones, where a small tile on a
     3× screen would otherwise pull the 720p stream, several at once. */
  light?: boolean;
  /* Start playing (with sound) as soon as the stream is attached. */
  autoplay?: boolean;
};

/* Puts `url` on the <video>. A plain file goes straight into src. An HLS
   stream (Mux) plays natively on Apple's browsers and through hls.js
   everywhere else; hls.js is only downloaded the first time a stream is
   needed. Changing `url` to undefined, or unmounting, stops the download and
   frees what was buffered.

   Returns:
   - `failed`: every restart failed; `retry()` starts over from scratch.
   - `blocked`: autoplay was refused (iPhones refuse sound without a tap);
     the video is fine and plays on a tap. */
export function useStream(
  ref: RefObject<HTMLVideoElement | null>,
  url: string | undefined,
  { light = false, autoplay = false }: Options = {},
) {
  const [attempt, setAttempt] = useState(0);
  const [failedAt, setFailedAt] = useState<string>();
  const [blockedAt, setBlockedAt] = useState<string>();
  const key = url ? `${attempt}:${url}` : undefined;

  useEffect(() => {
    const video = ref.current;
    if (!video || !url) return;
    const at = `${attempt}:${url}`;

    let hls: Hls | undefined;
    let cancelled = false;
    let timer = 0;

    const fail = () => {
      if (!cancelled) setFailedAt(at);
    };
    const play = () =>
      video.play().catch((e: DOMException) => {
        if (!cancelled && e.name === "NotAllowedError") setBlockedAt(at);
      });
    /* Swapping the source pauses the video; carry on if it was playing (or
       about to: a play() waiting for data counts). */
    const restart = (swap: () => void) => {
      const wasPlaying = !video.paused;
      swap();
      if (wasPlaying) play();
    };

    /* Native playback: on an error, set the source again, a few times. */
    let nativeTries = 0;
    const onNativeError = () => {
      if (nativeTries++ >= NET_RETRIES) return fail();
      const time = video.currentTime;
      timer = window.setTimeout(
        () =>
          restart(() => {
            video.src = url;
            if (time) video.currentTime = time;
          }),
        1000 * nativeTries,
      );
    };
    const native = () => {
      video.addEventListener("error", onNativeError);
      video.src = url;
      if (autoplay) play();
    };

    if (!isHls(url) || playsHlsItself(video)) {
      native();
    } else {
      import("hls.js/light")
        .then(({ default: HlsJs }) => {
          if (cancelled) return;
          if (!HlsJs.isSupported()) return native();

          /* Never fetch a size bigger than the element shows. */
          const h = new HlsJs({ capLevelToPlayerSize: true, ignoreDevicePixelRatio: light });
          let net = 0;
          let media = 0;
          h.on(HlsJs.Events.ERROR, (_, data) => {
            if (!data.fatal) return;
            if (data.type === HlsJs.ErrorTypes.MEDIA_ERROR && media++ < MEDIA_RETRIES) {
              restart(() => h.recoverMediaError());
            } else if (data.type === HlsJs.ErrorTypes.NETWORK_ERROR && net++ < NET_RETRIES) {
              /* No playlist yet: ask for it again. Otherwise pick up the
                 segments where loading stopped. */
              timer = window.setTimeout(
                () => (h.levels.length ? h.startLoad() : restart(() => h.loadSource(url))),
                1000 * net,
              );
            } else {
              fail();
            }
          });
          h.loadSource(url);
          h.attachMedia(video);
          hls = h;
          if (autoplay) play();
        })
        /* hls.js itself didn't download. */
        .catch(fail);
    }

    return () => {
      cancelled = true;
      clearTimeout(timer);
      video.removeEventListener("error", onNativeError);
      hls?.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [ref, url, light, autoplay, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { failed: key !== undefined && failedAt === key, blocked: key !== undefined && blockedAt === key, retry };
}
