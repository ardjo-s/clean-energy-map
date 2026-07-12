# Verifiable Clean Energy Atlas

Map-first, source-backed V1 for inspecting clean-energy infrastructure without hiding uncertainty or partial coverage.

Current published wave: United States, final 2024 EIA electricity baseline.

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

Product authority and methodology start at [docs/README.md](docs/README.md). V1 is finance-ready but contains no financing, investment, ranking, recommendation, or money-movement interface.
