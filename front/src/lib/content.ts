import {
  A,
  ACCENT,
  ACCENT_TINT,
  INK,
  LAVENDER,
  MOCK_AVATAR,
  MOCK_PHOTO,
  PURPLE,
  TEAL,
} from "./brand";

/* Decorative mark kept from the original design system. */
export const HERO_ARROW = A(
  "ae47034d3c2b6f9b629d235e7ce626d32a566e5d",
  "1789909498683619",
  "svg",
);

/* ---------- Real assets (front/public) ---------- */
/* Circular SM badge: big in About, and the marquee separator. */
export const LOGO_MARK = "/logo.png";

/* Transparent cut-out, 1152x2048. The subject sits in the bottom ~80% of the
   frame; the top 19.7% is empty, which the layouts below account for. */
export const HERO_PHOTO = "/hero.png";
export const SERVICES_PHOTO = "/hero.png";

export const PHOTOSHOP = "/adobe-photoshop-icon.png";
export const PREMIERE = "/adobe-premiere-pro-icon.png";
export const AFTER_EFFECTS = "/adobe-after-effects-icon.png";

/* ---------- Photography (MOCK) ---------- */
export const STUDIO_PHOTO = MOCK_PHOTO("soltani-onset", 900, 1050);
export const FOUNDER_PORTRAIT = MOCK_PHOTO("soltani-founder", 640, 720);

/* Positions are tuned to the cut-out's silhouette: the head occupies x 45-75%
   from y 20-35%, the body x 10-85% below that. Anything that clips the subject
   tucks behind it, since the photo carries a higher z-index. */
/* The burst is drawn by HeroBurst.tsx rather than loaded, so only its placement
   lives here — same tuned position the remote asset used to sit at. */
export const HERO_BURST_CLS = "w-16 sm:w-20 lg:w-28 top-[10%] right-[0%]";

/* Array order is the pop-in order — Hero.tsx staggers off the index, so moving
   an entry retimes it without touching its position, which rides on `cls`.
   Google AdSense sits last on purpose: it lands the sequence on the marketing
   side of the kit rather than another Adobe app. */
export const HERO_STICKERS = [
  { id: PHOTOSHOP, cls: "w-14 lg:w-[96px] left-[30%] top-[4%]" },
  { id: AFTER_EFFECTS, cls: "w-14 lg:w-[96px] left-[6%] top-[15%]" },
  { id: PREMIERE, cls: "w-12 lg:w-[80px] left-[-6%] top-[35%]" },
  {
    id: A(
      "feb195c82de9f8e8a5a03ccf6feefe3f9f33277c",
      "1789909498674904",
      "svg",
    ),
    cls: "w-12 lg:w-[80px] left-[-5%] top-[55%]",
  },
];

/* Colour order is deliberate — it sets the rhythm of the bubble cluster. */
export const SERVICES = [
  { label: "Brand Photography", bg: ACCENT, fg: "rgb(254,254,254)" },
  { label: "Video Production", bg: LAVENDER, fg: INK },
  { label: "Reels & Short-Form Editing", bg: PURPLE, fg: "rgb(254,254,254)" },
  { label: "Social Media Strategy", bg: TEAL, fg: "#fff" },
  { label: "Paid Ads & Creative Testing", bg: PURPLE, fg: "rgb(254,254,254)" },
  { label: "Brand Storytelling", bg: TEAL, fg: "rgb(254,254,254)" },
  { label: "Product & Menu Photography", bg: ACCENT_TINT, fg: INK },
  { label: "Social Media Content", bg: LAVENDER, fg: INK },
  { label: "Event & Venue Coverage", bg: ACCENT, fg: "rgb(254,254,254)" },
  { label: "Email Marketing & Automation", bg: PURPLE, fg: "rgb(254,254,254)" },
  { label: "Reporting & Analytics", bg: ACCENT_TINT, fg: INK },
];

export const TOOLBOX = [
  A("6dda1d55e1edd24f8e8b7263a69d2a7d2df3ac43", "1789909498771927", "svg"),
  A("d38c31018c606d20f2dcfc13f9aa6fd0f5d9a30a", "1789909498817571", "svg"),
  A("ccddafeee887321cad7ca56d5f194d62ab2db49d", "1789909498815883", "svg"),
  A("34e1708d8ca04800513036b8863dd4b78de2ba9d", "1789909498820724", "svg"),
  A("85768e3a65404cb9c5abde92cd5d02c9a13e574d", "1789909498819935", "svg"),
  A("8af38476fe7dec33409f061d249565f929de1896", "1789909498819401", "svg"),
  A("d3e00aca30ddff4029550347b4446aa0a44d7870", "1789909498828438", "svg"),
];

/* MOCK gallery — seven slots matching the grid spans in Work.tsx. */
export const WORK_IMAGES = [
  MOCK_PHOTO("soltani-work-1", 900, 600),
  MOCK_PHOTO("soltani-work-2", 900, 600),
  MOCK_PHOTO("soltani-work-3", 700, 700),
  MOCK_PHOTO("soltani-work-4", 700, 700),
  MOCK_PHOTO("soltani-work-5", 700, 700),
  MOCK_PHOTO("soltani-work-6", 900, 600),
  MOCK_PHOTO("soltani-work-7", 900, 600),
];

export const WORK_TABS = [
  "Photography",
  "Video & Motion",
  "Social Content & Campaigns",
];

/* ---------- Client logos ----------
   Real marks from public/logos. The source files are wildly inconsistent:
   four formats, aspect ratios from 0.6:1 to 3.6:1, and artwork that runs from
   near-black (Eclectic, Leadfox) to pure white (FCBB, Tyler's). TrustedBy
   flattens all of it to one ink silhouette with a brightness(0) filter, so the
   original colour is irrelevant — what makes that safe is that every one of
   these files has a transparent background. A logo with a baked-in background
   would come through as a solid black slab, so check before adding one.

   `cap` is a per-logo height ceiling. A single shared height would leave the
   near-square and portrait marks towering over the wide wordmarks, so each is
   tuned for equal optical mass rather than equal measured height.

   The leadfox filename contains a space, hence the %20 — the file is left
   named as delivered rather than renamed. */
export const CLIENT_LOGOS: { name: string; src: string; cap: string }[] = [
  {
    name: "Eclectic Creative & Co",
    src: "/logos/6893857a2382a9206011c316_3f4523b58e85c71272303ee2baceb340e9ce79ac.png",
    cap: "max-h-9",
  },
  { name: "Tyler's", src: "/logos/tylers-logo.png", cap: "max-h-14" },
  { name: "Leadfox", src: "/logos/leadfox%20logo.svg", cap: "max-h-9" },
  { name: "P4M", src: "/logos/logo-p4m.webp", cap: "max-h-16" },
  { name: "F45", src: "/logos/F45-logo-desktop.svg", cap: "max-h-11" },
  {
    name: "FCBB",
    src: "/logos/FCBB+Logo+(White)-399w.webp",
    cap: "max-h-8",
  },
  {
    name: "Lumeniri",
    src: "/logos/Lumeniri_Header_Soft_Chambray.webp",
    cap: "max-h-12",
  },
  /* TODO: name unknown — the filename is a UUID and the artwork could not be
     read here. Fill in before launch; it currently ships with generic alt. */
  {
    name: "Client",
    src: "/logos/All_White_BG_1cc381bb-e8c1-474a-8d75-793d0e889f86.avif",
    cap: "max-h-9",
  },
];

/* ---------- Videography (MOCK) ----------
   Nine stills, which is one full repeat of the span pattern in Videography.tsx.
   Add or remove in nines or the mosaic's bottom row stops sitting flush.
   Source dimensions barely matter — every tile is object-cover cropped. */
export const VIDEO_TILES = [
  MOCK_PHOTO("soltani-video-1", 1200, 900),
  MOCK_PHOTO("soltani-video-2", 1200, 900),
  MOCK_PHOTO("soltani-video-3", 1200, 900),
  MOCK_PHOTO("soltani-video-4", 1200, 900),
  MOCK_PHOTO("soltani-video-5", 1200, 900),
  MOCK_PHOTO("soltani-video-6", 1200, 900),
  MOCK_PHOTO("soltani-video-7", 1200, 900),
  MOCK_PHOTO("soltani-video-8", 1200, 900),
  MOCK_PHOTO("soltani-video-9", 1200, 900),
];

export const VIDEO_CAPABILITIES = [
  {
    title: "Brand films",
    body: "The three-minute piece that explains who you are, cut so people actually finish it.",
  },
  {
    title: "Short-form verticals",
    body: "One shoot day, forty verticals. Hooked in the first second, captioned, sized per platform.",
  },
  {
    title: "Event & venue coverage",
    body: "Run-of-show capture that leaves you with a recap film and a month of clips, not a hard drive.",
  },
];

export const VIDEO_STATS = [
  { figure: "120+", label: "Projects delivered" },
  { figure: "6K", label: "Capture standard" },
  { figure: "72h", label: "Typical first cut" },
];

/* ---------- Photography grid (MOCK) ----------
   Nine frames, one full repeat of the span pattern in Photography.tsx. Same
   rule as the video mosaic: add in nines to keep the bottom row flush. */
export const PHOTO_TILES = [
  MOCK_PHOTO("soltani-photo-1", 1200, 900),
  MOCK_PHOTO("soltani-photo-2", 1200, 900),
  MOCK_PHOTO("soltani-photo-3", 1200, 900),
  MOCK_PHOTO("soltani-photo-4", 1200, 900),
  MOCK_PHOTO("soltani-photo-5", 1200, 900),
  MOCK_PHOTO("soltani-photo-6", 1200, 900),
  MOCK_PHOTO("soltani-photo-7", 1200, 900),
  MOCK_PHOTO("soltani-photo-8", 1200, 900),
  MOCK_PHOTO("soltani-photo-9", 1200, 900),
];

export const PHOTO_DISCIPLINES = [
  "Brand & campaign",
  "Product & menu",
  "Portrait & team",
  "Event & venue",
];

/* ---------- Team (MOCK) ---------- */
export const TEAM = [
  {
    name: "Soltani",
    role: "Founder & Director of Photography",
    focus: "Stills, lighting, and the final say on the grade.",
    photo: MOCK_PHOTO("soltani-team-lead", 640, 800),
  },
  {
    name: "Nadia",
    role: "Head of Strategy",
    focus: "Turns one shoot day into a quarter of posts that perform.",
    photo: MOCK_PHOTO("soltani-team-strategy", 640, 800),
  },
  {
    name: "Omar",
    role: "Editor & Motion",
    focus: "Cuts the long form, then the forty verticals hiding inside it.",
    photo: MOCK_PHOTO("soltani-team-editor", 640, 800),
  },
  {
    name: "Lina",
    role: "Producer",
    focus: "Locations, permits, call sheets — the reason days run on time.",
    photo: MOCK_PHOTO("soltani-team-producer", 640, 800),
  },
];

export type Testimonial = {
  quote: string;
  name: string | null;
  handle: string | null;
  avatar: string | null;
  tag: string | null;
};

/* MOCK testimonials — replace once consent is collected (see docs/problems.md). */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Soltani Media is the rare shop that can shoot the thing and then tell you what to do with it. We came in expecting a photographer and left with a quarter's worth of content, a posting calendar, and an ad set that finally beat our old control. Two people delivered what our last agency needed six to half-do.",
    name: null,
    handle: null,
    avatar: null,
    tag: null,
  },
  {
    quote:
      "We booked one menu shoot and ended up handing over the whole content side. The photos were the easy part — what actually moved the needle was Soltani rebuilding how we post and turning the shoot into eight weeks of reels. Delivery day for delivery day, our online orders are up and I stopped dreading the content calendar. He's organised, fast, and he shows up with a plan instead of a mood board.",
    name: "Yasmine",
    handle: "@cafenomad",
    avatar: MOCK_AVATAR("yasmine"),
    tag: "Owner | Cafe Nomad",
  },
  {
    quote:
      "We've worked with Soltani across two product launches now. He handles the shoot, the edit, and the paid creative, which means nothing gets lost in translation between three different vendors. He'll also tell you straight when an idea won't perform — that honesty saved us a whole campaign budget last spring. Can't recommend the studio enough.",
    name: "Karim",
    handle: "@atlasoutfitters",
    avatar: MOCK_AVATAR("karim"),
    tag: "Founder | Atlas Outfitters",
  },
];

export const NAV = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Video", href: "#videography" },
  { label: "Photo", href: "#photography" },
  { label: "Work", href: "#work" },
  { label: "Team", href: "#team" },
];
