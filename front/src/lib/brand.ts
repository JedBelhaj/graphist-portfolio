/* ---------- Brand tokens ---------- */
export const FONT_DISPLAY = "Vastagogrotesk, Arial, sans-serif";
export const FONT_SCRIPT = '"Supfonts Desmontilles", Arial, sans-serif';
export const FONT_BODY = '"Acumin Variable Concept", Arial, sans-serif';

export const INK = "rgb(10,11,16)";
export const PINK = "rgb(255,95,130)";
export const LAVENDER = "rgb(217,173,255)";
export const PURPLE = "rgb(167,68,255)";
export const TEAL = "rgb(0,192,179)";
export const PINK_LIGHT = "rgb(255,194,207)";

/* ---------- Assets ---------- */
export const A = (id: string, gen: string, ext = "png") =>
  `https://storage.googleapis.com/download/storage/v1/b/prd-shared-services.firebasestorage.app/o/h2m-assets%2F${id}.${ext}?generation=${gen}&alt=media`;
