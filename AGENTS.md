# Repository Guidelines

## Project Structure & Module Organization
`src/app` contains App Router pages such as `notes`, `projects`, `graphs`, `roadmap`, and `diary`. Reusable UI lives in `src/components`, with graph-specific pieces under `src/components/graph`. Data loading and Markdown parsing helpers live in `src/lib`, and shared TypeScript types live in `src/types`. Content is file-based under `content/notes`, `content/projects`, `content/graphs`, `content/roadmaps`, and `content/diary`. Static assets and deployment metadata belong in `public`, while small maintenance scripts live in `scripts`.

## Build, Test, and Development Commands
Use `npm install` to install dependencies; CI uses `npm ci` on Node 20. Run `npm run dev` for local development. Run `npm run build` to create the static export in `out/`; this also triggers `pagefind` through `postbuild` to generate search indexes. Use `npm run start` to serve the exported site locally from `out/`. Run `npm run lint` before opening a PR. For content-only commits, `npm run commit:content` generates a descriptive commit message from changes under `content/`.

## Coding Style & Naming Conventions
Write TypeScript with `strict` mode in mind and prefer the `@/*` import alias for files under `src`. Follow the existing style: 2-space indentation, double quotes, PascalCase for React components (`ArticleCard.tsx`), and camelCase for utility modules (`posts.ts`, `roadmap.ts`). Keep route folders lowercase and match content categories to their URL segment names. Use ESLint (`next/core-web-vitals`) as the enforced style baseline; no Prettier config is checked in.

## Testing Guidelines
Node tests use the built-in `node:test` API and live in `scripts/*.test.ts`; run them with `npm test`. Add focused behavior tests for parsing or content-contract changes, then run `npm run lint` and `npm run build` before opening a PR. Avoid tests that inspect source text or lock in component implementation details.

## Commit & Pull Request Guidelines
Follow the commit patterns already in history: `feat:`, `fix:`, `refactor:`, `style:`, or the generated `content:` prefix for content batches. Keep each commit focused on one concern. Pull requests should summarize affected routes or content types, mention the verification commands you ran, link the related issue when applicable, and include screenshots for layout, Markdown rendering, or graph-view changes.

## Deployment & Configuration Notes
This site is exported statically and deployed by `.github/workflows/deploy.yml` to GitHub Pages. `REPO_NAME` and `CUSTOM_DOMAIN` influence `basePath` and asset prefixes in `next.config.ts`; keep those settings aligned with `public/CNAME` when changing deployment behavior.
