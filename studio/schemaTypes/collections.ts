import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { Camera, Film, Image as ImageIcon, MessageSquareQuote, Monitor, Sparkles, Users } from "lucide-react";
import { defineField, defineType, type PreviewValue } from "sanity";

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

const MOSAIC_NOTE =
  "The gallery is laid out in blocks of nine. Keep the number shown (not hidden) a multiple of nine (9, 18, 27…) so the bottom row sits flush — extras past the last full block are held back.";

export const photo = defineType({
  name: "photo",
  title: "Photo",
  type: "document",
  icon: Camera,
  description: MOSAIC_NOTE,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "photo" }),
    hidden,
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
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Brand & campaign", value: "brand" },
          { title: "Product & menu", value: "product" },
          { title: "Portrait & team", value: "portrait" },
          { title: "Event & venue", value: "event" },
        ],
      },
    }),
    showInRecent,
  ],
  preview: preview({ title: "alt", subtitle: "category", media: "image" }, "Untitled photo"),
});

export const video = defineType({
  name: "video",
  title: "Video",
  type: "document",
  icon: Film,
  description: MOSAIC_NOTE,
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "video" }),
    hidden,
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "poster",
      title: "Poster frame",
      type: "image",
      options: { hotspot: true },
      description: "The still shown in the gallery, and before the clip loads.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "clip",
      title: "Loop clip",
      type: "file",
      options: { accept: "video/mp4,video/webm,video/quicktime" },
      description:
        "Optional. A short, silent MP4 (5–15 s, ideally under 15 MB) that plays on a loop in place of the poster. Upload full-length films to YouTube/Vimeo and use the link below instead.",
    }),
    defineField({
      name: "link",
      title: "Full video link",
      type: "url",
      description: "Optional. The full film. YouTube and Vimeo links play inside the site's viewer; any other page gets a "Watch the full film" link.",
      validation: (r) => r.uri({ scheme: ["http", "https"] }),
    }),
    showInRecent,
  ],
  preview: preview({ title: "title", media: "poster" }),
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
  ],
  preview: preview({ title: "name", subtitle: "quote", media: "avatar" }, "Name withheld"),
});

export const result = defineType({
  name: "result",
  title: "Client message",
  type: "document",
  icon: Sparkles,
  description: "Screenshots of real client messages for the Results section. Confirm consent, or blur names and avatars, before publishing.",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "result" }),
    hidden,
    defineField({ name: "image", title: "Screenshot", type: "image", validation: (r) => r.required() }),
    defineField({ name: "label", title: "Caption", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description: "What the message says, for screen readers.",
    }),
  ],
  preview: preview({ title: "label", media: "image" }),
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

export const collectionTypes = [photo, video, webProject, testimonial, result, teamMember, clientLogo];
