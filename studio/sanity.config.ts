/* The admin for the Soltani Media site. Hosted by Sanity (`npm run deploy` →
   <name>.sanity.studio); the Next.js site in ../front reads what's published
   here through Sanity's API.

   Editors sign in with their Sanity account. Who can get in is managed on
   sanity.io/manage → the project → Members. */
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { media } from "sanity-plugin-media";
import { structureTool } from "sanity/structure";
import { googleDriveSource } from "./assetSources/googleDrive";
import { SINGLETONS, schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

/* SANITY_STUDIO_* variables come from .env (see .env.example) and are
   baked in at build time, so set them before `npm run deploy`. */
const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "";
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

const SINGLETON_ACTIONS = new Set(["publish", "discardChanges", "restore"]);

export default defineConfig({
  name: "soltani",
  title: "Soltani Media — Admin",
  projectId,
  dataset,

  plugins: [
    structureTool({ structure }),
    /* "Media" tab: a library of every uploaded photo and video. Drag a whole
       folder in at once, tag it, then pick from it in any image or file field
       (it also adds itself to each field's Select menu). */
    media(),
    /* GROQ playground, for debugging queries. */
    visionTool({ defaultApiVersion: "2026-10-13" }),
  ],

  schema: {
    types: schemaTypes,
    /* Singletons can't be created from the global "+" menu. */
    templates: (templates) => templates.filter(({ schemaType }) => !SINGLETONS.includes(schemaType)),
  },

  /* Adds "Google Drive link" next to the built-in sources in every image and
     file field's Select menu. */
  form: {
    image: { assetSources: (prev) => [...prev, googleDriveSource] },
    file: { assetSources: (prev) => [...prev, googleDriveSource] },
  },

  document: {
    /* …or deleted / duplicated: there is exactly one of each. */
    actions: (input, { schemaType }) =>
      SINGLETONS.includes(schemaType)
        ? input.filter(({ action }) => action && SINGLETON_ACTIONS.has(action))
        : input,
  },
});
