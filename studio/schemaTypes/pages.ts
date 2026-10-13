import {
  BriefcaseBusiness,
  Camera,
  CircleQuestionMark,
  Film,
  House,
  Info,
  Monitor,
  Settings,
  Wrench,
} from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

/* One document per page, each holding that page's copy. These are
   singletons: the studio structure opens them directly and hides create /
   delete / duplicate (see structure.ts and sanity.config.ts).

   Every field is optional. Anything left blank falls back to the original
   copy in src/lib/content.ts, so a half-filled page still renders whole. */

const HIGHLIGHT_NOTE = "Wrap words in **double asterisks** to set them in bold purple.";

const strings = (name: string, title: string, group: string, description?: string) =>
  defineField({
    name,
    title,
    group,
    description,
    type: "array",
    of: [defineArrayMember({ type: "string" })],
  });

const blurbs = (name: string, title: string, group: string) =>
  defineField({ name, title, group, type: "array", of: [defineArrayMember({ type: "blurb" })] });

const hero = defineField({ name: "hero", title: "Page hero", type: "pageHero", group: "hero" });

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: Settings,
  groups: [
    { name: "brand", title: "Brand & contact", default: true },
    { name: "images", title: "Key images" },
    { name: "footer", title: "Footer" },
    { name: "seo", title: "Search & sharing" },
  ],
  fields: [
    defineField({ name: "name", title: "Business name", type: "string", group: "brand" }),
    defineField({ name: "short", title: "Short name", type: "string", group: "brand" }),
    defineField({ name: "founder", title: "Founder", type: "string", group: "brand" }),
    defineField({
      name: "email",
      title: "Contact email",
      type: "string",
      group: "brand",
      validation: (r) => r.email(),
    }),
    defineField({ name: "instagram", title: "Instagram URL", type: "url", group: "brand" }),
    defineField({ name: "facebook", title: "Facebook URL", type: "url", group: "brand" }),
    defineField({ name: "linkedin", title: "LinkedIn URL", type: "url", group: "brand" }),
    defineField({
      name: "countries",
      title: "Countries worked in",
      type: "array",
      group: "brand",
      description: "Also drives the “… countries” counts in the logo band and Results.",
      of: [
        defineArrayMember({
          type: "object",
          name: "country",
          fields: [
            defineField({
              name: "code",
              title: "Country code",
              type: "string",
              description: "Two-letter ISO code, e.g. US, FR, LB — picks the flag.",
              validation: (r) =>
                r.required().regex(/^[A-Z]{2}$/, { name: "two capital letters" }),
            }),
            defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
            defineField({ name: "note", title: "Note", type: "string", description: "e.g. incl. California" }),
          ],
          preview: { select: { title: "name", subtitle: "code" } },
        }),
      ],
    }),

    defineField({
      name: "heroPhoto",
      title: "Founder cut-out",
      type: "image",
      group: "images",
      description:
        "The transparent cut-out used in the home hero, the Services bubbles and the About page. The tool stickers are positioned around the current photo's silhouette, so a replacement needs the same framing (PNG, transparent, subject in the bottom 80%).",
    }),
    defineField({
      name: "studioPhoto",
      title: "On-set photo",
      type: "image",
      group: "images",
      options: { hotspot: true },
      description: "Portrait (4:5). Used in the home About teaser and the About page.",
    }),
    defineField({
      name: "founderPortrait",
      title: "Founder portrait",
      type: "image",
      group: "images",
      options: { hotspot: true },
      description: "The portrait card in the footer.",
    }),

    defineField({ name: "footerCta", title: "Call-to-action line", type: "string", group: "footer" }),
    defineField({ name: "footerButton", title: "Call-to-action button", type: "string", group: "footer" }),
    defineField({ name: "founderCaption", title: "Portrait caption", type: "string", group: "footer" }),

    defineField({ name: "seoTitle", title: "Default page title", type: "string", group: "seo" }),
    defineField({ name: "seoDescription", title: "Description", type: "text", rows: 3, group: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

export const homePage = defineType({
  name: "homePage",
  title: "Home",
  type: "document",
  icon: House,
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "sections", title: "Sections" },
  ],
  fields: [
    defineField({ name: "heroLine1", title: "Headline, line 1", type: "string", group: "hero" }),
    defineField({ name: "heroLine2", title: "Headline, line 2 (heavy)", type: "string", group: "hero" }),
    defineField({ name: "heroLine3", title: "Headline, line 3 (script)", type: "string", group: "hero" }),
    defineField({ name: "heroTagline", title: "Purple tagline", type: "string", group: "hero" }),
    defineField({ name: "heroIntro", title: "Intro paragraph", type: "text", rows: 3, group: "hero" }),
    defineField({ name: "heroButton", title: "Button", type: "string", group: "hero" }),

    defineField({ name: "results", title: "Results", type: "heading", group: "sections" }),
    defineField({
      name: "projectsDelivered",
      title: "Projects delivered",
      type: "string",
      group: "sections",
      description: "The first figure in the Results stats, e.g. 120+. The brand and country counts are worked out automatically.",
    }),
    defineField({ name: "testimonials", title: "Testimonials", type: "heading", group: "sections" }),
    defineField({ name: "work", title: "My work", type: "heading", group: "sections" }),
    defineField({ name: "marqueeOne", title: "Scrolling banner 1", type: "string", group: "sections" }),
    defineField({ name: "services", title: "Services bubbles", type: "heading", group: "sections" }),
    defineField({ name: "marqueeTwo", title: "Scrolling banner 2", type: "string", group: "sections" }),
  ],
  preview: { prepare: () => ({ title: "Home" }) },
});

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About",
  type: "document",
  icon: Info,
  description: "The intro and countries sections also appear on the home page.",
  fields: [
    defineField({ name: "intro", title: "Intro", type: "heading" }),
    defineField({ name: "aboutTitle", title: "“About us” block title", type: "string" }),
    defineField({
      name: "principles",
      title: "Who / what / why",
      type: "array",
      description: `Exactly three. ${HIGHLIGHT_NOTE}`,
      of: [defineArrayMember({ type: "blurb" })],
      validation: (r) => r.length(3),
    }),
    defineField({ name: "photoCaption", title: "On-set photo caption", type: "string" }),
    defineField({ name: "team", title: "Team", type: "heading" }),
    defineField({ name: "countries", title: "Countries", type: "heading" }),
  ],
  preview: { prepare: () => ({ title: "About" }) },
});

export const servicesPage = defineType({
  name: "servicesPage",
  title: "Services",
  type: "document",
  icon: Wrench,
  description: "The packages also appear on the home page.",
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "services", title: "Services" },
    { name: "packages", title: "Packages" },
  ],
  fields: [
    hero,
    defineField({
      name: "bubbles",
      title: "Service bubbles (home page)",
      type: "array",
      group: "services",
      description: "Up to 11 — the desktop layout has a fixed spot for each.",
      validation: (r) => r.max(11),
      of: [
        defineArrayMember({
          type: "object",
          name: "bubble",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "color",
              title: "Colour",
              type: "string",
              options: {
                list: [
                  { title: "Purple", value: "accent" },
                  { title: "Lilac", value: "tint" },
                  { title: "Ink", value: "ink" },
                  { title: "Teal", value: "teal" },
                ],
                layout: "radio",
                direction: "horizontal",
              },
              initialValue: "accent",
            }),
          ],
          preview: { select: { title: "label", subtitle: "color" } },
        }),
      ],
    }),
    defineField({
      name: "groups",
      title: "Service groups",
      type: "array",
      group: "services",
      of: [
        defineArrayMember({
          type: "object",
          name: "serviceGroup",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "icon",
              title: "Icon",
              type: "string",
              options: {
                list: [
                  { title: "Camera", value: "camera" },
                  { title: "Clapperboard", value: "clapperboard" },
                  { title: "Monitor", value: "monitor" },
                  { title: "Megaphone", value: "megaphone" },
                  { title: "Trending up", value: "trending" },
                ],
              },
            }),
            defineField({ name: "body", title: "Text", type: "text", rows: 2 }),
            defineField({
              name: "items",
              title: "What's included",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
              options: { layout: "tags" },
            }),
          ],
          preview: { select: { title: "title", subtitle: "body" } },
        }),
      ],
    }),
    defineField({ name: "toolboxTitle", title: "Toolbox title", type: "string", group: "services" }),
    defineField({
      name: "toolbox",
      title: "Toolbox logos",
      type: "array",
      group: "services",
      description: "Software logos, ideally SVG. Shown about 24px tall.",
      of: [defineArrayMember({ type: "image" })],
      options: { layout: "grid" },
    }),

    defineField({ name: "packagesHeading", title: "Packages heading", type: "heading", group: "packages" }),
    defineField({
      name: "packages",
      title: "Packages",
      type: "array",
      group: "packages",
      of: [
        defineArrayMember({
          type: "object",
          name: "package",
          fields: [
            defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "price",
              title: "Price",
              type: "string",
              description: "As it should read, e.g. $750. Write “Custom” to turn the button into “Let's talk”.",
            }),
            defineField({ name: "cadence", title: "Cadence", type: "string", description: "e.g. / month" }),
            defineField({ name: "pitch", title: "Pitch", type: "string" }),
            defineField({
              name: "features",
              title: "Features",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
            }),
            defineField({
              name: "featured",
              title: "Highlight this one",
              type: "boolean",
              description: "Dark card with a “Most popular” badge. Keep it to one.",
              initialValue: false,
            }),
          ],
          preview: { select: { title: "name", subtitle: "price" } },
        }),
      ],
    }),
    defineField({ name: "packagesFootnote", title: "Note under the packages", type: "string", group: "packages" }),
  ],
  preview: { prepare: () => ({ title: "Services" }) },
});

export const workPage = defineType({
  name: "workPage",
  title: "Work",
  type: "document",
  icon: BriefcaseBusiness,
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "cards", title: "Work cards" },
    { name: "recent", title: "Recent projects" },
  ],
  fields: [
    hero,
    defineField({ name: "photoLane", title: "Photography card", type: "lane", group: "cards" }),
    defineField({ name: "videoLane", title: "Videography card", type: "lane", group: "cards" }),
    defineField({ name: "webLane", title: "Web design card", type: "lane", group: "cards" }),
    defineField({ name: "recentTitle", title: "Recent projects title", type: "string", group: "recent" }),
    strings("tabs", "Tabs", "recent", "The tab labels above the grid."),
  ],
  preview: { prepare: () => ({ title: "Work" }) },
});

export const photographyPage = defineType({
  name: "photographyPage",
  title: "Photography",
  type: "document",
  icon: Camera,
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "content", title: "Content" },
  ],
  fields: [
    hero,
    defineField({ name: "heading", title: "Section heading", type: "heading", group: "content" }),
    strings("disciplines", "Disciplines", "content"),
  ],
  preview: { prepare: () => ({ title: "Photography" }) },
});

export const videographyPage = defineType({
  name: "videographyPage",
  title: "Videography",
  type: "document",
  icon: Film,
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "content", title: "Content" },
  ],
  fields: [
    hero,
    defineField({ name: "heading", title: "Section heading", type: "heading", group: "content" }),
    blurbs("capabilities", "Capabilities", "content"),
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "stat" })],
      validation: (r) => r.max(3),
    }),
  ],
  preview: { prepare: () => ({ title: "Videography" }) },
});

export const webDesignPage = defineType({
  name: "webDesignPage",
  title: "Web design",
  type: "document",
  icon: Monitor,
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "content", title: "Content" },
  ],
  fields: [
    hero,
    defineField({ name: "heading", title: "Section heading", type: "heading", group: "content" }),
    defineField({ name: "capabilitiesTitle", title: "Capabilities title", type: "string", group: "content" }),
    blurbs("capabilities", "Capabilities", "content"),
    defineField({ name: "processHeading", title: "Process heading", type: "heading", group: "content" }),
    blurbs("process", "Process steps", "content"),
  ],
  preview: { prepare: () => ({ title: "Web design" }) },
});

export const faqPage = defineType({
  name: "faqPage",
  title: "FAQ",
  type: "document",
  icon: CircleQuestionMark,
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "content", title: "Questions" },
  ],
  fields: [
    hero,
    defineField({
      name: "faqs",
      title: "Questions",
      type: "array",
      group: "content",
      of: [
        defineArrayMember({
          type: "object",
          name: "faq",
          fields: [
            defineField({ name: "q", title: "Question", type: "string", validation: (r) => r.required() }),
            defineField({ name: "a", title: "Answer", type: "text", rows: 4, validation: (r) => r.required() }),
          ],
          preview: { select: { title: "q", subtitle: "a" } },
        }),
      ],
    }),
    defineField({ name: "ctaTitle", title: "Closing prompt", type: "string", group: "content" }),
    defineField({ name: "ctaButton", title: "Closing button", type: "string", group: "content" }),
  ],
  preview: { prepare: () => ({ title: "FAQ" }) },
});

export const singletonTypes = [
  siteSettings,
  homePage,
  aboutPage,
  servicesPage,
  workPage,
  photographyPage,
  videographyPage,
  webDesignPage,
  faqPage,
];
