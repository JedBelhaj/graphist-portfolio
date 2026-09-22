/* ---------- Brand identity ----------
   Single source of truth for the name, contact details and handles.
   Everything marked MOCK is placeholder — swap before launch. */
export const BRAND = {
  name: "Soltani Media & Marketing",
  short: "Soltani Media",
  founder: "Soltani",
  domain: "soltanimedia.co", // MOCK
  email: "hello@soltanimedia.co", // MOCK
  linkedin: "https://www.linkedin.com/company/soltani-media", // MOCK
  instagram: "https://www.instagram.com/soltanimedia", // MOCK
  year: 2026,
} as const;

/* ---------- Brand tokens ---------- */
export const FONT_DISPLAY = "Vastagogrotesk, Arial, sans-serif";
export const FONT_SCRIPT = '"Supfonts Desmontilles", Arial, sans-serif';
export const FONT_BODY = '"Acumin Variable Concept", Arial, sans-serif';

export const INK = "rgb(10,11,16)";
export const LAVENDER = "rgb(217,173,255)";
export const PURPLE = "rgb(167,68,255)";
export const TEAL = "rgb(0,192,179)";

/* ---------- Accent ----------
   Replaces the original hot pink, which fought the purple for attention and
   read candy rather than studio. Three weights, and only one of them is for
   type: ACCENT clears 4.4:1 on white, so it is safe for the large accent lines
   it is used on. TINT and WASH are surface colours — putting body copy on them
   at these luminances would fail contrast, so don't. */
export const ACCENT = "rgb(124,92,252)";
export const ACCENT_TINT = "rgb(214,205,255)";
export const ACCENT_WASH = "rgb(238,234,255)";

/* ---------- Assets ---------- */
export const A = (id: string, gen: string, ext = "png") =>
  `https://storage.googleapis.com/download/storage/v1/b/prd-shared-services.firebasestorage.app/o/h2m-assets%2F${id}.${ext}?generation=${gen}&alt=media`;

/* Stand-in photography. Seeded, so each slot stays on the same image between
   reloads. Replace with real shoots from the Soltani library. */
export const MOCK_PHOTO = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

/* Stand-in client headshots for the testimonial cards. */
export const MOCK_AVATAR = (seed: string) => `https://i.pravatar.cc/160?u=${seed}`;
