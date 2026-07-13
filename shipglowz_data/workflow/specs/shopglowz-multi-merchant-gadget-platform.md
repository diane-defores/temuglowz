---
artifact: spec
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "ShopGlowz"
created: "2026-07-13"
created_at: "2026-07-13 17:00:00 UTC"
updated: "2026-07-13"
updated_at: "2026-07-13 18:51:02 UTC"
status: reviewed
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
  - artifact: "shipglowz_data/branding/branding.md"
    artifact_version: "0.1.0"
    required_status: draft
  - artifact: "shipglowz_data/editorial/content-map.md"
    artifact_version: "1.1.0"
    required_status: reviewed
  - artifact: "shipglowz_data/technical/site/design-system-authority.md"
    artifact_version: "1.0.0"
    required_status: reviewed
supersedes:
  - "shipglowz_data/workflow/specs/temuglowz-temu-shopping-guides-content-plan.md"
evidence:
  - "Operator directive 2026-07-13: rename the public direction to ShopGlowz and make the site multi-merchant."
  - "Existing Temu-focused content plan and homepage repositioning spec are too narrow for the new promise."
  - "Research report on French import changes recommends a merchant-neutral gadget guide with Temu as one source among others."
next_step: "/100-sg-spec shopglowz-multi-merchant-gadget-platform"
---

# Title

ShopGlowz — plateforme éditoriale multi-enseignes de gadgets

## Status

Reviewed, not ready. The public brand change is approved in principle, but the spec still needs missing readiness sections and fresh external-document checks before implementation.

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

Vérifier la neutralité de marque, la validation des domaines marchands, la présence des disclosures, la parité sitemap/canonicals/redirections, l'absence de claims temps réel et le build Astro sans erreur.

## Dependencies

Fresh-docs required before readiness for each affiliate program, current merchant terms, domain/trademark availability, and current French/EU import guidance. Existing Temu research is evidence, not a universal merchant policy.

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

1. Mettre à jour les contrats de marque et de positionnement vers ShopGlowz.
2. Créer le registre marchand et l'abstraction de liens/cartes produit.
3. Réécrire layout, navigation, accueil, footer, metadata et données structurées.
4. Migrer le contenu Temu vers une verticale marchande et créer les catégories d'usage.
5. Produire les guides importation/stock/vendeurs/origine/algorithme avec sources datées.
6. Auditer les URL, générer redirections/canonicals, sitemap et llms.txt.
7. Vérifier les programmes affiliés et appliquer les disclosures seulement après validation.
8. Exécuter typecheck, build, tests de liens/domaines et preuve navigateur avant clôture.

## Acceptance Criteria

- Aucune page publique principale ne présente TemuGlowz comme marque après migration.
- Au moins deux enseignes peuvent être représentées par le même contrat de données sans code spécifique Temu.
- Les liens sortants sont allowlistés par marchand et les disclosures sont visibles.
- Les guides et cartes affichent source/date/limites pour les données volatiles.
- Les anciennes routes importantes répondent avec contenu équivalent ou redirection 301 documentée.
- Typecheck, build, tests SEO et preuve navigateur passent.

## Test Strategy

Tests unitaires pour registre/domaines, tests de collection et metadata, build Astro, audit sitemap/canonicals, puis `/108-sg-browser` pour les parcours accueil → usage → marchand et ancienne URL → destination. `/406-sg-seo` intervient avant toute bascule de domaine.

## Open Decisions

Le renommage public ShopGlowz est le défaut retenu. Le domaine, le nom du package `@temuglowz/site`, les dépôts et les routes techniques seront traités dans une décision de migration séparée afin d'éviter une rupture irréversible.

## Skill Run History

| Date UTC | Skill | Action | Result | Next step |
|---|---|---|---|---|
| 2026-07-13 17:00:00 UTC | 001-sg-build | Reframed the product as ShopGlowz, a multi-merchant gadget discovery hub, and created a new spec superseding the Temu-only content direction. | implemented | `/101-sg-ready shopglowz-multi-merchant-gadget-platform` |
| 2026-07-13 15:55:20 UTC | 706-continue | Confirmed the active chantier and resolved the next action-ready step without switching scope. | routed | `/101-sg-ready shopglowz-multi-merchant-gadget-platform` |
| 2026-07-13 18:51:02 UTC | 101-sg-ready | Reviewed the spec for execution readiness and kept it out of implementation because mandatory readiness sections and fresh-doc evidence are still missing. | not ready | `/100-sg-spec shopglowz-multi-merchant-gadget-platform` |

## Current Chantier Flow

- `100-sg-spec`: completed — draft created.
- `101-sg-ready`: not ready — return to spec hardening.
- `102-sg-start`: pending.
- `103-sg-verify`: pending.
- `104-sg-end`: pending.
- `005-sg-ship`: pending.

Next command: `/100-sg-spec shopglowz-multi-merchant-gadget-platform`.
