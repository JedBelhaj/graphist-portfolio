"use client";

import { useEffect, type RefObject } from "react";
import type Hls from "hls.js";

const isHls = (url: string) => /\.m3u8(\?|$)/.test(url);

/* Puts `url` on the <video>. A plain file goes straight into src. An HLS
   stream (Mux) plays natively where the browser can (Safari, iOS), and
   through hls.js elsewhere; hls.js is only downloaded the first time a
   stream is needed. Changing `url` to undefined, or unmounting, stops the
   download and frees what was buffered. */
export function useStream(ref: RefObject<HTMLVideoElement | null>, url: string | undefined) {
  useEffect(() => {
    const video = ref.current;
    if (!video || !url) return;

    let hls: Hls | undefined;
    let cancelled = false;

    if (!isHls(url) || video.canPlayType("application/vnd.apple.mpegurl")) {
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
