# Homepage catalogue repositioning baseline

Date UTC: 2026-07-13
Proof path: evidence-first
Scope: active homepage composition, shared layout metadata/schema, active global navbar, homepage footer, and canonical guide index.

## Active composition before implementation

`site/src/pages/index.astro` imports and renders, in order:

1. `Hero.astro`
2. `ProblemSection.astro`
3. `SolutionSection.astro`
4. `Benefits.astro`
5. `BentoGrid.astro`
6. `Testimonials.astro`
7. `Pricing.vue` with `client:only="vue"`
8. `FinalCTA.astro`
9. `Newsletter.vue` with `client:only="vue"`
10. `Footer.astro`

The active global navbar is `site/src/site/components/Navbar.vue`, imported by `site/src/layouts/Layout.astro`.

## Claim baseline

- Homepage metadata describes an app that archives carts/orders, tracks price changes, and avoids cloud storage.
- Shared JSON-LD emits `WebApplication` plus a zero-price `Offer` on every Layout-backed route.
- Hero, problem, solution, benefits, feature grid, testimonials and final CTA promote app organization, price history, multi-device behavior, or cloud/local claims.
- `Testimonials.astro` renders anonymous five-star endorsements and an unsupported savings statement.
- `Pricing.vue` renders free/Pro/Team plans, prices, a “most popular” badge, price alerts and trial CTAs.
- `Newsletter.vue` collects an email locally and simulates a successful subscription without a backend.
- Navbar and footer prioritize feature/pricing/app anchors; the navbar contains two prominent `/app` CTAs labelled “Ouvrir l’application” and “Commencer”.
- `site/public/og-image.png` is a 1200×630 TubeFlow graphic with unrelated English video-product copy, so it materially contradicts TemuGlowz metadata.
- `site/public/llms.txt` already states the independent-project, published-guide and evidence-safe posture; no baseline contradiction requires changing it.

## Destination baseline

- Hero: `/app`, `/#features`
- Navbar anchors: `/#benefits`, `/#features`, `/#pricing`, `/#reviews`; app links: `/app`
- Final CTA: `/app`, `#features`
- Footer: `/#features`, `/#pricing`, `/app`, `/guides`, `/blog`, `/privacy`, `/terms`, and the repository GitHub URL
- Canonical substantive guide destinations in `guideIndex.ts`: `/guides/kitchen-gadgets` and `/guides/summer-cooling`
- Allowed enabled homepage destinations for this slice: `/guides`, `/guides/kitchen-gadgets`, `/guides/summer-cooling`; `/app` remains secondary only.

## Excluded dirty-file fingerprints before implementation

- `AffiliateGuideTemplate.astro`: `f77321870b6c4dc8a87c043b967c85200118f8aa`
- `PillarPage.vue`: `614a39d376ceac28f23877012b0c5d57a6fb4099`
- `PillarPageLoader.vue`: `d9a58a70a8a2eddd4889e0f565d82d1b6d969360`
- `ProductCard.astro`: `691e2a7bcae82cc769a47294c80a9c2b121537ca`
- `ProductCard.vue`: `1ae90b3da5fd2cad52fdc3e35d2176e524cfc524`

These fingerprints and their pre-existing diffs are evidence boundaries, not changes owned by this homepage slice.
