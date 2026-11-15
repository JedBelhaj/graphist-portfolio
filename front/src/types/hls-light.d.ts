/* hls.js's smaller build (no subtitles, alternate audio or DRM, none of which
   the site uses) ships without its own types; its API is the full build's. */
declare module "hls.js/light" {
  export { default } from "hls.js";
}
