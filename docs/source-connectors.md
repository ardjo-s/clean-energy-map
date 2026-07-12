# Staged source connectors

The connector command stages concurrent observations from EIA-860M, GEM GIPT, and Ember. It never mutates the published atlas release. Public activation is deliberately absent until matching and review rules have operational evidence.

## Commands

Deterministic offline dry-run using the pinned, sourced fixtures:

```sh
npm run connectors:offline
```

Persist immutable, content-addressed offline snapshots and both report formats:

```sh
python3 scripts/run_source_connectors.py --offline \
  --report-json data/connectors/reports/offline.json \
  --report-md data/connectors/reports/offline.md
```

Acquire the official EIA-860M workbook, accept an official GEM export downloaded manually through GEM's form, and query Ember's official API:

```sh
EMBER_API_KEY='...' python3 scripts/run_source_connectors.py \
  --gem-file /absolute/path/to/official-gipt-export.csv \
  --report-json data/connectors/reports/live.json \
  --report-md data/connectors/reports/live.md
```

`EMBER_API_KEY` is read from the environment and is never stored in a snapshot, report, error, or committed file. The connector rejects any API response that echoes the credential. A local Ember response can instead be supplied with `--ember-file`. A local official EIA workbook can be supplied with `--eia-file`.

Run the connector contract tests:

```sh
npm run test:connectors
```

## Contract

Snapshots live under `data/connectors/staging/snapshots/<source>/<sha256>-<connector-version>/`. A repeat import reuses the same directory. Changed upstream bytes create a new directory; older snapshots are never removed. Each directory contains the unmodified source payload, its manifest, and deterministic normalized observations.

EIA-860M remains a preliminary observation beside the annual final EIA-860 inventory. Deltas report added, changed, unchanged, retired, cancelled, and deferred records. They never imply generation, financing, or new coordinates.

GEM is a concurrent observation. Only exact EIA plant and generator identifiers can auto-match. Names and other descriptive fields only create review candidates. Conflicts remain attached to the GEM record. Approximate GEM locations stay unplotted. An incompatible row-level restriction rejects the row and appears in the report.

Ember is restricted to 2024 United States electricity-generation aggregates in TWh. It never allocates a national aggregate to facilities and never combines production with capacity, primary energy, or final consumption.

The staging report reconciles Ember's 2024 total generation and nuclear-plus-wind-plus-solar aggregate against the published EIA observations. Both values and every input observation identifier remain present; a difference is a preserved conflict, never a silent replacement.

## Current limits

- The repository includes a schema-only GEM fixture because the official export requires GEM's download form. A real pilot needs an official manually downloaded export.
- The offline EIA fixture is a sourced subset of the May 2026 workbook, not the full inventory.
- The offline Ember fixture contains sourced US 2024 rows from Ember's official CC BY 4.0 bulk download. Live acquisition uses the official API and requires `EMBER_API_KEY`.
- No public calculation or atlas row changes without a future explicit activation command and review gate.

The next smallest step is one manual official GEM export, followed by inspection of real header names and the first exact-identifier matching report. Ownership and GLEIF remain deferred until that matching report is stable.
