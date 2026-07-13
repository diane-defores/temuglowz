---
artifact: technical_guidelines
metadata_schema_version: "1.0"
artifact_version: "1.0.0"
project: "TemuGlowz"
created: "2026-07-13"
updated: "2026-07-13"
status: reviewed
source_skill: 300-sg-docs
scope: project-language-and-public-copy
owner: "Diane"
confidence: high
risk_level: high
security_impact: none
docs_impact: yes
linked_systems:
  - site/src/pages/
  - site/src/components/
  - site/src/site/components/
  - shipglowz_data/branding/branding.md
  - shipglowz_data/editorial/claim-register.md
depends_on:
  - artifact: shipglowz_data/branding/branding.md
    artifact_version: "0.1.0"
    required_status: draft
  - artifact: shipglowz_data/editorial/claim-register.md
    artifact_version: "1.0.1"
    required_status: reviewed
supersedes: []
evidence:
  - "The public site is French-first while internal technical contracts and stable machine labels remain English."
  - "The claim register already defines evidence boundaries for product selection, volatile product facts, affiliate status, and app behavior."
next_review: "2026-08-13"
next_step: "/206-sg-audit-copy public site"
---

# TemuGlowz Technical Guidelines

## Purpose

Define the project-wide language, public-copy, and documentation rules that implementation and review skills must apply before changing user-facing TemuGlowz surfaces.

## Language Doctrine

- Internal technical contracts, code comments, durable implementation notes, and governance instructions use English.
- Public site copy and user-facing product text use natural French.
- French accents, apostrophes, punctuation, and non-breaking typography are required where appropriate; ASCII-only forms are reserved for identifiers, commands, slugs, and machine formats.
- Stable code identifiers, route names, schema types, command names, and machine-readable status values may remain English.
- Avoid casual English/French mixing in public copy when a clear French expression exists.

## Public Copy Contract

- Present TemuGlowz as an independent editorial discovery project unless written evidence authorizes a stronger relationship claim.
- Use the vocabulary and evidence limits from `shipglowz_data/branding/branding.md` and `shipglowz_data/editorial/claim-register.md`.
- Prefer concrete use cases, selection criteria, and reader verification steps over superlatives or urgency.
- Curation is not hands-on testing. Do not use `testé`, `approuvé`, `garanti`, `officiel`, `partenaire`, `temps réel`, or equivalent claims without the required evidence.
- Treat price, availability, delivery, seller status, ratings, variants, performance, and product safety as volatile or unverified unless a dated source record supports the exact statement.
- Do not fabricate testimonials, popularity, savings, subscription availability, newsletter success, or app readiness.
- A playful tone may use warmth, surprise, rhythm, and light imagery, but it must not weaken claim accuracy or hide limitations.

## Product And Platform Boundaries

- Do not imply Temu endorsement, authorization, sponsorship, certification, or affiliate approval before written confirmation.
- Do not promise crawling, scraping, automated monitoring, automatic product extraction, authenticated Temu access, or significant reuse of Temu content.
- Direct visitors to verify volatile product information on Temu before purchase.
- Keep the public catalogue, guide content, and application presentation distinct when their evidence and delivery status differ.

## Documentation Discipline

- `shipglowz_data/editorial/content-map.md` owns the job of each public surface.
- `shipglowz_data/editorial/page-intent-map.md` owns audience, CTA, and claim posture for public pages.
- `shipglowz_data/editorial/claim-register.md` owns public claim evidence boundaries.
- `shipglowz_data/branding/branding.md` owns brand posture and vocabulary.
- Public behavior and its canonical documentation must change in the same workstream; a source-only copy change is incomplete when machine-readable metadata or an owner document remains contradictory.

## Validation

- Scan source and generated public HTML for forbidden or unsupported claim families.
- Check French accents and user-facing language manually during browser proof.
- Validate changed governance artifacts with `python3 /home/claude/shipglowz/tools/shipglowz_metadata_lint.py`.
- Run the public-site typecheck, tests, build, link checks, metadata checks, and browser proof required by the active spec.

## Maintenance Rule

Update this document when the project language policy, public claim vocabulary, documentation ownership, or platform-policy boundary changes.
