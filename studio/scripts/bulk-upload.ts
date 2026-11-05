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
     --no-compress       upload videos as they are
     --max-seconds=15    videos: keep only the first 15 seconds
     --apply             actually upload (without it, only lists what it would do)

   Videos are compressed first with ffmpeg, to at most 1080p and, where quality
   allows, under 15 MB. One already under 15 MB is left alone if compressing
   wouldn't save at least 20% (the studio does the same in the browser:
   lib/compress.ts). One that can't fit is uploaded anyway and the script says so:
   cut it with --max-seconds, or use a YouTube or Vimeo link. Without ffmpeg (`winget install Gyan.FFmpeg`) the script stops rather than
   upload them uncompressed, unless --no-compress is set.

   Videos need a poster frame for the site to show them. The script uses an
   image with the same name next to the video (reel.mp4 + reel.jpg) if there
   is one, otherwise grabs a frame with ffmpeg if it's installed, otherwise
   adds the video without a poster and says so (set one in the studio, or use
   the studio's Bulk add tab, which grabs frames itself). Without --videos,
   those same-named poster images are skipped, not added as photos.

   Runs as whoever is logged in to the Sanity CLI (`npx sanity login`). */
import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, mkdtempSync, readdirSync, rmSync, statSync } from "node:fs";
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
const compressVideos = videos && !flag("no-compress");
const category = option("category");
const maxSeconds = option("max-seconds") === undefined ? undefined : Math.floor(Number(option("max-seconds")));

/* The same numbers as lib/compress.ts. */
const SIZE_LIMIT = 15 * 1024 * 1024;
const MIN_BITRATE = 1_500_000;
const AUDIO_BITRATE = 160_000;
/* Safe to keep as they are. HEVC isn't here: not every browser can play it. */
const WEB_CODECS = ["h264", "vp9", "av1"];

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

function probe(video: string) {
  const info = JSON.parse(
    execFileSync("ffprobe", [
      "-v", "error", "-show_entries", "format=duration:stream=codec_type,codec_name", "-of", "json", video,
    ]).toString(),
  ) as { format: { duration?: string }; streams: { codec_type: string; codec_name: string }[] };
  return {
    duration: Number(info.format.duration ?? 0),
    codec: info.streams.find((s) => s.codec_type === "video")?.codec_name ?? "",
    hasAudio: info.streams.some((s) => s.codec_type === "audio"),
  };
}

/* The compressed copy in a temp folder, or the original if that's not worth it.
   CRF 21 is software x264's rough match for the studio's 6 Mbps; only a result
   over the limit is encoded again, at the bitrate that fits. Returns the folder
   so the caller can delete it after uploading. */
function compress(video: string) {
  const dir = mkdtempSync(join(tmpdir(), "compress-"));
  const out = join(dir, `${basename(video, extname(video))}.mp4`);
  const { duration, codec, hasAudio } = probe(video);
  const cutting = maxSeconds !== undefined && maxSeconds < duration;
  const seconds = cutting ? maxSeconds : duration;
  const encode = (quality: string[]) =>
    execFileSync("ffmpeg", [
      "-y", "-v", "error", "-i", video,
      ...(cutting ? ["-t", String(seconds)] : []),
      /* Fits inside 1920×1920, rounded to the even sizes H.264 needs. */
      "-vf", "scale='trunc(min(1,1920/max(iw,ih))*iw/2)*2':'trunc(min(1,1920/max(iw,ih))*ih/2)*2'",
      "-c:v", "libx264", "-preset", "slow", ...quality, "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "160k",
      "-movflags", "+faststart",
      out,
    ], { stdio: "inherit" });

  try {
    encode(["-crf", "21"]);
    if (statSync(out).size > SIZE_LIMIT && seconds > 0) {
      const budget = (SIZE_LIMIT * 0.95 * 8) / seconds - (hasAudio ? AUDIO_BITRATE : 0);
      encode(["-b:v", String(Math.round(Math.max(MIN_BITRATE, budget)))]);
    }
  } catch (err) {
    rmSync(dir, { recursive: true, force: true });
    throw err;
  }

  const before = statSync(video).size;
  const after = statSync(out).size;
  const notWorthIt = after >= before || (before <= SIZE_LIMIT && after >= before * 0.8);
  return { clip: WEB_CODECS.includes(codec) && !cutting && notWorthIt ? video : out, dir, cutting };
}

async function upload(kind: "image" | "file", path: string) {
  const asset = await client.assets.upload(kind, createReadStream(path), { filename: basename(path) });
  return { _type: kind, asset: { _type: "reference", _ref: asset._id } };
}

async function main() {
  if (!folder || !existsSync(folder) || !statSync(folder).isDirectory()) {
    console.log('Usage: npm run bulk-upload -- -- "<folder>" [--videos] [--category=brand] [--hidden] [--no-compress] [--max-seconds=15] [--apply]');
    process.exit(folder ? 1 : 0);
  }
  if (maxSeconds !== undefined && !(maxSeconds >= 1)) {
    throw new Error("--max-seconds needs a whole number of seconds, 1 or more.");
  }
  if (maxSeconds !== undefined && !compressVideos) {
    throw new Error("--max-seconds needs --videos, and can't be used with --no-compress.");
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
  if (compressVideos && !ffmpeg) {
    throw new Error(
      "Compressing videos needs ffmpeg. Install it (winget install Gyan.FFmpeg, then open a new terminal), " +
        "or add --no-compress to upload them as they are.",
    );
  }

  console.log(`${files.length} ${videos ? "video" : "photo"}(s) in ${folder} → the ${videos ? "Videos" : "Photos"} list` +
    `${hidden ? ", hidden" : ""}${category ? `, category ${category}` : ""}${compressVideos ? ", compressed first" : ""}` +
    `${maxSeconds ? `, cut to the first ${maxSeconds} s` : ""}`);
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
        const compressed = compressVideos ? compress(f) : null;
        const clip = compressed?.clip ?? f;
        try {
          if (clip !== f) {
            const cutNote = compressed?.cutting ? `cut to the first ${maxSeconds} s, ` : "";
            console.log(`  ${basename(f)}: ${cutNote}compressed ${size(statSync(f).size)} → ${size(statSync(clip).size)}`);
          } else if (compressVideos && statSync(f).size <= SIZE_LIMIT) {
            console.log(`  ${basename(f)}: already well compressed, kept as it is`);
          }
          if (compressVideos && statSync(clip).size > SIZE_LIMIT) {
            console.log(`  ! ${basename(f)}: ${size(statSync(clip).size)} is over the 15 MB limit for loop clips; cut it with --max-seconds, or use a YouTube or Vimeo link`);
          }
          await client.create({
            _type: "video",
            orderRank: rank.toString(),
            title: titleFrom(basename(f)),
            format: formatOf(f, ffmpeg),
            ...(hidden ? { hidden: true } : {}),
            clip: await upload("file", clip),
            ...(poster ? { poster: await upload("image", poster) } : {}),
          });
        } finally {
          if (compressed) rmSync(compressed.dir, { recursive: true, force: true });
        }
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
