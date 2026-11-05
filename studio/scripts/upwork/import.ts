/* Writes data/upwork/upwork.json (from `npm run upwork:parse`) into Sanity:
   reviews into Testimonials, projects into Portfolio projects.

     npm run upwork:import:dry     prints what it would write; needs no token
     npm run upwork:import         writes

   Re-running is safe. Every document has a fixed ID (upwork-review-<hash>,
   upwork-portfolio-<slug>) and is written with createOrReplace, so a second
   run updates in place. A review whose text matches a testimonial already in
   the studio (the ones first copied over by hand) updates that testimonial
   instead of adding a twin.

   The import owns the Upwork fields and the quote. What editors set in the
   studio is kept: list order, Hide from website, Featured, the name, Role |
   Company, handle, photo and Hide on this card. New documents go to the end of
   their list.

   Reads SANITY_PROJECT_ID, SANITY_DATASET and SANITY_WRITE_TOKEN from
   studio/.env (falling back to the SANITY_STUDIO_* ones for project and
   dataset). The token needs Editor rights: sanity.io/manage → the project →
   API → Tokens. */
import { createHash } from "node:crypto";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { createClient, type SanityDocument } from "@sanity/client";
import { LexoRank } from "lexorank";
import type { ParsedImage, UpworkData } from "./types";

if (existsSync(".env")) process.loadEnvFile(".env");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
/* New reviews start hidden from the website, to switch on in the studio. */
const hideNew = args.includes("--hide-new");
const DATA_DIR = resolve(args.find((a) => !a.startsWith("--")) ?? resolve(process.cwd(), "../data/upwork"));
const JSON_FILE = join(DATA_DIR, "upwork.json");

const projectId = process.env.SANITY_PROJECT_ID || process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || process.env.SANITY_STUDIO_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

/* Editor-owned fields, carried over from the existing document. */
const KEEP = {
  testimonial: ["orderRank", "hidden", "featured", "name", "tag", "handle", "avatar", "hideDetails"],
  portfolioItem: ["orderRank", "hidden", "featured"],
};

const key = (s: string) => createHash("sha1").update(s).digest("hex").slice(0, 12);
const norm = (s: string) =>
  s.normalize("NFKC").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim().toLowerCase();
const compact = <T extends object>(o: T) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined)) as Partial<T>;

/* Paragraphs → Portable Text blocks. */
const blocks = (text: string | null) =>
  text?.split(/\n\s*\n/).map((p) => ({
    _type: "block",
    _key: key(p).slice(0, 8),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: key(`${p}span`).slice(0, 8), text: p.trim(), marks: [] }],
  }));

async function main() {
  if (!existsSync(JSON_FILE)) throw new Error(`No ${JSON_FILE}. Run \`npm run upwork:parse\` first.`);
  if (!projectId) throw new Error("Set SANITY_PROJECT_ID (or SANITY_STUDIO_PROJECT_ID) in studio/.env");
  if (!dryRun && !token) throw new Error("Set SANITY_WRITE_TOKEN in studio/.env (or add --dry-run)");

  const data = JSON.parse(readFileSync(JSON_FILE, "utf8")) as UpworkData;
  /* The dataset is public, so the dry run can read without a token. */
  const client = createClient({ projectId, dataset, token, apiVersion: "2026-10-13", useCdn: false, perspective: "raw" });

  const existing = await client.fetch<SanityDocument[]>(
    `*[_type in ["testimonial", "portfolioItem"] && !(_id in path("drafts.**"))]`,
  );
  const byId = new Map(existing.map((d) => [d._id, d]));
  const byQuote = new Map(
    existing.filter((d) => d._type === "testimonial" && typeof d.quote === "string").map((d) => [norm(d.quote as string), d]),
  );
  const lastRank = (type: string) =>
    existing.filter((d) => d._type === type && typeof d.orderRank === "string").map((d) => d.orderRank as string).sort().at(-1);
  const ranks = { testimonial: lastRank("testimonial"), portfolioItem: lastRank("portfolioItem") };
  /* Lists sort by the rank as a string. The seeded ranks are short ("0|2ef4:")
     and LexoRank pads them ("0|002efk:"), which sorts first, not last; then
     step to halfway towards the end instead. */
  const nextRank = (type: keyof typeof ranks) => {
    const prev = ranks[type];
    const rank = prev ? LexoRank.parse(prev) : LexoRank.min();
    const next = rank.genNext().genNext().toString();
    return (ranks[type] = !prev || next > prev ? next : rank.between(LexoRank.max()).toString());
  };

  const keep = (type: keyof typeof KEEP, prev: SanityDocument | undefined) =>
    prev ? Object.fromEntries(KEEP[type].filter((k) => prev[k] !== undefined).map((k) => [k, prev[k]])) : { orderRank: nextRank(type) };

  /* Uploads a saved image once per run; Sanity also de-duplicates by content. */
  const uploaded = new Map<string, string>();
  const image = async (img: ParsedImage | null, alt: string) => {
    if (!img?.file) return null;
    const path = join(DATA_DIR, img.file);
    if (!existsSync(path)) return console.log(`  ! missing ${img.file}, skipped`), null;
    let ref = uploaded.get(path);
    if (!ref && dryRun) ref = `(upload ${img.file})`;
    if (!ref) {
      ref = (await client.assets.upload("image", createReadStream(path), { filename: basename(path) }))._id;
      uploaded.set(path, ref);
    }
    return { _type: "image", alt, asset: { _type: "reference", _ref: ref } };
  };

  const docs: (Record<string, unknown> & { _id: string; _type: string })[] = [];
  const notes: string[] = [];

  for (const r of data.reviews) {
    const own = `upwork-review-${r.key}`;
    /* Upwork cuts long reviews off with "..." on the profile. Match those on the
       part it shows, and keep the full quote already in the studio. */
    const shown = r.text.match(/^(.*?)(?:\.\.\.|…)$/s)?.[1];
    const prefix = shown && norm(shown);
    const whole = prefix ? [...byQuote].find(([quote]) => quote.startsWith(prefix))?.[1] : undefined;
    const match = byId.get(own) ?? byQuote.get(norm(r.text)) ?? whole;
    const _id = match?._id ?? own;
    if (match && match._id !== own) notes.push(`review "${r.text.slice(0, 40)}…" matches testimonial ${match._id}; updating it`);
    if (shown && !match) notes.push(`review "${r.text.slice(0, 40)}…" is cut off on the saved page; expand it in the studio`);
    docs.push({
      _id,
      _type: "testimonial",
      ...keep("testimonial", match),
      ...(!match && hideNew ? { hidden: true } : {}),
      ...compact({
        quote: shown && match ? (match.quote as string) : r.text,
        source: "Upwork",
        rating: r.rating,
        projectTitle: r.projectTitle,
        date: r.date,
        dateRange: r.dateRange,
        earnings: r.earnings,
        hourlyRate: r.hourlyRate,
      }),
      /* Upwork rarely shows client names; never blank out one set in the studio. */
      ...(r.clientName ? { name: r.clientName } : {}),
    });
  }

  for (const p of data.portfolio) {
    const _id = `upwork-portfolio-${p.slug}`;
    const prev = byId.get(_id);
    const cover = (await image(p.coverImage, p.title)) ?? prev?.coverImage;
    const saved = p.gallery.filter((g) => g.file);
    const gallery = (await Promise.all(saved.map((g, i) => image(g, `${p.title} ${i + 2}`))))
      .filter((g) => g !== null)
      .map((g, i) => ({ ...g, _key: key(`${p.slug}${i}${g.asset._ref}`).slice(0, 8) }));
    const lost = [p.coverImage, ...p.gallery].filter((img) => img && !img.file).length;
    if (lost) notes.push(`"${p.title}": ${lost} image(s) weren't in the saved _files folder, left out`);
    docs.push({
      _id,
      _type: "portfolioItem",
      ...keep("portfolioItem", prev),
      ...compact({
        title: p.title,
        slug: { _type: "slug", current: p.slug },
        description: blocks(p.description),
        role: p.role,
        skills: p.skills.length ? p.skills : null,
        coverImage: cover,
        gallery: gallery.length ? gallery : (prev?.gallery ?? null),
        videoUrl: p.videoUrl,
        projectUrl: p.projectUrl,
        source: "Upwork",
      }),
    });
  }

  console.log(`${dryRun ? "Dry run: would write" : "Writing"} ${docs.length} document(s) to ${projectId}/${dataset}\n`);
  for (const d of docs) {
    const label = d._type === "testimonial" ? `"${String(d.quote).slice(0, 60)}…"` : String(d.title);
    console.log(`  ${byId.has(d._id) ? "update" : "create"}  ${d._type.padEnd(13)} ${d._id}  ${label}`);
    if (dryRun && args.includes("--verbose")) console.log(JSON.stringify(d, null, 2).replace(/^/gm, "      "));
  }
  for (const n of notes) console.log(`  · ${n}`);

  if (dryRun) {
    console.log(`\nDry run. Nothing was written.${args.includes("--verbose") ? "" : " Add --verbose to see each document."}`);
    return;
  }
  const tx = client.transaction();
  for (const d of docs) tx.createOrReplace(d);
  await tx.commit({ visibility: "async" });
  console.log(`\nDone: ${docs.length} document(s) written.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
