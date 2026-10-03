import {
  A,
  ACCENT,
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
  { label: "Video Production", bg: ACCENT_TINT, fg: INK },
  { label: "Reels & Short-Form Editing", bg: INK, fg: "rgb(254,254,254)" },
  { label: "Social Media Strategy", bg: TEAL, fg: "#fff" },
  { label: "Paid Ads & Creative Testing", bg: INK, fg: "rgb(254,254,254)" },
  { label: "Brand Storytelling", bg: TEAL, fg: "rgb(254,254,254)" },
  { label: "Product & Menu Photography", bg: ACCENT_TINT, fg: INK },
  { label: "Social Media Content", bg: ACCENT_TINT, fg: INK },
  { label: "Event & Venue Coverage", bg: ACCENT, fg: "rgb(254,254,254)" },
  { label: "Email Marketing & Automation", bg: INK, fg: "rgb(254,254,254)" },
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

export const CLIENT_LOGOS: ClientLogo[] = [
  {
    name: "Eclectic Creative & Co",
    src: "/logos/real/6893857a2382a9206011c316_3f4523b58e85c71272303ee2baceb340e9ce79ac.png",
    cap: "max-h-9",
  },
  { name: "Bailey Anne Studios", src: "/logos/real/BaileyAnneStudios-Whitecrop.webp", cap: "max-h-10" },
  { name: "Tyler's", src: "/logos/real/tylers-logo.png", cap: "max-h-14" },
  { name: "Easy Dental Marketing", src: "/logos/real/edm-logo.webp", cap: "max-h-12" },
  { name: "Leadfox", src: "/logos/real/leadfox%20logo.svg", cap: "max-h-9" },
  { name: "BSense", src: "/logos/real/bsense-logo.webp", cap: "max-h-14", tone: "grayscale" },
  { name: "P4M", src: "/logos/real/logo-p4m.webp", cap: "max-h-16" },
  { name: "Son & Bear", src: "/logos/real/Asset-4_375x.webp", cap: "max-h-6" },
  { name: "F45", src: "/logos/real/F45-logo-desktop.svg", cap: "max-h-11" },
  { name: "Canimoov", src: "/logos/real/canimoov.png", cap: "max-h-14" },
  { name: "FCBB", src: "/logos/real/FCBB+Logo+(White)-399w.webp", cap: "max-h-8" },
  { name: "Reedz", src: "/logos/real/logo-reedz1.png", cap: "max-h-12" },
  { name: "Lumeniri", src: "/logos/real/Lumeniri_Header_Soft_Chambray.webp", cap: "max-h-12" },
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

/* ---------- Services page ---------- */
export const SERVICE_GROUPS = [
  {
    title: "Photography",
    body: "Stills lit for where they are going — the grid, the menu, the website, the ad set.",
    items: ["Brand & campaign", "Product & menu", "Portrait & team", "Event & venue"],
  },
  {
    title: "Video",
    body: "Shot, directed and cut in-house, so the person framing the shot knows where it lands.",
    items: ["Brand films", "Reels & short-form", "Event recaps", "Testimonial videos"],
  },
  {
    title: "Social",
    body: "A plan for what goes out, when, and why — then the posting, so you don't have to.",
    items: ["Strategy & calendar", "Content creation", "Community management", "Reporting"],
  },
  {
    title: "Growth",
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
  { step: "Plan", body: "What the site has to do, who it's for, and the pages it needs to get there." },
  { step: "Design", body: "Layouts in your brand, with real content from the shoot, not stock filler." },
  { step: "Build", body: "Fast, responsive and editable, tested on every screen size before it ships." },
  { step: "Launch", body: "Domain, analytics and handover, then we stay on for fixes and growth." },
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
