/* Uploads a folder on this computer into the Photos or Videos list, one item
   per file, added to the end of the list. The command-line twin of the
   studio's "Bulk add" tab, for big batches.

     npm run bulk-upload -- -- "D:/Shoots/Cafe Nomad"                  dry run, photos
     npm run bulk-upload -- -- "D:/Shoots/Cafe Nomad" --apply
     npm run bulk-upload -- -- "D:/Reels" --videos --hidden --apply

   Options:
     --videos            add to Videos instead of Photos
     --category=brand    photos only: brand, product, portrait or event
     --hidden            add them hidden from the website, to check first
     --apply             actually upload (without it, only lists what it would do)

   Videos need a poster frame for the site to show them. The script uses an
   image with the same name next to the video (reel.mp4 + reel.jpg) if there
   is one, otherwise grabs a frame with ffmpeg if it's installed, otherwise
   adds the video without a poster and says so (set one in the studio, or use
   the studio's Bulk add tab, which grabs frames itself). Without --videos,
   those same-named poster images are skipped, not added as photos.

   Runs as whoever is logged in to the Sanity CLI (`npx sanity login`). */
import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, mkdtempSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import { LexoRank } from "lexorank";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-10-13" });
const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const option = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];

const folder = args.find((a) => !a.startsWith("--"));
const videos = flag("videos");
const apply = flag("apply");
const hidden = flag("hidden");
const category = option("category");

const PHOTO_EXT = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".heic", ".tif", ".tiff"];
const VIDEO_EXT = [".mp4", ".mov", ".webm", ".m4v"];
const CATEGORIES = ["brand", "product", "portrait", "event"];

/* "my_shoot-04.final.MOV" → "My shoot 04 final". */
const titleFrom = (name: string) => {
  const base = name.replace(/\.[^.]+$/, "").replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();
  return base.charAt(0).toUpperCase() + base.slice(1);
};

const size = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

function hasFfmpeg() {
  try {
    execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/* A poster beside the video, or one grabbed by ffmpeg a second in. */
function posterFor(video: string, ffmpeg: boolean): string | null {
  const stem = video.slice(0, -extname(video).length);
  const beside = PHOTO_EXT.map((e) => stem + e).find(existsSync);
  if (beside || !ffmpeg) return beside ?? null;
  const out = join(mkdtempSync(join(tmpdir(), "poster-")), `${basename(stem)} poster.jpg`);
  try {
    execFileSync("ffmpeg", ["-y", "-ss", "1", "-i", video, "-frames:v", "1", "-q:v", "3", out], { stdio: "ignore" });
    return existsSync(out) ? out : null;
  } catch {
    return null;
  }
}

/* Vertical if ffprobe says it's taller than wide; landscape when unknown. */
function formatOf(video: string, ffmpeg: boolean): "landscape" | "vertical" {
  if (!ffmpeg) return "landscape";
  try {
    const [w, h] = execFileSync("ffprobe", [
      "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", video,
    ])
      .toString()
      .trim()
      .split(",")
      .map(Number);
    return h > w ? "vertical" : "landscape";
  } catch {
    return "landscape";
  }
}

async function upload(kind: "image" | "file", path: string) {
  const asset = await client.assets.upload(kind, createReadStream(path), { filename: basename(path) });
  return { _type: kind, asset: { _type: "reference", _ref: asset._id } };
}

async function main() {
  if (!folder || !existsSync(folder) || !statSync(folder).isDirectory()) {
    console.log('Usage: npm run bulk-upload -- -- "<folder>" [--videos] [--category=brand] [--hidden] [--apply]');
    process.exit(folder ? 1 : 0);
  }
  if (category && (videos || !CATEGORIES.includes(category))) {
    throw new Error(`--category is for photos only, one of: ${CATEGORIES.join(", ")}`);
  }

  const type = videos ? "video" : "photo";
  const exts = videos ? VIDEO_EXT : PHOTO_EXT;
  const all = readdirSync(folder);
  const stem = (f: string) => f.slice(0, -extname(f).length);
  /* Photos named like a video beside them are its poster, not gallery photos. */
  const videoStems = new Set(all.filter((f) => VIDEO_EXT.includes(extname(f).toLowerCase())).map(stem));
  const files = all
    .filter((f) => exts.includes(extname(f).toLowerCase()) && (videos || !videoStems.has(stem(f))))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => join(folder, f));
  const ffmpeg = videos && hasFfmpeg();

  console.log(`${files.length} ${videos ? "video" : "photo"}(s) in ${folder} → the ${videos ? "Videos" : "Photos"} list` +
    `${hidden ? ", hidden" : ""}${category ? `, category ${category}` : ""}`);
  for (const f of files) {
    const note = videos ? (posterFor(f, false) ? "poster beside it" : ffmpeg ? "poster from ffmpeg" : "NO POSTER") : "";
    console.log(`  ${basename(f)}  ${size(statSync(f).size)}  ${note}`);
  }
  if (!files.length) return;
  if (!apply) {
    console.log("\nDry run. Nothing was uploaded. Add --apply to upload.");
    return;
  }

  const last = await client.fetch<string | null>(`*[_type == $type] | order(orderRank desc)[0].orderRank`, { type });
  let rank = last ? LexoRank.parse(last) : LexoRank.min();

  let added = 0;
  for (const f of files) {
    rank = rank.genNext().genNext();
    try {
      if (!videos) {
        await client.create({
          _type: "photo",
          orderRank: rank.toString(),
          ...(hidden ? { hidden: true } : {}),
          ...(category ? { category } : {}),
          image: await upload("image", f),
        });
      } else {
        const poster = posterFor(f, ffmpeg);
        await client.create({
          _type: "video",
          orderRank: rank.toString(),
          title: titleFrom(basename(f)),
          format: formatOf(f, ffmpeg),
          ...(hidden ? { hidden: true } : {}),
          clip: await upload("file", f),
          ...(poster ? { poster: await upload("image", poster) } : {}),
        });
        if (!poster) console.log(`  ! ${basename(f)}: added without a poster; set one in the studio`);
      }
      added++;
      console.log(`  ✓ ${basename(f)}`);
    } catch (err) {
      console.log(`  ✗ ${basename(f)}: ${err instanceof Error ? err.message : err}`);
    }
  }
  console.log(`\nAdded ${added} of ${files.length}.${videos ? " Add the videos to a Videography section to show them." : ""}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
