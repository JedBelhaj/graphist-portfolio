/* Converts Videography sections saved by earlier versions of the studio to
   the category shape the site reads (`categorySection`: title, videos):

   - `videoSection` (the first version: title, image, layout, tone…)
   - `clientSection` (one per client: client, photo, style, side)

     npm run migrate:video-sections      (from studio/)

   Runs as whoever is logged in to the Sanity CLI (`npx sanity login`). Fixes
   the published page and, if there is one, the unpublished draft, so
   publishing the draft later can't bring the old shape back. Safe to re-run:
   sections already in the new shape are left alone.

   The old title or client name becomes the category title, so rename it in
   the studio afterwards (a client name like "LePetitSao" → "Restaurants").
   The videos and the hide switch carry over; photos, styles and the rest are
   dropped, since categories don't show them. */
import { getCliClient } from "sanity/cli";

type Section = { _key: string; _type: string } & Record<string, unknown>;

const OLD_TYPES = ["videoSection", "clientSection"];

const client = getCliClient({ apiVersion: "2024-01-01" });

const convert = (s: Section) => ({
  _key: s._key,
  _type: "categorySection",
  title: (s._type === "clientSection" ? s.client : s.title) ?? "",
  videos: s.videos ?? [],
  hidden: s.hidden ?? false,
});

for (const id of ["videographyPage", "drafts.videographyPage"]) {
  const doc = await client.getDocument<{ _id: string; sections?: Section[] }>(id);
  if (!doc) continue;

  const sections = doc.sections ?? [];
  const old = sections.filter((s) => OLD_TYPES.includes(s._type));
  if (old.length === 0) {
    console.log(`${id}: nothing to convert`);
    continue;
  }

  const converted = sections.map((s) => (OLD_TYPES.includes(s._type) ? convert(s) : s));
  await client.patch(id).set({ sections: converted }).commit();
  console.log(`${id}: converted ${old.map((s) => convert(s).title || s._key).join(", ")}`);
}
