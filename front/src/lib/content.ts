import {
  A,
  ACCENT,
  BRAND,
  ACCENT_TINT,
  INK,
  MOCK_AVATAR,
  MOCK_PHOTO,
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

/* Wordmark lockups, cut from public/soltani_logo.png (see Logo.tsx). */
export const LOGO_FULL = "/soltani-logo.png";
export const LOGO_WORDMARK = "/soltani-wordmark.png";

/* Transparent cut-out, 1152x2048. The subject sits in the bottom ~80% of the
   frame; the top 19.7% is empty, which the layouts below account for. */
export const HERO_PHOTO = "/hero.png";

export const PREMIERE = "/adobe-premiere-pro-icon.png";
export const AFTER_EFFECTS = "/adobe-after-effects-icon.png";
export const CAPCUT = "/capcut-icon.png";
export const HIGGSFIELD = "/higgsfield-icon.png";
export const META = "/meta-icon.png";

/* ---------- Photography (MOCK) ---------- */
export const STUDIO_PHOTO = MOCK_PHOTO("soltani-onset", 900, 1050);
export const FOUNDER_PORTRAIT = MOCK_PHOTO("soltani-founder", 640, 720);

/* Positions are tuned to the cut-out's silhouette: the head occupies x 45-75%
   from y 20-35%, the body x 10-85% below that. Anything that clips the subject
   tucks behind it, since the photo carries a higher z-index. */
/* The burst is drawn by HeroBurst.tsx rather than loaded, so only its placement
   lives here — same tuned position the remote asset used to sit at. */
export const HERO_BURST_CLS = "w-16 sm:w-20 lg:w-28 top-[10%] right-[20%]";

/* Array order is the pop-in order and the order the stickers travel in. Meta
   sits last on purpose: it lands the sequence on the marketing side of the kit
   rather than another editing app. */
export const HERO_STICKERS = [PREMIERE, AFTER_EFFECTS, CAPCUT, HIGGSFIELD, META];

/* How the stickers move: "orbit" circles the head on a tilted ring
   (HERO_ORBIT), "stream" flows from behind the head to behind the laptop
   (HERO_STREAM). */
export const HERO_STICKER_MOTION: "orbit" | "stream" = "orbit";

/* The tilted ring the stickers circle the head on (HeroOrbit.tsx). Centre as
   fractions of the photo's width and height; both radii as fractions of its
   width, so the ring keeps its shape at any photo size. `tilt` lifts the right
   end, in degrees. The upper-left half is the far side, where the stickers
   shrink and pass behind the subject; the lower-right half crosses in front
   of the chest. `period` is seconds per lap. */
export const HERO_ORBIT = {
  cx: 0.36,
  cy: 0.37,
  rx: 0.44,
  ry: 0.18,
  tilt: -36,
  period: 20,
};

/* The curve the stickers stream along (HeroStream.tsx): out from behind the
   head, round its left side, and in behind the laptop. A cubic Bézier, every
   point as [x, y] fractions of the photo's width and height so it stays on
   the silhouette at any photo size. `lap` is the seconds one sticker takes
   end to end. */
export const HERO_STREAM = {
  from: [0.48, 0.27],
  c1: [0.22, 0.02],
  c2: [-0.06, 0.42],
  to: [0.29, 0.7],
  lap: 10,
};

/* The four bubble colourways. The CMS stores the key; components get the
   resolved pair. */
export const SERVICE_COLORS = {
  accent: { bg: ACCENT, fg: "rgb(254,254,254)" },
  tint: { bg: ACCENT_TINT, fg: INK },
  ink: { bg: INK, fg: "rgb(254,254,254)" },
  teal: { bg: TEAL, fg: "rgb(254,254,254)" },
} as const;

export type ServiceColor = keyof typeof SERVICE_COLORS;

/* Colour order is deliberate — it sets the rhythm of the bubble cluster. */
export const SERVICES: { label: string; color: ServiceColor }[] = [
  { label: "Brand Photography", color: "accent" },
  { label: "Video Production", color: "tint" },
  { label: "Reels & Short-Form Editing", color: "ink" },
  { label: "Social Media Strategy", color: "teal" },
  { label: "Paid Ads & Creative Testing", color: "ink" },
  { label: "Brand Storytelling", color: "teal" },
  { label: "Product & Menu Photography", color: "tint" },
  { label: "Social Media Content", color: "tint" },
  { label: "Event & Venue Coverage", color: "accent" },
  { label: "Email Marketing & Automation", color: "ink" },
  { label: "Reporting & Analytics", color: "tint" },
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
   Real marks from public/logos/real. The source files are wildly inconsistent:
   five formats, aspect ratios from 0.6:1 to 5.8:1, and artwork that runs from
   near-black (Eclectic, Leadfox) to pure white (FCBB, Tyler's). TrustedBy
   flattens most of it to one ink silhouette with a brightness(0) filter, so the
   original colour is irrelevant — what makes that safe is that every one of
   these files has a transparent background. A logo with a baked-in background
   would come through as a solid black slab, so check before adding one.

   Canimoov and FitLife were delivered as JPGs on a solid background, so they
   point at transparent PNGs cut from those originals (the JPGs are kept).

   `tone: "grayscale"` is for marks whose detail is a light shape on a dark one
   (BSense's white B, Lipfi's illustrated badge) — a silhouette would fill them
   in to a plain blob, so those are desaturated instead.

   `cap` is a per-logo height ceiling. A single shared height would leave the
   near-square and portrait marks towering over the wide wordmarks, so each is
   tuned for equal optical mass rather than equal measured height.

   Filenames with spaces are left as delivered, hence the %20. */
export type ClientLogo = {
  name: string;
  src: string;
  cap: string;
  tone?: "silhouette" | "grayscale";
};

/* The studio's logo "Height" options (in px) and the class each one maps to.
   Written out in full so Tailwind finds and generates every class. */
export const LOGO_CAPS: Record<string, string> = {
  "24": "max-h-6",
  "32": "max-h-8",
  "36": "max-h-9",
  "40": "max-h-10",
  "44": "max-h-11",
  "48": "max-h-12",
  "56": "max-h-14",
  "64": "max-h-16",
};

export const CLIENT_LOGOS: ClientLogo[] = [
  {
    name: "Eclectic Creative & Co",
    src: "/logos/real/6893857a2382a9206011c316_3f4523b58e85c71272303ee2baceb340e9ce79ac.png",
    cap: "max-h-9",
  },
  {
    name: "Bailey Anne Studios",
    src: "/logos/real/BaileyAnneStudios-Whitecrop.webp",
    cap: "max-h-10",
  },
  { name: "Tyler's", src: "/logos/real/tylers-logo.png", cap: "max-h-14" },
  {
    name: "Easy Dental Marketing",
    src: "/logos/real/edm-logo.webp",
    cap: "max-h-12",
  },
  { name: "Leadfox", src: "/logos/real/leadfox%20logo.svg", cap: "max-h-9" },
  {
    name: "BSense",
    src: "/logos/real/bsense-logo.webp",
    cap: "max-h-14",
    tone: "grayscale",
  },
  { name: "P4M", src: "/logos/real/logo-p4m.webp", cap: "max-h-16" },
  { name: "Son & Bear", src: "/logos/real/Asset-4_375x.webp", cap: "max-h-6" },
  { name: "F45", src: "/logos/real/F45-logo-desktop.svg", cap: "max-h-11" },
  { name: "Canimoov", src: "/logos/real/canimoov.png", cap: "max-h-14" },
  {
    name: "FCBB",
    src: "/logos/real/FCBB+Logo+(White)-399w.webp",
    cap: "max-h-8",
  },
  { name: "Reedz", src: "/logos/real/logo-reedz1.png", cap: "max-h-12" },
  {
    name: "Lumeniri",
    src: "/logos/real/Lumeniri_Header_Soft_Chambray.webp",
    cap: "max-h-12",
  },
  { name: "FitLife", src: "/logos/real/fitlife.png", cap: "max-h-14" },
  {
    name: "Lipfi's Barbershop",
    src: "/logos/real/All_White_BG_1cc381bb-e8c1-474a-8d75-793d0e889f86.avif",
    cap: "max-h-10",
    tone: "grayscale",
  },
];

/* ---------- Countries ----------
   California is folded into the US entry rather than listed as its own
   country — it rides along as the note. */
export const COUNTRIES = [
  { code: "US", name: "United States", note: "incl. California" },
  { code: "CA", name: "Canada", note: null },
  { code: "FR", name: "France", note: null },
  { code: "DE", name: "Germany", note: null },
  { code: "LB", name: "Lebanon", note: null },
];

/* ---------- Results (Wall of Love) ----------
   Real client messages from public/results. Filenames are as delivered, so
   encodeURI handles the spaces and the accented é.
   TODO before launch: confirm consent, or crop/blur names and avatars. */
export const RESULTS = [
  {
    src: encodeURI("/results/WhatsApp Image 2026-06-21 at 4.53.50 PM.jpeg"),
    alt: "Client message thanking Lauren and the team for a surprise birthday video that made her cry",
    label: "Surprise birthday film",
  },
  {
    src: encodeURI("/results/Capture d_écran 2026-09-29 200451.png"),
    alt: "Message shouting out Oussama Soltani Photography: Dr. Sydney loved the reel",
    label: "Clinic reel",
  },
  {
    src: encodeURI("/results/WhatsApp Image 2026-09-29 at 12.33.24 AM.jpeg"),
    alt: "Dr. Alex Martin saying the editing on the reel from today is fabulous",
    label: "Same-day reel edit",
  },
];

/* ---------- Packages (MOCK) ----------
   Placeholder tiers and prices — swap in the real offer before launch.
   `featured` gets the highlighted card; keep it to one. */
export const PACKAGES = [
  {
    name: "Starter",
    price: "$750",
    cadence: "/ month",
    pitch: "A steady, good-looking feed without thinking about it.",
    features: [
      "Half-day shoot every month",
      "20 edited photos",
      "4 short-form reels",
      "Monthly content calendar",
    ],
    featured: false,
  },
  {
    name: "Growth",
    price: "$1,800",
    cadence: "/ month",
    pitch: "Content plus the strategy that makes it perform.",
    features: [
      "Full-day shoot every month",
      "40 edited photos",
      "10 short-form reels",
      "Social management on 2 platforms",
      "Paid ad creative & testing",
      "Monthly results report",
    ],
    featured: true,
  },
  {
    name: "Signature",
    price: "Custom",
    cadence: "",
    pitch: "A full production and marketing team, without the hiring.",
    features: [
      "Multi-day productions",
      "Brand film + campaign assets",
      "Every platform, fully managed",
      "Dedicated producer",
      "Quarterly strategy workshop",
    ],
    featured: false,
  },
];

/* ---------- Services page ----------
   `icon` is a key into the icon map in ServiceGroups.tsx. */
export const SERVICE_GROUPS = [
  {
    title: "Photography",
    icon: "camera",
    body: "Stills lit for where they are going — the grid, the menu, the website, the ad set.",
    items: [
      "Brand & campaign",
      "Product & menu",
      "Portrait & team",
      "Event & venue",
    ],
  },
  {
    title: "Video",
    icon: "clapperboard",
    body: "Shot, directed and cut in-house, so the person framing the shot knows where it lands.",
    items: [
      "Brand films",
      "Reels & short-form",
      "Event recaps",
      "Testimonial videos",
    ],
  },
  {
    title: "Social",
    icon: "megaphone",
    body: "A plan for what goes out, when, and why — then the posting, so you don't have to.",
    items: [
      "Strategy & calendar",
      "Content creation",
      "Community management",
      "Reporting",
    ],
  },
  {
    title: "Growth",
    icon: "trending",
    body: "Paid creative built from the same shoot, tested until something beats the control.",
    items: ["Paid ads", "Creative testing", "Email & automation", "Analytics"],
  },
];

/* ---------- FAQ (placeholder) ---------- */
export const FAQS = [
  {
    q: "What kind of businesses do you work with?",
    a: "Placeholder — mostly local businesses, clinics, gyms and restaurants, plus brands that need content every month rather than once.",
  },
  {
    q: "Do you travel for shoots?",
    a: "Placeholder — yes. We've shot across the US, Canada, France, Germany and Lebanon. Travel is quoted separately.",
  },
  {
    q: "How fast do we get the content?",
    a: "Placeholder — first edits usually land within 72 hours of the shoot, with reels on a rolling schedule after that.",
  },
  {
    q: "Can we book a one-off shoot instead of a package?",
    a: "Placeholder — absolutely. Packages are for ongoing work; one-off shoots are quoted per project.",
  },
  {
    q: "Who owns the photos and videos?",
    a: "Placeholder — you do, for your own marketing. The details are in the agreement we send before any shoot.",
  },
  {
    q: "How do we get started?",
    a: "Placeholder — hit “Work with us”, tell us what you need, and we'll set up a short discovery call.",
  },
];

/* ---------- Videography (MOCK) ----------
   Stand-in posters. The first one fronts the Videography card on the Work page
   until a real video is published. */
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

/* ---------- Videography client sections (MOCK) ----------
   One section per client on the Videography page, until the studio has its
   own. VideoSections.tsx draws each photo style; "auto" style and side are
   resolved in cms.ts from the section's position, so neighbours differ. */
export const VIDEO_STYLES = ["edge", "framed", "print"] as const;
export type VideoStyle = (typeof VIDEO_STYLES)[number];
export type VideoSide = "left" | "right";

const mockVideos = (seed: string, formats: string) =>
  [...formats].map((f, i) =>
    f === "v"
      ? { src: MOCK_PHOTO(`${seed}-${i}`, 900, 1600), tall: true }
      : { src: MOCK_PHOTO(`${seed}-${i}`, 1600, 900), tall: false },
  );

export const VIDEO_SECTIONS: { client: string; photo: string; videos: { src: string; tall: boolean }[] }[] = [
  { client: "Café Nomad", photo: MOCK_PHOTO("soltani-vc-1", 1000, 1250), videos: mockVideos("soltani-vc-1", "l") },
  { client: "Harbour Fitness", photo: MOCK_PHOTO("soltani-vc-2", 1000, 1250), videos: mockVideos("soltani-vc-2", "vv") },
  { client: "Maison Lune", photo: MOCK_PHOTO("soltani-vc-3", 1000, 1250), videos: mockVideos("soltani-vc-3", "vvv") },
  { client: "Northside Dental", photo: MOCK_PHOTO("soltani-vc-4", 1000, 1250), videos: mockVideos("soltani-vc-4", "ll") },
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

/* ---------- Web design ----------
   What the studio builds. No live client sites are cleared to show yet, so
   the page leads with capabilities and process rather than a case-study grid.
   WEB_SHOTS are MOCK stills for the browser frames — swap for real
   screenshots once a build can be shown. */
export const WEB_SHOTS = [
  MOCK_PHOTO("soltani-web-1", 1400, 900),
  MOCK_PHOTO("soltani-web-2", 1400, 900),
  MOCK_PHOTO("soltani-web-3", 1400, 900),
];

export const WEB_CAPABILITIES = [
  {
    title: "Brand sites",
    body: "A home on the web that looks like the rest of your brand, built around the photos and video we shoot for it.",
  },
  {
    title: "Landing pages",
    body: "One page, one offer, one action. Built to catch the traffic your ads and reels send over.",
  },
  {
    title: "Online stores",
    body: "Product pages shot and written to sell, with checkout set up so you can run it day to day.",
  },
  {
    title: "Care & SEO",
    body: "Speed, search basics and updates after launch, so the site keeps working once it's live.",
  },
];

export const WEB_PROCESS = [
  {
    step: "Plan",
    body: "What the site has to do, who it's for, and the pages it needs to get there.",
  },
  {
    step: "Design",
    body: "Layouts in your brand, with real content from the shoot, not stock filler.",
  },
  {
    step: "Build",
    body: "Fast, responsive and editable, tested on every screen size before it ships.",
  },
  {
    step: "Launch",
    body: "Domain, analytics and handover, then we stay on for fixes and growth.",
  },
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

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

export const NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  {
    label: "Work",
    href: "/work",
    children: [
      { label: "Photography", href: "/work/photography" },
      { label: "Videography", href: "/work/videography" },
      { label: "Web Design", href: "/work/web-design" },
    ],
  },
  { label: "About Us", href: "/about" },
  { label: "FAQ", href: "/faq" },
];

/* ---------- Page copy ----------
   The words on every page, as they stood before the CMS. Each one is the
   fallback for the matching Sanity field (see src/lib/cms.ts): blank in the
   studio means this text shows. The seed script also copies these into Sanity
   as the starting point for editing.

   Headings share one shape: `eyebrow` is the small purple label, `accent`
   the script-face second line. A part the design doesn't show is "". */
export type Heading = {
  eyebrow: string;
  title: string;
  accent: string;
  body: string;
};
export type Blurb = { title: string; body: string };

const heading = (h: Partial<Heading>): Heading => ({
  eyebrow: "",
  title: "",
  accent: "",
  body: "",
  ...h,
});

export const COPY = {
  site: {
    seoTitle: `${BRAND.name} — Photo, Video & Marketing Studio`,
    seoDescription:
      "Soltani Media & Marketing is a production and marketing studio. Brand photography, video, web design, short-form social and the campaigns that put them to work — one team, brief to reporting.",
    footerCta: "Ready to look the part?",
    footerButton: "Let's Chat",
    founderCaption: "Behind the lens & the plan",
  },

  home: {
    heroLine1: "Sharp visuals.",
    heroLine2: "Sharper strategy.",
    heroLine3: "All under one roof.",
    /* The non-breaking spaces keep the dash from starting a line. */
    heroTagline:
      "Shot It, Cut It, Marketed It  —  Across 120+ Projects and Counting",
    heroIntro:
      "Photo, video, websites, and the campaigns that actually put them to work. One studio, one brief, no handoffs. What you see below is just a taste — there's a lot more where that came from.",
    heroButton: "Book A Discovery Call",
    results: heading({
      eyebrow: "Results",
      title: "Proof, not promises",
      accent: "[straight from the group chat]",
      body: "Real messages from real clients, sent the day the work landed. No staging, no rewrites.",
    }),
    projectsDelivered: "120+",
    testimonials: heading({
      eyebrow: "Testimonials",
      title: "Wall of Love",
      accent: "[in their words]",
    }),
    work: heading({
      eyebrow: "My work",
      title: "Three lanes,",
      accent: "one standard.",
    }),
    marqueeOne: "Content that looks good and does the work",
    services: heading({
      title: "THE SH** WE GET DONE",
      accent: "[aka what we do]",
    }),
    marqueeTwo:
      "Media & Marketing [noun]: Making something worth watching — then making sure it gets seen.",
  },

  about: {
    intro: heading({
      eyebrow: "About us",
      title: "A studio built to make your brand",
      accent: "worth watching.",
      body: `Hi, we're ${BRAND.name}. We started behind a camera and built the marketing side so great footage stops dying in a folder. Photo, video, social and paid — one small team that shoots it, cuts it and makes sure it gets seen, for brands from clinics and gyms to cafés and barbershops.`,
    }),
    aboutTitle: "About us",
    /* **…** renders bold purple (see Highlight.tsx). */
    principles: [
      {
        title: "WHO ARE WE?",
        body: "Soltani Media & Marketing is a small production studio built around one stubborn idea: the people who shoot your content should also know **what it's for**. We started behind a camera, spent years watching great footage die in the wrong hands, and built the marketing side so that stopped happening.",
      },
      {
        title: "WHAT DO WE DO?",
        body: "We shoot it, cut it, and put it to work. Brand photography, video, short-form social, paid creative, and the campaigns that carry them. One team from the brief to the reporting, which means **nothing gets lost in the handoff** between the studio, the editor, and the media buyer.",
      },
      {
        title: "WHY US?",
        body: "No template packages, no three-vendor telephone game. Just a crew that shows up with a plan and content **built to earn its keep.**",
      },
    ] as Blurb[],
    photoCaption: "Always rolling.",
    team: heading({
      eyebrow: "The crew",
      title: "Meet the team",
      accent: "[the whole roster]",
      body: "Four people, no account layer. You talk to whoever is doing the work.",
    }),
    countries: heading({
      title: "Where we've worked",
      accent: "passport ready.",
      body: "Shoots, campaigns and clients across five countries — and we're happy to add a sixth.",
    }),
  },

  services: {
    hero: heading({
      eyebrow: "Services",
      title: "Everything it takes",
      accent: "to get seen.",
      body: "Four disciplines, one team. Pick the pieces you need, or hand over the whole content side and we'll run it end to end.",
    }),
    toolboxTitle: "What's in our kit",
    packagesHeading: heading({
      eyebrow: "Packages",
      title: "Pick your pace",
      accent: "[or we'll build one]",
    }),
    packagesFootnote:
      "Need a one-off shoot instead? Every project can be quoted on its own.",
  },

  work: {
    hero: heading({
      eyebrow: "Work",
      title: "Made to be seen,",
      accent: "then remembered.",
      body: "A look at what we shoot and cut. Pick a lane below, or scroll for a mix of recent projects.",
    }),
    photoLane: {
      title: "Photography",
      blurb: "Brand, product, portrait and event stills.",
      tags: ["Brand", "Product", "Events"],
    },
    videoLane: {
      title: "Videography",
      blurb: "Brand films, reels and event coverage.",
      tags: ["Films", "Reels", "Recaps"],
    },
    webLane: {
      title: "Web Design",
      blurb: "Sites built around the content we shoot.",
      tags: ["Brand sites", "Stores", "SEO"],
    },
    recentTitle: "Recent projects",
  },

  photography: {
    hero: heading({
      eyebrow: "Work / Photography",
      title: "Photography",
      body: "Brand, product, portrait and event stills — lit for the crop you actually need.",
    }),
    heading: heading({
      eyebrow: "Photography",
      title: "Stills with a",
      accent: "job to do.",
      body: "Shot for where they are going — the grid, the menu, the ad set, the deck. We light for the crop you actually need, then hand over a library that is already sized and named for it.",
    }),
  },

  videography: {
    hero: heading({
      eyebrow: "Work / Videography",
      title: "Videography",
      body: "Brand films, short-form verticals and event coverage — shot, directed and cut in-house.",
    }),
    heading: heading({
      eyebrow: "Videography",
      title: "Motion that earns",
      accent: "the second watch.",
      body: "We shoot, direct and cut in-house — which means the person framing the shot already knows where it lands and how long it has to hold someone. No brief survives three vendors; ours never has to.",
    }),
  },

  webDesign: {
    hero: heading({
      eyebrow: "Work / Web Design",
      title: "Web Design",
      body: "Brand sites, landing pages and stores — designed around your content and built to load fast.",
    }),
    heading: heading({
      title: "Where the content",
      accent: "gets to live.",
      body: "The photos and video are built to travel; the website is where they land. We design and build it around the shoot, so the site looks like the brand on day one.",
    }),
    capabilitiesTitle: "What we build",
    processHeading: heading({
      title: "How a build runs",
      accent: "four steps, no surprises.",
    }),
  },

  faq: {
    hero: heading({
      eyebrow: "FAQ",
      title: "Good questions,",
      accent: "straight answers.",
    }),
    ctaTitle: "Still have a question?",
    ctaButton: "Work with us",
  },
};
