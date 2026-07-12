---
artifact: support_runbook
metadata_schema_version: "1.0"
artifact_version: "1.0.2"
project: "temu"
created: "2026-06-10"
updated: "2026-06-10"
status: draft
source_skill: sf-start
scope: "temu-shopping-lists-entitlements-support"
owner: "Diane"
confidence: "medium"
risk_level: "high"
security_impact: "yes"
docs_impact: "yes"
linked_systems:
  - shipglowz_data/workflow/specs/temu-shopping-lists-entitlements-access-model.md
  - /home/claude/winflowz/shipglowz_data/workflow/docs/technical/suite-authentication.md
depends_on:
  - artifact: "shipglowz_data/workflow/specs/temu-shopping-lists-entitlements-access-model.md"
    artifact_version: "1.0.5"
    required_status: "reviewed"
  - artifact: "/home/claude/winflowz/shipglowz_data/workflow/docs/technical/suite-authentication.md"
    artifact_version: "1.0.11"
    required_status: "reviewed"
supersedes: []
evidence:
  - "Temu Shopping Lists is a suite-ledger product with product_id=temu_shopping_lists."
  - "Support flow must exist before activation codes, grants, refunds, or paid protected features ship."
next_review: "2026-07-10"
next_step: "provider/support tooling spec before real grants, codes, refunds, billing, or protected sync"
---

# Temu Shopping Lists Entitlements Support Runbook

## Purpose

Provide a redacted operator checklist for Temu Shopping Lists entitlement support.
This is a skeleton until suite support tooling exposes real `temu_shopping_lists`
lookup, grant, revoke, refund, expire, and reissue actions.

## Product Contract

- Product id: `temu_shopping_lists`.
- Durable entitlement truth: suite-owned ledger.
- Product-local state: cache, bridge mirror, UI status, or product gate only.
- Local-only saved snapshots remain accessible without entitlement.
- Protected sync, premium capabilities, quotas, paid WebView beta, activation
  codes, billing, app-store purchases, and support grants require suite-ledger
  proof.

## Safe Lookup

Use the suite support surface when available. Search by a server-owned global
user id, provider account id, provider event id, or redacted support reference.
Do not use email alone as proof of entitlement ownership.

Never request or store:

- raw activation codes;
- cookies, session tokens, or ID tokens;
- provider webhook secrets;
- full payment payloads;
- Temu account credentials or Temu session data.

## Triage States

| State | Meaning | Support action |
| --- | --- | --- |
| Account recognized, no access | Identity exists but no active `temu_shopping_lists` entitlement exists | Confirm product id, environment, status, source, and event history |
| Backend unavailable | Access cannot be checked | Deny protected access, ask user to retry, and inspect suite bridge health |
| Wrong environment | Entitlement exists outside the current environment | Do not copy manually; replay or migrate through approved suite tooling |
| Revoked/refunded/expired | Access was removed by policy or provider event | Confirm event source and timestamp before changing state |
| Pending review | Provider/source event could not be trusted automatically | Resolve through suite ledger review, not product-local edits |

## Grant And Revoke Rules

- Manual grants must be written to the suite ledger with product id, plan id,
  source, source reference, status, timestamps, and operator note.
- Revokes, refunds, and expirations must remove protected access without
  deleting local-only archives.
- Reissues must invalidate or supersede the previous support reference.
- Duplicate events must be idempotent.
- Raw codes must not be logged or saved in client-visible storage.

## Verification Before Real Support Use

- Suite support UI or CLI can lookup `temu_shopping_lists`.
- Grant, revoke, expire, refund, and reissue actions leave an audit event.
- Product bridge reflects active and inactive states.
- Support diagnostics redact secrets and unnecessary personal data.

## Maintenance Rule

Update this runbook before shipping any real activation-code, provider, support
grant, billing, refund, revoke, or protected sync flow for Temu Shopping Lists.
