---
title: Fix verifiable-atlas review findings
type: fix
date: 2026-07-13
source: docs/brainstorms/2026-07-12-verifiable-clean-energy-atlas-requirements.md
review_artifact: /tmp/compound-engineering/ce-code-review/20260713-004059-0a06bb34/synthesized.json
---

# Fix verifiable-atlas review findings

## Summary

Resolve all 31 actionable review findings by repairing six shared boundaries: connector snapshots, release publication, domain contracts, browser state, evidence UX, and release documentation. Preserve the current public release unless explicitly activated, keep imports reproducible offline, and prefer deletion or one canonical invariant over source-specific patches.

## Requirements

- Preserve traceability from every published value and plotted location to exact observations and source snapshots (R12-R15).
- Keep source conflicts, rejected rows, lifecycle states, units, periods, and uncertain locations explicit (R9-R15).
- Make connector runs deterministic and idempotent; validate immutable snapshot bundles before reuse.
- Prevent failed or dry-run connector/ingestion work from partially replacing public artifacts.
- Make compact and full releases schema-versioned, mutually consistent, and runtime-validated before rendering.
- Keep map URL state restorable and map updates incremental; avoid rebuilding the map or dataset for UI-only state changes.
- Meet the keyboard focus contract for evidence drawers and expose calculation lineage for displayed aggregates.
- Document the R1-R18 implementation audit and exact verification commands.
- Remove unused dependencies only after the functional checks are green.

## Assumptions

- Checked-in public artifacts are the immutable safety baseline. Required schema additions are built in a staged candidate; `--activate` is the sole path allowed to replace public artifacts.
- A small standard-library Python module is justified only for snapshot validation and staged publication shared by both ingestion entry points; source normalization remains source-owned.
- Local builders guarantee fail-before-activation and rollback-tested replacement; production publication is atomic at Vercel's deployment boundary. Cross-file crash atomicity is not claimed for fixed local paths.
- Legacy checked-in JSON remains readable through its explicit schema version. New candidates must satisfy the new provenance contract before activation.
- Network-dependent source tests use fixtures; live acquisition is a separate opt-in verification.

## Scope Boundaries

- Included: the 31 findings in the recorded review artifact plus structured JSON-only connector failures/preflight where required for an auditable command contract.
- Included: focused decomposition needed to keep `scripts/run_source_connectors.py` and `scripts/ingest_eia860.py` legible.
- Excluded: new geographies, new source families, financing V2, fuzzy matching, new UI features, and unrelated visual redesign.
- Excluded: publication of newly ingested upstream data without an explicit activation command.

## Implementation Units

### 1. Canonical snapshot and staged-publication boundary

**Files:** `scripts/run_source_connectors.py`, `scripts/ingest_eia860.py`, a focused module under `scripts/`, `tests/test_source_connectors.py`, ingestion tests where present.

- Represent a snapshot bundle with its source payload, manifest, normalized output, checksum, connector version, retrieval timestamp, and validation result.
- On reuse, require the complete bundle and verify hashes instead of trusting file presence. Reject empty/truncated source payloads before normalization.
- Derive offline timestamps from recorded snapshot metadata, never the wall clock. Retry idempotent GETs only for timeouts, 408, 429, and 5xx with bounded attempts; never retry offline, auth, other 4xx, or schema errors.
- Stage generated artifacts outside public paths, validate the complete candidate release, then activate it. Dry-run and caller-provided output paths must not reach fixed public release files.
- Include every contributing source snapshot and schema contract version in the build identity and release metadata.
- Preserve the previous public files on any acquisition, parsing, validation, or reconciliation failure.

**Acceptance checks:** same snapshot and connector version produce identical bytes; incomplete/tampered bundles fail; a forced late failure leaves public hashes unchanged; dry-run cannot alter public files; build ID changes when any contributing source changes.

### 2. Deterministic source normalization and reconciliation

**Files:** `scripts/run_source_connectors.py`, `scripts/xlsx_reader.py`, focused source-normalization helpers only when they remove duplication, `tests/test_source_connectors.py`.

- Close temporary files before XLSX parsing and support inline-string cells.
- Normalize a source row once, parse numeric coordinates/capacities explicitly, and treat blank coordinates as unplotted.
- Detect duplicate upstream stable keys deterministically; reject them with a retained reason/report entry rather than emitting duplicate observation IDs.
- Keep canceled and postponed as distinct states. Preserve rejected rows with reason and counts in human and JSON reports.
- Replace Ember calculation-array position assumptions with stable calculation identifiers; block incompatible unit/period reconciliation.
- Emit structured failure/preflight information in JSON mode without contaminating stdout.

**Acceptance checks:** Windows-safe fixture path; inline strings retained; blank coordinates unplotted; duplicate keys do not duplicate IDs; comma-formatted capacities parse or reject explicitly; GEM coordinates are numbers; canceled/postponed remain distinct; rejected/conflicted/unmatched/review-required rows survive reports; reordered calculations reconcile identically.

### 3. Provenance-complete domain and release contracts

**Files:** `lib/domain/schemas.ts`, `lib/atlas/integrity.ts`, `scripts/verify-data.ts`, release-building code in `scripts/ingest_eia860.py`, domain/integrity tests.

- Require each observation to identify the exact source snapshot/release, not only a source family.
- Require coordinate evidence to support the actual plotted coordinates and precision; otherwise retain the record as unplotted.
- Add explicit schema contract versions to release metadata.
- Build compact references from canonical full entities and reject dangling project/phase links.
- Verify compact/full build identity, schema versions, entity references, calculation lineage, and observation reachability together.

**Acceptance checks:** no published value without a source observation; no plotted point without matching location evidence; compact/full divergence fails verification; dangling references fail; calculations reproduce from observation IDs.

### 4. Runtime-safe data, URL, and map state

**Files:** `hooks/use-atlas-data.ts`, `hooks/use-atlas-url.ts`, `components/atlas-app.tsx`, `components/map-canvas.tsx`, `lib/atlas/query.ts`, unit and browser tests.

- Parse fetched JSON through the domain schema before exposing it to components and surface a bounded load error.
- Validate URL filters and selections against runtime enums and available records before applying them.
- Separate facility filtering from viewport state so map movement does not rebuild data.
- Create the map once; update sources/layers incrementally instead of recreating it on search changes.
- Apply restored viewport before geography auto-fit and ensure an initial selection is applied after asynchronous layer creation.

**Acceptance checks:** malformed JSON and invalid URL values fail safely; typing search does not recreate the map; viewport moves do not recompute facility records; browser back/forward restores viewport; initial deep-linked facility is selected reliably.

### 5. Evidence UX and requirement audit

**Files:** `components/atlas-controls.tsx`, `components/evidence-drawer.tsx`, related inspector/profile components, `tests/e2e/atlas.spec.ts`, `docs/README.md`.

- Route national headline aggregates through existing calculation IDs. For client-derived filtered capacity, expose included facility IDs and capacity observation IDs instead of inventing a release calculation.
- Implement dialog focus entry, focus containment, Escape close, and focus restoration when an opener exists; URL-opened drawers have no restoration target.
- Add a concise R1-R18 audit mapping each requirement to implementation evidence, verification command, and any explicit remaining limitation.

**Acceptance checks:** keyboard-only open/inspect/close works with focus restored; aggregate lineage is reachable; R1-R18 each have a truthful status and evidence pointer.

### 6. Thermo-nuclear simplification, dependency cleanup, and full verification

**Files:** all files changed above, `package.json`, lockfile.

- Review the resulting diff for duplicated policy, scattered conditionals, cast-heavy boundaries, thin wrappers, and file growth. Do not grow the 795-line ingestion script before extracting a shared invariant; broader decomposition requires a demonstrated reduction in concepts.
- Remove confirmed unused scaffold dependencies.
- Run deterministic connector tests twice, data verification, type/lint/unit/build checks, then browser tests against the production build.
- Confirm the public release artifacts remain unchanged unless activation was explicitly tested in an isolated temporary destination.

**Acceptance checks:** no unjustified file-size growth; no fuzzy merge is introduced; second import creates zero duplicates; all existing CI commands and browser tests pass; git diff contains no unrelated user changes.

## Verification Matrix

| Risk | Required proof |
|---|---|
| Snapshot corruption/reuse | `npm run test:connectors` covers missing member, wrong checksum, empty and truncated payload |
| Nondeterminism | two offline runs compared byte-for-byte, including report JSON |
| Partial publication | inject failure before activation and compare public artifact hashes |
| Source semantics | fixtures for canceled/postponed, rejects, duplicates, blank/string coordinates, inline XLSX strings |
| Provenance | schema/integrity tests proving snapshot, observation, calculation and plotted-location reachability |
| Compact/full drift | `scripts/verify-data.ts` negative fixture plus current release pass |
| Map regressions | unit render-count assertions where stable and Playwright deep-link/history/keyboard flows |
| Release safety | `npm run verify && npm run test:e2e`; `shasum public/data/atlas-v1*.json` before/after a forced staged failure |

## Execution Order

1. Add failing regression tests for Units 1-3, then implement their shared boundaries.
2. Add failing tests for Unit 4, then repair browser state and map lifecycle.
3. Add accessibility/lineage tests and documentation audit for Unit 5.
4. Run the thermo-nuclear pass, delete incidental complexity, remove unused dependencies, and execute Unit 6 verification.

## Completion Evidence

- Exact commands and exit results for connector, data, lint, type, unit, build, and browser checks.
- Before/after public artifact hashes proving no implicit release activation.
- Mapping from review findings 1-31 to fixed commit or explicitly durable residual finding.
- English commit(s), pushed only to `agent/verifiable-atlas-v1`, with the existing PR updated.

## Finding Trace

| Findings | Unit | Regression proof |
|---|---|---|
| 1 | 5 | aggregate-lineage browser assertion |
| 2 | 5 | keyboard focus, Escape, and restoration browser flow |
| 3, 17-19 | 4 | stable map lifecycle plus history/deep-link tests |
| 4 | 5 | R1-R18 evidence table in `docs/README.md` |
| 5-8, 16, 20 | 3-4 | schema, integrity, compact/full, and runtime-parse negative tests |
| 9, 14, 15, 27 | 1 | staged failure, checksum, empty, and truncated fixtures |
| 10 | 1 | sorted build-identity source-list fixture |
| 11-13 | 1-2 | repeat-byte comparison and lifecycle/rejection fixtures |
| 21 | 4 | invalid URL enum/record tests |
| 22-26, 28 | 2 | XLSX, coordinate, duplicate, and normalization fixtures |
| 29 | 1 | bounded idempotent-GET retry fixture |
| 30 | 2 | reordered-calculation reconciliation fixture |
| 31 | 6 | dependency search plus full verification |
| JSON stdout/preflight gaps | 2 | JSON-only stdout, stderr diagnostics, and failure exit test |

## Exact Commands

```sh
npm run test:connectors
npm run verify:data
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
```

Determinism runs two offline dry-runs into distinct temporary stores/reports and compares reports byte-for-byte with `cmp`. Release safety records `shasum public/data/atlas-v1*.json` before and after an injected pre-activation failure.
