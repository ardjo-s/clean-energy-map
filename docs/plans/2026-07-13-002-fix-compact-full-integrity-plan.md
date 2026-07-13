---
title: Fix compact and full release integrity
type: fix
status: completed
date: 2026-07-13
origin: docs/brainstorms/2026-07-12-verifiable-clean-energy-atlas-requirements.md
---

# Fix compact and full release integrity

## Summary

Make the browser release self-contained for every relationship it exposes, then prove that compact and full releases agree on all shared public facts while permitting only documented evidence-size reductions.

## Problem Frame

The compact release currently exposes facility project and phase identifiers without publishing the referenced entities. Pair verification checks identifiers and counts but does not detect changed facility values, locations, classifications, calculations, or indicators. This weakens R12, R13, and R16 and is tracked by issues #4 and #6.

## Requirements

- R12: every browser-visible relationship and claim must remain traceable through entities and observations present in the browser release or an explicit source pointer.
- R13: compact/full transformations must be deterministic, versioned, and verified rather than silently accepted.
- R16: facility, project, phase, organization, and ownership distinctions must remain stable in the compact release.
- The compact dataset must pass integrity validation independently; validation against the full download cannot legitimize dangling browser references.
- Pair verification must detect drift in every shared public entity and value.
- Existing public data remains unchanged until the explicit activation path is used after every candidate gate passes; this plan includes that final explicit activation so issue #6 is fixed in the published artifact.

## Assumptions

- Publishing canonical referenced projects and phases is preferable to deleting facility relationships because the inspector already treats these relationships as user-visible evidence.
- The only intentional facility transforms are compact source pointers and shortened limitations; all other facility fields must match the full release exactly.
- Facilities use one exact compact projection: their field-level `sourceObservationIds` become deterministic source-pointer observations and their limitations become the documented compact summary. Projects, phases, ownership, organizations, calculations, and indicators retain their real referenced observations inside the compact release.

## Scope Boundaries

- Included: issues #4 and #6, compact generation, browser integrity, pair integrity, negative drift tests, candidate-size reporting, release version/build metadata, and explicit activation after validation.
- Excluded: issue #7 calculation-lineage redesign, issue #8 map-history behavior, and new upstream data.
- Deferred: payload-size optimization beyond removal of demonstrably unreachable evidence.

## Implementation Units

- U1. **Publish a self-contained browser evidence graph**
  - **Goal:** Include every project, phase, organization, ownership relationship, lifecycle record, source, and observation reachable from compact facilities and calculations.
  - **Requirements:** R12, R13, R16; issue #6.
  - **Dependencies:** None.
  - **Files:** `scripts/ingest_eia860.py`, `lib/atlas/integrity.ts`, `tests/domain/integrity.test.ts`.
  - **Approach:** Build compact relationships from canonical full entities. Apply the exact existing compact projection to facilities, then derive the real observation closure from projects, phases, ownership, organizations, calculations, and indicators. Facility source pointers are deterministic and resolve to immutable sources/full-release evidence rather than dangling IDs.
  - **Execution note:** Add failing browser-integrity fixtures before changing generation.
  - **Patterns to follow:** Existing ID-set integrity checks in `lib/atlas/integrity.ts`; deterministic sorting in `scripts/ingest_eia860.py`.
  - **Test scenarios:**
    1. A compact facility whose project is absent fails browser integrity.
    2. A compact facility whose phase is absent fails browser integrity.
    3. A generated candidate contains every facility-referenced project and phase.
    4. Every observation ID referenced by a compact project or phase resolves inside the compact observation list.
  - **Verification:** Browser integrity returns zero issues for the generated compact candidate and identifies each deliberately removed relationship.

- U2. **Compare canonical shared release projections**
  - **Goal:** Detect any compact/full drift outside the explicit compact transformation allowlist.
  - **Requirements:** R12, R13; issue #4.
  - **Dependencies:** U1.
  - **Files:** `lib/atlas/integrity.ts`, `scripts/verify-data.ts`, `tests/domain/integrity.test.ts`.
  - **Approach:** Compare deterministic keyed projections for every collection. Derive each expected compact facility from its full facility, including exact source pointers and compact limitations, then compare the complete result. Require semantic equality for methodology releases, geographies, sources, organizations, projects, phases, ownership, lifecycle evidence, indicators, calculations, and coverage. Compare release metadata completely; compare shared observations by ID/value and separately validate compact-only pointers.
  - **Execution note:** Test each drift class before generalizing the comparison helper.
  - **Patterns to follow:** Existing schema parsing and stable identifier maps in `lib/atlas/integrity.ts`.
  - **Test scenarios:**
    1. Mutating facility official name, capacity, classification, location, project ID, or phase IDs produces a pair-integrity issue.
    2. Mutating a country indicator or calculation produces a pair-integrity issue.
    3. Mutating methodology, geography, source, organization, project, phase, ownership, lifecycle, coverage, release metadata, or a shared observation produces a pair-integrity issue.
    4. Reordering arrays without changing entities does not produce drift.
    5. The exact expected compact source-pointer and limitation transforms pass; arbitrary mutations to either fail.
  - **Verification:** The current checked-in pair passes; each negative fixture fails with the responsible collection and entity ID.

- U3. **Validate and explicitly activate the release**
  - **Goal:** Prove the generator emits a valid self-contained candidate, quantify payload impact, then activate that exact candidate explicitly.
  - **Requirements:** R13 and release-safety constraints.
  - **Dependencies:** U1, U2.
  - **Files:** `scripts/ingest_eia860.py`, `scripts/verify-data.ts`, `package.json`, `.github/workflows/ci.yml` only if the existing command cannot validate staged candidates.
  - **Approach:** Reuse the existing explicit activation boundary. Parse and validate the candidate compact and full objects, including browser and pair integrity, before activation. Report compact/full byte sizes, increment release/build metadata for the structural publication change, then activate that exact validated candidate with `--activate`.
  - **Patterns to follow:** `npm run ingest:data`, `npm run verify`, and the CI no-public-diff gate.
  - **Test scenarios:**
    1. Candidate generation validates both schemas and integrity checks without `--activate`.
    2. Candidate generation without `--activate` leaves `public/data` hashes unchanged.
    3. A missing reachable entity blocks candidate validation and activation.
    4. Explicit activation writes the validated candidate, updates release metadata, and the resulting public pair passes every gate.
  - **Verification:** dry-run generation leaves public hashes unchanged; explicit activation produces the committed release; `npm run verify` and browser tests pass against it.

## Key Technical Decisions

- Preserve relationships by publishing their canonical entities instead of weakening the browser facility contract.
- Compare keyed semantic projections rather than raw JSON bytes so array order is irrelevant and explicit compact transforms remain visible.
- Derive evidence closure from references; do not add another manually curated observation list.

## System-Wide Impact

- Browser payload grows because projects and phases become truthful, but no new network request or public route is introduced.
- The verifier becomes stricter and can block future releases that previously passed with silent compact/full drift.
- Existing consumers keep the same facility schema and gain resolvable relationships.

## Risks and Mitigations

- **Payload growth:** report exact candidate bytes and avoid including observations not reachable from compact entities.
- **False drift from ordering:** compare by stable ID and canonical value, not array position.
- **Over-broad allowlist:** keep compact transforms limited to the two documented facility fields and observation subset.
- **Accidental publication:** run generation without `--activate` and retain the existing public hash gate.

## Sources and References

- `docs/brainstorms/2026-07-12-verifiable-clean-energy-atlas-requirements.md`
- `docs/verification-and-provenance-contract.md`
- `docs/verified-wave-publication-criteria.md`
- GitHub issues #4 and #6
