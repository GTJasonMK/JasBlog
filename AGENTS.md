# Repository Guidelines

## Project Structure & Module Organization
`src/app` contains App Router pages such as `notes`, `projects`, `graphs`, `roadmap`, `diary`, and `photography`. Reusable UI lives in `src/components`. Data loading helpers live in `src/lib`, and types live in `src/types`. Photography data belongs to the blog: its manifest is `content/photography/photos.json` and images are in `public/photography`; the shared view belongs to `@jas/content-ui`. Other content remains Markdown-based. Static assets and deployment metadata belong in `public`, while small maintenance scripts live in `scripts`.

## Build, Test, and Development Commands
Use `npm install` to install dependencies; CI uses `npm ci` on Node 20. Run `npm run dev` for local development. Run `npm run build` to create the static export in `out/`; this also triggers `pagefind` through `postbuild` to generate search indexes. Use `npm run start` to serve the exported site locally from `out/`. Run `npm run lint` before opening a PR. For content-only commits, `npm run commit:content` generates a descriptive commit message from changes under `content/`.

Use `npm run photo:add -- <file> --title <title>` to import a photograph; see `docs/photography.md`. Publish the manifest and generated public images together. Shared content styles and ContentHost belong inside the main content area, outside the site navigation.

Site content configuration lives in `content/site.json`, independent Markdown pages in `content/pages`, and generated article images in `public/media`. All publishable content explicitly declares `publication`. `@jas/site-tools` owns image processing, static-export cleanup and deployment orchestration; `@jas/content-ui` owns the shared photography view. See `docs/site-management.md`. `npm run site:migrate` backs up and upgrades existing content. `npm run commit:content` now performs the complete publishing workflow and must not be used as a verification command.

## Coding Style & Naming Conventions
Write TypeScript with `strict` mode in mind and prefer the `@/*` import alias for files under `src`. Follow the existing style: 2-space indentation, double quotes, PascalCase for React components (`ArticleCard.tsx`), and camelCase for utility modules (`posts.ts`, `roadmap.ts`). Keep route folders lowercase and match content categories to their URL segment names. Use ESLint (`next/core-web-vitals`) as the enforced style baseline; no Prettier config is checked in.

## Testing Guidelines
Node tests use the built-in `node:test` API and live in `scripts/*.test.ts`; run them with `npm test`. Add focused behavior tests for parsing or content-contract changes, then run `npm run lint` and `npm run build` before opening a PR. Avoid tests that inspect source text or lock in component implementation details.

## Commit & Pull Request Guidelines
Follow the commit patterns already in history: `feat:`, `fix:`, `refactor:`, `style:`, or the generated `content:` prefix for content batches. Keep each commit focused on one concern. Pull requests should summarize affected routes or content types, mention the verification commands you ran, link the related issue when applicable, and include screenshots for layout, Markdown rendering, or graph-view changes.

## Deployment & Configuration Notes
This site is exported statically and deployed by `.github/workflows/deploy.yml` to GitHub Pages. `REPO_NAME` and `CUSTOM_DOMAIN` influence `basePath` and asset prefixes in `next.config.ts`; keep those settings aligned with `public/CNAME` when changing deployment behavior.
