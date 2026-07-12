# Verifiable Clean Energy Atlas

Map-first, source-backed V1 for inspecting clean-energy infrastructure without hiding uncertainty or partial coverage.

Current published wave: United States, dataset `2024.2`, final 2024 EIA electricity baseline. Other target geographies remain explicitly `withheld` and `not_assessed`.

Release `2024.2` contains 10,805 facility-technology records, 2,799 source-backed EIA ownership relationships, four distinct country-indicator states, and a coverage assessment for every target geography × technology cell.

## Run

```bash
npm ci
npm run dev
```

## Verify

```bash
npm run ingest:data
npm run typecheck
npm run lint
npm test
npm run verify:data
npm run build
npm run test:e2e
```

Downloads and correction links are available from the in-product Methodology and Limitations drawers.

Product authority and methodology start at [docs/README.md](docs/README.md). V1 is finance-ready but contains no financing, investment, ranking, recommendation, or money-movement interface.
