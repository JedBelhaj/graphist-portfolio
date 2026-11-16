/* The admin for the Soltani Media site. Hosted by Sanity (`npm run deploy` →
   <name>.sanity.studio); the Next.js site in ../front reads what's published
   here through Sanity's API.

   Editors sign in with their Sanity account. Who can get in is managed on
   sanity.io/manage → the project → Members. */
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { media } from "sanity-plugin-media";
import { muxInput } from "sanity-plugin-mux-input";
import { structureTool } from "sanity/structure";
import { CompressionInput, CompressionLayout, withCompression } from "./assetSources/compressedUpload";
import { googleDriveSource } from "./assetSources/googleDrive";
import { SINGLETONS, schemaTypes } from "./schemaTypes";
import { structure } from "./structure";
import { bulkAddTool } from "./tools/bulkAdd";

/* SANITY_STUDIO_* variables come from .env (see .env.example) and are
   baked in at build time, so set them before `npm run deploy`. */
const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

const SINGLETON_ACTIONS = new Set(["publish", "discardChanges", "restore"]);
/* Contact-form messages: tick "Dealt with" and publish, or delete. */
const MESSAGE_ACTIONS = new Set(["publish", "discardChanges", "delete"]);

const IN_CATEGORY = [
  { id: "video-in-category", type: "video", title: "Video in a category" },
  { id: "photo-in-category", type: "photo", title: "Photo in a category" },
];

export default defineConfig({
  name: "soltani",
  title: "Soltani Media — Admin",
  projectId,
  dataset,

  plugins: [
    structureTool({ structure }),
    /* "Media" tab: a library of every uploaded photo and video. Tag them, then
       pick from it in any image or file field (it also adds itself to each
       field's Select menu). Uploading there is off because the plugin can't
       compress videos: new files come in through Bulk add or the fields. */
    media({ directUploads: false }),
    /* Videos are hosted and streamed by Mux, not stored in Sanity: Mux
       converts each upload into sizes for every connection, and makes the
       looping previews and stills the site shows. The Mux access token is
       entered once in the studio and kept in the dataset (secrets.mux).
       Both config dialogs are off, so an upload starts straight away with
       the settings here. */
    muxInput({
      video_quality: "plus",
      max_resolution_tier: "1080p",
      acceptedMimeTypes: ["video/*"],
      disableUploadConfig: true,
      disableTextTrackConfig: true,
    }),
    /* GROQ playground, for debugging queries. */
    visionTool({ defaultApiVersion: "2026-10-13" }),
  ],

  /* "Bulk add" tab: a folder of photos or videos in, one gallery item each. */
  tools: (prev) => [...prev, bulkAddTool],

  /* Asks whether to cut a video that's too long, whichever page uploaded it. */
  studio: { components: { layout: CompressionLayout } },

  schema: {
    types: schemaTypes,
    /* Singletons can't be created from the global "+" menu, nor can messages
       (only the contact form makes those). The two "… in a category" templates back the "New video/photo in this category" button
       in a category (components/CategoryItems.tsx). */
    templates: (templates) => [
      ...templates.filter(({ schemaType }) => !SINGLETONS.includes(schemaType) && schemaType !== "message"),
      ...IN_CATEGORY.map(({ id, type, title }) => ({
        id,
        title,
        schemaType: type,
        parameters: [{ name: "categoryId", type: "string" }],
        value: ({ categoryId }: { categoryId: string }) => ({
          category: { _type: "reference", _ref: categoryId, _weak: true },
        }),
      })),
    ],
  },

  /* Adds "Google Drive link" next to the built-in sources in every image and
     file field's Select menu. File fields also compress videos on upload, with
     a switch under the field. */
  form: {
    image: { assetSources: (prev) => [...prev, googleDriveSource] },
    file: { assetSources: (prev) => [...prev.map(withCompression), googleDriveSource] },
    components: { input: CompressionInput },
  },

  document: {
    /* The "… in a category" templates only make sense from a category. */
    newDocumentOptions: (prev) => prev.filter(({ templateId }) => !IN_CATEGORY.some((t) => t.id === templateId)),
    /* …or deleted / duplicated: there is exactly one of each. */
    actions: (input, { schemaType }) =>
      SINGLETONS.includes(schemaType)
        ? input.filter(({ action }) => action && SINGLETON_ACTIONS.has(action))
        : schemaType === "message"
          ? input.filter(({ action }) => action && MESSAGE_ACTIONS.has(action))
          : input,
  },
});
