/* Moves the Videography and Photography categories from the page documents'
   `sections` lists to category documents (videoCategory / photoCategory), and
   sets each video's and photo's `category` to match.

     npm run categories:migrate -- --dataset staging --dry-run
     npm run categories:migrate -- --dataset staging
     npm run categories:migrate -- --dataset production

   --dataset is required; --dry-run prints what it would do and changes nothing.
   Runs as whoever is logged in to the Sanity CLI.

   What it does, per kind:
   - One category document per old section, in the same order, with its title
     and hide switch. A category document with the same title is reused, so
     re-running doesn't duplicate them.
   - Each item in a section gets that category, on the published document and
     its draft. An item that already has a category (set by hand since) is
     left alone. An item listed twice keeps the first.
   - The site order inside each category must stay the same, but it now comes
     from the items' own order (orderRank). So, only on the run that creates
     the categories, the items are re-ranked: every category's items in turn,
     in their old order, then everything else in its current order. Runs that
     find everything already set up don't touch the order, so reordering done
     in the studio is kept.

   The old `sections` data is left in place (the fields are hidden in the
   studio) until the new site is live and checked. */
import { LexoRank } from "lexorank";
import { getCliClient } from "sanity/cli";

const args = process.argv.slice(2);
const arg = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const dataset = arg("dataset");
const dryRun = args.includes("--dry-run");
if (!dataset) {
  console.error("Say which dataset: --dataset staging (or --dataset production for the live content).");
  process.exit(1);
}

const client = getCliClient({ apiVersion: "2024-01-01" }).withConfig({ dataset, perspective: "raw" });

type Section = { _key: string; title?: string; hidden?: boolean; refs?: (string | null)[] };
type Item = { _id: string; orderRank?: string; category?: string };

const KINDS = [
  { item: "video", category: "videoCategory", page: "videographyPage", field: "videos" },
  { item: "photo", category: "photoCategory", page: "photographyPage", field: "photos" },
] as const;

const baseId = (id: string) => id.replace(/^drafts\./, "");
const nextRanks = (n: number) => {
  let r = LexoRank.min();
  return Array.from({ length: n }, () => (r = r.genNext().genNext()).toString());
};

for (const kind of KINDS) {
  console.log(`\n== ${kind.item}s (${dataset})`);

  /* The published page is what the site shows, so that's the source. */
  const sections =
    (await client.fetch<Section[] | null>(
      `*[_id == $page][0].sections[_type == "categorySection"]{ _key, title, hidden, "refs": ${kind.field}[]._ref }`,
      { page: kind.page },
    )) ?? [];
  if (sections.length === 0) {
    console.log("No old categories on the page: nothing to do.");
    continue;
  }

  /* Categories: reuse by title, create the rest in order. */
  const existing = await client.fetch<{ _id: string; title?: string }[]>(
    `*[_type == $type && !(_id in path("drafts.**"))]{ _id, title }`,
    { type: kind.category },
  );
  const byTitle = new Map(existing.map((c) => [(c.title ?? "").trim().toLowerCase(), c._id]));
  const toCreate = sections.filter((s) => s.title && !byTitle.has(s.title.trim().toLowerCase()));
  const catRanks = nextRanks(sections.length);

  /* Created first, so Sanity makes their IDs and the items can point at
     them. In a dry run they get a stand-in ID. */
  const catIdOf = new Map<string, string>();
  for (const [i, s] of sections.entries()) {
    if (!s.title) continue;
    const found = byTitle.get(s.title.trim().toLowerCase());
    if (found) {
      catIdOf.set(s._key, found);
    } else if (dryRun) {
      catIdOf.set(s._key, `(new) ${s.title}`);
    } else {
      const created = await client.create({
        _type: kind.category,
        title: s.title,
        hidden: s.hidden ?? false,
        orderRank: catRanks[i],
      });
      catIdOf.set(s._key, created._id);
    }
  }
  const tx = client.transaction();
  console.log(
    `Categories: ${sections.length} old, ${toCreate.length} to create` +
      (toCreate.length < sections.length ? `, ${sections.length - toCreate.length} already there (reused)` : "") +
      `: ${sections.map((s) => s.title ?? "(untitled, skipped)").join(", ")}`,
  );

  /* Every item, published and draft, keyed by its base ID. */
  const items = await client.fetch<Item[]>(`*[_type == $type]{ _id, orderRank, "category": category._ref }`, {
    type: kind.item,
  });
  const docsOf = new Map<string, Item[]>();
  for (const it of items) docsOf.set(baseId(it._id), [...(docsOf.get(baseId(it._id)) ?? []), it]);

  /* Section membership, first one wins. */
  const assigned = new Map<string, string>();
  const missing: string[] = [];
  for (const s of sections) {
    const cat = catIdOf.get(s._key);
    if (!cat) continue;
    for (const ref of s.refs ?? []) {
      if (!ref || assigned.has(ref)) continue;
      if (!docsOf.has(ref)) {
        missing.push(ref);
        continue;
      }
      assigned.set(ref, cat);
    }
  }

  let set = 0;
  let kept = 0;
  for (const [id, cat] of assigned) {
    for (const doc of docsOf.get(id)!) {
      if (doc.category) {
        kept++;
        continue;
      }
      tx.patch(doc._id, (p) => p.set({ category: { _type: "reference", _ref: cat, _weak: true } }));
      set++;
    }
  }
  console.log(
    `Items: ${assigned.size} in categories (${set} document(s) to set, ${kept} already had a category, kept)` +
      (missing.length ? `; ${missing.length} listed but deleted or never created, skipped` : ""),
  );

  /* Re-rank only on the run that sets up the categories (see the top): it
     created some, or put items in them (a first run cut short after
     creating the categories). */
  if (toCreate.length > 0 || set > 0) {
    const current = [...docsOf.keys()].sort((a, b) => {
      const ra = docsOf.get(a)!.find((d) => !d._id.startsWith("drafts."))?.orderRank ?? docsOf.get(a)![0].orderRank ?? "";
      const rb = docsOf.get(b)!.find((d) => !d._id.startsWith("drafts."))?.orderRank ?? docsOf.get(b)![0].orderRank ?? "";
      return ra.localeCompare(rb);
    });
    const order = [...assigned.keys(), ...current.filter((id) => !assigned.has(id))];
    const ranks = nextRanks(order.length);
    order.forEach((id, i) => {
      for (const doc of docsOf.get(id)!) tx.patch(doc._id, (p) => p.set({ orderRank: ranks[i] }));
    });
    console.log(`Order: ${order.length} item(s) re-ranked so each category keeps its current order.`);
  } else {
    console.log("Order: left as it is (the categories already existed).");
  }

  if (dryRun) {
    console.log("Dry run: nothing changed.");
    continue;
  }
  await tx.commit();
  console.log("Done.");
}
