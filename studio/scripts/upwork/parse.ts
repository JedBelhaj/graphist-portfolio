/* Reads Upwork pages saved with "Save page as → Webpage, Complete" from
   data/upwork/ (repo root) and writes data/upwork/upwork.json: the reviews
   and portfolio projects found in them. Never fetches anything.

     npm run upwork:parse
     npm run upwork:parse -- --debug     also dumps each page's embedded data to data/upwork/debug/

   Upwork pages carry their data as JSON for the app to hydrate from
   (Nuxt: window.__NUXT__ or a __NUXT_DATA__ script tag). That is read first;
   the visible HTML is only parsed, with cheerio, for a page where no embedded
   data turned up. The embedded script is read as data (acorn parses it, a
   literal-only evaluator walks it), never run.

   Field names differ between Upwork page versions, so reviews and projects
   are recognised by shape (a feedback comment with a score; a titled item in
   a portfolio list) rather than by a fixed path. What it couldn't read is
   listed under "problems" in the JSON and printed at the end. */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join, relative, resolve } from "node:path";
import { parse as parseJs } from "acorn";
import * as cheerio from "cheerio";
import type { ParsedImage, ParsedPortfolioItem, ParsedReview, UpworkData } from "./types";

const args = process.argv.slice(2);
const debug = args.includes("--debug");
const DATA_DIR = resolve(args.find((a) => !a.startsWith("--")) ?? resolve(process.cwd(), "../data/upwork"));
const OUT = join(DATA_DIR, "upwork.json");

type Json = unknown;
type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

const problems: UpworkData["problems"] = [];
let currentFile = "";
const problem = (message: string) => problems.push({ file: currentFile, message });

/* ---------- Embedded data ---------- */

/* Nuxt 3's __NUXT_DATA__ is devalue's flat format: one array, objects hold
   indexes into it, and ["Reactive", i]-style pairs wrap values. */
function unflatten(values: unknown[]): Json {
  const done = new Map<number, unknown>();
  const at = (i: unknown): unknown => {
    if (typeof i !== "number" || i < 0) return undefined;
    if (done.has(i)) return done.get(i);
    const v = values[i];
    if (v === null || typeof v !== "object") return done.set(i, v), v;
    if (Array.isArray(v)) {
      if (typeof v[0] === "string") {
        const [tag, ...rest] = v as [string, ...unknown[]];
        if (tag === "Date") return done.set(i, rest[0]), rest[0];
        if (tag === "Set") {
          const out: unknown[] = [];
          done.set(i, out);
          rest.forEach((j) => out.push(at(j)));
          return out;
        }
        if (tag === "Map" || tag === "null") {
          const out: Obj = {};
          done.set(i, out);
          for (let k = 0; k < rest.length; k += 2) out[String(at(rest[k]))] = at(rest[k + 1]);
          return out;
        }
        /* Reactive, ShallowReactive, Ref, EmptyRef, and Nuxt's own wrappers. */
        return at(rest[0]);
      }
      const out: unknown[] = [];
      done.set(i, out);
      v.forEach((j) => out.push(at(j)));
      return out;
    }
    const out: Obj = {};
    done.set(i, out);
    for (const [k, j] of Object.entries(v)) out[k] = at(j);
    return out;
  };
  return at(0);
}

/* Evaluates only literals, objects, arrays and the minifier's IIFE wrapper:
   (function(a,b){return {x:a}}("1",2)). Anything else becomes undefined. */
type Node = any;
function literal(node: Node, scope: Map<string, unknown>): unknown {
  if (!node) return undefined;
  switch (node.type) {
    case "Literal":
      return node.regex ? undefined : node.value;
    case "TemplateLiteral":
      return node.expressions.length ? undefined : node.quasis[0].value.cooked;
    case "Identifier":
      return node.name === "undefined" ? undefined : scope.get(node.name);
    case "ArrayExpression":
      return node.elements.map((e: Node) => (e && e.type !== "SpreadElement" ? literal(e, scope) : undefined));
    case "ObjectExpression": {
      const out: Obj = {};
      for (const p of node.properties) {
        if (p.type !== "Property" || p.computed || p.kind !== "init") continue;
        const key = p.key.type === "Identifier" ? p.key.name : String(p.key.value);
        out[key] = literal(p.value, scope);
      }
      return out;
    }
    case "UnaryExpression": {
      const v = literal(node.argument, scope);
      if (node.operator === "-") return typeof v === "number" ? -v : undefined;
      if (node.operator === "!") return !v;
      return undefined;
    }
    case "SequenceExpression":
      return literal(node.expressions.at(-1), scope);
    case "CallExpression": {
      const fn = node.callee;
      if (fn.type !== "FunctionExpression" && fn.type !== "ArrowFunctionExpression") return undefined;
      const inner = new Map(scope);
      fn.params.forEach((p: Node, i: number) => p.type === "Identifier" && inner.set(p.name, literal(node.arguments[i], scope)));
      if (fn.body.type !== "BlockStatement") return literal(fn.body, inner);
      for (const st of fn.body.body) {
        /* Nuxt 2 ties up shared references before returning: a.b = c; */
        if (st.type === "ExpressionStatement" && st.expression.type === "AssignmentExpression") {
          const { left, right } = st.expression;
          const target = left.type === "MemberExpression" ? literal(left.object, inner) : undefined;
          const key = left.computed ? literal(left.property, inner) : left.property?.name;
          if (isObj(target) || Array.isArray(target)) (target as Obj)[String(key)] = literal(right, inner);
        }
        if (st.type === "ReturnStatement") return literal(st.argument, inner);
      }
      return undefined;
    }
    default:
      return undefined;
  }
}

const STATE_SCRIPT = /window\.__[A-Z_]+__|__NUXT__|__INITIAL_STATE__|__APOLLO_STATE__|__PRELOADED_STATE__/;

/* Every block of embedded data in the page, labelled by where it came from. */
function embeddedData($: cheerio.CheerioAPI): { label: string; data: Json }[] {
  const found: { label: string; data: Json }[] = [];
  $("script").each((_, el) => {
    const script = $(el);
    const type = (script.attr("type") ?? "").toLowerCase();
    const id = script.attr("id") ?? "";
    const code = script.html() ?? "";
    if (!code.trim() || script.attr("src")) return;

    if (type.includes("json")) {
      try {
        const data = JSON.parse(code);
        /* __NUXT_DATA__ (and any other devalue payload) is a flat array. */
        const flat = Array.isArray(data) && id.includes("NUXT_DATA");
        found.push({ label: id ? `#${id}` : type, data: flat ? unflatten(data) : data });
      } catch {
        problem(`script ${id ? `#${id}` : type} looks like JSON but didn't parse`);
      }
      return;
    }
    if (!STATE_SCRIPT.test(code)) return;
    try {
      const program = parseJs(code, { ecmaVersion: "latest", sourceType: "script" }) as Node;
      for (const st of program.body) {
        const ex = st.type === "ExpressionStatement" ? st.expression : null;
        if (ex?.type !== "AssignmentExpression" || ex.left.type !== "MemberExpression") continue;
        const name = ex.left.computed ? ex.left.property.value : ex.left.property.name;
        const data = literal(ex.right, new Map());
        if (data !== undefined) found.push({ label: `window.${name}`, data });
        else problem(`window.${name} is set by code this parser doesn't evaluate`);
      }
    } catch (err) {
      problem(`inline script with page state didn't parse: ${err instanceof Error ? err.message : err}`);
    }
  });
  return found;
}

/* ---------- Helpers ---------- */

const clean = (s: unknown): string | null => {
  if (typeof s !== "string") return null;
  /* Some payloads carry HTML-escaped text or <br>s. */
  const text = /[<&]/.test(s) ? cheerio.load(`<div>${s.replace(/<br\s*\/?>/gi, "\n")}</div>`)("div").text() : s;
  const out = text.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return out || null;
};

const pick = (o: Obj, keys: string[]) => keys.map((k) => o[k]).find((v) => v !== undefined && v !== null && v !== "");

const num = (v: unknown): number | null => {
  const n = typeof v === "string" ? Number.parseFloat(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
};

const toDate = (v: unknown): Date | null => {
  if (v === null || v === undefined || v === "") return null;
  const d = typeof v === "number" ? new Date(v < 1e12 ? v * 1000 : v) : new Date(String(v));
  if (Number.isNaN(d.getTime())) return null;
  /* "Feb 1, 2025" parses as local midnight; pin it to that day in UTC. */
  const local = typeof v === "string" && !/^\d{4}-\d{2}-\d{2}/.test(v);
  return local ? new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) : d;
};
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const monthYear = (d: Date) => d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

/* 450 → "$450"; {amount: 25, currencyCode: "USD"} → "$25"; strings as shown. */
function money(v: unknown): string | null {
  if (typeof v === "string") return clean(v);
  if (typeof v === "number") return `$${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (isObj(v)) {
    const shown = pick(v, ["displayValue", "formatted", "display"]);
    if (typeof shown === "string") return clean(shown);
    const amount = num(pick(v, ["amount", "rawValue", "value"]));
    if (amount === null) return null;
    const currency = String(pick(v, ["currencyCode", "currency"]) ?? "USD");
    return currency === "USD" ? money(amount) : `${amount} ${currency}`;
  }
  return null;
}

const hash = (s: string) => createHash("sha1").update(s).digest("hex").slice(0, 12);
const norm = (s: string) =>
  s.normalize("NFKC").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, " ").trim().toLowerCase();

const slugify = (s: string) =>
  s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 96);

const IMAGE_URL = /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i;
const VIDEO_URL = /youtube\.com|youtu\.be|vimeo\.com|loom\.com|\.(mp4|mov|webm)(\?|#|$)/i;

/* Files in the page's "<name>_files" folder, by lowercase file name. */
function savedFiles(htmlPath: string): Map<string, string> {
  const map = new Map<string, string>();
  const stem = htmlPath.slice(0, -extname(htmlPath).length);
  for (const dir of [`${stem}_files`, `${stem}-Dateien`, `${stem}_fichiers`]) {
    if (!existsSync(dir) || !statSync(dir).isDirectory()) continue;
    for (const f of readdirSync(dir)) map.set(f.toLowerCase(), relative(DATA_DIR, join(dir, f)).replace(/\\/g, "/"));
  }
  return map;
}

/* A remote URL or a "./Page_files/x.jpg" src → its saved copy, if any. */
function localImage(src: string, files: Map<string, string>): ParsedImage {
  const remote = /^https?:/i.test(src);
  const raw = basename(src.split(/[?#]/)[0]).toLowerCase();
  let name = raw;
  try {
    name = decodeURIComponent(raw);
  } catch {
    /* Not valid percent-encoding; match the name as written. */
  }
  const file =
    files.get(name) ??
    files.get(raw) ??
    [...files.entries()].find(([f]) => name && f.startsWith(name.replace(/\.[^.]+$/, "")))?.[1];
  if (!file) problem(`image not in the saved _files folder: ${src}`);
  return { url: remote ? src : null, file: file ?? null };
}

/* ---------- Reviews and projects from embedded data ---------- */

const TEXT_KEYS = ["comment", "feedbackComment", "clientComment", "reviewText", "review"];
const SCORE_KEYS = ["score", "rating", "feedbackScore", "totalScore", "overallScore"];
const TITLE_KEYS = ["title", "jobTitle", "openingTitle", "contractTitle", "assignmentTitle"];
const START_KEYS = ["startDate", "startedOn", "dateStarted", "start", "createdOn"];
const END_KEYS = ["endDate", "endedOn", "dateEnded", "closedOn", "completedOn", "end"];
const EARNING_KEYS = ["totalCharge", "totalCharges", "totalEarnings", "earnings", "totalAmount", "amount", "fixedPrice", "budget"];
const RATE_KEYS = ["hourlyRate", "rate"];
/* Feedback the freelancer left for the client, or a reply: not a review. */
const NOT_A_REVIEW = /toclient|forclient|byfreelancer|freelancerfeedback|response|reply/i;

type Review = Omit<ParsedReview, "key" | "sourceFile" | "via">;
type Project = Omit<ParsedPortfolioItem, "sourceFile" | "via">;
type Found = { reviews: Review[]; projects: Obj[] };

function walk(data: Json): Found {
  const found: Found = { reviews: [], projects: [] };
  const seen = new Set<unknown>();
  const visit = (node: unknown, path: string[], parents: { obj: Obj; inArray: boolean }[], inArray: boolean) => {
    if (typeof node !== "object" || node === null || seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) {
      const key = path.at(-1) ?? "";
      const projectList = /portfolio/i.test(path.join(".")) && !/skill|categor|specialt/i.test(key);
      node.forEach((item, i) => {
        if (projectList && isObj(item) && typeof item.title === "string") found.projects.push(item);
        else visit(item, [...path, String(i)], parents, true);
      });
      return;
    }
    const obj = node as Obj;
    const key = path.at(-1) ?? "";
    /* A single project, on a saved project page. */
    if (/^(portfolio(item|project)?|project(details)?)$/i.test(key) && typeof obj.title === "string") {
      found.projects.push(obj);
      return;
    }
    const text = clean(pick(obj, TEXT_KEYS));
    const score = num(pick(obj, SCORE_KEYS));
    if (text && (score !== null || /feedback|review/i.test(path.join("."))) && !NOT_A_REVIEW.test(path.join("."))) {
      /* The job it belongs to: this object and its parents, up to the
         nearest list item (one entry of the work history). */
      const context: Obj[] = [obj];
      if (!inArray) {
        for (const p of [...parents].reverse()) {
          context.push(p.obj);
          if (p.inArray) break;
        }
      }
      const from = (keys: string[]) => context.map((c) => pick(c, keys)).find((v) => v !== undefined);
      const client = context.map((c) => pick(c, ["client", "buyer", "company"])).find(isObj);
      const start = toDate(from(START_KEYS));
      const end = toDate(from(END_KEYS));
      const total = money(from(EARNING_KEYS));
      const rate = money(from(RATE_KEYS));
      found.reviews.push({
        text,
        rating: score !== null && score >= 0 && score <= 5 ? Math.round(score * 100) / 100 : null,
        projectTitle: clean(from(TITLE_KEYS)),
        clientName: clean(from(["clientName", "buyerName", "companyName"]) ?? (client && pick(client, ["name", "displayName", "companyName"]))),
        date: end ? ymd(end) : start ? ymd(start) : null,
        dateRange: start ? `${monthYear(start)} – ${end ? monthYear(end) : "Present"}` : null,
        earnings: total ?? (rate ? `${rate}/hr` : null),
      });
      if (score !== null && (score < 0 || score > 5)) problem(`review score ${score} isn't 0–5, left blank: "${text.slice(0, 50)}…"`);
      return;
    }
    if (score !== null && /feedback/i.test(key) && !NOT_A_REVIEW.test(path.join("."))) {
      problem(`a ${score}★ rating with no written feedback was skipped (at ${path.join(".")})`);
    }
    for (const [k, v] of Object.entries(obj)) visit(v, [...path, k], [...parents, { obj, inArray }], false);
  };
  visit(data, [], [], false);
  return found;
}

/* Every string in an object (a few levels deep) with the key it sits under. */
function strings(o: unknown, depth = 0, key = ""): { key: string; value: string }[] {
  if (depth > 4) return [];
  if (typeof o === "string") return [{ key, value: o }];
  if (Array.isArray(o)) return o.flatMap((v) => strings(v, depth + 1, key));
  if (isObj(o)) return Object.entries(o).flatMap(([k, v]) => strings(v, depth + 1, k));
  return [];
}

function project(o: Obj, files: Map<string, string>): Project | null {
  const title = clean(o.title);
  if (!title) return null;
  const all = strings(o);
  const urls = [...new Set(all.map((s) => s.value).filter((v) => /^https?:\/\//i.test(v)))];
  /* Prefer full-size copies; drop a thumbnail when its original is listed too. */
  const images = urls.filter((u) => IMAGE_URL.test(u) || /thumbnail|image/i.test(all.find((s) => s.value === u)?.key ?? ""));
  const cover = images.find((u) => /original|cover/i.test(all.find((s) => s.value === u)?.key ?? "")) ?? images[0];
  const rawSkills = pick(o, ["skills", "attributeSkills", "tags"]);
  const skills = Array.isArray(rawSkills)
    ? rawSkills.map((s) => clean(isObj(s) ? pick(s, ["prettyName", "name", "label", "skill"]) : s)).filter((s): s is string => !!s)
    : [];
  const linked = clean(pick(o, ["projectUrl", "projectLink", "url", "link", "externalUrl"]));
  const video = urls.find((u) => VIDEO_URL.test(u)) ?? null;
  return {
    title,
    slug: slugify(title) || hash(title),
    description: clean(pick(o, ["description", "projectDescription", "details", "summary"])),
    role: clean(pick(o, ["role", "myRole", "projectRole"])),
    skills: [...new Set(skills)],
    coverImage: cover ? localImage(cover, files) : null,
    gallery: images.filter((u) => u !== cover).map((u) => localImage(u, files)),
    videoUrl: video,
    projectUrl: linked && /^https?:/i.test(linked) && !IMAGE_URL.test(linked) && linked !== video && !/upwork\.com/i.test(linked) ? linked : null,
  };
}

/* ---------- Fallback: the visible HTML ---------- */

const MONTH_RANGE =
  /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(?:\d{1,2},\s*)?\d{4}\s*[-–]\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(?:\d{1,2},\s*)?\d{4}|Present)/i;

function domReviews($: cheerio.CheerioAPI): Review[] {
  const tiles = $(
    '[data-test*="job-tile"], [data-test*="assignment"], [data-qa*="assignment"], [data-test*="feedback-item"], [data-test="review"], .assignments-item',
  ).filter((_, el) => $(el).parents('[data-test*="job-tile"], [data-test*="assignment"], .assignments-item').length === 0);
  const out: Review[] = [];
  tiles.each((i, el) => {
    const tile = $(el);
    const title = clean(tile.find('h4, h5, [data-test*="title"], [data-qa*="title"]').first().text());
    const text = clean(
      tile.find('[data-test*="feedback"] p, [data-test*="comment"], [data-qa*="feedback"], q, blockquote').first().text() ||
        tile.find('[data-test*="feedback"]').first().text(),
    );
    const label = tile.find('[aria-label*="out of"], [aria-label*="Rating"], [class*="rating"]').first();
    const ratingText = label.attr("aria-label") ?? label.text();
    const rating = num(ratingText.match(/(\d(?:\.\d+)?)/)?.[1]);
    const whole = tile.text().replace(/\s+/g, " ");
    const range = whole.match(MONTH_RANGE)?.[0] ?? null;
    const earnings = whole.match(/\$[\d,]+(?:\.\d+)?(?:\s*\/\s*hr)?/)?.[0] ?? null;
    if (!text) {
      problem(`HTML tile ${i + 1}${title ? ` ("${title}")` : ""}: no feedback text found, skipped`);
      return;
    }
    if (rating === null) problem(`HTML review "${text.slice(0, 40)}…": rating not found`);
    const [from, to] = range?.split(/\s[-–]\s|[-–]/).map((s) => s.trim()) ?? [];
    const start = toDate(from);
    const end = toDate(to);
    out.push({
      text,
      rating: rating !== null && rating <= 5 ? rating : null,
      projectTitle: title,
      clientName: null,
      date: end ? ymd(end) : start ? ymd(start) : null,
      /* Same wording as the embedded-data path; as shown if it won't parse. */
      dateRange: start ? `${monthYear(start)} – ${end ? monthYear(end) : "Present"}` : range,
      earnings,
    });
  });
  return out;
}

function domProjects($: cheerio.CheerioAPI, files: Map<string, string>): Project[] {
  const out: Project[] = [];
  $('[data-test*="portfolio"] [data-test*="tile"], [data-qa*="portfolio"] [data-qa*="tile"], .portfolio-item').each((_, el) => {
    const tile = $(el);
    const title = clean(tile.find('h4, h5, [data-test*="title"]').first().text() || tile.find("[title]").attr("title"));
    if (!title) return void problem("HTML portfolio tile with no title, skipped");
    /* Saved pages point img src at the local _files copy. */
    const images = tile.find("img").map((_, img) => $(img).attr("src") ?? "").get().filter(Boolean).map((s) => localImage(s, files));
    out.push({
      title,
      slug: slugify(title) || hash(title),
      description: null,
      role: null,
      skills: [],
      coverImage: images[0] ?? null,
      gallery: images.slice(1),
      videoUrl: null,
      projectUrl: null,
    });
  });
  return out;
}

/* A project seen on the profile and again on its own saved page. */
function mergeProject(a: ParsedPortfolioItem, b: Project): ParsedPortfolioItem {
  const longer = (x: string | null, y: string | null) => ((y?.length ?? 0) > (x?.length ?? 0) ? y : x);
  const cover = a.coverImage?.file ? a.coverImage : (b.coverImage ?? a.coverImage);
  const id = (img: ParsedImage | null) => img?.file ?? img?.url ?? "";
  const seen = new Set([id(cover)]);
  const gallery = [a.coverImage, ...a.gallery, b.coverImage, ...b.gallery].filter(
    (img): img is ParsedImage => !!id(img) && !seen.has(id(img)) && !!seen.add(id(img)),
  );
  return {
    ...a,
    description: longer(a.description, b.description),
    role: a.role ?? b.role,
    skills: [...new Set([...a.skills, ...b.skills])],
    coverImage: cover,
    gallery,
    videoUrl: a.videoUrl ?? b.videoUrl,
    projectUrl: a.projectUrl ?? b.projectUrl,
  };
}

/* ---------- Main ---------- */

function main() {
  const pages = existsSync(DATA_DIR) ? readdirSync(DATA_DIR).filter((f) => /\.html?$/i.test(f)).sort() : [];
  if (!pages.length) {
    console.log(`No .html files in ${DATA_DIR}. Save the Upwork pages there first (see scripts/upwork/README.md).`);
    process.exit(1);
  }

  const reviews = new Map<string, ParsedReview>();
  const portfolio = new Map<string, ParsedPortfolioItem>();
  const add = (page: string, via: "state" | "dom", found: Review[], projects: Project[]) => {
    for (const r of found) {
      const key = hash(`${norm(r.text)}|${norm(r.projectTitle ?? "")}`);
      const prev = reviews.get(key);
      /* The same review often sits in two places in the page data; keep the
         first copy and fill its gaps from the other. */
      const filled = prev && (Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, v ?? (r as Obj)[k] ?? null])) as ParsedReview);
      reviews.set(key, filled || { key, ...r, sourceFile: page, via });
    }
    for (const p of projects) {
      const prev = portfolio.get(p.slug);
      portfolio.set(p.slug, prev ? mergeProject(prev, p) : { ...p, sourceFile: page, via });
    }
  };

  for (const page of pages) {
    currentFile = page;
    const path = join(DATA_DIR, page);
    const $ = cheerio.load(readFileSync(path, "utf8"));
    const files = savedFiles(path);
    const blocks = embeddedData($);
    console.log(`${page}: ${blocks.length ? blocks.map((b) => b.label).join(", ") : "no embedded data"}; ${files.size} saved files`);
    if (debug) {
      mkdirSync(join(DATA_DIR, "debug"), { recursive: true });
      writeFileSync(join(DATA_DIR, "debug", `${page}.state.json`), JSON.stringify(blocks, null, 2));
    }

    let counts = { reviews: 0, projects: 0 };
    for (const block of blocks) {
      const found = walk(block.data);
      const projects = found.projects.map((o) => project(o, files)).filter((p): p is Project => !!p);
      counts = { reviews: counts.reviews + found.reviews.length, projects: counts.projects + projects.length };
      add(page, "state", found.reviews, projects);
    }
    if (!counts.reviews) {
      const found = domReviews($);
      problem(`no reviews in the embedded data; read ${found.length} from the HTML instead`);
      counts.reviews = found.length;
      add(page, "dom", found, []);
    }
    if (!counts.projects) {
      const found = domProjects($, files);
      problem(`no portfolio in the embedded data; read ${found.length} from the HTML instead`);
      counts.projects = found.length;
      add(page, "dom", [], found);
    }
    console.log(`  ${counts.reviews} review(s), ${counts.projects} portfolio item(s), before de-duplication`);
  }

  for (const r of reviews.values()) {
    const missing = (["rating", "projectTitle", "date"] as const).filter((k) => r[k] === null);
    if (missing.length) problems.push({ file: r.sourceFile, message: `review "${r.text.slice(0, 40)}…" has no ${missing.join(", ")}` });
  }
  const data: UpworkData = {
    parsedAt: new Date().toISOString(),
    files: pages,
    reviews: [...reviews.values()],
    portfolio: [...portfolio.values()],
    problems,
  };
  writeFileSync(OUT, `${JSON.stringify(data, null, 2)}\n`);

  console.log(`\n${data.reviews.length} review(s), ${data.portfolio.length} portfolio item(s) → ${OUT}`);
  if (problems.length) {
    console.log(`\n${problems.length} thing(s) to check (also under "problems" in the JSON):`);
    for (const p of problems) console.log(`  [${p.file}] ${p.message}`);
  }
}

main();
