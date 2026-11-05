# Upwork import

Copies the Upwork reviews into **Testimonials** and the Upwork portfolio into **Portfolio projects** in the studio. It reads pages you saved yourself. It never logs in to Upwork or downloads anything from it.

## 1. Save the pages

1. Open your public Upwork profile in Chrome or Edge. Scroll down until all reviews are loaded: click "Show more" under Work history, including the Completed jobs tab. Do the same for the portfolio.
2. Press Ctrl+S and choose **Webpage, Complete**. Save it in `data/upwork/` at the repo root (create the folder). You get `Profile.html` and a `Profile_files/` folder. Keep both.
3. Optional: open each portfolio project and save it the same way, into the same folder. Project pages often have more images and a longer description than the profile does. The parser merges each one with its profile entry by title.

`data/upwork/` is git-ignored. A page saved while logged in can contain your session.

## 2. Set the env vars

In `studio/.env` (copy from `studio/.env.example`):

| Variable | Value |
| --- | --- |
| `SANITY_PROJECT_ID` | Optional. Defaults to `SANITY_STUDIO_PROJECT_ID`. |
| `SANITY_DATASET` | Optional. Defaults to `SANITY_STUDIO_DATASET`, then `production`. |
| `SANITY_WRITE_TOKEN` | A token with Editor rights: sanity.io/manage → the project → API → Tokens. Only the real import needs it. |

## 3. Run

From `studio/`:

```sh
npm run upwork:parse                  # saved pages → data/upwork/upwork.json
npm run upwork:import:dry             # what it would write, no token needed
npm run upwork:import:dry -- --verbose   # …with every document in full
npm run upwork:import                 # writes to Sanity
```

The parser prints a list of things it couldn't read. Typical ones are a rating with no written feedback, or an image that isn't in the `_files` folder. Check that list and `upwork.json` before importing. If it found nothing on a page, run `npm run upwork:parse -- --debug`. That writes the data the page embeds to `data/upwork/debug/`, so the field names can be checked.

Run the real import only after the branch that added these scripts is merged and the studio is deployed. Before that, the live site doesn't know the new fields, and imported reviews would show as "Client, name withheld".

## What it writes

- **Reviews → Testimonials.** A review whose text matches an existing testimonial updates that testimonial. That covers the reviews that were first copied in by hand. Other reviews get the ID `upwork-review-<hash>`. Each review gets its rating, project title, dates and earnings under "Review details". If Name and Role | Company are blank, the site shows "Upwork client" and "★ 5.0 on Upwork · project title", the same as the original cards.
- **Projects → Portfolio projects**, with the ID `upwork-portfolio-<slug>`. Images come from the saved `_files` folders and are uploaded as Sanity assets. No section on the site shows this list yet.
- **Re-running is safe.** Documents are written with `createOrReplace` under the same IDs. The import replaces the Upwork fields and the quote. It keeps what editors set in the studio: list order, Hide from website, Featured, name, Role | Company, handle and photo. New items go to the end of their list.
- **Featured** testimonials come first on the site, followed by the drag-to-reorder order.
