# Atlas interface implementation spec

## Authority

This specification translates the accepted desktop and mobile concepts into code. Product truth and copy remain subordinate to the product requirements and verified source data. Generated facility names, dates, counts, and source details are visual placeholders only and must not ship.

Visual references:

- `atlas-desktop-concept.png` — 1568 × 1003
- `atlas-mobile-concept.png` — 853 × 1844; implementation gate remains 390 CSS px wide

## Product screen

The map is the application, not a preview or dashboard card. Desktop uses a quiet top rail, left controls, full-bleed map, right inspector, and bottom evidence/status rail. Mobile uses a compact top rail and controls over the map, with details in a bottom sheet. Map interaction remains available whenever a modal action does not require exclusive focus.

## Allowed first-viewport copy

- Atlas
- Verifiable Clean Energy Atlas
- Search facilities, countries, operators
- World
- Filters
- Coverage
- Sources
- Methodology
- Coverage varies by geography
- Map layers
- Facilities
- Clusters
- Grid & basemap
- Regions
- EEZ boundaries
- Eligible
- Conditional
- Excluded
- Unknown
- Mapped
- Unplotted
- Facility
- Evidence
- How this was verified
- Location precision
- Lifecycle emissions
- Sources
- Limitations

Real record names, values, dates, statuses, and publishers may appear only from the checked-in source-backed dataset.

## Design tokens

- Background: true white `#ffffff` for chrome; cool map gray-blue supplied by the basemap.
- Ink: `#0a1e40`; secondary ink `#526079`; muted `#6f7a8d`.
- Hairline: `#c9d2df`; strong border `#9aa9bc`.
- Eligible: `#087f83`; conditional: `#d88a00`; excluded: `#b83d27`; unknown: `#7b838d`.
- Focus: `#145bd7`, 2 px ring with 2 px white separation.
- Panels: opaque white; no blur or glass. Small 4–8 px radii. Shadows limited to a faint elevation cue on overlays.
- Content serif: Source Serif 4 or a close self-hosted/system fallback. UI/data sans: Inter or a close highly legible sans.
- Desktop controls: 13–15 px. Body: 14–16 px. Inspector title: 24–30 px serif. Brand: 30–38 px serif.
- Spacing scale: 4, 8, 12, 16, 20, 24, 32 px. Touch targets: minimum 44 × 44 px.
- Motion: 140–220 ms opacity/transform only; disabled under `prefers-reduced-motion`.

## Component families

- `AppHeader`: mark, wordmark, search, primary document actions.
- `MapCanvas`: MapLibre map, verified points, clusters, selected geometry, attribution.
- `GeographyControl`: current geography and shareable URL state.
- `FilterPanel`: technology, classification, lifecycle, confidence, and precision.
- `LayerPanel`: facility/cluster/region/ocean overlays.
- `MapLegend`: classification color plus mapped/unplotted semantics.
- `CoverageSummary`: status, measured coverage, gaps, and last verification.
- `FacilityInspector`: physical asset facts, evidence, calculations, sources, uncertainty, limitations.
- `CountryProfile`: distinct electricity generation, installed electrical capacity, total energy supply, and final consumption indicators.
- `EvidenceDrawer`: source ledger, methodology, limitations, coverage, and calculation lineage.
- `MobileSheet`: accessible dialog-like bottom sheet with a persistent map behind it.

## Icon treatment

Use one outline icon family with approximately 1.75 px strokes, square optical bounds, round caps, and no filled icon containers unless selected. Required metaphors: globe, search, filters/sliders, document/source, information, layers, location, zoom, compass, share, external link, close, disclosure chevron, and menu. Status marks are filled squares or circles and must never rely on color alone.

## Responsive behavior

- Desktop: right inspector width 360–420 px; left controls no wider than 280 px; bottom rail 48–56 px; map fills every remaining pixel.
- Mobile at 390 px: single-row header; compact geography and filter controls; map fills the viewport; inspector becomes a bottom sheet with 44 px targets; horizontal overflow is forbidden.
- Long inspector content scrolls inside the inspector, not the page. Safe-area insets apply to header, sheet, and bottom actions.

## Interaction lock

- Search results include mapped and unplotted records.
- Selecting a mapped facility opens the inspector and sets `facility` in the URL.
- Selecting an unplotted result opens the inspector without moving the map.
- Filters immediately update records, clusters, counts, country profile, and URL.
- Browser back/forward and reload restore geography, view, filters, and selected facility.
- Every displayed headline indicator opens its calculation lineage.
- Keyboard users can reach all controls, search results, points through an equivalent list, inspector sections, and source links.

## Concept deviations required by product truth

- Do not implement the concept's illustrative Patagonia facility, counts, dates, source names, transmission layer, or point distribution.
- Only source-backed records and coverage measurements may render.
- No global-looking scatter of sample points. Unsupported geographies show coverage state without markers.
- V1 contains no finance inspector or finance-facing copy.
