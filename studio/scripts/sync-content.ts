/* Pushes content worked out locally in ../front/src/lib/content.ts into
   Sanity. Each part is a named step, and only the steps you name run, so a
   later sync can't undo what an editor has done since (a crop, a hidden item):

     npm run sync-content                          lists the steps
     npm run sync-content -- -- team               prints the plan for "team"
     npm run sync-content -- -- team --apply       makes the change

   Runs as whoever is logged in to the Sanity CLI (`npx sanity login`).
   Each run's changes (except image uploads) go in one transaction, so a
   failure part way leaves the dataset as it was.

   Steps:
   - services: the "What makes us different" heading and tiles (stored in the
     packages fields), the hero line, the bubbles and the three groups.
   - results: replaces every Client message with the screenshots in
     public/content/results (already-uploaded files are reused). Discards any
     crop or "hide" set in the studio, so only run it for a full reset.
   - testimonials: replaces every testimonial with the defaults.
   - team: name, role and line for each member, by position in the list;
     uploads the lead's photo only if they have none.
   - images: uploads the hero cut-out, on-set photo and founder portrait. */
import { createReadStream, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { getCliClient } from "sanity/cli";
import type { Transaction } from "@sanity/client";
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

function needFiles(paths: string[]) {
  const missing = paths.filter((p) => !existsSync(fileOf(p)));
  if (missing.length) throw new Error(`Missing files in front/public:\n  ${missing.join("\n  ")}`);
}

async function upload(publicPath: string) {
  const file = fileOf(publicPath);
  const asset = await client.assets.upload("image", createReadStream(file), { filename: basename(file) });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

/* Each step prints what it would do, and only touches the dataset (uploads,
   then queued changes on `tx`) when `apply` is set. */
type Step = (tx: Transaction) => Promise<void>;

const steps: Record<string, Step> = {
  async services(tx) {
    console.log(`services
  heading  → "${COPY.services.packagesHeading.title}"
  tiles    → ${PACKAGES.map((p) => p.name).join(" · ")}
  hero     → "${COPY.services.hero.body.slice(0, 40)}…"
  bubbles  → ${SERVICES.length}
  groups   → ${SERVICE_GROUPS.map((g) => g.title).join(" · ")}`);
    if (!apply) return;
    tx.patch("servicesPage", (p) =>
      p.set({
        packagesHeading: {
          _type: "heading",
          title: COPY.services.packagesHeading.title,
          body: COPY.services.packagesHeading.body,
        },
        packages: keyed(PACKAGES.map(({ name, pitch, featured }) => ({ name, pitch, featured })), "package"),
        "hero.body": COPY.services.hero.body,
        bubbles: keyed(SERVICES, "bubble"),
        groups: keyed(SERVICE_GROUPS.map(({ title, body, items }) => ({ title, body, items })), "serviceGroup"),
      }),
    );
  },

  async results(tx) {
    needFiles(RESULTS.map((r) => r.src));
    const now = await client.fetch<{ _id: string; file: string; image: unknown }[]>(
      `*[_type == "result"]{ _id, "file": image.asset->originalFilename, image }`,
    );
    const reused = new Map(now.filter((r) => r.image).map((r) => [r.file, r.image]));
    const results = RESULTS.map((r) => ({ ...r, file: basename(decodeURI(r.src)) }));
    console.log(`results: ${now.length} → ${results.length} (${results.filter((r) => !reused.has(r.file)).length} to upload; crops and hides are reset)`);
    if (!apply) return;
    const images: unknown[] = [];
    for (const r of results) images.push(reused.get(r.file) ?? (await upload(r.src)));
    for (const r of now) tx.delete(r._id);
    results.forEach((r, i) =>
      tx.create({ _type: "result", image: images[i], label: r.label, alt: r.alt, orderRank: rank(i) }),
    );
  },

  async testimonials(tx) {
    const now = await client.fetch<{ _id: string }[]>(`*[_type == "testimonial"]{ _id }`);
    console.log(`testimonials: delete ${now.length}, create ${TESTIMONIALS.length}`);
    if (!apply) return;
    for (const t of now) tx.delete(t._id);
    TESTIMONIALS.forEach((t, i) =>
      tx.create({ _type: "testimonial", quote: t.quote, name: t.name, tag: t.tag, orderRank: rank(i) }),
    );
  },

  async team(tx) {
    const now = await client.fetch<{ _id: string; name: string; role?: string; hasPhoto: boolean }[]>(
      `*[_type == "teamMember"] | order(orderRank){ _id, name, role, "hasPhoto": defined(photo.asset) }`,
    );
    if (now.length !== TEAM.length) {
      throw new Error(`team: the studio has ${now.length} members and content.ts ${TEAM.length}; match them by hand first`);
    }
    console.log("team");
    TEAM.forEach((m, i) => console.log(`  ${now[i].name} (${now[i].role ?? "no role"}) → ${m.name} (${m.role})`));
    const leadPhoto = !now[0].hasPhoto && TEAM[0].photo.startsWith("/");
    if (leadPhoto) console.log(`  + photo for ${TEAM[0].name}`);
    if (!apply) return;
    const photo = leadPhoto ? await upload(TEAM[0].photo) : null;
    TEAM.forEach((m, i) =>
      tx.patch(now[i]._id, (p) => p.set({ name: m.name, role: m.role, focus: m.focus, ...(i === 0 && photo ? { photo } : {}) })),
    );
  },

  async images(tx) {
    needFiles([HERO_PHOTO, STUDIO_PHOTO, FOUNDER_PORTRAIT]);
    console.log("images: hero cut-out, on-set photo and founder portrait (new uploads)");
    if (!apply) return;
    const [heroPhoto, studioPhoto, founderPortrait] = await Promise.all(
      [HERO_PHOTO, STUDIO_PHOTO, FOUNDER_PORTRAIT].map(upload),
    );
    tx.patch("siteSettings", (p) => p.set({ heroPhoto, studioPhoto, founderPortrait }));
  },
};

async function main() {
  const chosen = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const unknown = chosen.filter((s) => !(s in steps));
  if (!chosen.length || unknown.length) {
    if (unknown.length) console.log(`Unknown step: ${unknown.join(", ")}`);
    console.log(`Steps: ${Object.keys(steps).join(", ")}\nExample: npm run sync-content -- -- team --apply`);
    return;
  }

  const tx = client.transaction();
  for (const name of chosen) await steps[name](tx);

  if (!apply) {
    console.log("\nDry run. Nothing was changed. Add --apply to make these changes.");
    return;
  }
  await tx.commit();
  console.log("Done. The site picks it up on the next page view (publish webhook), or within a minute.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
