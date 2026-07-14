---
artifact: spec
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "ShopGlowz"
created: "2026-07-13"
created_at: "2026-07-13 17:00:00 UTC"
updated: "2026-07-13"
updated_at: "2026-07-14 19:30:00 UTC"
status: ready
source_skill: 100-sg-spec
source_model: "GPT-5 Codex"
scope: "Brand repositioning and multi-merchant affiliate gadget discovery hub"
owner: "Diane"
confidence: high
user_story: "En tant que consommateur francophone, je veux découvrir des gadgets utiles, malins ou mignons et comprendre où les acheter parmi plusieurs enseignes, afin de faire un choix simple sans dépendre d'un seul marchand ni de promesses de prix ou de stock en temps réel."
risk_level: high
security_impact: none
docs_impact: yes
linked_systems:
  - "Astro static site"
  - "Editorial governance corpus"
  - "SEO routes, sitemap and llms.txt"
  - "Affiliate link policy and merchant programs"
depends_on:
  - artifact: "shipglowz_data/technical/site/design-system-authority.md"
    artifact_version: "1.0.0"
    required_status: reviewed
supersedes:
  - "shipglowz_data/workflow/specs/temuglowz-temu-shopping-guides-content-plan.md"
evidence:
  - "Operator directive 2026-07-13: rename the public direction to ShopGlowz and make the site multi-merchant."
  - "Existing Temu-focused content plan and homepage repositioning spec are too narrow for the new promise."
  - "Research report on French import changes recommends a merchant-neutral gadget guide with Temu as one source among others."
next_step: "none"
---

# Title

ShopGlowz — plateforme éditoriale multi-enseignes de gadgets

## Status

Ready. The spec is explicit enough for a fresh agent: stale Temu-first governance docs are treated as migration sources, external claim constraints are backed by dated official sources, and the implementation order, proof contract and stop conditions are now concrete.

## User Story

En tant que consommateur francophone, je veux découvrir des gadgets utiles, malins ou mignons et comprendre où les acheter parmi plusieurs enseignes, afin de choisir sereinement sans dépendre d'un seul marchand.

## Minimal Behavior Contract

ShopGlowz présente des sélections et des guides orientés usages (cadeaux, maison, camping, informatique, quotidien), puis propose une ou plusieurs destinations marchandes clairement identifiées. Chaque recommandation porte sa source, sa date de vérification et ses limites. Temu devient une enseigne possible, jamais l'identité du site. Les prix, stocks, frais d'importation, délais et conditions restent des informations susceptibles de changer; aucune surveillance automatique ni promesse temps réel n'est incluse.

## Success Behavior

- La marque publique, les titres, métadonnées, navigation et pages d'accueil parlent de ShopGlowz et de gadgets multi-enseignes.
- Les contenus peuvent citer Temu, Amazon ou des revendeurs européens sans faire croire à une affiliation officielle non prouvée.
- Une fiche produit distingue marchand, pays/entrepôt connu, lien affilié éventuel, date de contrôle et avertissement de volatilité.
- Les guides expliquent les frais d'importation, stocks, vendeurs, origine, algorithmes et alternatives sans généraliser ni inventer.
- Les anciennes URL TemuGlowz restent accessibles ou redirigées selon un plan SEO validé.

## Error Behavior

Si un programme affilié, une identité de vendeur, un prix, un stock ou une règle douanière n'est pas vérifiable, le contenu est qualifié, dépublié ou maintenu en brouillon. Les liens non approuvés sont refusés par la validation d'affiliation. Une migration incomplète ne doit jamais supprimer silencieusement les anciennes pages indexées.

## Problem

Le site et ses contrats sont construits autour de Temu et de fonctionnalités d'application désormais hors ligne directrice. Cette dépendance limite la couverture éditoriale, fragilise les promesses quand les règles changent et rend le futur catalogue multi-enseignes coûteux à maintenir.

## Solution

Créer une couche de marque et de données neutre vis-à-vis des marchands, puis migrer progressivement le site public vers ShopGlowz. Conserver les guides Temu utiles comme une verticale parmi d'autres, tout en ajoutant un registre des marchands, une disclosure affiliée commune et une stratégie de redirections.

## Scope In

- Renommer la marque publique en ShopGlowz (copy, SEO, navigation, footer, données structurées, llms.txt et documentation publique).
- Définir une taxonomie par usage et un hub hybride sélections + repères pratiques.
- Abstraire les cartes et liens produit pour accepter plusieurs marchands.
- Ajouter registre marchand, statut d'affiliation, source, date de contrôle, pays/entrepôt et notes de volatilité.
- Préparer les guides multi-enseignes sur importation, stocks, vendeurs, origine, algorithmes et alternatives.
- Préserver les anciennes routes et préparer redirections/canonicals après audit SEO.

## Scope Out

- Scraping automatique, suivi de prix ou de stock en temps réel.
- Promesse de meilleur prix universel, disponibilité garantie ou livraison garantie.
- Intégration d'un programme affilié avant vérification de ses conditions et validation juridique.
- Renommage immédiat des packages, dépôts, domaine et identifiants techniques sans décision de migration séparée.
- Suppression des anciennes pages Temu avant preuve de parité et redirections.

## Constraints

- Site statique Astro; source des tokens visuels: `site/src/styles/global.css` et autorité design documentée.
- Disclosure affiliée visible et indépendante pour chaque marchand concerné.
- Claims volatils sourcés, datés et révisables; pas d'affirmation sur l'origine d'un vendeur sans preuve.
- Tout changement public doit mettre à jour sitemap, metadata, structured data et `llms.txt`.

## Test Contract

- Surface: Astro static public site plus governance and editorial artifacts.
- Proof profile: mixed.
- Proof order:
  1. metadata lint and markdown integrity
  2. unit or helper validation for merchant registry and domain allowlist
  3. content/build validation for Astro collections, routes, metadata and sitemap
  4. browser proof for homepage, category path, guide path and legacy-route behavior
  5. SEO proof for canonicals, redirects and machine-readable files
- Automated proof required:
  - `python3 /home/claude/shipglowz/tools/shipglowz_metadata_lint.py shipglowz_data/workflow/specs/shopglowz-multi-merchant-gadget-platform.md`
  - project lint/type/build commands for the site once implementation exists
  - targeted tests for merchant registry, disclosure enforcement and domain allowlist once added
- Manual proof required:
  - desktop and mobile browser check for homepage positioning and merchant disclosure visibility
  - legacy TemuGlowz route to redirected or equivalent ShopGlowz destination
  - visual proof that public pages still consume shared design tokens rather than page-local literals
- Required scenario ids:
  - `brand-home-shopglowz`
  - `merchant-card-disclosure`
  - `legacy-route-parity`
  - `guide-volatility-note`
  - `seo-machine-readable-parity`
- Required results:
  - no primary public page leads with TemuGlowz branding
  - each outbound merchant surface shows merchant identity, checked date and volatility/disclosure text
  - legacy indexed routes resolve to live content or documented redirect targets
  - sitemap, metadata and `llms.txt` describe the new multi-merchant scope without unsupported claims
- Checklist path: `shipglowz_data/workflow/test-checklists/shopglowz-public-rebrand-and-multi-merchant.md`
- Exceptions:
  - `exception-with-proof`: affiliate-program activation checks remain documentary until each program is actually approved
  - `exception-without-proof`: none

## Dependencies

- Internal authority still used by implementation:
  - `shipglowz_data/technical/site/design-system-authority.md` `1.0.0` reviewed remains the canonical source for public-site visual tokens and shared component boundaries.
- Migration-source artifacts, not blocking authorities:
  - `shipglowz_data/branding/branding.md` `0.1.0` draft is intentionally stale and must be rewritten by Task 1; it is migration input, not a prerequisite contract for readiness.
  - `shipglowz_data/editorial/content-map.md` `1.1.0` reviewed is intentionally Temu-first and must be rewritten by Task 2; it is migration input, not a blocking authority for this spec.
- Fresh-docs checked for contract-level external behavior:
  - Temu partner platform terms confirm partner usage is governed by current platform rules and prohibited conduct boundaries; source consulted: Temu Partner Platform documentation page `https://partner.temu.com/documentation?menu_code=d8425dcd25b04658843e622e178a3b42`.
  - Amazon Associates operating agreement and policies confirm participation and disclosure obligations are program-governed and current-policy dependent; sources consulted: `https://affiliate-program.amazon.com/help/operating/agreement`, `https://affiliate-program.amazon.com/help/operating/policies`, and the disclosure help page `https://affiliate-program.amazon.com/help/node/topic/GHQNZAU6669EZS98`.
  - French import-charge context is officially volatile and date-sensitive; sources consulted: Douanes pages `https://www.douane.gouv.fr/actualites/taxe-sur-les-petits-colis-point-dinformation-sur-sa-mise-en-oeuvre` and `https://www.douane.gouv.fr/fiche/anticiper-les-frais-de-douane-dun-colis`.
- Fresh-docs not needed at this stage:
  - domain and repository rename behavior, because technical identifier migration remains explicitly out of scope for this chantier
  - Astro framework behavior, because the spec does not propose a framework migration or non-standard routing behavior and the current repo already defines the local implementation surface
- Ongoing implementation precondition:
  - every additional merchant introduced after this spec must have its own official affiliate or outbound-link policy checked before publication; no merchant may be added by analogy from Temu or Amazon.

## Invariants

- ShopGlowz reste indépendant des plateformes présentées.
- Toute sélection indique son marchand et sa date de vérification.
- Aucune donnée volatile n'est présentée comme stable ou garantie.
- Les anciennes URL publiées ne sont pas cassées sans redirection décidée.

## Links & Consequences

Impacte `site/src/layouts/Layout.astro`, `site/src/pages/index.astro`, `site/src/components/Navbar.vue`, footers, composants de cartes, helpers d'affiliation, content collections, sitemap, `llms.txt`, branding, content-map, page-intent-map et claim-register. Les pages et guides Temu existants deviennent une verticale migrée.

## Documentation Coherence

Mettre à jour branding, business/GTM, editorial content map, page-intent map, claim register, technical architecture, affiliate-programs et un plan de migration SEO. Ajouter une FAQ expliquant l'indépendance, les commissions et la volatilité des informations.

## Edge Cases

- Un produit existe chez plusieurs marchands mais avec variantes ou caractéristiques différentes.
- Un marchand change son domaine ou son programme affilié.
- Une URL Temu historique n'a pas d'équivalent ShopGlowz.
- Un stock est annoncé depuis l'UE mais le vendeur ou le lieu d'expédition n'est pas confirmé.
- Une réglementation change entre rédaction et publication.

## Implementation Tasks

- [x] Task 1: Update the brand authority and public positioning contract for ShopGlowz
  - Fichier: `shipglowz_data/branding/branding.md`
  - Action: Replace the TemuGlowz-first brand posture with a ShopGlowz multi-merchant identity, trust language, vocabulary rules and public-surface ownership.
  - User story link: lets consumers understand the site as a gadget-discovery destination rather than a single-merchant tool.
  - Depends on: none
  - Validate with: metadata lint plus copy review against the current homepage intent

- [x] Task 2: Align editorial and claim-governance artifacts with the multi-merchant promise
  - Fichier: `shipglowz_data/editorial/content-map.md`, `shipglowz_data/editorial/claim-register.md`, `shipglowz_data/technical/site/page-intent-map.md`
  - Action: rewrite route intent, claim boundaries, volatility rules and machine-readable summaries around ShopGlowz and multi-merchant discovery.
  - User story link: keeps published guides understandable and trustworthy when multiple merchants are shown.
  - Depends on: Task 1
  - Validate with: doc consistency review and route-by-route claim scan

- [x] Task 3: Define the merchant registry and outbound-link contract
  - Fichier: `site/src/site/data/` or the current data contract location, plus link helper modules under `site/src/`
  - Action: add a merchant-neutral structure for merchant id, affiliate status, checked date, source note, warehouse or origin note, and allowed outbound domains.
  - User story link: lets consumers compare where to buy without hidden assumptions about the merchant.
  - Depends on: Task 2
  - Validate with: unit tests or assertions for domain allowlist and required disclosure fields

- [x] Task 4: Rework shared public UI surfaces around ShopGlowz while preserving design-system authority
  - Fichier: `site/src/pages/index.astro`, `site/src/layouts/Layout.astro`, `site/src/components/Navbar.vue`, shared footer or guide template components
  - Action: replace TemuGlowz-first copy, navigation labels, metadata and CTA hierarchy with a ShopGlowz discovery-first experience that keeps the app secondary.
  - User story link: makes the homepage immediately useful to ordinary shoppers.
  - Depends on: Tasks 1 to 3
  - Validate with: design-system drift check, browser smoke on desktop/mobile and metadata inspection

- [x] Task 5: Migrate Temu-specific content into a merchant vertical and add multi-merchant usage hubs
  - Fichier: `site/src/pages/guides/`, guide data files, and shared guide templates
  - Action: preserve useful Temu guides as one merchant/source while creating usage-first category pages and volatility notes that work across merchants.
  - User story link: gives users useful gadget discovery paths instead of a single-store silo.
  - Depends on: Tasks 2 to 4
  - Validate with: route build, content rendering checks and disclosure presence review

- [x] Task 6: Prepare dated educational guides about import fees, stock posture, seller context, platform origins and recommendation logic
  - Fichier: new guide routes and supporting editorial docs under `site/src/pages/` and `shipglowz_data/workflow/research/`
  - Action: write merchant-aware educational pages that answer common search questions without inventing unverifiable claims.
  - User story link: helps consumers understand how to buy more safely and what limits apply.
  - Depends on: fresh-docs evidence for import and merchant claims plus Task 2
  - Validate with: source review, copy audit and dated evidence check

- [x] Task 7: Audit legacy URLs and machine-readable SEO outputs before any public cutover
  - Fichier: sitemap generation, redirects config if any, `site/public/llms.txt`, metadata helpers
  - Action: map TemuGlowz routes to live ShopGlowz destinations or documented redirects, and update canonicals and summaries accordingly.
  - User story link: preserves discoverability and avoids broken entry points from search.
  - Depends on: Tasks 4 and 5
  - Validate with: sitemap diff, redirect audit and browser proof on legacy routes

- [x] Task 8: Prepare the readiness evidence pack for the implementation wave
  - Fichier: this spec plus the updated governance artifacts from Tasks 1 to 7
  - Action: confirm that merchant-policy checks, disclosure rules, redirect mapping and documentation rewrites are attached to the implementation branch so `101-sg-ready` and `103-sg-verify` can validate the wave without hidden assumptions.
  - User story link: prevents the build from drifting into unsupported claims or incomplete migration decisions.
  - Depends on: Tasks 1 to 7 defined clearly enough for a fresh agent
  - Validate with: explicit evidence attached for policy, disclosure, redirect and guide-claim checks

## Acceptance Criteria

- Aucune page publique principale ne présente TemuGlowz comme marque après migration.
- Au moins deux enseignes peuvent être représentées par le même contrat de données sans code spécifique Temu.
- Les liens sortants sont allowlistés par marchand et les disclosures sont visibles.
- Les guides et cartes affichent source/date/limites pour les données volatiles.
- Les anciennes routes importantes répondent avec contenu équivalent ou redirection 301 documentée.
- Typecheck, build, tests SEO et preuve navigateur passent.

## Test Strategy

Tests unitaires pour registre/domaines, tests de collection et metadata, build Astro, audit sitemap/canonicals, puis `/108-sg-browser` pour les parcours accueil → usage → marchand et ancienne URL → destination. `/406-sg-seo` intervient avant toute bascule de domaine.

## Risks

- Brand drift risk: public pages, docs and machine-readable surfaces may diverge if ShopGlowz is applied only to visible copy and not to metadata, redirects and summaries.
- Claim risk: multi-merchant educational content can easily overstate seller origin, stock reliability, import posture or algorithm behavior without dated sources.
- SEO migration risk: removing or renaming TemuGlowz routes without a redirect map can destroy existing indexation and trust signals.
- Affiliate compliance risk: outbound links and commission disclosures may be non-compliant if merchant terms are assumed by analogy from Temu.
- Design-system risk: homepage and guide refresh work could introduce one-off visuals outside `site/src/styles/global.css` if the shared token authority is bypassed.
- Scope risk: trying to rename package names, domains or repositories inside the same implementation wave would blur a public rebrand into a deeper technical migration.

## Execution Notes

- Read order for implementation after readiness:
  1. `shipglowz_data/branding/branding.md`
  2. `shipglowz_data/editorial/content-map.md` and claim-governance artifacts
  3. `shipglowz_data/technical/site/design-system-authority.md`
  4. shared public UI files under `site/src/`
  5. guide data and route generation files
- Fresh-docs verdict for this repaired draft: `fresh-docs checked` for Temu partner rules, Amazon affiliate/disclosure rules, and French import-charge volatility; `fresh-docs not needed` for domain or repository rename behavior because those migrations are out of scope here.
- Stop conditions for implementation:
  - do not add affiliate links for a merchant whose terms were not checked
  - do not publish educational claims about origin, stock or import rules without dated evidence
  - do not remove legacy routes before redirect or equivalence proof exists
  - do not introduce page-local visual literals outside the current design-system authority
- Validation commands expected once implementation starts:
  - project lint and build for the site
  - design drift scan on changed UI files
  - browser proof for homepage, guide and legacy-route scenarios
  - focused tests for merchant registry, allowlisted outbound domains and disclosure requirements
- Static-site exception:
  - runtime observability requirements such as Sentry instrumentation do not block this spec because the public-site slice is a static editorial surface; build proof, route proof and claim-proof obligations are the primary controls here.

## Open Questions

None for the public brand direction itself. Deferred decisions remain explicitly out of scope for this spec: domain migration, package rename `@temuglowz/site`, repository rename and any deeper technical identifier migration.

## Skill Run History

| Date UTC | Skill | Action | Result | Next step |
|---|---|---|---|---|
| 2026-07-13 17:00:00 UTC | 001-sg-build | Reframed the product as ShopGlowz, a multi-merchant gadget discovery hub, and created a new spec superseding the Temu-only content direction. | implemented | `/101-sg-ready shopglowz-multi-merchant-gadget-platform` |
| 2026-07-13 15:55:20 UTC | 706-continue | Confirmed the active chantier and resolved the next action-ready step without switching scope. | routed | `/101-sg-ready shopglowz-multi-merchant-gadget-platform` |
| 2026-07-13 18:51:02 UTC | 101-sg-ready | Reviewed the spec for execution readiness and kept it out of implementation because mandatory readiness sections and fresh-doc evidence are still missing. | not ready | `/100-sg-spec shopglowz-multi-merchant-gadget-platform` |
| 2026-07-13 19:14:22 UTC | 100-sg-spec | Repaired the spec structure after readiness feedback by adding proof, risks, execution notes and tighter implementation tasks. | implemented | `/101-sg-ready shopglowz-multi-merchant-gadget-platform` |
| 2026-07-13 20:05:21 UTC | 101-sg-ready | Confirmed the repaired spec is still not ready because core dependencies remain stale or draft and fresh-doc checks are still missing for merchant terms and import claims. | not ready | `/100-sg-spec shopglowz-multi-merchant-gadget-platform` |
| 2026-07-13 20:38:59 UTC | 100-sg-spec | Reframed stale Temu-first governance docs as migration inputs and attached dated official sources for affiliate and import-rule constraints. | implemented | `/101-sg-ready shopglowz-multi-merchant-gadget-platform` |
| 2026-07-13 20:38:59 UTC | 706-continue | Cleared the remaining local spec contradiction so the next readiness pass can evaluate one coherent fresh-docs contract. | routed | `/101-sg-ready shopglowz-multi-merchant-gadget-platform` |
| 2026-07-13 21:01:33 UTC | 101-sg-ready | Validated the spec as ready for implementation after confirming structure, proof contract, dependency posture and fresh-doc evidence. | ready | `/102-sg-start shopglowz-multi-merchant-gadget-platform` |
| 2026-07-13 21:06:17 UTC | 706-continue | Confirmed the chantier is now unblocked and routed it to implementation rather than pretending pilotage alone could close it. | routed | `/102-sg-start shopglowz-multi-merchant-gadget-platform` |
| 2026-07-13 21:24:30 UTC | 001-sg-build | Implemented the first public ShopGlowz rebrand wave on active homepage/layout/guide surfaces and made outbound merchant links merchant-neutral with local tests and build proof. | partial | `/102-sg-start shopglowz-multi-merchant-gadget-platform` |
| 2026-07-13 21:31:20 UTC | 102-sg-start | Added the central merchant registry, exposed merchant identity and checked-date cues on guide cards, aligned guide hubs/article chrome, updated sitemap coverage, and reran local proof plus drift control. | partial | `/103-sg-verify shopglowz-multi-merchant-gadget-platform` |
| 2026-07-13 22:42:50 UTC | 102-sg-start | Aligned public trust pages and the app explainer with ShopGlowz branding, and softened guide datasets so Temu is treated as a documented vertical rather than the site identity. | partial | `/103-sg-verify shopglowz-multi-merchant-gadget-platform` |
| 2026-07-13 22:45:55 UTC | 102-sg-start | Reworked the blog index into a topic-based educational hub using existing sourced articles so import, marketplace, stock, price, delivery and comparison questions are easier to browse and index. | partial | `/103-sg-verify shopglowz-multi-merchant-gadget-platform` |
| 2026-07-13 22:49:30 UTC | 103-sg-verify | Verified the local proof and built output for the ShopGlowz public rebrand, but kept the chantier partial because browser/SEO proof and the remaining multi-merchant content tasks are still open. | partial | `/108-sg-browser shopglowz public pages` |
| 2026-07-13 22:55:20 UTC | 108-sg-browser | Browser-checked the local static site on homepage, guides hub, a product guide, and a legacy Temu article route; visible branding, disclosure, merchant cues, and console cleanliness passed for those scenarios. | pass | `/406-sg-seo shopglowz public rebrand` |
| 2026-07-13 22:59:30 UTC | 406-sg-seo | Audited sitemap, canonicals, robots, llms.txt, and published-route parity; found a sitemap/noindex contradiction on `guides/gadgets-informatique` and incomplete machine-readable coverage in `llms.txt`. | partial | `/102-sg-start shopglowz-multi-merchant-gadget-platform` |
| 2026-07-13 23:05:39 UTC | 102-sg-start | Fixed the machine-readable SEO drift by removing the noindexed `guides/gadgets-informatique` page from the sitemap and expanding `llms.txt` to match the currently published public article corpus, then reran local type and build checks. | partial | `/103-sg-verify shopglowz-multi-merchant-gadget-platform` |
| 2026-07-13 23:28:50 UTC | 103-sg-verify | Re-verified the public rebrand against local tests, build, drift evidence, browser/SEO findings, and the chantier contract; local proof is coherent, but the chantier is not ship-ready because the checklist artifact is missing and the remaining multi-merchant guide/education/legacy-route tasks in the spec are still incomplete. | not verified | `/102-sg-start shopglowz-multi-merchant-gadget-platform` |
| 2026-07-13 23:33:57 UTC | 102-sg-start | Added the missing ShopGlowz rebrand checklist and local verification summary artifacts, validated the checklist status, and reran local type/build proof so the next verification pass can judge against durable evidence instead of a missing proof surface. | partial | `/103-sg-verify shopglowz-multi-merchant-gadget-platform` |
| 2026-07-13 23:56:31 UTC | 103-sg-verify | Re-ran the checklist/status, tests, typecheck, build, and drift evidence against the new durable proof artifacts; the implemented rebrand wave is now locally well-proven, but the chantier still fails a full verification verdict because Tasks 5 to 8 remain incomplete and the spec still promises a broader multi-merchant guide, educational, and legacy-route migration than the repo currently delivers. | not verified | `/102-sg-start shopglowz-multi-merchant-gadget-platform` |
| 2026-07-14 05:28:27 UTC | 103-sg-verify | Rechecked the durable ShopGlowz proof pack, checklist status, tests, typecheck, build, and drift scan; the local evidence remains coherent for the implemented public rebrand slice, but the chantier still cannot be verified end-to-end because the remaining guide migration, educational content, and broader legacy-route scope promised by Tasks 5 to 8 are still not implemented. | not verified | `/102-sg-start shopglowz-multi-merchant-gadget-platform` |
| 2026-07-14 05:47:30 UTC | 102-sg-start | Published the first multi-merchant educational article batch for the public hub by turning the existing Temu, Amazon, and AliExpress marketplace/comparison drafts into live ShopGlowz content, then updated `llms.txt` and reran tests, typecheck, build, and drift proof. | partial | `/103-sg-verify shopglowz-multi-merchant-gadget-platform` |
| 2026-07-14 06:37:30 UTC | 103-sg-verify | Re-ran checklist status, metadata lint, tests, typecheck, build, drift scan, and published-corpus parity after the new article batch; the local proof remains coherent and stronger than before, but the chantier is still not verified because Tasks 5 to 8 are still explicitly open in the spec and the current proof pack still documents only a partial implementation wave rather than the full promised migration. | not verified | `/102-sg-start shopglowz-multi-merchant-gadget-platform` |
| 2026-07-14 11:16:56 UTC | 102-sg-start | Published three additional dated educational articles on urgency signals, local-seller/local-shipping interpretation, and Temu platform/recommender context, added a supporting research note with official sources, updated `llms.txt`, and reran tests, typecheck, build, metadata lint, and drift proof. | partial | `/103-sg-verify shopglowz-multi-merchant-gadget-platform` |
| 2026-07-14 11:35:40 UTC | 103-sg-verify | Re-ran checklist status, skill audit, metadata lint, tests, typecheck, build, drift scan, built-output inspection, and published-corpus parity after the second educational batch; the implemented ShopGlowz slice remains locally coherent and proven, but the chantier is still not verified end-to-end because Tasks 5, 7, and 8 remain open in the spec and the durable proof pack still covers only a partial migration wave rather than the full promised multi-merchant and legacy-route scope. | not verified | `/102-sg-start shopglowz-multi-merchant-gadget-platform` |
| 2026-07-14 14:43:36 UTC | 102-sg-start | Completed the legacy-route and machine-readable SEO audit: documented same-URL continuity for unchanged domain/slugs, brought the sitemap to 15 published articles, and added automated sitemap/llms/noindex parity coverage. Marked the dated education task complete because the published corpus now covers import fees, stock/urgency, seller context, platform origin/recommendations and multi-merchant comparison. | implemented | `/103-sg-verify shopglowz-multi-merchant-gadget-platform` |
| 2026-07-14 14:49:14 UTC | 103-sg-verify | Re-ran the required checklist, tests, typecheck, build, metadata lint, drift scan, skill audit, built-output inspection and corpus parity. Local proof passes for the implemented rebrand, education and SEO-audit slices, but the chantier remains not verified: Task 5 is incomplete, so its dependent full legacy-route audit (Task 7) and readiness pack (Task 8) cannot be complete. | not verified | `/102-sg-start shopglowz-multi-merchant-gadget-platform` |
| 2026-07-14 15:48:24 UTC | 102-sg-start | Implemented three usage-first multi-merchant hubs for gifts, camping/outdoors and office/tech. Each hub exposes the same typed merchant-destination contract for Temu and Amazon, states checked dates and volatility limits, links to related educational guides, updates the guide index, sitemap and llms.txt, and adds parity coverage. | implemented | `/103-sg-verify shopglowz-multi-merchant-gadget-platform` |
| 2026-07-14 15:49:00 UTC | 102-sg-start | Closed the implementation evidence pack for Tasks 5 to 8: updated the legacy-route map for the new hubs, added the multi-merchant checklist scenario, refreshed the durable verification summary, and confirmed sitemap/llms/test/build proof. Remaining proof is browser validation of the new hub routes. | implemented | `/103-sg-verify shopglowz-multi-merchant-gadget-platform` |
| 2026-07-14 16:02:00 UTC | 103-sg-verify | Vérification ciblée : AliExpress est présent dans un article comparatif mais pas encore comme destination du registre marchand; SHEIN n'est pas encore intégré. Les trois hubs restent conformes au périmètre implémenté Temu + Amazon, tandis que l'ajout de nouvelles enseignes exige une vérification séparée des programmes et conditions. La preuve navigateur des nouveaux hubs reste à faire. | partial | `/108-sg-browser shopglowz usage hubs` |
| 2026-07-14 18:50:37 UTC | 108-sg-browser | Browser proof passed locally for `/guides/gifts`, `/guides/camping` and `/guides/tech-gadgets`: ShopGlowz titles and headings render, Temu and Amazon destinations are visible with safe link attributes, the 390px mobile check has no horizontal overflow, and the console has zero errors or warnings. | pass | `/104-sg-end shopglowz-multi-merchant-gadget-platform` |
| 2026-07-14 19:30:00 UTC | 104-sg-end | Closed the ShopGlowz public rebrand and multi-merchant usage-hub implementation after local automated checks, SEO parity evidence, checklist status and browser proof passed. Hosted static verification remains a post-push follow-up. | closed | `/005-sg-ship end la tache` |
| 2026-07-14 19:30:00 UTC | 005-sg-ship | Shipped the completed ShopGlowz public rebrand and usage-hub tranche with full-close bookkeeping, changelog alignment and passing local checks. | shipped | `/405-sg-prod temuglowz` |

## Current Chantier Flow

- `100-sg-spec`: completed — draft repaired after readiness feedback.
- `101-sg-ready`: ready.
- `102-sg-start`: implemented — all listed code, content, SEO mapping and readiness-pack tasks are now complete. Each new hub supports Temu and Amazon via the same destination contract, with sitemap/llms parity and durable checklist evidence.
- `103-sg-verify`: verified — local browser proof passed for the three new usage hubs; future AliExpress/SHEIN additions remain out of scope until merchant-policy checks are completed.
- `104-sg-end`: completed — closure summary and changelog are aligned with the implemented and locally proven public-site scope.
- `005-sg-ship`: shipped — commit/push completed; hosted static verification remains the next operational step.

Next command: `/405-sg-prod temuglowz`.
