/* Mux URLs for a video's playback ID (set by the studio's Mux field).

   The gallery tiles loop only the first PREVIEW_SECONDS, capped at 720p, so a
   page of tiles costs a few hundred KB each instead of whole films. Mux cuts
   the clip on its side ("instant clipping", no extra charge), but only to the
   nearest segment, so the tile also jumps back at PREVIEW_SECONDS itself.
   The Lightbox streams the full film, in the size that suits the connection. */
export const PREVIEW_SECONDS = 4;

export const muxPreview = (id: string) =>
  `https://stream.mux.com/${id}.m3u8?asset_start_time=0&asset_end_time=${PREVIEW_SECONDS}&max_resolution=720p`;

export const muxFilm = (id: string) => `https://stream.mux.com/${id}.m3u8`;

/* The first frame, matching where the preview starts. */
export const muxStill = (id: string, width: number) => `https://image.mux.com/${id}/thumbnail.webp?time=0&width=${width}`;
