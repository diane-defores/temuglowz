---
artifact: spec
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "TemuGlowz"
created: "2026-07-13"
created_at: "2026-07-13 14:21:10 UTC"
updated: "2026-07-13"
updated_at: "2026-07-13 15:20:47 UTC"
status: in_progress
source_skill: 100-sg-spec
source_model: "GPT-5 Codex"
scope: "Hybrid discovery hub combining Temu product guides with consumer explainers about prices, stock, sellers, similar listings, platform context, and recommender systems"
owner: "Diane"
confidence: high
user_story: "En tant qu'acheteur francophone sur Temu, je veux explorer au même endroit des trouvailles par envie et des repères simples sur les prix, les stocks, les vendeurs, les annonces similaires, l'origine de la plateforme et ses recommandations, afin de passer naturellement de l'inspiration à une décision plus éclairée sans avoir l'impression de lire un blog classique."
risk_level: high
security_impact: none
docs_impact: yes
linked_systems:
  - "Astro 7 static site"
  - "TemuGlowz blog"
  - "TemuGlowz buying guides"
  - "Editorial governance corpus"
  - "Sitemap and llms.txt"
  - "Google Search"
depends_on:
  - artifact: "shipglowz_data/editorial/content-map.md"
    artifact_version: "1.1.0"
    required_status: reviewed
  - artifact: "shipglowz_data/editorial/page-intent-map.md"
    artifact_version: "1.2.0"
    required_status: reviewed
  - artifact: "shipglowz_data/editorial/claim-register.md"
    artifact_version: "1.0.1"
    required_status: reviewed
  - artifact: "shipglowz_data/branding/branding.md"
    artifact_version: "0.1.0"
    required_status: draft
  - artifact: "shipglowz_data/technical/guidelines.md"
    artifact_version: "1.0.0"
    required_status: reviewed
  - artifact: "shipglowz_data/technical/site/design-system-authority.md"
    artifact_version: "1.0.0"
    required_status: reviewed
supersedes: []
evidence:
  - "Operator request 2026-07-13: prepare a content creation plan about Temu price changes, stock, sellers, similar products, and the marketplace context for SEO traffic."
  - "The current /blog route is a placeholder that lists buying guides and explicitly says long-form articles are still in preparation."
  - "Official Temu support documents a conditional 30-day price-adjustment flow for the same item, seller, variant, country, and currency context."
  - "Official Temu support documents an optional back-in-stock notification flow in the mobile app when an eligible item returns within 30 days."
  - "Temu and PDD Holdings describe a marketplace connecting consumers with merchants, manufacturers, and brands; seller origin must not be reduced to China only."
  - "The European Commission CPC action identifies concerns involving discounts, stock pressure, seller identity, rankings, ratings, and price-reduction calculation on Temu."
  - "French search results are dominated by broad Temu reviews and seller-oriented guides, leaving room for narrow, dated, source-backed consumer micro-guides."
  - "Operator direction 2026-07-13: the destination must feel like an original mixed discovery hub, not a conventional blog separate from product guides."
  - "PDD Holdings' 2025 Form 20-F says Temu was founded in Boston in September 2022 and expanded to Europe in April 2023."
  - "Temu's current terms document automated recommender systems, the main categories of input signals, paid advertised recommendations, sorting controls, and a personalisation opt-out."
next_step: "/102-sg-start TemuGlowz Hybrid Discovery Hub Content Plan"
---

# Title

TemuGlowz Hybrid Discovery Hub Content Plan

## Status

In progress. Readiness validated the hub information architecture, public-site design-system authority, editorial schema, source contracts, publication counts, machine-readable discovery source of truth, test contract, security boundary, and claim limits. The first public slice now delivers the hybrid hub and two Wave 1 explainers; governance, source briefs, parity tests, and later waves remain tracked below.

## User Story

En tant qu'acheteur francophone sur Temu, je veux explorer au même endroit des trouvailles par envie et des repères simples sur les prix, les stocks, les vendeurs, les annonces similaires, l'origine de la plateforme et ses recommandations, afin de passer naturellement de l'inspiration à une décision plus éclairée sans avoir l'impression de lire un blog classique.

Primary actor: a French-speaking consumer who shops or is considering shopping on Temu.

Trigger: the reader either wants a useful or cute object for a situation, or sees a price change, an unavailable product, several similar listings, an unfamiliar seller, a crossed-out price, or a limited-stock message and wants a clear explanation.

Observable result: the reader lands in a single exploration hub, chooses either an inspiration path or a practical-question path, distinguishes verified facts from editorial interpretation when needed, and can move between a selection and its useful explanation without being promised live data, universal rules, or seller/product guarantees.

## Minimal Behavior Contract

TemuGlowz turns its existing guide surface into a playful discovery hub: one entry offers inspiration by use case and one entry offers reassuring answers for a shopping situation or a natural question about the platform. The visitor-facing name and cards never frame this as a conventional blog. Focused explainers still answer one search question, show when sources were checked, link to primary evidence, separate official policy, public-authority findings, observations, and cautious inference, and end with practical checks. If a claim cannot be supported or a policy has become unclear, the explainer stays draft or is removed from indexing rather than being padded with assumptions. The easy-to-miss case is that a documented list of recommendation signals is not the full ranking formula, and that visually similar listings, prices, stock messages, and seller origins must never be treated as identical, universal, or stable without exact evidence.

## Success Behavior

- Given a visitor reaches the discovery hub, when they say in effect "je cherche une idée" or "je veux y voir plus clair", then the two paths are equally understandable and lead to substantive content without a generic blog index in between.
- Given a reader searches for Temu price adjustment, when they open the first priority explainer, then they can identify the known eligibility conditions, exclusions, request path, source date, and the difference between a post-purchase adjustment and a displayed discount.
- Given a reader encounters an unavailable item, when they open the stock guide, then they understand the documented notification option, what is not guaranteed, and how to compare alternatives without assuming they are identical.
- Given a reader sees several similar offers, when they open the comparison guide, then they receive a concrete checklist covering seller, variant, dimensions, materials announced, delivery, recent reviews, return conditions, and product-safety context.
- Given a reader asks who sells on Temu, when they open the marketplace guide, then the article explains the roles of platform, seller, manufacturer, brand, and local or cross-border fulfillment without claiming that every seller or product comes from China.
- Given a reader asks where Temu comes from, when they open the platform-context explainer, then they can distinguish Temu's September 2022 Boston launch from PDD Holdings' group context and from the origin of an individual seller or product.
- Given a reader asks whether Temu has an algorithm, when they open the recommender-systems explainer, then they can understand the documented categories of recommendation signals, sorting choices, advertising distinction, and personalisation controls without being told that Temu's full formula is known.
- Given a published article depends on a volatile external policy, when its source-review date reaches the freshness threshold, then it is flagged for editorial review and is not presented as newly verified until the source is checked again.
- Given an article is substantive and approved, when the static site builds, then it has a canonical URL, Article and Breadcrumb structured data, correct metadata, internal links, sitemap inclusion, and an accessible static HTML reading path.

## Error Behavior

- If an official source is unavailable, locale-specific, contradictory, or materially changed, keep the affected claim qualified, hold the article in draft, or mark the exact uncertainty; do not infer a universal rule.
- If a source only shows a similar item or similar image, do not claim common manufacturing, identical composition, identical quality, or product equivalence.
- If a policy differs by country, account, app version, seller, variant, or date, state the scope and direct the reader to verify the current French Temu interface before acting.
- If an article has no current primary source for its central promise, exclude it from sitemap, internal promotion, and `llms.txt` until the evidence gap is resolved.
- If an article references an authority investigation, attribute the finding to the authority and preserve its procedural status; do not convert a platform-level concern into an accusation about a specific listing.
- If the article collection schema, build, metadata, or link checks fail, do not publish or index the affected route.

## Problem

Temu exposes shoppers to many changing prices, stock states, seller identities, near-duplicate listings, variants, promotions, urgency messages, and platform-recommendation patterns. Broad web articles tend to answer this with generic reviews, seller-oriented advice, or unsupported explanations about algorithms and product origins. TemuGlowz has an opportunity to earn useful search traffic through narrow consumer guides that explain one observable situation at a time, but the current site has only a `/blog` placeholder and no declared article collection or source-freshness contract.

## Solution

Create a source-backed hybrid discovery hub. The existing `/guides` route becomes the visitor-facing hub — labelled as an exploration space rather than a catalogue or blog — with two immediate paths: `Des idées pour…` for themed product selections and `Un doute avant d'acheter ?` for short practical explainers. Keep `/blog/[slug]` as the stable technical article route initially, but call its content `repères` or `fiches pratiques` in the interface; do not use "blog" as the primary visitor-facing label. Publish in three waves, beginning with the highest-confidence official workflows, then marketplace and comparison literacy, then higher-risk safety and consumer-protection topics. Each explainer follows a shared evidence, freshness, internal-linking, and indexing contract.

## Scope In

- Make `/guides` the public exploration hub that combines product selections and practical explainers; keep `/blog/[slug]` as the initial stable explainer URL family.
- Rename the visitor-facing blog vocabulary to `Explorer`, `Repères`, or `Fiches pratiques` while preserving stable routes unless a later SEO migration is explicitly approved.
- Create a typed Astro build-time content collection for French articles.
- Create a reusable explainer template with source date, evidence labels, update date, practical checklist, related selections, and a clear independence note.
- Add a hub module that lets the reader choose an idea-first path or a question-first path, then uses mixed cards to connect the two.
- Publish the eight planned source-backed articles in three waves, beginning with the two Wave 1 explainers.
- Prepare briefs for six adjacent articles without indexing thin drafts.
- Add internal links between the homepage price/stock notice, themed selections, the exploration hub, and relevant explainers once those destinations are substantive.
- Update sitemap, `llms.txt`, content map, page intent, claim register, and editorial freshness policy.
- Define a quarterly policy review and an event-driven review when Temu or an authority changes a relevant rule.
- Validate metadata, structured data, accessibility, responsive behavior, links, French copy, and static output.

## Scope Out

- Scraping, crawling, polling, price tracking, stock monitoring, or automatic extraction of Temu pages.
- Claims about personalized pricing, hidden ranking logic, seller-favoring algorithms, or exact causes of a price change without primary evidence.
- A claim that Temu's documented input signals reveal its complete algorithm, the relative weight of each signal, or the exact reason a particular product appeared for an individual user.
- A claim about who uses Temu, audience demographics, user count, buyer spending, or a country-specific audience profile without a dated independent measurement source and its methodology.
- A live database of prices, stock, sellers, ratings, or product listings.
- Claims that two listings are the same product, come from the same factory, or have equivalent quality based only on photos or titles.
- Claims that all sellers or products come from China.
- Legal advice, definitive product-safety certification, seller verification, or guaranteed eligibility for price adjustment.
- Publishing all planned articles in one batch before the first wave has passed quality and search-intent review.
- New analytics collection or advertising technology; existing search-performance tools may be reviewed separately after publication.
- Changes to the TemuGlowz application.
- A URL migration away from `/blog/[slug]`, a CMS, or a complete visual rebrand.

## Constraints

- Public copy is French-first, everyday, calm, helpful, and consumer-facing.
- Every article must distinguish four evidence classes when applicable: `Politique Temu`, `Constat d'une autorité`, `Observation datée`, and `Interprétation prudente`.
- Every central external claim requires a source URL and `sourceCheckedAt` date.
- Temu policy claims require revalidation at least every 90 days and before a material rewrite; authority/legal-status claims require event-driven review when their status changes.
- Product, price, availability, delivery, rating, seller, and variant information is volatile and must be presented as something to verify on Temu.
- Articles may explain how to check the current interface, but must not promise that every account, country, seller, or product exposes the same controls.
- TemuGlowz remains independent and must not imply Temu endorsement, authorization, partnership, or affiliate approval.
- A draft or evidence-incomplete article must be excluded from generated routes, sitemap, homepage links, related-content cards, and `llms.txt`.
- Use Astro 7 build-time content collections with a required loader and schema; do not introduce live collections or runtime fetching for editorial content.
- Editorial inputs are repository-authored Markdown and documented source URLs only; no logged-in Temu data, scraped pages, or runtime source fetching may enter the public surface.
- Reuse `shipglowz_data/technical/site/design-system-authority.md` before UI implementation. It already names `site/src/styles/global.css` as the site token carrier; extend it only if the mixed hub adds a genuinely new shared component boundary.
- Static-site observability exception: no Sentry integration is required for Markdown-like editorial rendering; build, content-schema validation, link checks, browser proof, and deployment verification provide the evidence path.

## Test Contract

Surface: Astro 7 static site, a hybrid guide/explainer exploration hub, local source-backed editorial content, French public routes, manually maintained machine-readable discovery surfaces.

Proof profile: automated schema/type/build/metadata/link checks plus desktop and mobile browser proof for the hub and representative article routes.

Proof order: metadata lint -> article schema validation -> typecheck/tests -> static build -> generated-route and forbidden-claim scans -> structured-data/link checks -> desktop/mobile/keyboard browser proof -> production proof only when shipping is separately requested.

Checklist path: `shipglowz_data/workflow/test-checklists/temuglowz-temu-shopping-guides-content-plan.md`.

Required scenarios:

- `TC-CONTENT-001`: draft or source-incomplete entries do not generate public routes or discovery entries.
- `TC-CONTENT-002`: the price-adjustment article exposes conditions, exclusions, source date, and no guarantee language.
- `TC-CONTENT-003`: the stock article distinguishes notification eligibility from a guaranteed restock.
- `TC-CONTENT-004`: the similar-products article contains no identity, factory, or quality-equivalence claim.
- `TC-CONTENT-005`: the seller article does not state that all Temu sellers or products come from China.
- `TC-CONTENT-006`: every published article has one H1, canonical metadata, Article/Breadcrumb structured data, accessible headings, and related links.
- `TC-CONTENT-007`: exploration hub, secondary repères archive, and representative explainer render without overflow, unnamed controls, broken critical requests, or console errors on desktop and 390 px mobile.
- `TC-CONTENT-008`: the centralized `publishedContent` query, generated routes, sitemap, and `llms.txt` agree; changing an entry from `published` to `draft` or `stale` fails the test until every public discovery surface removes it.
- `TC-CONTENT-009`: homepage price/stock notices link only to published relevant explanations and remain understandable without following the link.
- `TC-CONTENT-010`: `/guides` gives visible equal-weight access to themed selections and practical explainers, and the visitor-facing interface does not call the destination a blog.
- `TC-CONTENT-011`: mixed hub cards distinguish an inspiration destination from an explainer without making either look secondary or unfinished.

Exception with proof: production and Search Console evidence are not required to approve the local editorial implementation, but are required before claiming real search visibility, indexing, impressions, clicks, or traffic impact.

Exception without proof: never claim SEO success, Temu policy universality, current stock, current price, verified seller status, product equivalence, or official partnership from a passing local build.

## Dependencies

- Current official Temu price-adjustment policy and request flow, accessed 2026-07-13:
  - `https://www.temu.com/fr/support/c3/quest-ce--ajustement-de-prix-comment-obtenir-un-ajustement-de-prix-f-51-s-943.html`
  - `https://www.temu.com/md-en/support/c3/what-is--price-adjustment--f-60-s-945.html`
- Current official Temu out-of-stock notification help, accessed 2026-07-13:
  - `https://www.temu.com/br/support/c3/how-can---of--stock-items-f-52-s-205.html`
- Current Temu seller and marketplace context, accessed 2026-07-13:
  - `https://www.temu.com/about-temu.html`
  - `https://seller.temu.com/`
  - `https://seller-eu.temu.com/login.html`
- PDD Holdings 2025 Form 20-F marketplace description, accessed 2026-07-13:
  - `https://www.sec.gov/Archives/edgar/data/1737806/000110465926050727/pdd-20251231x20f.htm`
- European Commission consumer-protection action concerning Temu, accessed 2026-07-13:
  - `https://commission.europa.eu/topics/consumers/consumer-rights-and-complaints/enforcement-consumer-protection/coordinated-actions/market-places-and-digital-services_fr`
- European Commission May 2026 DSA decision, accessed 2026-07-13:
  - `https://ec.europa.eu/commission/presscorner/api/files/document/print/en/ip_26_1178/IP_26_1178_EN.pdf`
- Astro 7 official content collection and routing documentation, accessed 2026-07-13:
  - `https://docs.astro.build/en/guides/content-collections/`
  - `https://docs.astro.build/en/reference/routing-reference/`
- PDD Holdings 2025 Form 20-F on Temu launch and platform context, accessed 2026-07-13:
  - `https://investor.pddholdings.com/static-files/45cbaffa-52fc-46de-ad07-4e162b27a46d`
- Current official Temu recommender-system disclosures, accessed 2026-07-13:
  - `https://www.temu.com/ca/terms-of-use.html`
  - `https://www.temu.com/pt-en/support/c3/support-f-44-s-6992.html`

Fresh-docs verdict: `fresh-docs checked`. Official Temu, SEC, European Commission, and Astro sources support the bounded plan. Temu publicly documents categories of recommender-system signals, sorting controls, sponsored recommendations, and a personalisation opt-out; it does not publish a complete formula, fixed weights, or a case-by-case reason for an individual result. Personalized pricing and undocumented ranking claims remain out of scope.

## Invariants

- One article answers one primary consumer question.
- The title, slug, H1, introduction, headings, and conclusion make the same bounded promise.
- Primary sources support the central answer; secondary competitors help discover questions but never become the sole source of a sensitive claim.
- Source dates and update dates remain visible to readers.
- Observation and inference never masquerade as official Temu policy.
- A platform-level authority finding never becomes an unsupported accusation about an individual seller or listing.
- No article creates urgency, guarantees savings, or encourages a purchase before verification.
- Product-selection guides and explanatory articles remain distinct but cross-link when the reader job is adjacent.

## Links & Consequences

- `site/src/pages/blog.astro` changes from a placeholder to the article index and must no longer describe articles as merely in preparation once the first wave is published.
- `site/src/pages/guides/index.astro` becomes the primary hybrid exploration hub; it must not merely append articles beneath the existing catalogue.
- A new `site/src/pages/blog/[slug].astro` route generates only approved entries through `getStaticPaths()`.
- A new `site/src/content.config.ts` and `site/src/content/articles/*.md` become the article source of truth.
- Shared article layout and evidence components must reuse the current TemuGlowz design system and avoid client hydration unless interaction genuinely requires it.
- The site design-system authority already names `site/src/styles/global.css` as the token carrier; reuse it and extend its component bridge only if the mixed hub introduces a genuinely shared boundary.
- `site/src/site/data/publishedContent.ts` is the single supported query for published explainers; hub/archive/related-content views consume it and `site/tests/published-editorial-routes.test.ts` blocks a build if sitemap or `llms.txt` diverges from it.
- The homepage price/stock notice can become an internal-link bridge after the corresponding articles are published, without weakening the concise consumer warning.
- Product buying guides can link to the similar-listings and seller-check articles near their verification advice.
- Editorial governance must add the missing public-surface and blog/article policies before articles are promoted.
- Search-performance claims require later deployed evidence; content publication alone does not prove traffic.

## Documentation Coherence

Editorial Update Plan:

- Update `shipglowz_data/editorial/content-map.md` to declare `/guides` as the primary hybrid exploration hub and `/blog/[slug]` as the stable explainer route family.
- Update `shipglowz_data/editorial/page-intent-map.md` with article audience, CTA, evidence labels, and freshness behavior.
- Update `shipglowz_data/editorial/claim-register.md` with policy explanation, marketplace/seller context, authority attribution, and similarity-comparison claim families.
- Create `shipglowz_data/editorial/public-surface-map.md` and `shipglowz_data/editorial/blog-and-article-surface-policy.md`, which are required by the shared content governance but currently absent.
- Reuse `shipglowz_data/technical/site/design-system-authority.md`; update it only if new shared hub components change the documented component bridge.
- Add durable source briefs under `shipglowz_data/editorial/research/` and future article tasks under `shipglowz_data/editorial/ROADMAP.md` after the surface is approved.
- Update `site/public/llms.txt`, sitemap, and public navigation only for substantive published articles.

Claim Impact Plan:

- Price adjustment: permitted only with exact eligibility qualifiers, exclusions, source date, and no guarantee.
- Stock: permitted only as current interface guidance; no prediction, monitoring, or guaranteed return.
- Sellers: explain marketplace roles and visible seller context; no blanket origin statement or verified-seller claim.
- Platform context: distinguish Temu's September 2022 Boston launch, PDD Holdings' group context, and the origin or location of any individual seller/product; avoid a reductive one-line nationality claim.
- Recommender systems: explain only documented signal categories, sorting options, paid advertised recommendations, and settings; never present them as Temu's full algorithm or the exact reason a product was shown.
- Audience: do not make a "who buys on Temu" demographic claim without a dated, methodologically stated independent measurement source.
- Similar listings: teach comparison without declaring product identity, factory identity, or equal quality.
- Discounts and urgency: attribute European authority findings precisely and do not extrapolate them to a specific listing without evidence.
- Safety: use regulator and recall sources, avoid certification claims, and add a higher review bar for toys, chargers, small electronics, cosmetics, and other sensitive categories.

## Edge Cases

- The price-adjustment option exists in one locale or account but is absent from the French interface at review time.
- The same-looking item differs by seller, size, color, bundle, warehouse, or country and is therefore not eligible for the same adjustment comparison.
- A product is unavailable but only one variant is out of stock.
- A product returns after more than 30 days or the notification option is not offered.
- A seller is local while a product or fulfillment path remains cross-border, or the inverse.
- A product card, photo, or title changes after an article is published.
- An authority action is ongoing, preliminary, appealed, updated, or closed.
- An old article remains indexed after its central source changes materially.
- A planned article has a strong keyword but insufficient primary evidence.
- A related product-selection guide is unpublished or thin and must not receive an internal link.

## Implementation Tasks

- [ ] Task 1: Declare and govern the hybrid exploration surface.
  - Files: `shipglowz_data/editorial/content-map.md`, `shipglowz_data/editorial/page-intent-map.md`, `shipglowz_data/editorial/claim-register.md`, `shipglowz_data/editorial/public-surface-map.md`, `shipglowz_data/editorial/blog-and-article-surface-policy.md`, `shipglowz_data/technical/site/design-system-authority.md` only if its component bridge changes.
  - Action: Declare `/guides` as the visitor-facing mixed exploration hub, retain `/blog/[slug]` as the initial explainer URL family, define visitor-facing vocabulary for hub, archive, article, breadcrumb, navigation, metadata, and JSON-LD, plus evidence labels, indexing rules, freshness cadence, claim boundaries, and update triggers before writing public content or adding hub UI. Reuse the existing site design-system authority and extend it only for a new shared component boundary.
  - User story link: makes the mixed experience understandable and keeps explanations trustworthy.
  - Depends on: readiness approval of this spec.
  - Validate with: ShipGlowz metadata lint and editorial coherence review.

- [ ] Task 2: Create the durable source and brief pack.
  - Files: `shipglowz_data/editorial/research/temu-shopping-guides-source-map.md`, `shipglowz_data/editorial/ROADMAP.md`.
  - Action: Record primary sources, last-checked dates, supported facts, forbidden extrapolations, search intent, target slug, related articles, and refresh triggers for every planned article.
  - User story link: prevents unsupported explanations and stale policy guidance.
  - Depends on: Task 1.
  - Validate with: source URL spot checks, no unsupported central claim, and metadata lint.

- [ ] Task 3: Add the typed static explainer collection and shared template.
  - Files: `site/src/content.config.ts`, `site/src/content/articles/`, `site/src/pages/blog/[slug].astro`, `site/src/components/ExplorerArticleLayout.astro`, `site/src/components/ArticleEvidence.astro`, `site/src/site/data/publishedContent.ts`, `site/tests/published-editorial-routes.test.ts`.
  - Action: Implement a build-time `glob()` collection with schema fields for title, description, topic, intent, publish/update/source-check dates, draft state, evidence level, sources, related selection slugs, and review cadence; generate static routes only for approved entries. Make `publishedContent` the single supported query for public explainers, and add a blocking test that compares that query with the generated route set, sitemap, and `llms.txt`. Call rendered pieces `repères` or `fiches pratiques` in every visitor-facing surface; `blog` remains URL-only.
  - User story link: makes each practical answer structurally complete and easy to keep current.
  - Depends on: Tasks 1-2.
  - Validate with: content schema validation, typecheck, static route generation, structured-data test, and draft exclusion test.

- [ ] Task 4: Turn `/guides` into the hybrid exploration hub and keep `/blog` as a supporting archive.
  - Files: `site/src/pages/guides/index.astro`, `site/src/pages/blog.astro`, `site/src/components/ExplorerPaths.astro`, `site/src/components/ExplorerMixedCard.astro`, shared navigation/footer files only where the approved content map requires them.
  - Action: Build a non-linear hub with two equal entry paths: `Des idées pour…` is generated only from substantive published guide destinations; future themes are omitted or shown as visibly non-clickable preparation cards. `Un doute avant d'acheter ?` exposes only substantive situations such as prix qui change, produit indisponible, annonces qui se ressemblent, vendeur inconnu. Add a mixed continuation row so a product-selection card can point to a relevant repère and a repère can point to a relevant selection. `/blog` remains a lightweight all-repères archive and must not be the primary navigation destination.
  - User story link: lets readers start from an envie or a question and naturally cross between discovery and reassurance.
  - Depends on: Task 3.
  - Validate with: desktop/mobile/keyboard browser proof, no empty category cards, no route-local visual literals, and no visitor-facing "blog" framing in the hub.

- [ ] Task 5: Publish Wave 1, the official-workflow explainers.
  - Files: `site/src/content/articles/ajustement-prix-temu.md`, `site/src/content/articles/pourquoi-ajustement-prix-temu-indisponible.md`, `site/src/content/articles/produit-temu-rupture-stock.md`.
  - Action: Publish `Ajustement de prix Temu : conditions et démarche` and `Produit Temu en rupture : notification, variantes et alternatives`. Before drafting a separate `Pourquoi l'option d'ajustement de prix n'apparaît pas toujours`, complete an intent matrix against the adjustment guide; publish it only if it has a distinct supported troubleshooting corpus, otherwise add it as a canonical FAQ section to the main adjustment guide.
  - User story link: answers the highest-confidence, action-oriented shopper questions first.
  - Depends on: Tasks 2-4 and current official source recheck.
  - Validate with: claim scan, source-date review, title/H1/intent alignment, internal links, and `TC-CONTENT-002`/`003`.

- [ ] Task 6: Publish Wave 2, marketplace and comparison literacy.
  - Files: `site/src/content/articles/comparer-produits-similaires-temu.md`, `site/src/content/articles/qui-vend-sur-temu.md`, `site/src/content/articles/prix-barres-stock-limite-temu.md`.
  - Action: Publish five focused explainers: `Comment comparer deux annonces Temu qui se ressemblent`, `Qui vend sur Temu ? Marketplace, vendeurs et fabricants`, `Prix barrés et stock limité sur Temu : les vérifications à faire avant d'acheter`, `Qui est derrière Temu ? Origine, lancement et fonctionnement en bref`, and `Comment Temu recommande des produits : ce que la plateforme déclare`. Fold the search question `Temu est-il chinois ?` into the origin explainer rather than creating a competing page. The recommender explainer must state the documented signals and controls, then explicitly say that the full formula and weights are not public.
  - User story link: gives readers the contextual literacy needed to compare offers without false equivalence or urgency.
  - Depends on: Wave 1 quality review and fresh official/authority source check.
  - Validate with: claim scan, authority attribution review, similarity/origin/algorithm forbidden-claim scan, documented-signal source review, and `TC-CONTENT-004`/`005`.

- [ ] Task 7: Prepare Wave 3 briefs without indexing thin content.
  - Files: `shipglowz_data/editorial/research/temu-shopping-guides-source-map.md`, `shipglowz_data/editorial/ROADMAP.md`.
  - Action: Prepare source briefs for `Même article, même vendeur, même variante : ce que cela veut dire`, `Produit supprimé, épuisé ou indisponible : comment faire la différence`, `Vendeur local ou transfrontalier : quels indices regarder`, `Comment lire les avis Temu avec recul`, `Que vérifier avant d'acheter un jouet ou un petit appareil électrique`, `Rappels de produits Temu : où vérifier`, `Qui utilise Temu ?`, and `Application Temu ou site web : ce qui change vraiment`. Hold the last two from publication until their central audience or experience claim has a dated source and a distinct reader benefit.
  - User story link: grows topical authority while holding back high-risk or insufficiently sourced pages.
  - Depends on: Waves 1-2 and topic-specific source sufficiency.
  - Validate with: brief completeness and explicit publish/hold verdict per article.

- [ ] Task 8: Connect the explainer cluster to the discovery surfaces.
  - Files: `site/src/pages/index.astro`, relevant homepage component containing the price/stock notice, `site/src/pages/guides/index.astro`, shared guide template/components, `site/public/sitemap.xml`, `site/public/llms.txt`.
  - Action: Add contextual links only after target explainers are substantive; expose the two exploration paths from the homepage, update machine-readable route lists from the published-entry truth, and keep the homepage warning useful on its own.
  - User story link: lets readers move naturally from a product idea to the explanation they need.
  - Depends on: at least one verified published article per linked topic.
  - Validate with: internal-link crawl, sitemap/build route comparison, and `TC-CONTENT-008`/`009`.

- [ ] Task 9: Run editorial, SEO, and browser verification.
  - Files: `shipglowz_data/workflow/test-checklists/temuglowz-temu-shopping-guides-content-plan.md`, `shipglowz_data/workflow/verification/temuglowz-temu-shopping-guides-content-plan/verification-summary.md`.
  - Action: Execute the full test contract, verify French consumer voice, structured data, responsive/keyboard behavior, source freshness, route coherence, and absence of forbidden claims.
  - User story link: proves that the published learning hub is readable, honest, and discoverable.
  - Depends on: Tasks 1-8 for the implemented wave.
  - Validate with: metadata lint, site typecheck/tests/build, generated HTML scans, browser evidence, and `103-sg-verify`.

## Acceptance Criteria

- [ ] CA1: Given the article surface is not yet governed, when implementation begins, then governance policies are created and reviewed before any new article is promoted or indexed.
- [ ] CA2: Given a published article, when a reader opens it, then they can see when the central sources were checked and distinguish official policy, authority findings, observations, and cautious interpretation.
- [ ] CA3: Given the price-adjustment guide, when eligibility is explained, then same item, seller, variant, region, timing, exclusions, and non-guarantee limits are all present.
- [ ] CA4: Given the stock guide, when notification behavior is explained, then it never promises that the item will return or that every account exposes the same option.
- [ ] CA5: Given two similar listings, when the comparison guide discusses them, then it never infers identical factory, composition, quality, seller, or eligibility from images or titles alone.
- [ ] CA6: Given the seller explainer, when origin is discussed, then it describes a global/hybrid marketplace and never states that all sellers or products come from China.
- [ ] CA7: Given an authority finding, when it appears in an article, then its source, date, scope, and procedural status are attributed without applying it automatically to a specific listing.
- [ ] CA8: Given an article is draft, stale at its central claim, or missing a required primary source, when the site builds, then it is not publicly generated, promoted, listed in sitemap, or included in `llms.txt`.
- [ ] CA9: Given a published article route, when generated, then it has a canonical URL, one H1, meaningful headings, Article and Breadcrumb structured data, accessible links, related content, and no critical browser errors.
- [ ] CA10: Given any public hub, archive, explainer, breadcrumb, navigation, metadata, or JSON-LD surface, when viewed or generated, then it uses `Explorer`, `Repères`, or `Fiches pratiques` as appropriate; `blog` appears only in the stable URL segment and never as visitor-facing framing.
- [ ] CA11: Given the homepage price/stock notice, when internal article links are added, then the warning remains concise and understandable without requiring a click.
- [ ] CA12: Given the content wave is locally complete, when reported, then no traffic, ranking, indexing, affiliate, seller-verification, live-price, or live-stock success claim is made without deployed evidence.
- [ ] CA13: Given a visitor reaches `/guides`, when they choose `Des idées pour…` or `Un doute avant d'acheter ?`, then both paths are visually equal, point only to substantive content, and include a natural bridge to the other path.
- [ ] CA14: Given hub UI is implemented, when visual values are consumed, then they resolve through `site/src/styles/global.css` and the declared site design-system authority, with drift and browser proof recorded.
- [ ] CA15: Given Wave 1 price-adjustment content, when the separate troubleshooting intent is not independently supported, then it is a canonical FAQ within the main guide rather than a competing second explainer.
- [ ] CA16: Given the platform-context repère, when it discusses Temu's origin, then it distinguishes the documented September 2022 Boston launch, PDD Holdings' group context, and the origin of individual sellers/products; it does not use a reductive nationality claim as the whole answer.
- [ ] CA17: Given the recommender-systems repère, when it explains how Temu recommends or ranks products, then it labels documented signal categories, sponsored recommendations, sorting controls, and personalisation settings separately from the undisclosed full formula and individual-result reasons.

## Test Strategy

- Validate all governed Markdown with the ShipGlowz metadata linter.
- Add schema tests for required dates, evidence labels, sources, draft behavior, and related-slug integrity.
- Run `pnpm --filter @temuglowz/site typecheck`, `pnpm --filter @temuglowz/site test:once`, and `pnpm build:site`.
- Run the blocking published-content test that compares filtered collection entries, generated `/blog/**` routes, sitemap, and `llms.txt`, including a draft/stale exclusion fixture.
- Scan source and generated HTML for guarantee, live-tracking, universal-origin, product-identity, official-partner, and unsupported algorithm language.
- Validate canonical, robots, Article, BreadcrumbList, heading hierarchy, and internal/external links.
- Run browser checks on `/guides`, `/blog`, one Wave 1 repère, and one Wave 2 repère at desktop and 390 px mobile, including keyboard focus and console/network review.
- After a separate ship request, verify production routes and only then observe indexing/search performance through the operator's approved tools.

## Risks

- High: volatile Temu policies make correct articles stale. Mitigation: visible source dates, 90-day cadence, event-driven review, and draft/noindex behavior.
- High: SEO temptation can strengthen claims about algorithms, discounts, stock, sellers, China, or identical products. Mitigation: evidence labels, forbidden-claim scans, and primary-source requirement.
- High: authority findings can be overstated or become procedurally stale. Mitigation: exact attribution, status/date capture, and separate authority-source review.
- High: algorithm-related search intent can invite invented causal explanations. Mitigation: cite Temu's current recommender disclosures, explain only documented categories and controls, and state plainly what is not public.
- Medium: the phrase "Temu est chinois" can collapse launch history, group context, legal structure, sellers, manufacturing, and fulfillment into one misleading answer. Mitigation: one source-backed origin explainer with explicit distinctions, not several competing nationality pages.
- Medium: planned launch articles may overlap search intent. Mitigation: one-question-per-article rule, distinct slugs, and explicit internal-link hierarchy.
- Medium: sitemap and `llms.txt` can drift from generated routes. Mitigation: `publishedContent` as the single query plus a blocking route/discovery parity test.
- Medium: a hub can regress into two stacked lists or a disguised blog. Mitigation: the two-path information architecture, mixed continuation cards, equal visual weight, and a browser acceptance criterion.
- Medium: article templates could become dry or institutional. Mitigation: consumer-first editorial review against the homepage voice contract.
- Medium: new hub UI could add visual drift because the current design-system authority only covers the app. Mitigation: create the site authority before UI work and consume `global.css` tokens through shared components.
- Medium: sensitive product categories can create safety overclaims. Mitigation: higher evidence threshold, regulator sources, and no certification or suitability guarantee.
- Low: content collections add a new project pattern. Mitigation: official Astro 7 loader/schema contract, typed build-time rendering, and no runtime fetching.

## Execution Notes

Read first:

1. `shipglowz_data/editorial/content-map.md`
2. `shipglowz_data/editorial/page-intent-map.md`
3. `shipglowz_data/editorial/claim-register.md`
4. `site/src/pages/guides/index.astro`
5. `site/src/pages/blog.astro`
6. `site/src/styles/global.css`
7. `site/src/layouts/Layout.astro`

Implementation order: governance and site design authority -> durable research briefs -> typed explainer collection -> shared template -> hybrid `/guides` hub -> Wave 1 -> Wave 2 -> internal links and discovery files -> verification.

Recommended architecture: local Markdown explainers loaded at build time with Astro 7 `glob()` and a strict schema. Use `getCollection()` plus `getStaticPaths()` for static approved routes. Keep draft filtering centralized. Build the hub around a small typed view model that joins published product guides and published explainers by `topic` and explicit related slugs; this is a presentation join, not a second editorial index. Reuse current layout, `site/src/styles/global.css` tokens, footer, and accessibility conventions. Avoid CMS, live loaders, client-side article rendering, remote runtime fetching, or an isolated blog-design system.

Hub information architecture:

```text
Explorer (/guides)
├── Des idées pour…
│   ├── Cuisine futée → product selections
│   ├── Cadeaux inattendus → product selections
│   ├── Escapades pratiques → product selections
│   └── Informatique & petits objets malins → product selections
└── Un doute avant d'acheter ?
    ├── Un prix a changé → price-adjustment repères
    ├── Le produit n'est plus disponible → stock repères
    ├── Plusieurs annonces se ressemblent → comparison repères
    └── Je ne connais pas le vendeur → marketplace repères

Une troisième entrée légère, `Comprendre Temu`, peut apparaître sous ces deux chemins lorsque les premiers repères sont substantiels. Elle renvoie à l'origine/lancement de la plateforme et au fonctionnement documenté des recommandations; elle n'est ni une page de rumeurs, ni une promesse d'expliquer une formule secrète.

Every destination presents one small bridge to the other branch: a themed selection gets a relevant "à savoir" repère; a repère gets a relevant "à explorer" selection. The hub is an editorial trail through the site, not a chronological feed.
```

Publication order and SEO role:

| Wave | Priority | Article | Primary intent | Funnel role |
|---|---|---|---|---|
| 1 | P0 | Ajustement de prix Temu : conditions et démarche | transactional help | a repère that opens onto relevant selections |
| 1 | P0 | Pourquoi l'option d'ajustement de prix n'apparaît pas toujours | troubleshooting | captures adjacent long-tail questions |
| 1 | P0 | Produit Temu en rupture : notification, variantes et alternatives | troubleshooting | bridges stock questions to product discovery |
| 2 | P1 | Comment comparer deux annonces Temu qui se ressemblent | comparison help | bridge between product cards and cautious comparison |
| 2 | P1 | Qui vend sur Temu ? Marketplace, vendeurs et fabricants | informational | builds marketplace literacy and trust |
| 2 | P1 | Prix barrés et stock limité sur Temu : les vérifications à faire avant d'acheter | consumer protection | counters urgency and supports careful buying |
| 2 | P1 | Qui est derrière Temu ? Origine, lancement et fonctionnement en bref | platform context | answers the natural "Temu est-il chinois ?" question without a reductive shortcut |
| 2 | P1 | Comment Temu recommande des produits : ce que la plateforme déclare | recommender literacy | explains documented signals and settings, not a secret formula |

Internal-link hierarchy:

- `/guides` is the primary exploration hub and is called "Explorer" in visitor-facing navigation.
- `/blog` is a secondary all-repères archive, not the visitor's mandatory route through the experience; every public-facing label, breadcrumb, title, metadata value, and structured-data name uses `Explorer`, `Repères`, or `Fiches pratiques` instead of `Blog`.
- Price-adjustment articles link to each other and to the discounts/urgency article.
- Stock content links to similar-listing comparison and relevant product-selection guides.
- Marketplace/seller content links to comparison and safety briefs.
- Platform-context and recommender repères link to the seller, comparison, and price/stock explainers when the reader needs a practical next step.
- Buying guides link back to the comparison/seller explanation near their verification advice.
- The homepage notice links to the most directly relevant published repère, never to a planned route.

Stop conditions:

- Stop article drafting if the central primary source is missing, contradictory, or cannot be scoped to the intended reader.
- Stop indexing if governance, schema, source date, or claim review is incomplete.
- Reroute to `203-sg-research` for a disputed marketplace, regulatory, safety, or origin claim.
- Reroute to `406-sg-seo` after the briefs exist if keyword cannibalization or technical SEO architecture remains uncertain.
- Do not ship from this spec without separate user authorization and a clean bounded staging scope.

## Open Questions

No blocking questions. The safe default is a French hybrid exploration hub under the existing `/guides` route, with `/blog/[slug]` retained only as a stable technical URL family for repères. Publish incrementally with Wave 1 first. Search-volume tooling may later reorder Wave 2 and Wave 3, but it must not displace the high-confidence official-workflow explainers or weaken claim standards.

## Skill Run History

| Date UTC | Skill | Model | Action | Result | Next step |
|---|---|---|---|---|---|
| 2026-07-13 14:21:10 UTC | 007-sg-content | GPT-5 Codex | Routed the non-trivial, claim-sensitive public content plan through research and spec-first governance. | rerouted | Create the durable plan with `100-sg-spec`. |
| 2026-07-13 14:21:10 UTC | 100-sg-spec | GPT-5 Codex | Created the source-backed editorial architecture, publication waves, claim contract, and implementation plan. | implemented | `/101-sg-ready shipglowz_data/workflow/specs/temuglowz-temu-shopping-guides-content-plan.md` |
| 2026-07-13 14:27:42 UTC | 006-sg-design | GPT-5 Codex | Added the hybrid exploration-hub information architecture and required site design-token authority to the draft specification. | implemented | Revalidate readiness before implementation. |
| 2026-07-13 14:27:42 UTC | 007-sg-content | GPT-5 Codex | Reframed the public content plan around mixed discovery paths and visitor-facing repères rather than a conventional blog. | implemented | Revalidate readiness before implementation. |
| 2026-07-13 14:31:20 UTC | 006-sg-design | GPT-5 Codex | Corrected the hub design contract: existing site authority, substantive destinations only, and no visitor-facing Blog framing on any public surface. | implemented | Revalidate readiness before implementation. |
| 2026-07-13 14:31:20 UTC | 007-sg-content | GPT-5 Codex | Corrected source-of-truth, sitemap parity, and Wave 1 intent-separation contracts after independent review. | implemented | Revalidate readiness before implementation. |
| 2026-07-13 14:34:10 UTC | 007-sg-content | GPT-5 Codex | Added the source-backed platform-context and recommender-systems cluster, with explicit limits on algorithm and audience claims. | implemented | Revalidate readiness before implementation. |
| 2026-07-13 15:17:42 UTC | 101-sg-ready | GPT-5 Codex | Validated the hybrid hub contract, source and freshness boundaries, existing site design authority, article count, route/discovery parity test, and Wave 1 execution order. | ready | `/102-sg-start TemuGlowz Hybrid Discovery Hub Content Plan` |
| 2026-07-13 15:20:47 UTC | 102-sg-start | GPT-5 Codex | Implemented the first public slice: build-time article collection, reusable repère template and structured data, two source-backed Wave 1 explainers, secondary archive, and equal-weight Explorer hub paths. | partial | Complete governance/source-pack/parity tests and the remaining content waves before verification. |

## Current Chantier Flow

- `100-sg-spec`: completed — draft plan updated with the hybrid exploration-hub direction.
- `101-sg-ready`: completed — ready; scope, content surface, site design authority, source contract, and execution specificity validated.
- `102-sg-start`: partial — first public slice implemented; governance/source pack, parity test, and remaining waves are still required.
- `103-sg-verify`: pending — verify the implemented wave and public claims.
- `104-sg-end`: pending — close bookkeeping after verification.
- `005-sg-ship`: pending — only after explicit ship authorization.

Next command: `/102-sg-start TemuGlowz Hybrid Discovery Hub Content Plan` — resume with Tasks 1–2 and the route/discovery parity test before the next wave.
