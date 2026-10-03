# TODO

Plan and context: [Plan_and_notes.md](Plan_and_notes.md)

## A. Content and assets
- [ ] Review the Drive folder and list usable photos, videos and logos
- [x] Get the client logos into `front/public/logos/real/`
- [ ] Replace the mock package tiers and prices (`PACKAGES` in `content.ts`)
- [ ] Replace placeholder FAQ answers (`FAQS` in `content.ts`)
- [ ] Real Instagram / Facebook / email links (`BRAND` in `brand.ts`)
- [ ] Replace mock photos (picsum) with real shoots: work cards, galleries, team, about
- [ ] Web design: real site screenshots for `WEB_SHOTS`, then pass `wireframe={false}` to `BrowserFrame`
- [ ] Add web design to the Services page groups and the Services bubble cluster
- [ ] Write original copy for each page (nothing taken from Marissa's site)
- [ ] Before launch: confirm consent for the Wall of Love screenshots, or crop/blur names and avatars
- [ ] Decide whether to delete the old `public/logos/*` copies (the site now uses `logos/real/`)

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
- [ ] Responsive check on mobile, tablet and desktop for every page
- [ ] Image and video optimisation (next/image, lazy loading)
- [ ] Confirm no copied text or images from Marissa's site
- [x] Lint and build pass
