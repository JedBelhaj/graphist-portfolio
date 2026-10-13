# Soltani Media — Admin (Sanity Studio)

The admin for the website in `../front`. Editors change text, photos, videos,
logos and the rest here; the site picks up published changes within a minute.

- Project: `4vlbo27c`, dataset `production`
- Hosted by Sanity at https://oussamasoltani.sanity.studio
- Content and uploads live in Sanity (free plan: 100 GB assets, 100 GB
  bandwidth / month, 20 users)

## First-time setup

```bash
cd studio
npm install
cp .env.example .env          # already filled in: SANITY_STUDIO_PROJECT_ID=4vlbo27c
npx sanity login              # choose GitHub — the account that owns the project
npm run seed                  # copies the site's current text, logos and screenshots into Sanity
npm run deploy                # builds and hosts the studio at oussamasoltani.sanity.studio
```

Then on Vercel (front project → Settings → Environment Variables):

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `4vlbo27c` |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_STUDIO_URL` | `https://oussamasoltani.sanity.studio` — makes `/admin` on the site redirect there |
| `SANITY_REVALIDATE_SECRET` | optional, see below |

**Instant updates (optional).** Without this, edits appear within 60 seconds.
For instant: sanity.io/manage → project → API → Webhooks → add one with URL
`https://<site>/api/revalidate`, trigger on create / update / delete, and a
secret; put the same secret in `SANITY_REVALIDATE_SECRET` on Vercel.

**Giving someone access:** sanity.io/manage → project → Members → Invite.

## Day to day

```bash
npm run dev       # studio on http://localhost:3333
npm run deploy    # publish schema/studio changes to the hosted studio
npm run typegen   # after changing a schema or the site's query: regenerates ../front/sanity.types.ts
```

## How content is organised

- **Pages** (Site settings, Home, About, Services, Work, Photography,
  Videography, Web design, FAQ): one document each, holding that page's text.
  A blank field shows the original copy, so nothing on the site can go empty.
- **Lists** (Photos, Videos, Websites, Client messages, Testimonials, Client
  logos, Team): drag to reorder; the site follows that order. An empty list
  shows the original placeholder items.

**Video:** upload only short, silent loop clips (5–15 s, under ~15 MB) as the
"Loop clip". Full-length films go on YouTube or Vimeo, with the link pasted
into "Full video link". Sanity serves files as plain downloads with no
streaming, so long videos would eat the free bandwidth fast.
