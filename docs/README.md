# Verifiable Clean Energy Atlas — Document System

Status: normative index  
Current product stage: V1 — Verifiable Atlas  
Last reviewed: 2026-07-12

## Purpose

This directory is the maintained execution system for the Verifiable Clean Energy Atlas. It replaces the practice of treating `PROMPT.md` as one executable master prompt. Each rule has one owning document so product scope, methodology, evidence, release policy, and future compatibility can change at the right pace.

[`PROMPT.md`](../PROMPT.md) remains historical source material. It is not a release checklist and must not be handed to an implementation agent as an undifferentiated V1 scope.

## Authority

When instructions conflict, use this order:

1. [Confirmed requirements](brainstorms/2026-07-12-verifiable-clean-energy-atlas-requirements.md).
2. Applicable repository, workspace, and user instructions.
3. Constraints carried forward from `PROMPT.md` into this document system.
4. Reasonable implementation decisions recorded after the sources above.

This index does not create a new authority above that order. It identifies where the maintained interpretation of each authoritative constraint lives.

Within this document system:

1. The [Product Constitution](product-constitution.md) owns enduring principles and the V1 → V2 → V3 sequence.
2. The current stage brief owns what must and must not ship now.
3. A domain methodology or contract owns definitions and invariants in its named domain.
4. The publication criteria own the evidence required to call a geography or release verified.
5. A narrower owning document controls over a broader summary. Summaries must link rather than restate detailed rules.

If a maintained document appears to weaken or omit a confirmed requirement or a still-valid `PROMPT.md` safeguard, treat that as a documentation defect. Do not use the omission as permission. Correct the owning document and record the change.

The words **MUST**, **MUST NOT**, **SHOULD**, and **MAY** are normative.

## Documents and ownership

| Document | Owns | Does not own |
| --- | --- | --- |
| [Product Constitution](product-constitution.md) | Mission, audience priority, product laws, stage sequence, independence | V1 screen inventory, formulas, schemas, release gates |
| [V1 Product Brief](v1-product-brief.md) | V1 users, scope, experience, platform, responsive and accessibility outcomes, V1 acceptance | Detailed energy definitions, provenance mechanics, future finance behavior |
| [Energy and Geographic Methodology](energy-and-geographic-methodology.md) | Clean classification, lifecycle evidence, technology taxonomy, energy metrics, units, lifecycle states, location and ocean rules | Source lineage implementation, release approval |
| [Verification and Provenance Contract](verification-and-provenance-contract.md) | Source policy, raw observations, normalized facts, field lineage, calculations, versioning, corrections, licensing | Clean-energy policy decisions, wave prioritization |
| [Future-Financing Compatibility Constraints](future-financing-compatibility.md) | V1 structural foundations, deferred finance model, future anti-greenwashing and capital-guidance safeguards | V1 finance UI; no finance UI is allowed in V1 |
| [Verified-Wave Publication Criteria](verified-wave-publication-criteria.md) | Coverage vocabulary, national-baseline gates, wave selection, release artifacts, V1 quality gates | Energy classification or source-lineage definitions |

## Current release boundary

V1 ships a journalist-first, map-first, verifiable physical-energy atlas. Citizens receive plain explanations; experts receive methods, observations, calculations, limitations, and permitted downloads.

V1 preserves time-aware facilities, projects, phases, organizations, ownership, jurisdictions, evidence, and methodology versions. V1 MUST NOT expose financing transactions, funding opportunities, investment rankings, capital recommendations, personalized financial advice, or money movement. Missing future-finance data MUST NOT block a V1 geography unless a V1 energy claim itself depends on ownership or organizational evidence.

## Product sequence

1. **V1 — Verifiable Atlas:** physical infrastructure, energy profiles, coverage, evidence, calculations, and limitations.
2. **V2 — Financing Atlas:** source-backed financing relationships and transactions attached to the V1 foundation.
3. **V3 — Capital Guidance:** evidence-gated public-interest guidance, opportunity analysis, accountability, and observed outcomes.

The stages are cumulative. A later stage adds evidence and surfaces; it does not redefine V1 entities or weaken V1 verification.

## R1–R18 completion audit

Status describes the checked-in V1 implementation, not future coverage. `npm run verify` is the common executable gate; narrower checks are named where they provide more direct proof.

| Requirement | Status | Implementation evidence | Verification | Explicit limitation |
| --- | --- | --- | --- | --- |
| R1 product sequence | Complete | Constitution § Product sequence; `lib/domain/schemas.ts` | Documentation review | V2/V3 are intentionally inactive. |
| R2 maintained document system | Complete | This index and the six owning documents | Link review | Historical `PROMPT.md` is non-executable. |
| R3 journalist first; citizen clarity; expert depth | Complete | `components/atlas-app.tsx`, evidence and methodology drawers | `npm run test:e2e` | Expert evidence remains a secondary surface. |
| R4 target geography | Complete | `scripts/ingest_eia860.py` target-geography matrix | `npm run verify:data` | Only the U.S. wave is verified. |
| R5 verified waves | Complete | `coveragePublicationStatusSchema`, coverage UI | `npm run verify:data` | Other targets are withheld, never implied complete. |
| R6 auditable national baseline | Complete | `countryIndicatorSchema`, `calculationSchema`, integrity arithmetic | `npm run test && npm run verify:data` | Baseline is U.S. electricity for 2024. |
| R7 coverage status and gaps | Complete | `coverageAssessmentSchema`, coverage view | `npm run test:e2e` | Unassessed scopes remain explicit. |
| R8 ocean jurisdiction | Complete | `jurisdictionSchema`, location limitations | `npm run verify:data` | No ocean-area facility wave is published. |
| R9 four clean classifications | Complete | `classificationSchema`, facility classification reason | `npm run typecheck && npm run verify:data` | Biomass stays gated by facility evidence. |
| R10 lifecycle evidence and ranges | Complete | `lifecycleEvidenceSchema`, lifecycle register | `npm run verify:data` | Facility-specific LCAs are not universally available. |
| R11 distinct country indicators | Complete | `indicatorTypeSchema`, calculation arithmetic | `npm run test && npm run verify:data` | No metric is substituted for another. |
| R12 trace from claim to source | Complete | immutable source snapshots, observations, calculations, evidence drawer | `npm run test && npm run verify:data` | Redistribution restrictions may limit raw downloads. |
| R13 versioned methods, data, history, limitations | Complete | release schemas, change history, corrections URL | `npm run verify:data` | Legacy 2024.2 files receive V1 contract defaults when parsed. |
| R14 unplotted uncertain locations | Complete | discriminated location schema and coordinate-evidence integrity | `npm run test && npm run verify:data` | One current record is intentionally unplotted. |
| R15 visible conflicts and uncertainty | Complete | confidence, conflict groups, limitations, connector reports | `npm run test:connectors && npm run test:e2e` | Absence of a conflict is not evidence of exhaustive matching. |
| R16 finance-ready entities and histories | Complete | project, phase, organization and ownership schemas | `npm run verify:data` | Financing transactions are not modeled in V1. |
| R17 no V1 finance-facing behavior | Complete | V1 routes and components; future-financing interface boundary | `npm run test:e2e` | No advice, ranking, funding or money movement. |
| R18 finance compatibility does not delay V1 | Complete | nullable/independent ownership and phase relationships | `npm run verify` | Missing future-finance data is not a publication gate. |

## `PROMPT.md` migration map

No valid constraint is intentionally discarded. Detailed ownership is:

| `PROMPT.md` topic | Maintained owner |
| --- | --- |
| Mission, lifecycle-carbon trust, public-interest identity | Constitution |
| Technology and infrastructure scope | Energy/geographic methodology |
| Geographic navigation and target experience | V1 brief |
| Coverage levels and global-completeness warnings | Publication criteria |
| Country and regional energy-mix formulas | Energy/geographic methodology |
| Lifecycle status vocabulary | Energy/geographic methodology |
| Facility records, sources, calculations, public methods, corrections | Verification contract |
| Finance-ready entity boundaries and future connectors | Future-financing constraints |
| Public-interest capital guidance and anti-greenwashing | Future-financing constraints; activated only in V2/V3 as stated there |
| Source policy, map evidence, raw/normalized separation | Verification contract and energy/geographic methodology |
| Core map experience, visual direction, responsive behavior | V1 brief |
| Data-pipeline validation and reproducibility | Verification contract |
| Transparency invariants | Owning methodology or contract; release enforcement in publication criteria |
| V1 build, data, interaction, accessibility, mobile, and live checks | Publication criteria |
| Finance- and opportunity-specific checks | Future-financing constraints; not V1 gates |
| Autonomous iteration and durable release practice | Publication criteria |

## Change protocol

Every normative change MUST:

1. name the owning document and affected requirement;
2. explain whether it changes policy, method, evidence, or release status;
3. increment the affected methodology, schema, dataset, or document version where applicable;
4. update tests and public change history when behavior or published data changes;
5. preserve prior released values and decisions in history;
6. avoid copying the changed rule into non-owning documents.

The original confirmed requirements in `docs/brainstorms/` are decision evidence and are not edited as part of routine maintenance.

## Supporting source material

- [`PROMPT.md`](../PROMPT.md): broad historical build prompt; non-executable source material after migration.
- [Clean-energy source research](../Clean_Energy_Sources_Research_20260712/research_report_20260712_clean_energy_sources.md): background research for the initial lifecycle taxonomy. It informs methodology but does not override the authority order above.
- [V1 lifecycle-emissions evidence register](research/lifecycle-evidence-register.md): supporting source, range, subtype, and licensing research. The energy methodology owns the normative classification rules.
- [Atlas interface implementation spec](design/implementation-spec.md): supporting translation of the accepted desktop and mobile concepts. It cannot create product facts or override the V1 brief and normative methods.
- `design/atlas-desktop-concept.png` and `design/atlas-mobile-concept.png`: visual references only; all illustrative data is non-publishable.
