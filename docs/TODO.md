# TODO

Plan and context: [Plan_and_notes.md](Plan_and_notes.md)

## Launch checklist (decided 2026-11-01)

Oussama, in the Studio (no code):
- [ ] Real contact email, Instagram, Facebook and LinkedIn: Site settings → Brand & contact. Email is the only contact route (no form or booking link).
- [ ] Write the 6 FAQ answers, and change question 4 to "Can we book a one-off project?": FAQ page.
- [ ] Read the privacy page (`/privacy`) and confirm it matches how he handles email.
- [ ] Hide or crop any results screenshot a client wouldn't want shown (crop tool and "Hide from website" on each Client message).

Jed / Claude:
- [x] Bulk upload in the Studio: Drive folder browser, "Bulk add" tab, sanity-plugin-media, and a local-folder upload script (tested in the local Studio 2026-11-01).
- [ ] Studio deploy (crop tool on results, updated field descriptions, the bulk tools).
- [ ] Sync to Sanity after merging `feature/launch-prep`: team roles, "Oussama Soltani".
- [ ] Real team photos for Jed, Oubaid and Houssemeddine (stock until then).

Real work, once the bulk tools exist:
- [ ] Photography gallery, work cards, the three Services cards (placeholder photos now).
- [ ] Web design: real site screenshots for `WEB_SHOTS`, then pass `wireframe={false}` to `BrowserFrame`.

Later, by choice:
- [ ] Custom domain: buy it, add it in Vercel → Domains, change `domain` in `brand.ts` (now soltani-eight.vercel.app).
- [ ] Let Google index the site: remove `robots: { index: false }` in `front/src/app/layout.tsx`, add sitemap.xml and robots.txt.
- [ ] Visitor stats (Vercel Analytics is cookie-free; add a line to the privacy page if added).

## A. Content and assets
- [ ] Review the Drive folder and list usable photos, videos and logos
- [x] Get the client logos into `front/public/logos/real/`
- [x] Confirm the "What makes us different" claims with Oussama: 72-hour first edits, 120+ projects, 5 countries all accurate
- [ ] Replace placeholder FAQ answers: Oussama, in the Studio (see the launch checklist)
- [ ] Real Instagram / Facebook / email links: Oussama, in the Studio (see the launch checklist)
- [ ] Replace mock photos (picsum) with real shoots: work cards, galleries, team (portraits and About are done)
- [x] Services are photography, video and web design (social and growth groups removed; marketing copy kept on purpose)
- [ ] Write original copy for each page (nothing taken from Marissa's site)
- [x] Consent: show the screenshots as they are; the studio can hide or crop any of them
- [x] Old `public/logos/*` copies, the old hero and duplicate screenshots are git-ignored (kept on disk)

## B. Routing and layout
- [x] Add routes: `/services`, `/work`, `/work/photography`, `/work/videography`, `/about`, `/faq`
- [x] Header: page links, Work dropdown, Instagram/Facebook, "Work with us", mobile menu
- [x] Header: full width at the top, shrinks to a pill on scroll (animated)
- [x] Footer links point to the new pages
- [x] Shared layout (Header + Footer) and per-page metadata

## C. Home page rework
- [x] Order: Hero, Trusted brands, Results, Testimonials, My work, Services, Packages, About, Countries
- [x] Services teaser links to `/services`
- [x] Photography / Videography reduced to two teaser cards
- [x] About and Team moved off the home page (short About teaser kept)
- [x] Wall of Love above About

## D. New components
- [x] `Packages` (mock tiers)
- [x] `Countries` (USA incl. California, Canada, France, Germany, Lebanon)
- [x] `TrustedBy` shows all 15 client logos (scrolling band under the hero)
- [x] Soltani Media logo in header (wordmark) and footer (full lockup), cut to transparent from `soltani_logo.png`
- [x] `/work/web-design` page + Web Design in the Work dropdown, footer and work cards
- [x] `Results` (real screenshots + stats) and `Testimonials` (light card rail), split from the old Wall of Love

## E. Detail pages
- [x] `/photography`, `/videography`, `/about` (Bailey-style intro + team), `/faq`, `/services`, `/work`
- [ ] Refine each page section by section

## F. Polish and QA
- [x] Responsive check on mobile, tablet and desktop for every page (no overflow; results wall shortened on phones)
- [x] Image weight: live images come resized and compressed from Sanity's CDN
- [x] Tab icons and link-preview image
- [x] Privacy page; dead "Terms" link removed
- [ ] Confirm no copied text or images from Marissa's site
- [x] Lint and build pass
