import { createClient } from "next-sanity";
import { apiVersion, dataset, isSanityConfigured, projectId } from "./env";

/* Read-only client for the public site. Published content only, through the
   CDN — drafts stay in the studio until someone hits Publish. */
export const client = isSanityConfigured
  ? createClient({ projectId, dataset, apiVersion, useCdn: true, perspective: "published" })
  : null;

/* Every site query carries this tag. /api/revalidate clears it when the
   publish webhook fires, so edits show up straight away; REVALIDATE_SECONDS is
   the fallback if the webhook isn't set up. */
export const SANITY_TAG = "sanity";
const REVALIDATE_SECONDS = 60;

export async function sanityFetch<T>(query: string, params: Record<string, unknown> = {}) {
  if (!client) return null;
  return client.fetch<T>(query, params, {
    next: { revalidate: REVALIDATE_SECONDS, tags: [SANITY_TAG] },
  });
}
