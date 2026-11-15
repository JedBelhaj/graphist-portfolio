import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { Briefcase, Camera, Film, Image as ImageIcon, MessageSquareQuote, Monitor, Sparkles, Users } from "lucide-react";
import { createElement } from "react";
import { defineField, defineType, type PreviewValue } from "sanity";
import { PhotoCategoryItems, VideoCategoryItems } from "../components/CategoryItems";

/* The repeatable content: one document per photo, video, person, logo.
   Each list is drag-to-reorder in the studio (orderRank), and the site shows
   them in that order. Any item can be hidden: it stays in the studio but the
   site's query skips it. */

const hidden = defineField({
  name: "hidden",
  title: "Hide from website",
  type: "boolean",
  description: "Keeps this in the studio but off the site. Switch it off again to show it.",
  initialValue: false,
});

/* List previews with "Hidden" in front of the subtitle, so hidden items stand
   out in the studio lists. */
type PreviewFields = { title?: string; subtitle?: string; media?: PreviewValue["media"]; hidden?: boolean };
const preview = (select: { title: string; subtitle?: string; media?: string }, untitled?: string) => ({
  select: { ...select, hidden: "hidden" },
  prepare: ({ title, subtitle, media, hidden }: PreviewFields) => ({
    title: title || untitled,
    subtitle: hidden ? ["Hidden", subtitle].filter(Boolean).join(" · ") : subtitle,
    media,
  }),
});

const showInRecent = defineField({
  name: "showInRecent",
  title: "Show in “Recent projects”",
  type: "boolean",
  description: "Adds this to the mixed grid on the Work page (the first seven are shown).",
  initialValue: false,
});

const featured = defineField({
  name: "featured",
  title: "Featured",
  type: "boolean",
  description: "Featured items come first on the site, ahead of the list order.",
  initialValue: false,
});

const MOSAIC_NOTE =
  "The gallery is laid out in blocks of nine, and the last few photos are resized to fill the rows. To hold them back until a block is full instead, change Gallery layout on the Photography page.";

/* The fields that matter go first; the rarely used ones sit in a collapsed
   "More options" at the bottom, so the form stays short. */
const MORE = [{ name: "more", title: "More options", options: { collapsible: true, collapsed: true } }];
const more = <T extends object>(field: T) => ({ ...field, fieldset: "more" });

/* An item's category: at most one, or none. Weak, so deleting a category
   just leaves its items without one instead of being blocked. */
const category = (to: "videoCategory" | "photoCategory", description: string) =>
  defineField({ name: "category", title: "Category", type: "reference", to: [{ type: to }], weak: true, description });

/* The category's title under the item's name in lists, or that it has none. */
const categorySubtitle = (category?: string, hidden?: boolean) =>
  [hidden ? "Hidden" : null, category ?? "No category"].filter(Boolean).join(" · ");

export const photo = defineType({
  name: "photo",
  title: "Photo",
  type: "document",
  icon: Camera,
  description: MOSAIC_NOTE,
  orderings: [orderRankOrdering],
  fieldsets: MORE,
  fields: [
    orderRankField({ type: "photo" }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      description: "Full-resolution upload is fine — the site resizes it. Set the hotspot to the part that must never be cropped.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description: "What's in the picture, for screen readers and search.",
    }),
    category(
      "photoCategory",
      "Where it shows on the Photography page. Photos with no category aren't shown there (unless there are no categories at all, then every photo is).",
    ),
    more(showInRecent),
    more(hidden),
  ],
  preview: {
    select: { title: "alt", media: "image", category: "category.title", hidden: "hidden" },
    prepare: ({ title, media, category, hidden }: { title?: string; media?: PreviewValue["media"]; category?: string; hidden?: boolean }) => ({
      title: title || "Untitled photo",
      subtitle: categorySubtitle(category, hidden),
      media,
    }),
  },
});

export const video = defineType({
  name: "video",
  title: "Video",
  type: "document",
  icon: Film,
  description:
    "A video shows on the Videography page once it has a category. The first one in the Videos list also fronts the Videography card on the Work page.",
  orderings: [orderRankOrdering],
  fieldsets: MORE,
  fields: [
    orderRankField({ type: "video" }),
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "muxVideo",
      title: "Video",
      type: "mux.video",
      description:
        "The full video, any length: drag the file here. The site streams it in the right size for each visitor, loops its first few seconds silently in the gallery, and works out on its own whether it's vertical.",
    }),
    category("videoCategory", "Where it shows on the Videography page. Leave empty to keep it off that page."),
    /* Only for videos still on the old file: a Mux video reports its own
       shape, which the site uses instead, so the field hides itself there. */
    defineField({
      name: "format",
      title: "Format",
      type: "string",
      hidden: ({ document }) => Boolean(document?.muxVideo),
      description: "Vertical for Reels, TikToks and Shorts, so they are not cropped to a wide frame.",
      options: {
        list: [
          { title: "Landscape (16:9)", value: "landscape" },
          { title: "Vertical (9:16)", value: "vertical" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "landscape",
    }),
    /* Videos uploaded before Mux. The site plays them until they are moved
       to the Video field above (scripts/mux-migrate.ts). Shown only while a
       video still depends on it, so new and moved videos never see it; the
       file itself is kept as a backup. */
    defineField({
      name: "clip",
      title: "Old video file",
      type: "file",
      options: { accept: "video/mp4,video/webm,video/quicktime" },
      hidden: ({ document }) => !document?.clip || Boolean(document?.muxVideo),
      description: "Uploaded before videos moved to Mux. Once the Video field above is filled, this one is no longer used.",
    }),
    more(
      defineField({
        name: "poster",
        title: "Poster frame",
        type: "image",
        options: { hotspot: true },
        description: "Optional. The still shown in the gallery before the video starts. Leave empty to use the video's first frame.",
      }),
    ),
    more(
      defineField({
        name: "link",
        title: "Full video link",
        type: "url",
        description:
          "Optional. A YouTube or Vimeo link plays inside the site's viewer instead of the video above; any other page gets a 'Watch the full film' link.",
        validation: (r) => r.uri({ scheme: ["http", "https"] }),
      }),
    ),
    more(showInRecent),
    more(hidden),
  ],
  /* The poster, else the Mux video's first frame, so videos without a poster
     can still be told apart in the list; the category underneath. */
  preview: {
    select: {
      title: "title",
      poster: "poster",
      playbackId: "muxVideo.asset.playbackId",
      category: "category.title",
      hidden: "hidden",
    },
    prepare: ({
      title,
      poster,
      playbackId,
      category,
      hidden,
    }: {
      title?: string;
      poster?: PreviewValue["media"];
      playbackId?: string;
      category?: string;
      hidden?: boolean;
    }) => ({
      title,
      subtitle: categorySubtitle(category, hidden),
      media:
        poster ??
        (playbackId
          ? createElement("img", {
              src: `https://image.mux.com/${playbackId}/thumbnail.webp?time=0&width=200`,
              alt: "",
              style: { width: "100%", height: "100%", objectFit: "cover" },
            })
          : undefined),
    }),
  },
});

export const webProject = defineType({
  name: "webProject",
  title: "Website",
  type: "document",
  icon: Monitor,
  description: "The first three are shown in the browser-window fan on the Web Design page; the first one also fronts the Web Design card.",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "webProject" }),
    hidden,
    defineField({ name: "title", title: "Client / site name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "screenshot",
      title: "Screenshot",
      type: "image",
      description: "A desktop screenshot of the top of the site, roughly 16:10 (e.g. 1440×900).",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "address",
      title: "Address bar text",
      type: "string",
      description: "What the fake address bar shows, e.g. yourbrand.com.",
    }),
  ],
  preview: preview({ title: "title", subtitle: "address", media: "screenshot" }),
});

/* The parts of an Upwork review card that can be switched off, for all cards on
   the Home page and for one card here. A hide list rather than show switches:
   a blank list means everything shows, without having to fill in every document. */
export const REVIEW_DETAILS = [
  { title: "Rating", value: "rating" },
  { title: "Job title", value: "jobTitle" },
  { title: "Earnings", value: "earnings" },
  { title: "Hourly rate", value: "hourlyRate" },
  { title: "Dates", value: "dates" },
];

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  icon: MessageSquareQuote,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "testimonial" }),
    hidden,
    defineField({ name: "quote", title: "Quote", type: "text", rows: 6, validation: (r) => r.required() }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "Leave blank to show “Client, name withheld”.",
    }),
    defineField({ name: "tag", title: "Role | Company", type: "string", description: "e.g. Owner | Cafe Nomad" }),
    defineField({
      name: "handle",
      title: "Handle",
      type: "string",
      description: "e.g. @cafenomad — shown only when Role | Company is blank.",
    }),
    defineField({ name: "avatar", title: "Photo", type: "image", options: { hotspot: true } }),
    featured,
    defineField({
      name: "hideDetails",
      title: "Hide on this card",
      type: "array",
      of: [{ type: "string" }],
      options: { list: REVIEW_DETAILS },
      description:
        "Tick what to leave off this card. To hide something on every card, use “Hide on all review cards” on the Home page (Sections tab).",
    }),
    /* Filled by the Upwork import (scripts/upwork). With Role | Company blank,
       the site builds the card's tag line from the rating and project title. */
    defineField({ name: "source", title: "Source", type: "string", initialValue: "Upwork", fieldset: "review" }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      description: "Out of 5.",
      validation: (r) => r.min(0).max(5),
      fieldset: "review",
    }),
    defineField({ name: "projectTitle", title: "Project title", type: "string", fieldset: "review" }),
    defineField({ name: "date", title: "Date", type: "date", description: "When the job ended.", fieldset: "review" }),
    defineField({
      name: "dateRange",
      title: "Date range",
      type: "string",
      description: "As Upwork shows it, e.g. Mar 2025 – Apr 2025.",
      fieldset: "review",
    }),
    defineField({
      name: "earnings",
      title: "Earnings or budget",
      type: "string",
      description: "As Upwork shows it, e.g. $450.",
      fieldset: "review",
    }),
    defineField({
      name: "hourlyRate",
      title: "Hourly rate",
      type: "string",
      description: "As Upwork shows it, e.g. $25/hr. Blank for fixed-price jobs.",
      fieldset: "review",
    }),
  ],
  fieldsets: [{ name: "review", title: "Review details", options: { collapsible: true, collapsed: true } }],
  preview: preview({ title: "name", subtitle: "quote", media: "avatar" }, "Name withheld"),
});

export const result = defineType({
  name: "result",
  title: "Client message",
  type: "document",
  icon: Sparkles,
  description: "Screenshots of real client messages for the Results section. To leave out a name or face, crop the screenshot (the crop icon on the image) or switch on \"Hide from website\".",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "result" }),
    hidden,
    defineField({
      name: "image",
      title: "Screenshot",
      type: "image",
      description: "Use the crop icon to trim it, e.g. to cut a name or profile picture out.",
      /* hotspot turns on the crop tool; the site applies the crop through the image URL. */
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "label",
      title: "Caption",
      type: "string",
      description: "Optional. The short line under the screenshot on the site.",
    }),
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description: "What the message says, for screen readers.",
    }),
  ],
  preview: preview({ title: "label", media: "image" }, "No caption"),
});

export const teamMember = defineType({
  name: "teamMember",
  title: "Team member",
  type: "document",
  icon: Users,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "teamMember" }),
    hidden,
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", title: "Role", type: "string" }),
    defineField({ name: "focus", title: "One line on what they own", type: "text", rows: 2 }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      description: "Portrait, 4:5. Shown in black and white until hovered.",
    }),
  ],
  preview: preview({ title: "name", subtitle: "role", media: "photo" }),
});

/* Projects imported from the Upwork portfolio (scripts/upwork). Not shown on
   the site yet: no section reads this list. */
export const portfolioItem = defineType({
  name: "portfolioItem",
  title: "Portfolio project",
  type: "document",
  icon: Briefcase,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "portfolioItem" }),
    hidden,
    featured,
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "description", title: "Description", type: "array", of: [{ type: "block" }] }),
    defineField({ name: "role", title: "My role", type: "string" }),
    defineField({ name: "skills", title: "Skills", type: "array", of: [{ type: "string" }], options: { layout: "tags" } }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Alt text", type: "string" })],
        },
      ],
      options: { layout: "grid" },
    }),
    defineField({
      name: "videoUrl",
      title: "Video link",
      type: "url",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
    }),
    defineField({
      name: "projectUrl",
      title: "Project link",
      type: "url",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
    }),
    defineField({ name: "source", title: "Source", type: "string", initialValue: "Upwork" }),
  ],
  preview: preview({ title: "title", subtitle: "role", media: "coverImage" }),
});

/* Size keys map to Tailwind classes in content.ts (LOGO_CAPS). The classes
   can't come from the CMS as raw text — Tailwind only generates classes it
   finds in the source. */
export const clientLogo = defineType({
  name: "clientLogo",
  title: "Client logo",
  type: "document",
  icon: ImageIcon,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "clientLogo" }),
    hidden,
    defineField({ name: "name", title: "Client name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      description:
        "Must have a transparent background (PNG, SVG or WebP). The band flattens every logo to one colour, so a logo on a solid background shows up as a solid block.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "size",
      title: "Height",
      type: "string",
      description: "Tune by eye so every logo looks equally heavy: wide wordmarks smaller, square marks larger.",
      options: {
        list: ["24", "32", "36", "40", "44", "48", "56", "64"].map((px) => ({ title: `${px}px`, value: px })),
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "48",
    }),
    defineField({
      name: "tone",
      title: "Treatment",
      type: "string",
      description:
        "Silhouette flattens the logo to one colour. Use Grayscale for marks whose detail is a light shape on a dark one, which a silhouette would fill in.",
      options: {
        list: [
          { title: "Silhouette", value: "silhouette" },
          { title: "Grayscale", value: "grayscale" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "silhouette",
    }),
  ],
  preview: preview({ title: "name", media: "logo" }),
});

/* A category on the Videography or Photography page: a title, drag-to-reorder
   in its list, and a panel listing its items (components/CategoryItems.tsx),
   which changes the items' own Category field rather than storing anything
   here. */
const categoryType = (name: "videoCategory" | "photoCategory", kind: "video" | "photo") =>
  defineType({
    name,
    title: kind === "video" ? "Video category" : "Photo category",
    type: "document",
    icon: kind === "video" ? Film : Camera,
    orderings: [orderRankOrdering],
    fields: [
      orderRankField({ type: name }),
      defineField({
        name: "title",
        title: "Title",
        type: "string",
        description: "Shown big above its items on the site. Keep it short: one or two words.",
        validation: (r) => r.required(),
      }),
      defineField({
        name: "items",
        title: kind === "video" ? "Videos in this category" : "Photos in this category",
        type: "string",
        components: { input: kind === "video" ? VideoCategoryItems : PhotoCategoryItems },
      }),
      { ...hidden, description: "Keeps this category, and everything in it, off the site." },
    ],
    preview: preview({ title: "title" }, "Untitled category"),
  });

export const videoCategory = categoryType("videoCategory", "video");
export const photoCategory = categoryType("photoCategory", "photo");

export const collectionTypes = [
  photo,
  video,
  videoCategory,
  photoCategory,
  webProject,
  testimonial,
  result,
  teamMember,
  clientLogo,
  portfolioItem,
];
