import React, { useState } from "react";
import { Menu, X, Check } from "lucide-react";

/* ---------- Brand tokens ---------- */
const FONT_DISPLAY = "Vastagogrotesk, Arial, sans-serif";
const FONT_SCRIPT = '"Supfonts Desmontilles", Arial, sans-serif';
const FONT_BODY = '"Acumin Variable Concept", Arial, sans-serif';

const INK = "rgb(10,11,16)";
const PINK = "rgb(255,95,130)";
const LAVENDER = "rgb(217,173,255)";
const PURPLE = "rgb(167,68,255)";
const TEAL = "rgb(0,192,179)";
const PINK_LIGHT = "rgb(255,194,207)";

/* ---------- Assets ---------- */
const A = (id: string, gen: string, ext = "png") =>
  `https://storage.googleapis.com/download/storage/v1/b/prd-shared-services.firebasestorage.app/o/h2m-assets%2F${id}.${ext}?generation=${gen}&alt=media`;

const LOGO = A("2815ef3cbf90965172950237f415dfead2462fc8", "1789909498660890");
const STAR = A("e76ac0c742a7bfaab06dd8d473b5b4e64fb4fb1f", "1789909498665119");
const HERO_PERSON = A("c4aed01edd5049241df70a2b63c9bbde56a47896", "1789909498714486");
const HERO_ARROW = A("ae47034d3c2b6f9b629d235e7ce626d32a566e5d", "1789909498683619", "svg");
const LUNA = A("f7c0f5a5568a54f1dde2898fec651522b68b0ef8", "1789909498678054", "jpg");
const SERVICE_PERSON = A("6fc76eeec1fc0475b0b2c4fed172a2dd89f6bcfc", "1789909498879537");

const HERO_STICKERS = [
  { id: A("055a210c1948ebebdad7846fd82dc326825e1e55", "1789909498657425", "svg"), cls: "w-16 sm:w-20 lg:w-28 top-0 right-[-11%]" },
  { id: A("cb65ff875937f4a3479b723f692b9c19065caf28", "1789909498680732", "svg"), cls: "w-14 lg:w-[110px] left-[21%] top-[31%]" },
  { id: A("feb195c82de9f8e8a5a03ccf6feefe3f9f33277c", "1789909498674904", "svg"), cls: "w-6 lg:w-[35px] left-[5%] top-[30%]" },
  { id: A("28ce6c9361ccc969b265f695605d0ea762e2c763", "1789909498659327", "svg"), cls: "w-10 lg:w-[70px] left-[-6%] top-[42%]" },
  { id: A("ea634b69b3625a481cb1f1be1a927b5f5e3b8be7", "1789909498666254", "svg"), cls: "w-14 lg:w-[110px] left-[5%] top-[53%]" },
];

const SERVICES = [
  { label: "Klaviyo Email Automation & Flow", bg: PINK, fg: "rgb(254,254,254)" },
  { label: "Email Design", bg: LAVENDER, fg: INK },
  { label: "Event Production", bg: PURPLE, fg: "rgb(254,254,254)" },
  { label: "Reputation Strategy & Management", bg: TEAL, fg: "#fff" },
  { label: "Paid Ads", bg: PURPLE, fg: "rgb(254,254,254)" },
  { label: "Brand Storytelling", bg: TEAL, fg: "rgb(254,254,254)" },
  { label: "Swag Design", bg: PINK_LIGHT, fg: INK },
  { label: "Social Media Strategy", bg: LAVENDER, fg: INK },
  { label: "Social Media Content", bg: PINK, fg: "rgb(254,254,254)" },
  { label: "Shopify Subscription Setup & Management", bg: PURPLE, fg: "rgb(254,254,254)" },
  { label: "Reporting & Data", bg: PINK_LIGHT, fg: INK },
];

const TOOLBOX = [
  A("6dda1d55e1edd24f8e8b7263a69d2a7d2df3ac43", "1789909498771927", "svg"),
  A("d38c31018c606d20f2dcfc13f9aa6fd0f5d9a30a", "1789909498817571", "svg"),
  A("ccddafeee887321cad7ca56d5f194d62ab2db49d", "1789909498815883", "svg"),
  A("34e1708d8ca04800513036b8863dd4b78de2ba9d", "1789909498820724", "svg"),
  A("85768e3a65404cb9c5abde92cd5d02c9a13e574d", "1789909498819935", "svg"),
  A("8af38476fe7dec33409f061d249565f929de1896", "1789909498819401", "svg"),
  A("d3e00aca30ddff4029550347b4446aa0a44d7870", "1789909498828438", "svg"),
];

const WORK_IMAGES = [
  A("9ccc3bed529cc1ebae7c9b1ae56c142b1000ac43", "1789909498991296"),
  A("f32270ebd675c1dab5ad1776178bd29401768181", "1789909499041478"),
  A("4f1292da5cb2f89c34c1e95577ac203823a04b7e", "1789909499062305"),
  A("09611869a89472ddd6188e03a43dfc694e2e426b", "1789909499162440"),
  A("e15d034842c78a4851996359ce4fb5e2d4cf1b3d", "1789909499064548"),
  A("57342a9edcfdd27a7b9983bb926f3afc595a543a", "1789909499094756"),
  A("35b31cc6a708d7388481396702cc43f31dd1ef8b", "1789909499011578"),
];

const WORK_TABS = [
  "Social Strategy, Content, and Design",
  "Content Creation",
  "Email Design & Automations",
];

const TESTIMONIALS = [
  {
    quote:
      "Eclectic Creative studio has this unique ability to combine technical expertise with creative insight, explaining not just what to do but why each email strategy decision matters for getting real responses. Despite being a boutique studio, Marissa delivers the output and results you'd expect from a full marketing department — she completely overhauled our nurturing campaigns into something that actually connects.",
    name: null,
    handle: null,
    avatar: null,
    tag: null,
  },
  {
    quote:
      "We're so glad we answered Marissa's DM at Jalapa Jar — a chance customer service encounter led to a great working relationship! She jumped in and leveled up our Salsa Club membership game, enhancing the offering and marketing efforts on social. Everything from posting cadence to hiring & liaising with freelancers to create great, impactful new content. Our regular working sessions were full of good, creative ideas that were on brand but also scrappy, actionable and practical. She's detail oriented, organized, resourceful — seriously made our team stronger and helped us grow. Highly recommend her for anyone needing a marketing boost!",
    name: "Tommy",
    handle: "@tommy",
    avatar: A("30f223f51bcaaba347d6b08c3bf18c77cad6b273", "1789909499058007"),
    tag: "Founder | Jalapa Jar",
  },
  {
    quote:
      "I worked with Marissa for a couple years for my Salon, PRISM Hair in Richmond, VA! And even across the country she slayed our content and was super helpful. She had wonderful ideas, was super organized, and even helped our email campaigns. Because of her the beginning days and years of owning my salon were made easier having her help with our social media and marketing. Can't recommend her for her expertise and experience enough!",
    name: "Brittany",
    handle: "@brittany",
    avatar: A("3adc334b56c8e1ec935c65d20557227973918477", "1789909499082655"),
    tag: "Owner | Prism Hair Salon",
  },
];

/* ---------- Marquee ---------- */
function Marquee({
  items,
  bg,
  textColor,
  duration = 30,
}: {
  items: string[];
  bg: string;
  textColor?: string;
  duration?: number;
}) {
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <div key={i} className="flex items-center">
          <img src={STAR} alt="" className="mx-3 h-6 w-6 sm:mx-4 sm:h-8 sm:w-8" />
          <span
            className="whitespace-nowrap text-lg font-bold uppercase sm:text-xl lg:text-2xl"
            style={{ color: textColor }}
          >
            {t}
          </span>
        </div>
      ))}
    </div>
  );
  return (
    <div className="flex overflow-hidden py-6 sm:py-8" style={{ backgroundColor: bg }}>
      <div className="flex animate-[marquee_var(--dur)_linear_infinite]" style={{ ["--dur" as string]: `${duration}s` }}>
        {row}
        {row}
      </div>
    </div>
  );
}

/* ---------- App ---------- */
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(1);

  const nav = [
    { label: "About", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Work", href: "#work" },
  ];

  return (
    <div className="min-h-full bg-white font-light text-[rgb(51,51,51)]" style={{ fontFamily: FONT_BODY }}>
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>

      {/* ---------- Header ---------- */}
      <header className="fixed top-0 z-[1000] w-full bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-6 px-5 py-4 sm:px-8 lg:px-[72px] lg:py-6">
          <a href="#top" className="block max-w-[110px] shrink-0 lg:max-w-[131px]">
            <img src={LOGO} alt="Eclectic Creative & Co." className="w-full" />
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <a
                key={n.label}
                href={n.href}
                className="px-5 py-2 text-base font-semibold text-[rgb(10,11,16)] transition-opacity hover:opacity-60"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#contact"
              className="hidden rounded-full bg-[rgb(10,11,16)] px-5 py-2.5 text-base font-medium text-white transition-transform hover:scale-[1.03] sm:inline-block"
            >
              Drop Me A Line
            </a>
            <button
              className="md:hidden"
              aria-label="Toggle menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-black/5 bg-white px-5 pb-6 pt-2 md:hidden">
            <nav className="flex flex-col">
              {nav.map((n) => (
                <a
                  key={n.label}
                  href={n.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-black/5 py-3 text-lg font-semibold text-[rgb(10,11,16)]"
                >
                  {n.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="mt-4 rounded-full bg-[rgb(10,11,16)] px-5 py-3 text-center text-base font-medium text-white"
              >
                Drop Me A Line
              </a>
            </nav>
          </div>
        )}
      </header>

      <main id="top">
        {/* ---------- Hero ---------- */}
        <section className="relative overflow-hidden bg-[rgb(254,254,254)] pt-28 lg:pt-0">
          <div className="mx-auto grid max-w-[1300px] grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:min-h-screen lg:grid-cols-2 lg:gap-6 lg:px-[43px]">
            <div className="order-2 py-6 lg:order-1 lg:py-40">
              <div className="mb-8 flex flex-wrap gap-x-3">
                <h1
                  className="text-[40px] font-semibold leading-[1.1] tracking-[-0.03em] text-[rgb(22,28,39)] sm:text-5xl lg:text-[53px]"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  Sharp strategy.
                </h1>
                <h1
                  className="text-[40px] font-black leading-[1.1] tracking-[-0.03em] text-[rgb(22,28,39)] sm:text-5xl lg:text-[53px]"
                  style={{ fontFamily: FONT_DISPLAY }}
                >
                  Bold content.
                </h1>
                <div className="flex items-center gap-3">
                  <h1
                    className="text-[40px] leading-[1.1] tracking-[-0.03em] text-[rgb(22,28,39)] sm:text-5xl lg:text-[53px]"
                    style={{ fontFamily: FONT_SCRIPT }}
                  >
                    All under one roof.
                  </h1>
                  <img src={HERO_ARROW} alt="" className="hidden h-10 sm:block lg:h-12" />
                </div>
              </div>

              <p
                className="mb-3 text-xl font-semibold leading-snug tracking-tight sm:text-2xl"
                style={{ color: PINK }}
              >
                Been There, Marketed That &nbsp;&mdash;&nbsp; Across 15 Industries and Counting
              </p>
              <p className="mb-8 max-w-xl text-lg leading-relaxed tracking-tight text-[rgb(10,11,16)] sm:text-xl">
                Creative? Strategic? Digital? If it makes sense, we can make it happen. What you see
                below is just a taste — there's a lot more where that came from.
              </p>

              <a
                href="#contact"
                className="inline-block rounded-full bg-[rgb(10,11,16)] px-5 py-2.5 text-base font-medium text-white transition-transform hover:scale-[1.03]"
              >
                Book A Brainstorm With Me
              </a>
            </div>

            {/* Hero image panel */}
            <div className="order-1 lg:order-2 lg:hidden">
              <div className="relative mx-auto flex max-w-md items-end justify-center overflow-hidden rounded-3xl bg-[rgb(255,218,223)] pt-8">
                <img src={HERO_PERSON} alt="Marissa" className="relative z-[5] max-h-[420px]" />
              </div>
            </div>
          </div>

          {/* Desktop full-height photo panel */}
          <div className="absolute inset-y-0 right-0 hidden w-[42%] items-end justify-center bg-[rgb(255,218,223)] lg:flex">
            <div className="relative left-[-4%] flex items-end justify-center">
              <img src={HERO_PERSON} alt="Marissa" className="relative z-[5] max-h-[600px]" />
              {HERO_STICKERS.map((s, i) => (
                <div key={i} className={`absolute ${s.cls}`}>
                  <img src={s.id} alt="" className="w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Marquee 1 ---------- */}
        <Marquee
          items={Array(4).fill("Built for brands that give a damn")}
          bg={LAVENDER}
          textColor={INK}
        />

        {/* ---------- About ---------- */}
        <section id="about" className="bg-[rgb(10,11,16)] px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-[1180px]">
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-3">
              <h2
                className="text-5xl font-semibold leading-none tracking-tight text-[rgb(254,254,254)] sm:text-7xl lg:col-span-2 lg:text-[84px]"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                About me
              </h2>

              <AboutBlock num="01" title="WHO AM I?">
                I'm Marissa, Founder of Eclectic Creative & Co., a one-woman{" "}
                <span className="font-bold" style={{ color: PINK }}>marketing powerhouse</span> with a
                not-so-linear resume and a big heart for small business. After a decade of shaping
                brands across beauty, tech, CPG, real estate, financial services, and healthcare, I've
                learned that no two businesses or marketing strategies should ever look the same.
              </AboutBlock>

              <AboutBlock num="02" title="WHAT I DO?">
                At Eclectic Creative, I blend big-picture thinking with hands-on execution. Whether
                it's social content that converts, community events that build loyal advocates, or
                Shopify setups that simply work. My secret weapon? A{" "}
                <span className="font-bold" style={{ color: PINK }}>wildly diverse background</span>{" "}
                that brings fresh ideas to every client, every time.
              </AboutBlock>

              {/* Luna image */}
              <div className="relative overflow-hidden rounded-2xl lg:col-start-2 lg:row-start-2 lg:row-span-2">
                <img src={LUNA} alt="Luna" className="w-full" />
                <div
                  className="absolute bottom-6 left-4 text-2xl font-bold text-black"
                  style={{ fontFamily: FONT_SCRIPT }}
                >
                  Co-founder, Luna
                </div>
              </div>

              <div className="lg:col-start-1 lg:row-start-3 lg:self-end">
                <AboutBlock num="03" title="WHY ME?">
                  This isn't one-size-fits-all marketing. It's curated, human, and{" "}
                  <span className="font-bold" style={{ color: PINK }}>built to grow with you.</span>
                </AboutBlock>
              </div>

              <div className="hidden items-end justify-center lg:col-start-3 lg:row-start-3 lg:flex">
                <img src={STAR} alt="" className="w-40 rotate-[160deg] invert" />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Marquee 2 ---------- */}
        <Marquee
          items={Array(2).fill(
            "Eclectic [Adjective]: Deriving ideas, style, or taste from a broad and diverse range of sources.",
          )}
          bg={PINK_LIGHT}
          textColor={INK}
          duration={40}
        />

        {/* ---------- Services ---------- */}
        <section id="services" className="px-5 pt-20 sm:px-8 lg:pt-24">
          <div className="mx-auto max-w-[940px]">
            <h2
              className="mb-12 text-center text-4xl font-semibold leading-tight tracking-tight text-[rgb(10,11,16)] sm:text-6xl lg:mb-16 lg:text-[84px]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              THE SH** I GET DONE
              <span className="block text-2xl sm:text-4xl lg:text-5xl" style={{ fontFamily: FONT_SCRIPT }}>
                [aka what I do]
              </span>
            </h2>

            {/* Mobile / tablet: wrapped pills */}
            <div className="flex flex-wrap justify-center gap-3 lg:hidden">
              {SERVICES.map((s) => (
                <span
                  key={s.label}
                  className="rounded-full px-5 py-3 text-center text-sm font-bold"
                  style={{ backgroundColor: s.bg, color: s.fg, fontFamily: FONT_DISPLAY }}
                >
                  {s.label}
                </span>
              ))}
            </div>

            {/* Desktop: photo with floating bubbles */}
            <div className="relative mx-auto hidden justify-center lg:flex">
              <img src={SERVICE_PERSON} alt="" className="max-h-[460px]" />
              {SERVICES.map((s, i) => {
                const pos = [
                  "top-[-13%] right-[17%] w-[180px]",
                  "right-[20%] bottom-[21%] w-[120px]",
                  "right-[1%] bottom-[52%] w-[130px]",
                  "right-[-1%] bottom-[9%] w-40",
                  "right-[52%] bottom-[91%] w-[120px]",
                  "right-[78%] bottom-[83%] w-[140px]",
                  "right-[64%] bottom-[60%] w-[120px]",
                  "right-[87%] bottom-[53%] w-[200px]",
                  "right-[90%] bottom-[5%] w-[200px]",
                  "right-[67%] bottom-[9%] w-[200px]",
                  "right-[-3%] bottom-[89%] w-[120px]",
                ][i];
                return (
                  <div
                    key={s.label}
                    className={`absolute flex items-center justify-center rounded-full px-2 py-6 text-center text-base font-bold ${pos}`}
                    style={{ backgroundColor: s.bg, color: s.fg, fontFamily: FONT_DISPLAY }}
                  >
                    {s.label}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- Toolbox ---------- */}
        <section className="bg-[rgb(239,239,239)] px-5 py-8 sm:px-8 lg:px-[72px]">
          <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-8 lg:flex-row lg:justify-between">
            <h2
              className="text-xl font-bold tracking-tight text-[rgb(47,38,29)] lg:text-2xl"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              What's in my toolbox
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              {TOOLBOX.map((src, i) => (
                <img key={i} src={src} alt="" className="h-5 sm:h-6" />
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Work ---------- */}
        <section id="work" className="px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto flex max-w-[940px] flex-col items-center gap-10 lg:gap-12">
            <h2
              className="text-4xl font-bold tracking-tight text-[rgb(47,38,29)] sm:text-5xl lg:text-[56px]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Our work
            </h2>

            {/* Tabs */}
            <div role="tablist" className="flex flex-wrap justify-center gap-1 border-b border-[rgb(167,68,255)]/30">
              {WORK_TABS.map((t, i) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={activeTab === i}
                  onClick={() => setActiveTab(i)}
                  className={`px-4 py-3 text-center text-sm transition-colors ${
                    activeTab === i
                      ? "rounded-t-lg border border-b-0 border-[rgb(167,68,255)] font-semibold text-[rgb(167,68,255)]"
                      : "font-normal text-[rgb(34,34,34)] hover:text-[rgb(167,68,255)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Masonry-ish responsive grid */}
            <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-6">
              {WORK_IMAGES.map((src, i) => {
                const span = [
                  "sm:col-span-3",
                  "sm:col-span-3",
                  "sm:col-span-2",
                  "sm:col-span-2",
                  "sm:col-span-2",
                  "sm:col-span-3",
                  "sm:col-span-3",
                ][i];
                return (
                  <div key={i} className={`overflow-hidden rounded-lg ${span}`}>
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- Wall of Love ---------- */}
        <section id="testimonial" className="bg-[rgb(10,11,16)] px-5 py-20 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-[1180px]">
            <h2
              className="mb-12 text-center text-4xl font-bold tracking-tight text-[rgb(254,254,254)] sm:text-5xl lg:mb-16 lg:text-[56px]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Wall Of Love
            </h2>
            <div className="flex snap-x gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className="flex w-[85vw] shrink-0 snap-start flex-col gap-5 rounded-[20px] border border-[rgb(41,41,41)] bg-[rgb(20,20,20)] p-6 sm:w-[420px] lg:w-[560px]"
                >
                  {t.name && (
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[rgb(227,227,227)]">
                        <img src={t.avatar!} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <div className="text-xs font-medium tracking-tight text-white">{t.name}</div>
                        <div className="text-xs text-[rgb(143,143,143)]">{t.handle}</div>
                      </div>
                    </div>
                  )}
                  <div className="h-px w-full bg-[rgb(41,41,41)]" />
                  <p className="text-xs leading-relaxed text-[rgb(176,176,176)]">{t.quote}</p>
                  {t.tag && (
                    <div className="mt-auto">
                      <span className="rounded-full bg-[rgb(41,41,41)] px-3 py-1 text-xs text-[rgb(201,201,201)]">
                        {t.tag}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Footer / CTA ---------- */}
        <footer id="contact" className="bg-[rgb(10,11,16)] px-5 pb-12 sm:px-8 lg:px-[72px]">
          <div className="mx-auto max-w-[1180px]">
            {/* CTA card */}
            <div className="mb-12 flex flex-col items-center gap-6 rounded-2xl bg-[rgb(167,68,255)] p-8 text-center lg:flex-row lg:justify-between lg:gap-16 lg:text-left">
              <img src={LOGO} alt="" className="max-w-[140px] invert" />
              <h3
                className="text-3xl font-normal leading-tight tracking-tight text-[rgb(254,254,254)]"
                style={{ fontFamily: FONT_SCRIPT }}
              >
                Ready to give a damn?
              </h3>
              <a
                href="mailto:marissa@getelectic.co"
                className="rounded-full bg-[rgb(254,254,254)] px-6 py-2.5 text-base font-medium text-[rgb(167,68,255)] transition-transform hover:scale-[1.03]"
              >
                Let's Chat
              </a>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
              <div className="relative col-span-2 aspect-[2.88/3.2] max-w-[272px] overflow-hidden rounded-xl">
                <img
                  src={A("454e9980d55ff19e9f1d4e3029514e9a332fb7ec", "1789909499114993", "jpg")}
                  alt="Marissa"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-2 bottom-2 rounded-lg bg-[rgb(10,11,16)] px-3 py-2">
                  <div className="flex items-center gap-1">
                    <span className="text-base font-semibold text-[rgb(254,254,254)]">Marissa</span>
                    <Check size={14} className="text-[rgb(167,68,255)]" />
                  </div>
                  <div className="text-sm text-[rgb(254,254,254)]">Your Brand's Best Friend</div>
                </div>
              </div>

              <FooterCol title="Navigation" links={[
                ["Services", "#services"],
                ["Work", "#work"],
                ["Testimonial", "#testimonial"],
                ["About me", "#about"],
              ]} />
              <FooterCol title="Connect" links={[
                ["LinkedIn", "https://www.linkedin.com/in/mhazen95/"],
                ["marissa@getelectic.co", "mailto:marissa@getelectic.co"],
              ]} />
            </div>

            {/* Bottom bar */}
            <div className="mt-8 flex flex-col gap-4 border-t border-[rgb(254,254,254)]/40 pt-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-[rgb(254,254,254)]">&copy; 2026 Eclectic Creative & Co</p>
              <div className="flex gap-6">
                <a href="#" className="text-[rgb(254,254,254)] underline">Terms</a>
                <a href="#" className="text-[rgb(254,254,254)] underline">Privacy Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

/* ---------- Small components ---------- */
function AboutBlock({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="text-base text-[rgb(254,254,254)]">{num}</div>
      <div className="flex flex-col gap-6">
        <div className="text-base font-bold text-[rgb(254,254,254)]">{title}</div>
        <p className="text-base leading-relaxed text-[rgb(254,254,254)]">{children}</p>
      </div>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <div className="text-base font-semibold text-[rgb(254,254,254)]">{title}</div>
      <div className="flex flex-col gap-5">
        {links.map(([label, href]) => (
          <a key={label} href={href} className="text-[rgb(254,254,254)] transition-opacity hover:opacity-60">
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}
