import { defineArrayMember, defineField, defineType } from "sanity";

/* Small building blocks shared by the page singletons. */

/* A section's heading block. Not every section shows every part — a field the
   design doesn't use is simply ignored, and anything left blank falls back to
   the original copy. */
export const heading = defineType({
  name: "heading",
  title: "Heading",
  type: "object",
  options: { collapsible: true, collapsed: false },
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: "The small purple label above the heading.",
    }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "accent",
      title: "Accent line",
      type: "string",
      description: "The second line, set in the handwritten script face.",
    }),
    defineField({ name: "body", title: "Intro text", type: "text", rows: 3 }),
  ],
});

/* The opening block of every page except home. */
export const pageHero = defineType({
  name: "pageHero",
  title: "Page hero",
  type: "object",
  options: { collapsible: true, collapsed: false },
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({
      name: "accent",
      title: "Accent line",
      type: "string",
      description: "Optional second line in the script face.",
    }),
    defineField({ name: "body", title: "Intro text", type: "text", rows: 3 }),
  ],
});

/* Title + paragraph: capabilities, principles, process steps. */
export const blurb = defineType({
  name: "blurb",
  title: "Item",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", title: "Text", type: "text", rows: 3 }),
  ],
  preview: { select: { title: "title", subtitle: "body" } },
});

export const stat = defineType({
  name: "stat",
  title: "Stat",
  type: "object",
  fields: [
    defineField({
      name: "figure",
      title: "Figure",
      type: "string",
      description: "As it should read, e.g. 120+, 6K, 72h.",
      validation: (r) => r.required(),
    }),
    defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "figure", subtitle: "label" } },
});

/* One of the three cards that lead into the work pages. The picture comes
   from the first item of that lane's collection. */
export const lane = defineType({
  name: "lane",
  title: "Work card",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "blurb", title: "Blurb", type: "string" }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
  ],
});

export const objectTypes = [heading, pageHero, blurb, stat, lane];
