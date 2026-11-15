/* Moves videos uploaded before Mux (the old `clip` file) to Mux, and fills
   each video's `muxVideo` field, the same as uploading it in the studio would.

     npm run mux:migrate -- --dataset staging --dry-run
     npm run mux:migrate -- --dataset staging --limit 8
     npm run mux:migrate -- --dataset staging --only "Spider,Le Petit Sao"
     npm run mux:migrate -- --dataset production --env-file .env.mux-production.local

   --dataset is required, so it can't run on the live content by accident.
   --dry-run lists what it would do and changes nothing.
   --limit N / --only "a,b" pick a few videos (title contains any of them).
   --env-file reads the Mux token from that file (it wins over the others).

   Needs MUX_TOKEN_ID and MUX_TOKEN_SECRET (a Mux access token with Mux Video
   read + write, Mux Data read) from --env-file, studio/.env.development.local
   or studio/.env.local, and runs as whoever is logged in to the Sanity CLI.
   For the production dataset --env-file is required, so the test token in
   .env.development.local can't send the real videos to Mux's test
   environment.

   If the dataset has no Mux key yet (the `secrets.mux` document the studio's
   Video field reads), the token is saved there too, so the Video field works
   without anyone typing it in. An existing key is left alone.

   Mux fetches each file itself from its Sanity URL, so nothing is downloaded
   here. The old file stays where it is; the site prefers the Mux video once
   it's there. Safe to re-run: every Mux asset carries its video's ID, so one
   created by an earlier run that stopped halfway is reused, not duplicated,
   and videos that already have a Mux video are skipped. Drafts are patched
   along with the published document, so publishing one later keeps it. */
import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { getCliClient } from "sanity/cli";

/* ---------- Arguments ---------- */

const args = process.argv.slice(2);
const arg = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const dataset = arg("dataset");
const envFile = arg("env-file");

if (dataset === "production" && !envFile) {
  console.error("For the live content, pass the Production token's file: --env-file .env.mux-production.local");
  process.exit(1);
}
if (envFile && !existsSync(envFile)) {
  console.error(`${envFile} doesn't exist (run from studio/).`);
  process.exit(1);
}

/* The Mux token. --env-file always wins, even over anything the Sanity CLI
   already loaded; otherwise the local env files fill in what's missing. Only
   the two MUX_ keys are read. */
const MUX_KEYS = ["MUX_TOKEN_ID", "MUX_TOKEN_SECRET"];
if (envFile) {
  const vars = parseEnv(readFileSync(envFile, "utf8"));
  for (const key of MUX_KEYS) process.env[key] = vars[key];
}
for (const file of [".env.development.local", ".env.local"]) {
  if (envFile || !existsSync(file)) continue;
  const vars = parseEnv(readFileSync(file, "utf8"));
  for (const key of MUX_KEYS) if (!process.env[key] && vars[key]) process.env[key] = vars[key];
}
const dryRun = args.includes("--dry-run");
const limit = Number(arg("limit")) || Infinity;
const only = arg("only")
  ?.split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

if (!dataset) {
  console.error('Say which dataset: --dataset staging (or --dataset production for the live content).');
  process.exit(1);
}

const { MUX_TOKEN_ID, MUX_TOKEN_SECRET } = process.env;
if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
  console.error(`MUX_TOKEN_ID and MUX_TOKEN_SECRET are missing (${envFile ?? "studio/.env.development.local"}).`);
  process.exit(1);
}

const client = getCliClient({ apiVersion: "2024-01-01" }).withConfig({ dataset, perspective: "raw" });

/* ---------- The studio's Mux key ---------- */

/* Same document the Video field's setup dialog saves. */
const secrets = await client.fetch<{ token?: string } | null>(`*[_id == "secrets.mux"][0]{ token }`);
if (!secrets?.token) {
  console.log(`Dataset "${dataset}" has no Mux key for the studio yet: ${dryRun ? "would save" : "saving"} this token.`);
  if (!dryRun) {
    await client.createOrReplace({
      _id: "secrets.mux",
      _type: "mux.apiKey",
      token: MUX_TOKEN_ID,
      secretKey: MUX_TOKEN_SECRET,
      enableSignedUrls: false,
      signingKeyId: "",
      signingKeyPrivate: "",
    });
  }
} else if (secrets.token !== MUX_TOKEN_ID) {
  console.log(`Note: the studio in "${dataset}" uses a different Mux token than this run. Left as is.`);
}

/* ---------- Mux API ---------- */

type MuxAsset = {
  id: string;
  status: "preparing" | "ready" | "errored";
  passthrough?: string;
  playback_ids?: { id: string; policy: string }[];
  errors?: { messages?: string[] };
};

const AUTH = `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString("base64")}`;

async function mux<T>(path: string, init?: { method: string; body: unknown }): Promise<T> {
  const res = await fetch(`https://api.mux.com/video/v1${path}`, {
    method: init?.method ?? "GET",
    headers: { Authorization: AUTH, "Content-Type": "application/json" },
    body: init ? JSON.stringify(init.body) : undefined,
  });
  if (!res.ok) throw new Error(`Mux ${res.status}: ${await res.text()}`);
  return ((await res.json()) as { data: T }).data;
}

async function allMuxAssets() {
  const out: MuxAsset[] = [];
  for (let page = 1; ; page++) {
    const batch = await mux<MuxAsset[]>(`/assets?limit=100&page=${page}`);
    out.push(...batch);
    if (batch.length < 100) return out;
  }
}

/* Mux usually takes a fraction of the video's length; give up after 30 min. */
async function waitUntilReady(id: string) {
  for (let i = 0; i < 360; i++) {
    const a = await mux<MuxAsset>(`/assets/${id}`);
    if (a.status !== "preparing") return a;
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error("still processing after 30 minutes");
}

/* ---------- Which videos ---------- */

type VideoDoc = { _id: string; title?: string; url?: string; orderRank?: string };

const docs = await client.fetch<VideoDoc[]>(
  `*[_type == "video" && defined(clip.asset) && !defined(muxVideo.asset)]
     { _id, title, "url": clip.asset->url, orderRank } | order(orderRank)`,
);

/* One entry per video: the published document and its draft, if any. */
const baseId = (id: string) => id.replace(/^drafts\./, "");
const groups = new Map<string, VideoDoc[]>();
for (const d of docs) groups.set(baseId(d._id), [...(groups.get(baseId(d._id)) ?? []), d]);

let todo = [...groups.entries()]
  .map(([id, ds]) => ({ id, ids: ds.map((d) => d._id), title: ds[0].title ?? id, url: ds.find((d) => d.url)?.url }))
  .filter((v) => v.url);
if (only) todo = todo.filter((v) => only.some((o) => v.title.toLowerCase().includes(o)));
todo = todo.slice(0, limit);

const existing = new Map((await allMuxAssets()).filter((a) => a.passthrough).map((a) => [a.passthrough!, a]));

console.log(`Dataset "${dataset}": ${groups.size} video(s) still on the old file, doing ${todo.length}.`);
for (const v of todo) {
  console.log(`  ${existing.has(v.id) ? "(already on Mux) " : ""}${v.title}${v.ids.length > 1 ? " + draft" : ""}`);
}
if (dryRun || todo.length === 0) process.exit(0);

/* ---------- Move them, four at a time ---------- */

async function move(v: (typeof todo)[number]) {
  let asset = existing.get(v.id);
  if (!asset || asset.status === "errored") {
    asset = await mux<MuxAsset>("/assets", {
      method: "POST",
      body: {
        inputs: [{ url: v.url }],
        playback_policies: ["public"],
        video_quality: "plus",
        max_resolution_tier: "1080p",
        passthrough: v.id,
        meta: { title: v.title, external_id: v.id },
      },
    });
  }
  if (asset.status !== "ready") asset = await waitUntilReady(asset.id);
  if (asset.status !== "ready") throw new Error(asset.errors?.messages?.join("; ") || "Mux couldn't process it");

  const playbackId = asset.playback_ids?.find((p) => p.policy === "public")?.id;
  if (!playbackId) throw new Error("no public playback ID");

  /* The same document the studio plugin writes for an upload. */
  const assetDocId =
    (await client.fetch<string | null>(`*[_type == "mux.videoAsset" && assetId == $id][0]._id`, { id: asset.id })) ??
    randomUUID();
  const tx = client.transaction().createIfNotExists({ _id: assetDocId, _type: "mux.videoAsset" }).patch(assetDocId, (p) =>
    p.set({ assetId: asset.id, playbackId, status: asset.status, filename: v.title, data: asset }),
  );
  for (const id of v.ids) {
    tx.patch(id, (p) =>
      p.set({ muxVideo: { _type: "mux.video", asset: { _type: "reference", _weak: true, _ref: assetDocId } } }),
    );
  }
  await tx.commit();
}

let done = 0;
const failed: string[] = [];
const queue = [...todo];
await Promise.all(
  Array.from({ length: 4 }, async () => {
    for (let v = queue.shift(); v; v = queue.shift()) {
      try {
        await move(v);
        console.log(`✓ ${v.title} (${++done}/${todo.length})`);
      } catch (err) {
        failed.push(v.title);
        console.log(`✗ ${v.title}: ${err instanceof Error ? err.message : err}`);
      }
    }
  }),
);

console.log(`\nMoved ${done} of ${todo.length}.${failed.length ? ` Failed: ${failed.join(", ")}. Re-run to retry them.` : ""}`);
