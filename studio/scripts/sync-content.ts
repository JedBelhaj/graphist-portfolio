/* Pushes the content worked out locally in ../front/src/lib/content.ts into
   Sanity, for the fields changed on the feature/packages-cards branch:

     npm run sync-content              (from studio/) prints the plan only
     npm run sync-content -- -- --apply   makes the changes

   Runs as whoever is logged in to the Sanity CLI (`npx sanity login`).

   - Services page: the "What makes us different" heading and tiles (stored
     in the packages fields), the hero line, the bubbles and the three groups.
   - Results: the 15 screenshots in public/content/results. The three already
     uploaded keep their documents and assets; the rest are uploaded.
   - Testimonials: the Upwork reviews replace the three placeholder quotes.
   - Team: the real names for the other three members, and Oussama's photo.
   - Site images: hero cut-out, on-set photo and founder portrait.

   Everything except the image uploads goes in one transaction, so a failure
   part way leaves the dataset as it was. */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { getCliClient } from "sanity/cli";
import {
  COPY,
  FOUNDER_PORTRAIT,
  HERO_PHOTO,
  PACKAGES,
  RESULTS,
  SERVICE_GROUPS,
  SERVICES,
  STUDIO_PHOTO,
  TEAM,
  TESTIMONIALS,
} from "../../front/src/lib/content";

const client = getCliClient({ apiVersion: "2026-10-13" });
const apply = process.argv.includes("--apply");
const PUBLIC = join(process.cwd(), "..", "front", "public");

const keyed = <T extends object>(items: T[], type: string) =>
  items.map((item, i) => ({ _key: `k${i}`, _type: type, ...item }));
const rank = (i: number) => `0|${(100000 + i * 1000).toString(36)}:`;
const fileOf = (publicPath: string) => join(PUBLIC, decodeURI(publicPath));

async function upload(publicPath: string) {
  const file = fileOf(publicPath);
  const asset = await client.assets.upload("image", createReadStream(file), { filename: basename(file) });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

async function main() {
  const missing = [HERO_PHOTO, STUDIO_PHOTO, FOUNDER_PORTRAIT, TEAM[0].photo, ...RESULTS.map((r) => r.src)].filter(
    (p) => !existsSync(fileOf(p)),
  );
  if (missing.length) throw new Error(`Missing files in front/public:\n  ${missing.join("\n  ")}`);

  type Existing = { _id: string; name?: string; file?: string };
  const now = await client.fetch<{
    results: Existing[];
    resultAssets: { file: string; image: unknown }[];
    testimonials: Existing[];
    team: Existing[];
  }>(`{
    "results": *[_type == "result"]{ _id, "file": image.asset->originalFilename },
    "resultAssets": *[_type == "result" && defined(image.asset)]{ "file": image.asset->originalFilename, image },
    "testimonials": *[_type == "testimonial"]{ _id, name },
    "team": *[_type == "teamMember"] | order(orderRank){ _id, name }
  }`);

  const reused = new Map(now.resultAssets.map((r) => [r.file, r.image]));
  const results = RESULTS.map((r) => ({ ...r, file: basename(decodeURI(r.src)) }));
  const renames: [string, string][] = TEAM.slice(1).map((m, i) => [now.team[i + 1]?.name ?? "?", m.name]);

  console.log(`Services page
  heading  → "${COPY.services.packagesHeading.title}"
  tiles    → ${PACKAGES.map((p) => p.name).join(" · ")}
  hero     → "${COPY.services.hero.body.slice(0, 40)}…"
  bubbles  → ${SERVICES.length} (${SERVICES.map((s) => s.label).join(", ")})
  groups   → ${SERVICE_GROUPS.map((g) => g.title).join(" · ")}
Results: ${now.results.length} → ${results.length} (${results.filter((r) => reused.has(r.file)).length} reuse their upload, ${results.filter((r) => !reused.has(r.file)).length} to upload)
Testimonials: delete ${now.testimonials.length} placeholders, create ${TESTIMONIALS.length} Upwork reviews
Team: ${renames.map(([a, b]) => `${a} → ${b}`).join(", ")}; photo for ${now.team[0]?.name}
Site images: hero, on-set and founder photos uploaded from front/public/photos`);

  if (!apply) {
    console.log("\nDry run. Nothing was changed. Add --apply to make these changes.");
    return;
  }

  console.log("\nUploading images…");
  const [heroPhoto, studioPhoto, founderPortrait, leadPhoto] = await Promise.all(
    [HERO_PHOTO, STUDIO_PHOTO, FOUNDER_PORTRAIT, TEAM[0].photo].map(upload),
  );
  const resultImages = [];
  for (const r of results) resultImages.push(reused.get(r.file) ?? (await upload(r.src)));

  const tx = client.transaction();

  tx.patch("servicesPage", (p) =>
    p.set({
      packagesHeading: { _type: "heading", title: COPY.services.packagesHeading.title, body: COPY.services.packagesHeading.body },
      packages: keyed(PACKAGES.map(({ name, pitch, featured }) => ({ name, pitch, featured })), "package"),
      "hero.body": COPY.services.hero.body,
      bubbles: keyed(SERVICES, "bubble"),
      groups: keyed(SERVICE_GROUPS.map(({ title, body, items }) => ({ title, body, items })), "serviceGroup"),
    }),
  );

  for (const r of now.results) tx.delete(r._id);
  results.forEach((r, i) =>
    tx.create({ _type: "result", image: resultImages[i], label: r.label, alt: r.alt, orderRank: rank(i) }),
  );

  for (const t of now.testimonials) tx.delete(t._id);
  TESTIMONIALS.forEach((t, i) =>
    tx.create({ _type: "testimonial", quote: t.quote, name: t.name, tag: t.tag, orderRank: rank(i) }),
  );

  tx.patch(now.team[0]._id, (p) => p.set({ photo: leadPhoto }));
  TEAM.slice(1).forEach((m, i) => {
    const doc = now.team[i + 1];
    if (doc) tx.patch(doc._id, (p) => p.set({ name: m.name }));
  });

  tx.patch("siteSettings", (p) => p.set({ heroPhoto, studioPhoto, founderPortrait }));

  await tx.commit();
  console.log("Done. The site picks it up within a minute (or on the next publish webhook).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
