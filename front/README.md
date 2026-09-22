# Soltani Media & Marketing — Next.js front end

Marketing site for Soltani Media & Marketing (photo, video and campaign studio).

## Run

```bash
npm install
npm run dev
```

## Where the brand lives

- `src/lib/brand.ts` — name, contact details, social handles, colour and type tokens.
  Entries marked `MOCK` are placeholders (domain, email, social URLs).
- `src/lib/content.ts` — services, work gallery, testimonials, imagery.
  Photography currently uses seeded [picsum](https://picsum.photos) placeholders
  and testimonial avatars use [pravatar](https://pravatar.cc); swap both for real assets.
- `src/components/Logo.tsx` — typographic wordmark. Replace with a real mark when one exists.

`../design/` is the original Figma code export the layout was built from. It is
reference material and is intentionally left on the old branding.
