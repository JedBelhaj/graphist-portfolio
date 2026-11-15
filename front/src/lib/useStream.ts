"use client";

import { useEffect, type RefObject } from "react";
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

/* Puts `url` on the <video>. A plain file goes straight into src. An HLS
   stream (Mux) plays natively on Apple's browsers and through hls.js
   everywhere else; hls.js is only downloaded the first time a stream is
   needed. Changing `url` to undefined, or unmounting, stops the download and
   frees what was buffered. */
export function useStream(ref: RefObject<HTMLVideoElement | null>, url: string | undefined) {
  useEffect(() => {
    const video = ref.current;
    if (!video || !url) return;

    let hls: Hls | undefined;
    let cancelled = false;

    if (!isHls(url) || playsHlsItself(video)) {
      video.src = url;
    } else {
      import("hls.js/light").then(({ default: HlsJs }) => {
        if (cancelled) return;
        if (!HlsJs.isSupported()) {
          video.src = url;
          return;
        }
        /* Never fetch a size bigger than the element shows. */
        const h = new HlsJs({ capLevelToPlayerSize: true });
        h.loadSource(url);
        h.attachMedia(video);
        hls = h;
      });
    }

    return () => {
      cancelled = true;
      hls?.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [ref, url]);
}
