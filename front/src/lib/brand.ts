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
  facebook: "https://www.facebook.com/soltanimedia", // MOCK
  year: 2026,
} as const;

/* ---------- Brand tokens ----------
   Same values as the Tailwind colours in globals.css (bg-ink, text-brand,
   bg-tint, bg-wash) — keep the two in step. These constants are for the
   places that need a colour in JS, like SVG fills. */
export const FONT_DISPLAY = 'var(--nf-display), "Arial Black", sans-serif';
export const FONT_SCRIPT = '"Supfonts Desmontilles", cursive';
export const FONT_BODY = "var(--nf-body), Arial, sans-serif";
export const FONT_MONO = "var(--nf-mono), ui-monospace, monospace";

export const INK = "rgb(10,11,16)";

/* ---------- Accent ----------
   The one purple on the site. Three weights, and only one of them is for
   type: ACCENT clears 4.4:1 on white, so it is safe for large accent lines
   and labels. TINT and WASH are surface colours — putting body copy on them
   at these luminances would fail contrast, so don't. */
export const ACCENT = "rgb(124,92,252)";
export const ACCENT_TINT = "rgb(214,205,255)";
export const ACCENT_WASH = "rgb(238,234,255)";

/* ---------- Assets ---------- */
/* Stand-in photography. Seeded, so each slot stays on the same image between
   reloads. Replace with real shoots from the Soltani library. */
export const MOCK_PHOTO = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

/* Stand-in client headshots for the testimonial cards. */
export const MOCK_AVATAR = (seed: string) => `https://i.pravatar.cc/160?u=${seed}`;
