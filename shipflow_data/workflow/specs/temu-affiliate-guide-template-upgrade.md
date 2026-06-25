---
artifact: spec
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "temu"
created: "2026-06-25"
created_at: "2026-06-25 18:13:40 UTC"
updated: "2026-06-25"
updated_at: "2026-06-25 18:27:31 UTC"
status: reviewed
source_skill: 100-sf-spec
source_model: "GPT-5 Codex"
scope: "affiliate guide template and editorial trust upgrade"
owner: "Diane"
confidence: high
user_story: "En tant que lectrice TemuGlowz, je veux comprendre rapidement pourquoi un produit est recommande, comment la selection a ete faite, quelles limites existent, et si les liens sont affilies, afin de choisir avec confiance sans etre trompee par des promesses non prouvees."
risk_level: high
security_impact: yes
docs_impact: yes
linked_systems:
  - "src/pages/guides/kitchen-gadgets.astro"
  - "src/pages/guides/summer-cooling.astro"
  - "src/site/components/ProductCard.astro"
  - "src/site/data/kitchen-gadgets.json"
  - "src/site/data/summer-cooling.json"
  - "public/data/kitchen-gadgets.json"
  - "public/llms.txt"
  - "src/layouts/Layout.astro"
  - "shipflow_data/technical/design-system-authority.md"
depends_on:
  - artifact: "shipflow_data/technical/design-system-authority.md"
    artifact_version: "1.0.0"
    required_status: active
  - artifact: "Google Search Central helpful content documentation"
    artifact_version: "accessed 2026-06-25"
    required_status: reviewed
  - artifact: "Google Search Central high-quality reviews documentation"
    artifact_version: "accessed 2026-06-25"
    required_status: reviewed
  - artifact: "FTC Endorsement Guides disclosure guidance"
    artifact_version: "accessed 2026-06-25"
    required_status: reviewed
supersedes: []
evidence:
  - "User asked whether current guides are at the level of a major affiliate site in 2026; assessment: technical base is healthy, editorial/trust layer is not yet at that bar."
  - "Current guide pages duplicate the same layout logic instead of using a shared affiliate guide template component."
  - "Current guide JSON uses unsupported phrases such as 'testes', 'approuves', 'performants', and 'qualite au top' without repo evidence of hands-on testing."
  - "Current ProductCard displays rating, price, pros, cons, and affiliate links but lacks per-product rationale, best-for use case, source/proof status, and price freshness context."
  - "Current guide pages do not show a clear affiliate disclosure near the first affiliate decision point."
next_step: "/100-sf-spec Temu affiliate guide template upgrade"
---

# Spec: Temu Affiliate Guide Template Upgrade

🟡 [temu] spec: Temu affiliate guide template upgrade | status: reviewed | path: shipflow_data/workflow/specs/temu-affiliate-guide-template-upgrade.md | next: /100-sf-spec Temu affiliate guide template upgrade

## Title

Temu Affiliate Guide Template Upgrade: Trust, Methodology, Disclosure, And Review Quality

## Status

Reviewed by `101-sf-ready` on 2026-06-25 and not yet ready for `/102-sf-start`. The current spec is directionally solid, but it still needs a canonical structured `Test Contract` and an explicit, proportionate security treatment for outbound-link and rendered-content safety before a fresh agent can implement it without making contract decisions mid-run.

## User Story

En tant que lectrice TemuGlowz, je veux comprendre rapidement pourquoi un produit est recommande, comment la selection a ete faite, quelles limites existent, et si les liens sont affilies, afin de choisir avec confiance sans etre trompee par des promesses non prouvees.

Primary actors:

- French-speaking Temu shopper reading a buying guide.
- Operator maintaining affiliate pages without making unsupported product claims.
- Search/crawler surface evaluating originality, helpfulness, and trust signals.

Trigger:

- A visitor opens `/guides/kitchen-gadgets` or `/guides/summer-cooling`.
- A new Temu guide is created from the shared template.
- Product data is refreshed without new hands-on testing evidence.

Observable result:

- Each guide displays a clear affiliate disclosure before or near the first product recommendation.
- Each guide explains selection methodology, update date, proof limits, and what readers should verify on Temu before buying.
- Each product card explains the best use case, why it was selected, key drawback or caution, and price freshness status without claiming direct testing unless evidence exists.
- The two existing guide pages consume one shared Astro guide template instead of duplicating route markup.
- Unsupported "tested/approved" style claims are removed or replaced with accurate curation language.

## Minimal Behavior Contract

The site must render Temu affiliate guides through a shared static Astro template that preserves crawlable HTML and the existing product card performance gains while adding trust-critical editorial blocks: disclosure, methodology, update context, comparison summary, product rationale, caveats, and conservative claim wording. If no hands-on evidence exists for a product, the guide must say the product is curated or selected from visible criteria, not tested. The easy-to-miss edge case is that adding a premium-looking template must not strengthen public claims beyond the evidence available in the data.

## Success Behavior

- Given a reader lands on a guide, when they reach the introduction, then they see a concise affiliate disclosure and editorial independence note before the first product CTA.
- Given a guide has product sections, when rendered, then a summary block shows the selection criteria and how to use the ranking.
- Given a product card appears, when the reader scans it, then the card states "best for" or equivalent use case, rationale, pros, cons/cautions, price note, and link CTA.
- Given a guide lacks hands-on proof, when copy is rendered, then it avoids "testé", "approuvé", "meilleur prouvé", "qualité garantie", and similar unsupported claims.
- Given a new guide is created later, when it imports the shared template and guide data, then the route does not duplicate the full page structure.
- Given the site builds, when generated HTML is inspected, then product content, disclosure, FAQ, JSON-LD, canonical metadata, and `rel=\"noopener noreferrer sponsored\"` remain present.

## Error Behavior

- Missing disclosure text: fail validation or block verification; do not ship an affiliate page without visible disclosure.
- Missing methodology data: render a conservative default methodology only if it does not invent tests, otherwise block readiness.
- Missing product rationale: render a neutral card but mark the page as incomplete for affiliate-quality verification.
- Unsupported claim found in guide data or route copy: replace with evidence-safe wording before verification.
- Missing `productUrl`: render the product content without an affiliate CTA and do not produce a broken link.
- Price/date uncertainty: show prices as indicative and ask readers to verify current price and availability on Temu.
- Layout/template refactor breaks static rendering: stop and repair as Astro/static HTML; do not reintroduce Vue islands for non-interactive cards.

## Problem

The current guide pages are technically cleaner after the performance hardening work, but editorially they still read like a generic affiliate list. They duplicate page structure, make unsupported testing/performance claims, do not show a visible affiliate disclosure near the decision point, and do not explain enough about selection criteria or proof limits. In 2026, major affiliate sites need more than product cards: they need trust architecture, original value, clear caveats, and compliance-safe disclosure.

## Solution

Create a shared static Astro affiliate guide template and enrich the guide data contract with trust fields. Update the two existing guides to use the template, remove unsupported testing claims, add disclosure and methodology blocks, add comparison/selection summaries, and upgrade product cards with rationale/caution fields while preserving static performance and sponsored link attributes.

## Scope In

- Shared Astro guide template component for guide pages.
- Data contract additions for guide-level disclosure, methodology, criteria, last-checked note, and product rationale.
- Product card enhancements for use case, rationale, caveat, and price freshness.
- Copy cleanup for unsupported test/quality/performance claims in current guide JSON and visible pages.
- Existing routes `/guides/kitchen-gadgets` and `/guides/summer-cooling`.
- Static build, artifact inspection, and browser smoke proof.
- Metadata/JSON-LD preservation where currently present.
- Optional update to `public/llms.txt` if it currently implies stronger verification than the site can support.

## Scope Out

- Claiming hands-on product testing without actual test evidence.
- Creating original product photography, lab testing, or purchase receipts in this slice.
- Scraping Temu pages, mirroring remote product images, or building price/availability monitoring.
- Adding new Temu guide topics beyond the two existing guide pages.
- SEO keyword research, content calendar, or backlink strategy.
- Changing the app-side Temu Shopping Lists product.
- Changing affiliate network/provider integration beyond visible disclosure and link attributes.

## Constraints

- Static guide pages must remain crawlable without client-side hydration for product cards.
- Public claims must remain evidence-safe: "selection", "curation", "points a verifier", and "prix indicatif" are acceptable; "teste", "approuve", "garanti", "meilleur prouve", and "stock/prix en direct" are not acceptable unless evidence exists.
- Affiliate disclosure must be visible before the reader reaches the first affiliate CTA.
- Temu affiliation must not be implied; the site remains independent.
- Price and availability must be framed as volatile and to verify on Temu.
- Product URLs must keep `target="_blank"` and `rel="noopener noreferrer sponsored"`.
- Design changes must respect the project design-system authority and pass drift check.
- Static-site Sentry remains not expected for current guide pages because there is no auth, checkout, protected route, or user-specific runtime workflow.
- Fresh external docs verdict: `fresh-docs checked` using Google Search Central helpful content/reviews guidance and FTC endorsement/disclosure guidance accessed 2026-06-25.

## Test Contract

This section is not yet in the canonical ready format required by `101-sf-ready`.

Missing structured fields that must be added before `/102-sf-start`:

- `surface`
- `proof_profile`
- `proof_order`
- `checklist_path` (or an explicit no-checklist rationale)
- `required_scenario_ids`
- `required_results`
- `exception_with_proof`
- `exception_without_proof`

Current intended proof inputs:

- Automated proof:
  - `pnpm build:site`
  - `python3 /home/claude/shipflow/tools/design_system_drift_check.py --changed --format markdown`
  - `python3 /home/claude/shipflow/tools/shipflow_metadata_lint.py shipflow_data/workflow/specs/temu-affiliate-guide-template-upgrade.md shipflow_data/technical/design-system-authority.md`
  - Static scans for forbidden unsupported claims in guide data and generated HTML.
  - Static scans that guide HTML still has no `astro-island`/`client:only` for product cards and that affiliate links keep sponsored/noopener/noreferrer attributes.
- Browser proof:
  - Astro preview or equivalent static browser smoke for both guide pages on desktop and mobile.
  - Check disclosure visibility, methodology block, comparison/criteria block, product cards, FAQ, images, outbound links, console warnings/errors, and mobile overflow.
- Manual proof:
  - Hands-on product testing proof is explicitly not part of this slice; verification must not claim it.

## Dependencies

- Astro static page routing and component rendering already used by the site.
- Current data files: `src/site/data/kitchen-gadgets.json`, `src/site/data/summer-cooling.json`.
- Current static product component: `src/site/components/ProductCard.astro`.
- Project design authority: `shipflow_data/technical/design-system-authority.md`.
- Official guidance consulted on 2026-06-25:
  - Google Search Central: creating helpful, reliable, people-first content.
  - Google Search Central: writing high-quality reviews.
  - FTC Endorsement Guides: disclosure of material connections and endorsements.

Fresh external docs verdict: `fresh-docs checked`.

## Invariants

- Static guide product cards remain static HTML, not hydrated Vue islands.
- Affiliate link attributes remain `noopener noreferrer sponsored`.
- Guide pages do not imply Temu partnership, certification, or official authorization.
- Product prices remain indicative and are not represented as live or guaranteed.
- Remote Temu/product images are not copied into the repo.
- Existing app-side sync, shopping list, and WebView behavior is not affected.
- Public claims must match the proof available in the repo.

## Links & Consequences

- `src/pages/guides/kitchen-gadgets.astro` and `src/pages/guides/summer-cooling.astro`: should become thin route wrappers around the shared guide template.
- `src/site/components/ProductCard.astro`: card data contract expands; existing fields must stay backward-compatible or current data must be updated in the same change.
- `src/site/data/*.json`: copy and schema-like conventions change; unsupported claims must be removed.
- `public/data/kitchen-gadgets.json`: may be stale duplicate guide data; implementation must decide whether to update, remove, or document its role.
- `public/llms.txt`: currently states "honest reviews" and "verified seller on Temu"; this may need correction if it overclaims review depth or verified seller status.
- SEO consequence: stronger trust blocks help quality, but wrong claims or hidden disclosure increase compliance and ranking risk.
- Performance consequence: shared template must preserve the static rendering improvements from the previous chantier.

## Documentation Coherence

- Update this spec's run history through the lifecycle.
- Update editorial governance or content map only if the project decides to formalize guide surfaces under root `shipflow_data/editorial/`; current `site/shipflow_data/editorial/content-map.md` appears copied from another project and should not be treated as authoritative for Temu without cleanup.
- README updates are not required unless the public guide workflow becomes a developer-facing command or policy.
- Do not edit `TASKS.md` or `AUDIT_LOG.md` from this spec.

## Edge Cases

- Product has no affiliate URL.
- Product has a remote placeholder image.
- Product has pros but no cons.
- Product price becomes stale after publish.
- Guide title says 2025 while metadata says 2026.
- Existing text claims "testes" without proof.
- JSON-LD or FAQ disappears during template extraction.
- Shared template introduces an `article` nesting issue or changes heading order.
- Mobile cards overflow because additional trust fields are too dense.
- Disclosure appears only in footer and not before the first affiliate CTA.
- `public/data` contains a stale copy that contradicts `src/site/data`.

## Implementation Tasks

- [ ] Task 1: Define the shared affiliate guide data contract.
  - Files: `src/site/data/kitchen-gadgets.json`, `src/site/data/summer-cooling.json`
  - Action: Add guide-level fields for disclosure, methodology, criteria, last-checked note, and product-level fields for best use, rationale, caution, and price note.
  - User story link: gives readers the why, limits, and disclosure behind each recommendation.
  - Validate with: build and static text scan.

- [ ] Task 2: Create a shared Astro guide template.
  - File: `src/site/components/AffiliateGuideTemplate.astro`
  - Action: Move duplicated guide layout into one static template with breadcrumb, header, disclosure, methodology, summary/criteria, sections, FAQ, and final CTA slots/props.
  - User story link: makes future guides consistently trustworthy instead of duplicating weak layouts.
  - Validate with: `pnpm build:site`.

- [ ] Task 3: Upgrade static product cards for affiliate trust.
  - File: `src/site/components/ProductCard.astro`
  - Action: Render best-for/use-case, selection rationale, caution/limits, and price note when present; keep sponsored links and static HTML.
  - User story link: lets readers understand whether a product fits their situation.
  - Validate with: browser smoke and generated HTML inspection.

- [ ] Task 4: Refactor existing guide routes to use the shared template.
  - Files: `src/pages/guides/kitchen-gadgets.astro`, `src/pages/guides/summer-cooling.astro`
  - Action: Replace duplicated page bodies with `<AffiliateGuideTemplate />` calls and page-specific breadcrumb/category/CTA data.
  - User story link: ensures both existing guides use the improved standard.
  - Validate with: `pnpm build:site` and no route regressions.

- [ ] Task 5: Remove unsupported public claims.
  - Files: `src/site/data/*.json`, `public/data/kitchen-gadgets.json`, `public/llms.txt` if needed
  - Action: Replace unsupported "tested/approved/performance guaranteed" claims with conservative curation language, and correct any stale 2025/2026 mismatch where appropriate.
  - User story link: protects reader trust and compliance.
  - Validate with: `rg` scan for forbidden claim terms.

- [ ] Task 6: Preserve SEO and static performance proof.
  - Files: generated `dist-site/guides/**/index.html`
  - Action: Inspect built HTML for disclosure, methodology, product content, FAQ, JSON-LD, sponsored links, and absence of per-card islands.
  - User story link: improves guide quality without undoing performance hardening.
  - Validate with: static scans plus Playwright smoke.

- [ ] Task 7: Update durable notes only if needed.
  - Files: this spec, optionally root editorial docs if bootstrapped in a later docs chantier
  - Action: Record validation evidence and any explicit editorial governance gap.
  - User story link: future guide updates keep the same trust standard.
  - Validate with: ShipFlow metadata lint.

## Acceptance Criteria

- [ ] AC1: Given a guide page loads, when the reader reaches the intro, then a visible affiliate disclosure appears before the first product CTA.
- [ ] AC2: Given a guide page loads, when the reader scans the top section, then methodology, selection criteria, and update/price freshness context are visible.
- [ ] AC3: Given a product card renders, when product trust fields exist, then best-use, rationale, caution/limits, and price note are visible without breaking mobile layout.
- [ ] AC4: Given current guide data has no hands-on proof, when generated HTML is scanned, then unsupported claims such as "testé", "approuvé", and "qualité au top" are absent unless tied to actual evidence.
- [ ] AC5: Given each guide has Temu outbound links, when generated HTML is inspected, then each link keeps `target="_blank"` and `rel="noopener noreferrer sponsored"`.
- [ ] AC6: Given the guides build, when generated HTML is scanned, then product cards do not emit `astro-island`, `client:only`, or Vue hydration for static cards.
- [ ] AC7: Given `/guides/kitchen-gadgets` and `/guides/summer-cooling` render, when browser smoke runs on desktop and mobile, then disclosure, methodology, product cards, FAQ, images, and CTAs are visible with no console errors or mobile overflow.
- [ ] AC8: Given the template is shared, when both route files are inspected, then they no longer duplicate the full guide page body.
- [ ] AC9: Given `public/llms.txt` or `public/data` contains contradictory public claims, when implementation finishes, then those claims are corrected, updated, or explicitly documented as out of scope with no active contradiction in shipped pages.
- [ ] AC10: Given validation runs, then `pnpm build:site`, design-system drift check, metadata lint, static claim scans, and browser smoke pass.

## Test Strategy

1. Run `pnpm build:site`.
2. Run `python3 /home/claude/shipflow/tools/design_system_drift_check.py --changed --format markdown`.
3. Run metadata lint on this spec and any touched ShipFlow docs.
4. Scan source and `dist-site` for forbidden unsupported claim terms and hydration regressions.
5. Inspect generated guide HTML for affiliate disclosure, methodology, FAQ, JSON-LD, and link attributes.
6. Run Astro preview and Playwright/browser smoke on both guide pages at desktop and mobile widths.

## Risks

- High trust/compliance risk: unsupported test claims can mislead readers and weaken affiliate compliance. Mitigation: conservative copy and forbidden-claim scan.
- Medium SEO risk: a templated trust layer can still feel generic if product rationale is thin. Mitigation: require per-product rationale and use-case fields, not only a generic intro block.
- Medium UX risk: adding methodology and disclosure can make pages dense. Mitigation: concise, scannable blocks and mobile proof.
- Medium maintenance risk: `public/data` may be stale duplicate content. Mitigation: implementation must reconcile or document its role.
- Low performance risk: additional static HTML should not add client JS. Mitigation: static artifact scans and browser proof.
- Low but real content-safety risk: guide data and outbound affiliate URLs are repo-curated but still become public HTML, so the spec must explicitly define how invalid `productUrl`, unsafe schemes, and rendered text fields are handled before implementation begins.

## Execution Notes

- Prefer a shared Astro component over repeating markup in each route.
- Do not create a CMS, schema library, or runtime validator unless implementation finds actual recurring maintenance pain that justifies it.
- Do not invent product testing, purchase history, verified seller status, or live price checks.
- If the implementation discovers actual evidence of hands-on tests, it may preserve testing language only where the evidence is linked and specific.
- Treat `site/shipflow_data/editorial/content-map.md` as suspect migration debt because it references `tubeflow-site`, not TemuGlowz.
- Public guide content is French; internal ShipFlow headings and metadata stay English.

## Open Questions

Not ready:

- Rewrite `Test Contract` into the canonical structured format expected by `101-sf-ready`, including scenario IDs, proof order, required results, and explicit proof exceptions.
- Add an explicit security note covering outbound link validation and rendered-content safety for repo-curated guide data, so a fresh agent does not improvise that contract during implementation.

## Skill Run History

| Date UTC | Skill | Model | Action | Result | Next step |
|----------|-------|-------|--------|--------|-----------|
| 2026-06-25 18:13:40 UTC | 100-sf-spec | GPT-5 Codex | Created spec from user request to raise TemuGlowz guides to major affiliate-site quality after identifying missing trust template, disclosure, methodology, and evidence-safe claim boundaries. | draft | /101-sf-ready Temu affiliate guide template upgrade |
| 2026-06-25 18:27:31 UTC | 101-sf-ready | GPT-5 Codex | Evaluated readiness gate against structure, freshness, design-system authority, adversarial review, and security expectations. | not ready | /100-sf-spec Temu affiliate guide template upgrade |

## Current Chantier Flow

- 100-sf-spec: complete, spec created.
- 101-sf-ready: complete, not ready.
- 102-sf-start: pending.
- 103-sf-verify: pending.
- 104-sf-end: pending.
- 005-sf-ship: pending.

Next command: `/100-sf-spec Temu affiliate guide template upgrade`
