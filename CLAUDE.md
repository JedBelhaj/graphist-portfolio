# Soltani Media portfolio

- `front/`: the website. Next.js 15, React 19, Tailwind 4, deployed on Vercel from `main`.
  - Run: `cd front && npm run dev` (http://localhost:3000)
  - Check before every commit: `npm run lint` and `npx tsc --noEmit` in `front/`
  - Layout and styling: `front/src/components/`, `front/src/app/` (pages, `globals.css`, `theme.css`), `front/public/`
- `studio/`: the Sanity Studio, i.e. the admin at https://oussamasoltani.sanity.studio. All text, photos, videos, testimonials and logos are edited there, not in code.
- `front/src/lib/cms.ts` fetches content from Sanity and fills any gap with the defaults in `front/src/lib/content.ts`. Components get content from `getContent()`. Changing `content.ts` does not change text that Sanity has a value for.

## Git workflow (every session, every branch)

| Branch | Purpose |
| --- | --- |
| `main` | The live site. Changes arrive only through a GitHub pull request that Jed merges. |
| `oussama` | Oussama's design work. |
| `dev`, `feature/*` | Jed's work. |

Rules:

- Never commit to `main`, push to `main`, or merge anything into `main` locally.
- Never run `git push --force` (or `--force-with-lease`), `git rebase`, `git reset --hard`, or delete a branch, unless the user explicitly asks for that exact command.
- At the start of a session, before editing anything:
  1. `git status`. If there are uncommitted changes, ask the user what they are before continuing.
  2. `git pull`, then `git fetch origin`, then `git merge origin/main --no-edit`.
  3. If the merge reports a conflict, run `git merge --abort`, stop, and tell the user to contact Jed. Do not resolve it yourself.
- Commit after each finished change, with a short message saying what changed. Push at the end of each task.
- If an npm package is added or removed, commit `package-lock.json` with it.
- To send work to `main`, open a pull request (`gh pr create --base main`, or give the user the GitHub "compare" link). Never merge the pull request.

## On the `oussama` branch

The person working here owns the business and isn't a developer. Explain git steps in plain words, and before committing, say which files changed and why.

- Scope is design: layout, styling, animation, and images in `front/public/`.
- Don't edit `studio/`, `front/sanity.types.ts`, `front/src/lib/cms.ts`, `front/src/sanity/`, `front/src/app/api/`, `front/next.config.ts`, or any `.env` file.
- To change text or photos on the site, point the user to the admin (Sanity Studio) instead of editing code.
- If a design change needs a new editable field in the admin, stop and tell the user to ask Jed. That needs a schema change and a studio deploy.
