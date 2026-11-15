# Studio phase 2: categories, simpler forms, sidebar, Bulk add → Mux

Branch: `feature/studio-categories` (from `main` after #27 and #28).
Status: **1–6 built and migrated on `staging`** (old and new categories compared:
identical for videos and photos). Waiting on Jed's test, then going live.
7 (Mux domain restriction) and 8 (loose ends) are still to do.

## Goal

Make adding work fast and obvious for Oussama, who isn't a developer:
fewer lists, shorter forms, categories pickable from either side, and whole
folders of videos straight to Mux.

## Decisions (made)

- Videos and photos each have **one category or none**. No item is in two
  categories today. The only overlaps are 2 photo slots added twice to the same
  category (Graduation, Corporate events), and those collapse into one.
- Categories work **from both sides**: pick one on the item, or open a category
  and add/create items there. Choosing at upload works for both single and Bulk add.
- The "Vision" tab stays as it is.
- Mux stays the video host (Sanity's own guidance for non-Enterprise plans).

## To-do

### 1. Categories as their own documents (videos and photos)
- [ ] New types `videoCategory` and `photoCategory`: title (required), hide from
      website, drag-to-reorder (`orderRank`).
- [ ] `category` field on `video` and `photo`: a weak reference to the matching
      category type, optional. Deleting a category leaves its items uncategorised
      instead of blocking.
- [ ] Order inside a category = the items' own drag order (`orderRank`), shown
      as a filtered orderable list (`@sanity/orderable-document-list` supports
      `filter`/`params`).
- [ ] Opening a category: its items, drag to reorder, "Create new" with the
      category already set (initial value template), and "Add existing" (a
      small custom panel that sets `category` on the picked items).
- [ ] Old `sections` arrays on `videographyPage` / `photographyPage`: hide them
      (deprecation pattern), and unset them only after the site reads the new model.
- [ ] Photography keeps its current behaviour: no categories means every photo in
      one gallery.

### 2. Migration script (`studio/scripts/categories-migrate.ts`)
- [ ] Same safety as `mux-migrate.ts`: required `--dataset`, `--dry-run`, and
      safe to re-run.
- [ ] Create one category document per existing section (title, hidden), in the
      same order.
- [ ] Set `category` on every item from its section, including drafts.
- [ ] Re-rank `orderRank` so each category keeps its current order. Categorised
      items go first, in category order, then the rest in their old order.
      Side effect: the Videos and Photos lists reorder. The first video still
      fronts the Videography card, so check that card afterwards.
- [ ] Keep the old `sections` data until the new site is live and checked.

### 3. Site (`front/src/lib/cms.ts`)
- [ ] Query categories by `orderRank`, each with its visible items
      (`category._ref == ^._id`, `order(orderRank)`).
- [ ] Output shapes (`VideoSection`, `PhotoSection`) stay the same, so no
      component changes.
- [ ] Run `npm run typegen`, lint, `tsc` and a build.

### 4. Simpler forms
- [ ] Video: Title, Video, Category; collapsed "More options" with Poster, Full
      video link, Show in Recent projects and Hide from website.
- [ ] Photo: Image, Alt text, Category; collapsed "More options" with Show in
      Recent projects and Hide from website.

### 5. Sidebar (`studio/structure.ts`)
```
Videos ▸        Categories · All videos · No category
Photos ▸        Categories · All photos · No category
Websites
Portfolio projects
Reviews ▸       Testimonials · Client messages · Client logos
Team
──────────
Pages ▸         Home · About · Services · Work · Photography · Videography · Web design · FAQ
Site settings
```

### 6. Bulk add → Mux (`studio/tools/bulkAdd.tsx`)
- [ ] Bring "Videos" back.
- [ ] Each file goes through the same route the Mux plugin uses, so no key is
      needed in the browser:
  - `POST /addons/mux/uploads/{dataset}` with a `MUX-Proxy-UUID` header;
  - upload the file in chunks to the returned URL (`@mux/upchunk`, pinned
    version);
  - poll until Mux has made the asset, then fill the `mux.videoAsset` document;
  - create the `video` with `muxVideo` and `category`.
- [ ] Drop compression, poster grabbing and Format guessing for videos. Mux
      handles them, and vertical videos are detected from Mux's aspect ratio.
- [ ] The category picker sets each item's `category` (photos too), instead of
      editing the page's `sections`.
- [ ] Google Drive folders keep working: download each file in the browser,
      then upload it as above.

### 7. Mux playback restricted to the site's domain (Jed's reminder)
- [ ] First check how Mux applies playback restrictions. They may require
      **signed** playback IDs, which would mean signing stream and thumbnail
      URLs on the server, a signing key in Vercel, and re-creating playback IDs
      on existing assets. Estimate after checking.
- [ ] Allowed domains: the live domain (and the custom one later), plus
      localhost and Vercel previews if wanted.

### 8. Loose ends
- [ ] Vercel: switch on `NEXT_PUBLIC_SANITY_PROJECT_ID` / `_DATASET` for Preview
      builds (previews show placeholders today).
- [ ] Switch `front/.env.development.local` and `front/.env.production.local`
      back to `staging` before testing this phase.
- [ ] Optionally add `NEXT_PUBLIC_SANITY_PROJECT_ID` to `front/.env.local`.
      The local builds get it from Jed's terminal today.

## Testing (on the `staging` dataset first)

1. Unhide the 43 videos hidden for the Mux test
   (`studio/scripts/tmp-hide-non-mux.ts --undo`, then delete that script).
2. Run the categories migration: dry run, then for real. The site must look
   identical, with the same categories, order and videos.
3. In the studio, test:
   - pick a category on a video;
   - open a category and add existing videos;
   - create a video from inside a category;
   - reorder inside a category;
   - Bulk add a folder of videos and one of photos into a category;
   - a Google Drive folder.
4. Check the local site with a production build, desktop and phone.

## Going live

1. Pull request → Jed merges. The site deploys and reads the new model, so
   **the migration must run straight after the merge.**
2. To avoid a gap, the site can read the new model with a fallback to the old
   `sections` while no category documents exist yet. That makes merge-then-migrate
   safe with no window of empty pages.
3. `cd studio && npm run deploy`.
4. Run the categories migration on `production` (dry run first).
5. Check the live Videography and Photography pages, then tell Oussama what changed.
6. Later: unset the old `sections` data.

## Clean-up after this phase

- Delete the `staging` dataset and the Mux Development environment.
- Delete `studio/.env.development.local`, `front/.env.development.local`,
  `front/.env.production.local` and `studio/.env.mux-production.local`.
- With Jed's OK: delete the old Sanity video files (Mux has them all).

## Estimate (my working time; Jed's testing on top)

| Part | Time |
|---|---|
| Categories model, migration script, site query | 1½–2 h |
| Forms and sidebar | ~30 min |
| Bulk add → Mux | ~1 h |
| Checks, builds, staging runs | ~30 min |
| Mux domain restriction | after checking; small with referrer rules, ~1–2 h if signed playback is needed |
