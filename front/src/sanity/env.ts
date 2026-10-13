/* Sanity connection settings, read once from the environment.

   Everything here is optional on purpose: with no project ID the site renders
   from the defaults in src/lib/content.ts, so a fresh clone, a preview build
   or a Sanity outage never takes the site down. */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

/* The date this integration was built against. Pinned on purpose, so a
   Sanity API change can't alter query results under a deploy that didn't touch
   this file. */
export const apiVersion = "2026-10-13";

export const isSanityConfigured = projectId.length > 0;
