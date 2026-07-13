# V1 performance budget

Status: release gate

Last measured: 2026-07-13

Release: `atlas-v1-us-wave-2024.5`

## Budgets

| Surface | Budget | Gate |
| --- | ---: | --- |
| Compact browser JSON | at most 32 MiB | Enforced by `npm run verify:data` |
| Initial atlas ready | at most 8,000 ms | Median of three production-build runs |
| Map zoom and cluster redraw | at most 1,500 ms | Median of three production-build runs |
| Filter and cluster refresh | at most 750 ms | Median of three production-build runs |
| Facility inspector opening | at most 500 ms | Median of three production-build runs |

The full field-level evidence release is excluded from initial load. It is fetched only when the user requests exact filtered-capacity lineage or downloads the full evidence file.

## Measurement method

Build and serve the production application, then run the repeatable browser measurement:

```sh
npm run build
npm run start -- --hostname 127.0.0.1
npm run measure:performance
```

For a public preview or production URL:

```sh
PERF_BASE_URL='https://example.vercel.app' npm run measure:performance
```

Each run uses a fresh 1440 × 900 page. `initialAtlasReady` ends when the released record count and map canvas are visible. The map measure zooms the live MapLibre map and waits for its shareable URL state, which includes cluster redraw at the new zoom. The filter measure waits for the released record count to change and for two animation frames, covering the shared filtered selection and map-source refresh. The inspector measure selects a real facility search result and waits for the evidence inspector.

These are release-regression budgets, not synthetic Core Web Vitals. Local loopback measurements isolate payload parsing, rendering, filtering, clustering, and interaction from public network variability. A public preview smoke and the same remote command remain required before promotion.

## Current production-build baseline

Environment: local production server; Chromium `149.0.7827.55`; Node.js `22.22.3`; three fresh pages.

| Surface | Median | Budget | Result |
| --- | ---: | ---: | --- |
| Initial atlas ready | 1,133 ms | 8,000 ms | Pass |
| Map zoom and cluster redraw | 446 ms | 1,500 ms | Pass |
| Filter and cluster refresh | 83 ms | 750 ms | Pass |
| Facility inspector opening | 42 ms | 500 ms | Pass |

The compact release is 29,894,216 bytes (28.5 MiB), below the 32 MiB hard ceiling. Any release that exceeds the payload ceiling or any measured median budget is not ready for promotion without an explicit, documented budget revision.
