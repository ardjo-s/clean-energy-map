# Staged source connectors

The connector command stages concurrent observations from EIA-860M, GEM GIPT, and Ember. It never mutates the published atlas release. The release builder separately publishes the pinned EIA-860M planned inventory and EIA-861M distributed aggregates after checksum and integrity gates; GEM and Ember remain staged observations.

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

Build and validate the pinned release without changing checked-in data, then activate it explicitly:

```sh
python3 scripts/ingest_eia860.py
python3 scripts/ingest_eia860.py --activate
npm run verify
npm run test:e2e
```

The canonical verifier caps the compact browser release at 32 MiB. Exact field-level observations remain in the full evidence release. The browser fetches and validates that full release only when a user requests filtered-capacity lineage, and rejects it if the release or build identifier differs from the displayed compact release.

Refresh the two minimal official USGS API snapshots used for exact-ID spatial enrichment:

```sh
curl -fsS --get 'https://energy.usgs.gov/api/uspvdb/v1/projects' \
  --data-urlencode 'select=case_id,eia_id,p_name,p_year,p_cap_ac,p_cap_dc,p_dig_conf,xlong,ylat,p_img_date' \
  --data-urlencode 'eia_id=not.is.null' --data-urlencode 'order=case_id' \
  -o data/raw/usgs/uspvdb-v4.0-eia-projects.json
curl -fsS --get 'https://energy.usgs.gov/api/uswtdb/v1/turbines' \
  --data-urlencode 'select=case_id,eia_id,p_name,p_year,p_cap,t_conf_loc,xlong,ylat' \
  --data-urlencode 'eia_id=not.is.null' --data-urlencode 'order=case_id' \
  -o data/raw/usgs/uswtdb-v9.0-eia-turbines.json
```

New upstream bytes require new versioned filenames and pinned checksums; never overwrite the meaning of an existing snapshot version.

## Contract

Snapshots live under `data/connectors/staging/snapshots/<source>/<sha256>-<connector-version>/`. A repeat import reuses the same directory. Changed upstream bytes create a new directory; older snapshots are never removed. Each directory contains the unmodified source payload, its manifest, and deterministic normalized observations.

EIA-860M remains a preliminary observation beside the annual final EIA-860 inventory. The public release uses only its planned sheet for planned capacity, lifecycle state, source coordinates, and target commercial-operation month. It never overwrites final annual installed observations or implies generation, financing, construction start, or guaranteed delivery. Connector deltas report added, changed, unchanged, retired, cancelled, and deferred records.

Final December 2024 EIA-861M small-scale solar and non-net-metered distributed capacities are preserved as aggregate reconciliation inputs. They never become facility records or map points, and overlapping small-scale solar observations are excluded from headline arithmetic to prevent double counting.

USPVDB 4.0 and USWTDB 9.0 enrich only final annual facilities that share an exact published EIA plant ID. Solar uses the published project-area centroid. Wind uses a deterministic centroid derived from all turbines sharing that ID. Names, coordinates, capacity, and ownership never create an automatic match. The original EIA observations remain in the full release, and the displayed USGS centroid is explicitly not a surveyed equipment point or legal project boundary.

GEM is a concurrent observation. Only exact EIA plant and generator identifiers can auto-match. Names and other descriptive fields only create review candidates. Conflicts remain attached to the GEM record. Approximate GEM locations stay unplotted. An incompatible row-level restriction rejects the row and appears in the report.

Ember is restricted to 2024 United States electricity-generation aggregates in TWh. It never allocates a national aggregate to facilities and never combines production with capacity, primary energy, or final consumption.

The staging report reconciles Ember's 2024 total generation and nuclear-plus-wind-plus-solar aggregate against the published EIA observations. Both values and every input observation identifier remain present; a difference is a preserved conflict, never a silent replacement.

## Current limits

- The repository includes a schema-only GEM fixture because the official export requires GEM's download form. A real pilot needs an official manually downloaded export.
- The offline connector fixture is a sourced subset of the May 2026 workbook. The release builder pins and checksums the full official planned-generator workbook.
- The offline Ember fixture contains sourced US 2024 rows from Ember's official CC BY 4.0 bulk download. Live acquisition uses the official API and requires `EMBER_API_KEY`.
- GEM and Ember do not change public facility rows or headline calculations without a future explicit activation command and review gate.

The next smallest step is one manual official GEM export, followed by inspection of real header names and the first exact-identifier matching report. Ownership and GLEIF remain deferred until that matching report is stable.
