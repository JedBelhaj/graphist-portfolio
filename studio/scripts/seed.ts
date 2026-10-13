/* Seeds Sanity with the site's current content, so editors start from what's
   live instead of a blank studio.

     npm run seed                  (from studio/)
     npm run seed -- -- --replace

   Runs as whoever is logged in to the Sanity CLI (`npx sanity login`). The
   defaults and the files are read straight from ../front, so the seed always
   matches what the site shows when the CMS is empty.

   Safe to re-run: a page is only created if it doesn't exist yet, and a list
   (testimonials, team, logos…) only if that list is still empty, so nothing
   an editor has changed gets overwritten. --replace resets the page
   documents to the defaults; lists are never touched once they have items.

   What goes in: all page copy, the countries, packages, FAQs and services,
   the testimonials and team (text only), and the real assets in public/ —
   client logos, the client-message screenshots and the hero cut-out. The mock
   picsum photos are left out on purpose: the site keeps showing them until
   real photos are uploaded, and seeding them would make them look real. */
import { createReadStream } from "node:fs";
import { basename, join } from "node:path";
import { getCliClient } from "sanity/cli";
import {
  CLIENT_LOGOS,
  COPY,
  COUNTRIES,
  FAQS,
  HERO_PHOTO,
  LOGO_CAPS,
  PACKAGES,
  PHOTO_DISCIPLINES,
  RESULTS,
  SERVICE_GROUPS,
  SERVICES,
  TEAM,
  TESTIMONIALS,
  VIDEO_CAPABILITIES,
  VIDEO_STATS,
  WEB_CAPABILITIES,
  WEB_PROCESS,
  WORK_TABS,
} from "../../front/src/lib/content";
import { BRAND } from "../../front/src/lib/brand";

const client = getCliClient({ apiVersion: "2026-10-13" });
const replace = process.argv.includes("--replace");
const PUBLIC = join(process.cwd(), "..", "front", "public");

type NewDoc = { _type: string; [key: string]: unknown };
type Doc = NewDoc & { _id: string };

/* Drop blank strings, so a part of a heading the design doesn't use stays
   empty in the studio instead of showing up as "". */
function clean<T>(value: T): T {
  if (Array.isArray(value)) return value.map(clean) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== "" && v !== null && v !== undefined)
        .map(([k, v]) => [k, clean(v)]),
    ) as T;
  }
  return value;
}

/* Array items need a unique _key. */
const keyed = <T extends object>(items: T[], type?: string) =>
  items.map((item, i) => ({ _key: `k${i}`, ...(type ? { _type: type } : {}), ...item }));

/* Ranks for the orderable lists — any strings that sort in order will do. */
const rank = (i: number) => `0|${(100000 + i * 1000).toString(36)}:`;

async function uploadImage(publicPath: string) {
  const file = join(PUBLIC, decodeURI(publicPath));
  try {
    const asset = await client.assets.upload("image", createReadStream(file), { filename: basename(file) });
    return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
  } catch (err) {
    console.warn(`  ! skipped ${publicPath}: ${(err as Error).message}`);
    return null;
  }
}

const capToPx = Object.fromEntries(Object.entries(LOGO_CAPS).map(([px, cls]) => [cls, px]));

async function main() {
  const { projectId, dataset } = client.config();
  console.log(`Seeding ${projectId}/${dataset} (${replace ? "replace" : "create if missing"})`);

  const heroPhoto = await uploadImage(HERO_PHOTO);

  /* Pages are the one place fixed IDs are used: the studio structure and the
     site's query both address them by ID. */
  const singletons: Doc[] = [
    {
      _id: "siteSettings",
      _type: "siteSettings",
      name: BRAND.name,
      short: BRAND.short,
      founder: BRAND.founder,
      email: BRAND.email,
      instagram: BRAND.instagram,
      facebook: BRAND.facebook,
      linkedin: BRAND.linkedin,
      countries: keyed(COUNTRIES, "country"),
      heroPhoto,
      footerCta: COPY.site.footerCta,
      footerButton: COPY.site.footerButton,
      founderCaption: COPY.site.founderCaption,
      seoTitle: COPY.site.seoTitle,
      seoDescription: COPY.site.seoDescription,
    },
    { _id: "homePage", _type: "homePage", ...COPY.home },
    {
      _id: "aboutPage",
      _type: "aboutPage",
      ...COPY.about,
      principles: keyed(COPY.about.principles, "blurb"),
    },
    {
      _id: "servicesPage",
      _type: "servicesPage",
      hero: COPY.services.hero,
      bubbles: keyed(SERVICES, "bubble"),
      groups: keyed(SERVICE_GROUPS, "serviceGroup"),
      toolboxTitle: COPY.services.toolboxTitle,
      packagesHeading: COPY.services.packagesHeading,
      packages: keyed(PACKAGES, "package"),
      packagesFootnote: COPY.services.packagesFootnote,
    },
    { _id: "workPage", _type: "workPage", ...COPY.work, tabs: WORK_TABS },
    {
      _id: "photographyPage",
      _type: "photographyPage",
      ...COPY.photography,
      disciplines: PHOTO_DISCIPLINES,
    },
    {
      _id: "videographyPage",
      _type: "videographyPage",
      ...COPY.videography,
      capabilities: keyed(VIDEO_CAPABILITIES, "blurb"),
      stats: keyed(VIDEO_STATS, "stat"),
    },
    {
      _id: "webDesignPage",
      _type: "webDesignPage",
      ...COPY.webDesign,
      capabilities: keyed(WEB_CAPABILITIES, "blurb"),
      process: keyed(
        WEB_PROCESS.map((p) => ({ title: p.step, body: p.body })),
        "blurb",
      ),
    },
    { _id: "faqPage", _type: "faqPage", ...COPY.faq, faqs: keyed(FAQS, "faq") },
  ];

  /* Ordinary documents get IDs from Sanity. Each list is built (and its
     images uploaded) only while that type is still empty in the dataset. */
  const collections: Record<string, () => Promise<NewDoc[]>> = {
    testimonial: async () =>
      TESTIMONIALS.map((t) => ({ _type: "testimonial", quote: t.quote, name: t.name, tag: t.tag, handle: t.handle })),
    teamMember: async () => TEAM.map((m) => ({ _type: "teamMember", name: m.name, role: m.role, focus: m.focus })),
    result: async () => {
      const images = await Promise.all(RESULTS.map((r) => uploadImage(r.src)));
      return RESULTS.flatMap((r, i) =>
        images[i] ? [{ _type: "result", image: images[i], label: r.label, alt: r.alt }] : [],
      );
    },
    clientLogo: async () => {
      const images = await Promise.all(CLIENT_LOGOS.map((l) => uploadImage(l.src)));
      return CLIENT_LOGOS.flatMap((l, i) =>
        images[i]
          ? [
              {
                _type: "clientLogo",
                name: l.name,
                logo: images[i],
                size: capToPx[l.cap] ?? "48",
                tone: l.tone ?? "silhouette",
              },
            ]
          : [],
      );
    },
  };

  const tx = client.transaction();
  for (const doc of singletons.map(clean)) {
    if (replace) tx.createOrReplace(doc);
    else tx.createIfNotExists(doc);
  }

  let created = 0;
  for (const [type, build] of Object.entries(collections)) {
    const existing = await client.fetch<number>(`count(*[_type == $type])`, { type });
    if (existing > 0) {
      console.log(`  - ${type}: ${existing} already in the dataset, left alone`);
      continue;
    }
    const docs = await build();
    docs.forEach((doc, i) => tx.create(clean({ ...doc, orderRank: rank(i) })));
    created += docs.length;
  }

  await tx.commit();
  console.log(`Done: ${singletons.length} pages and ${created} list items. Open the studio to edit.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
