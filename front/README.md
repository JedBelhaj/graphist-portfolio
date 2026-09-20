# geteclectic.co — Next.js front end

An exact port of the Figma Make bundle in [`../design`](../design) to Next.js (App Router).

## Running

```bash
npm install
npm run dev     # http://localhost:3000
```

`npm run build` produces a fully static prerender of `/`.

## Layout

```
src/
  app/
    layout.tsx     root html/body + metadata (title, description, noindex)
    page.tsx       page composition — mirrors the section order of design/src/app/App.tsx
    globals.css    tailwind + tw-animate-css + theme + fonts, plus the marquee keyframes
    theme.css      design tokens, copied verbatim from design/src/styles/default_theme.css
    fonts.css      @font-face declarations, copied from design/src/styles/globals.css
  components/      one file per section (Header, Hero, Marquee, About, …)
  lib/
    brand.ts       colors, font stacks, and the remote-asset URL helper
    content.ts     copy, asset ids, and the services/work/testimonial data
```

## Notes on the port

- Tailwind, `tw-animate-css`, and `lucide-react` are pinned to the exact versions the
  design bundle uses, so the generated CSS matches.
- Images are plain `<img>` tags pointing at the same remote Figma asset URLs as the
  design. `@next/next/no-img-element` is disabled for this reason; `next.config.ts`
  already whitelists the host if these are ever migrated to `next/image`.
- Only `Header` and `Work` are client components — they hold the mobile-menu and
  active-tab state. Every other section prerenders on the server.
- The design inlined `@keyframes marquee` in a `<style>` tag; it lives in
  `globals.css` here.
- The design's `theme.css` is intentionally not carried over: its own entry point
  (`index.css`) imported `default_theme.css` instead, so `theme.css` was dead code.
