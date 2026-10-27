/* Converts Videography sections saved by the first version of the studio
   (`videoSection`: title, image, layout, tone…) to the per-client shape the
   site reads (`clientSection`: client, photo, videos, style, side).

     npm run migrate:video-sections      (from studio/)

   Runs as whoever is logged in to the Sanity CLI (`npx sanity login`). Fixes
   the published page and, if there is one, the unpublished draft, so
   publishing the draft later can't bring the old shape back. Safe to re-run:
   sections already in the new shape are left alone.

   The title becomes the client name and the cover image the photo; the
   videos and the hide switch carry over. The old layouts (cinema, split…)
   have no counterpart among the new photo styles, so style and side start
   on Auto. The accent, intro and background tone are dropped: the per-client
   sections don't show them. */
import { getCliClient } from "sanity/cli";

type OldSection = {
  _key: string;
  _type: "videoSection";
  title?: string;
  image?: unknown;
  videos?: unknown[];
  hidden?: boolean;
};
type Section = { _key: string; _type: string } & Record<string, unknown>;

const client = getCliClient({ apiVersion: "2024-01-01" });

const convert = (s: OldSection) => ({
  _key: s._key,
  _type: "clientSection",
  client: s.title ?? "",
  ...(s.image ? { photo: s.image } : {}),
  videos: s.videos ?? [],
  style: "auto",
  side: "auto",
  hidden: s.hidden ?? false,
});

for (const id of ["videographyPage", "drafts.videographyPage"]) {
  const doc = await client.getDocument<{ _id: string; sections?: Section[] }>(id);
  if (!doc) continue;

  const sections = doc.sections ?? [];
  const old = sections.filter((s) => s._type === "videoSection");
  if (old.length === 0) {
    console.log(`${id}: nothing to convert`);
    continue;
  }

  await client
    .patch(id)
    .set({ sections: sections.map((s) => (s._type === "videoSection" ? convert(s as OldSection) : s)) })
    .commit();
  console.log(`${id}: converted ${old.map((s) => s.title || s._key).join(", ")}`);
}
