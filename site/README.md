# TemuGlowz public site

This workspace contains the active TemuGlowz Astro site. It owns public pages, layouts, Astro components, Vue islands, guide data, static assets, and the product-ingestion tool.

## Commands

Run from the repository root:

```bash
pnpm dev:site
pnpm build:site
pnpm --filter @temuglowz/site typecheck
pnpm --filter @temuglowz/site test:once
```

The static build is written to `site/dist/`.

## Product data tool

The tool reads and updates JSON files under `site/src/site/data/` and must be run in the site workspace:

```bash
pnpm --filter @temuglowz/site product:add -- prepare --url <temu-url>
pnpm --filter @temuglowz/site product:add -- apply --input-file <payload.json> --page <slug> --section <id>
```

Do not invent ratings, prices, availability, partnership, approval, or automation claims. Keep all public assets in `site/public/`; app icons are copied separately to `app/public/`.
