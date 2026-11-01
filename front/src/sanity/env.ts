/* Sanity connection settings, read once from the environment.

   Everything here is optional on purpose: with no project ID the site renders
   from the defaults in src/lib/content.ts, so a fresh clone, a preview build
   or a Sanity outage never takes the site down. */
/* NEXT_PUBLIC_LOCAL_CONTENT=1 in .env.local ignores Sanity in `npm run dev`,
   so content.ts can be edited and previewed without touching the admin. Dev
   only: a build or a deploy always reads Sanity. */
const localContent =
  process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_LOCAL_CONTENT === "1";

export const projectId = localContent ? "" : (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "");
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

/* The date this integration was built against. Pinned on purpose, so a
   Sanity API change can't alter query results under a deploy that didn't touch
   this file. */
export const apiVersion = "2026-10-13";

export const isSanityConfigured = projectId.length > 0;
