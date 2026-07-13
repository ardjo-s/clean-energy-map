# Verifiable Clean Energy Atlas

[![Atlas CI](https://github.com/ardjo-s/clean-energy-map/actions/workflows/ci.yml/badge.svg)](https://github.com/ardjo-s/clean-energy-map/actions/workflows/ci.yml)
[![CodeQL](https://github.com/ardjo-s/clean-energy-map/actions/workflows/codeql.yml/badge.svg)](https://github.com/ardjo-s/clean-energy-map/actions/workflows/codeql.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)

Source-backed map of U.S. clean-energy infrastructure, generation, planned projects, provenance, and uncertainty.

**[Open the live atlas](https://clean-energy-map.vercel.app)**

## Current release

Dataset `2024.5` contains:

- 12,411 facility-technology records, including 12,409 with source-backed locations;
- 11,775 projects and 17,449 generator phases;
- final 2024 EIA generation and operating dates;
- preliminary May 2026 EIA-860M planned generators, kept separate from the final annual inventory;
- 2,799 source-backed EIA ownership relationships;
- exact-ID USGS solar and wind spatial enrichment; and
- explicit coverage, provenance, limitations, and calculation lineage.

The verified public wave is limited to the United States. Other target geographies remain explicitly `withheld` and `not_assessed`. Planned dates are publisher observations, not delivery guarantees. Missing generation or coordinates are never inferred.

## Run locally

Requirements: Node.js 22, npm, and Python 3.

```bash
npm ci
npm run dev
```

Open <http://localhost:3000>.

## Verify

The canonical deterministic check is:

```bash
npm run verify
```

For browser flows:

```bash
npm run test:e2e
```

For data changes, reproduce the release and prove that the checked-in public artifacts are unchanged:

```bash
npm run ingest:data
git diff --exit-code -- public/data
```

Connector fixtures support deterministic offline verification:

```bash
npm run connectors:offline
npm run test:connectors
```

## Project contracts

- [Documentation index](docs/README.md)
- [Energy and geographic methodology](docs/energy-and-geographic-methodology.md)
- [Verification and provenance contract](docs/verification-and-provenance-contract.md)
- [Publication criteria](docs/verified-wave-publication-criteria.md)
- [Source connectors](docs/source-connectors.md)
- [Data and third-party licences](DATA_LICENSES.md)

V1 is finance-ready but contains no financing, investment, ranking, recommendation, or money-movement interface.

## Contributing

Data corrections, source improvements, accessibility fixes, and reproducibility improvements are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Use the [data-correction form](https://github.com/ardjo-s/clean-energy-map/issues/new?template=data-correction.yml) for a disputed record.

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md). Security vulnerabilities must be reported privately as described in [SECURITY.md](SECURITY.md).

## Licence

Original code and documentation are licensed under [Apache License 2.0](LICENSE). Upstream datasets and derived data retain their source-specific terms, attribution requirements, and restrictions; see [DATA_LICENSES.md](DATA_LICENSES.md). Apache-2.0 does not relicense third-party data.
