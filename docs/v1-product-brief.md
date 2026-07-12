# V1 Product Brief — Verifiable Atlas

Status: normative for the current stage  
Version: 1.0.0  
Last reviewed: 2026-07-12  
Depends on: [Constitution](product-constitution.md), [Energy and Geographic Methodology](energy-and-geographic-methodology.md), [Verification Contract](verification-and-provenance-contract.md), [Wave Criteria](verified-wave-publication-criteria.md)

## Outcome

Build a production-quality, full-screen, interactive global map where a reader can discover physical clean-energy infrastructure, understand national energy indicators, see what is missing, and audit every important claim.

Truth, reproducibility, source quality, map integrity, and maintainability outrank record count and visual spectacle.

## Users and primary jobs

### Journalist

- Find a country share, facility fact, or coverage statement quickly.
- Cite the displayed value, reporting period, definition, and source.
- Open “How this number was calculated” and inspect inputs, exclusions, conflicts, and limitations.

### Citizen

- Understand what a facility is, whether it is eligible, conditional, excluded, or unknown, and why.
- Distinguish mapped from unplotted records and verified from partial coverage.
- Read plain-language explanations without losing access to the underlying evidence.

### Energy expert

- Inspect source observations, normalization, units, lifecycle evidence, geographic precision, confidence, and calculation lineage.
- Download permitted supporting data and reproduce or challenge an aggregate.
- Compare geographies only when definitions and periods are compatible.

### Data steward

- Import and reconcile authoritative observations, review locations and conflicts, measure coverage, run quality gates, and publish or withhold verified status.

## Geographic target

The architecture and navigation MUST support worldwide coverage from the start. V1’s cumulative target is:

- United States;
- China;
- every European country;
- India;
- Japan;
- Russia;
- Australia;
- African jurisdictions where reliable, legally usable evidence is available;
- relevant ocean infrastructure.

This is a coverage roadmap, not a simultaneous-completeness claim. Geographies publish in verified waves under the [publication criteria](verified-wave-publication-criteria.md). Target geographies that do not pass the gate remain partial, sparse, not assessed, or unavailable with explicit gaps.

Navigation MUST support world, continent or major region, country, reliable first-level administrative region, and current map viewport.

## Required product surfaces

### Map canvas

- The interactive map is the dominant, full-screen canvas on desktop and mobile.
- It remains pannable and zoomable while search, filters, statistics, comparisons, or inspection are open.
- It supports verified points, suitable verified polygons, approximate project areas, and clearly separate unplotted records.
- Dense points cluster without hiding the underlying count. Cluster membership and totals respond to active filters and zoom.
- A calm neutral basemap, color-blind-conscious technology palette, non-color lifecycle and confidence cues, and an understandable legend make uncertainty readable.
- Selecting a facility MAY pan or zoom only when that improves context and does not obscure the selected geometry.

### Search and navigation

- Compact global search covers facilities, official and alternate names, operators, owners, projects, technologies, countries, and regions.
- Search returns reliable unplotted records; it never fabricates a marker for them.
- Geography selection updates the map, statistics, search results, filters, coverage explanation, country profile, and URL.
- Browser back/forward and reload restore selected geography, map position, active filters, view, and inspected record.

### Filters and views

Fast filters MUST cover, where data permits:

- technology and subtype;
- generation, heat, carrier, or storage class;
- lifecycle state;
- installed or planned capacity range with unit-safe handling;
- geography;
- classification state;
- verification freshness;
- location precision;
- confidence;
- mapped versus unplotted.

Technology views MUST be able to distinguish:

- All;
- Solar Photovoltaic;
- Concentrated Solar Power;
- Solar Thermal Energy;
- Onshore Wind;
- Offshore Wind;
- Hydropower;
- Geothermal Energy;
- Marine/Ocean Energy;
- Nuclear Fission;
- Ambient Renewable Heat;
- Recovered Heat;
- Conditional Biomass;
- Energy Carriers;
- Storage.

The last two are never represented as primary energy sources. Storage is an optional V1 data layer, but if present it follows every separation, evidence, and aggregation rule.

### Statistics

For the current selection, show only supportable values, including:

- matching record count;
- mapped count;
- unplotted count;
- capacity separated into electrical MW, thermal MW, storage MW, and storage MWh;
- lifecycle-state breakdown;
- technology mix;
- classification and coverage context.

All totals derive from the filtered database selection. Mapped plus unplotted MUST equal matching location-bearing records under the published counting rule. A displayed total MUST NOT include records excluded by visible filters.

### Country and regional profiles

Profiles show dated, independently defined indicators only when authoritative evidence exists:

- clean share of electricity generation;
- clean share of installed electrical capacity;
- total energy supply share;
- final energy consumption share;
- technology-level shares;
- separate contextual imports, exports, losses, curtailment, and storage.

Every percentage identifies numerator, denominator, unit, period, geography, definition, source release, verification date, formula, and atlas/source taxonomy differences. Electricity generation MUST NOT be labelled as the broader “energy mix.” Exact definitions live in the [energy methodology](energy-and-geographic-methodology.md).

### Facility inspector

Inspection stays in context: a side drawer on desktop and bottom sheet on mobile. It shows, when available:

- official and alternate identity;
- physical facility, project, and phase relationships;
- technology and classification with lifecycle rationale;
- lifecycle state and dated evidence;
- installed, planned, retired, generation, and storage values with correct units;
- operator, owner, and effective dates;
- geography, geometry type, location evidence, precision, and confidence;
- source observations, direct source links, source and access dates;
- last data update and last verification as separate dates;
- conflicts, uncertainty, reviewer notes, and limitations.

V1 has no finance inspector, funding-opportunity panel, empty investment state, financing total, or recommendation surface.

### Coverage panel

For the selected geography and technology, explain:

- coverage level and verified-wave status;
- source universe and measured coverage where available;
- included and omitted technologies or lifecycle states;
- source freshness, licensing limits, and known gaps;
- mapped and unplotted counts;
- why the view must not be interpreted as complete when it is not.

### Verification and public records

V1 MUST expose:

- “How this number was calculated” for every headline energy share and aggregate;
- included and excluded records, filters, formula, period, inputs, transformations, and limitations;
- a source ledger searchable by publisher, geography, dataset, technology, and freshness;
- public methodology and data dictionary;
- dataset release, source-snapshot, methodology, change-log, limitations, and correction information;
- practical open-format downloads when licensing permits;
- a documented correction and contribution route.

Restricted evidence follows the disclosure rules in the [verification contract](verification-and-provenance-contract.md); the interface must state when full reproduction is legally impossible.

### System states

Loading, empty, partial-data, offline, stale, restricted, and error states MUST be explicit. An empty map must not imply zero infrastructure when data is absent. Errors must preserve user context and offer a safe recovery path.

## Information design

- Use a restrained editorial aesthetic with compact floating panels, strong hierarchy, clear typography, readable numeric formatting, minimal chrome, and generous map space.
- Functional inspiration MAY come from Power Atlas’s map-first composition, but identity and component design MUST be original.
- Use smooth, restrained transitions that do not delay interaction.
- Avoid decorative dashboards, unsupported visualizations, excessive gradients, and glass effects that reduce readability.
- Encode technology separately from lifecycle, confidence, and coverage.
- Never use a green visual treatment as the only evidence that a record is clean.

## Responsive and accessibility contract

At 390 px:

- keep the map visible and usable behind controls;
- collapse geographic navigation into a compact selector;
- present filters and details as bottom sheets;
- prevent horizontal page overflow and unintended vertical document overflow;
- keep primary actions reachable without precision tapping;
- respect mobile safe areas;
- prevent search, map controls, legends, and sheets from covering one another;
- preserve access to evidence, sources, and limitations.

On desktop, use compact floating panels and drawers without shrinking the map into a secondary area.

Across viewports:

- keyboard users can reach, operate, dismiss, and return from every control, drawer, sheet, result, and disclosure;
- focus is visible and restored predictably;
- semantics, accessible names, reading order, contrast, target size, and reduced-motion behavior meet WCAG-conscious practice;
- essential meaning never depends on color, hover, gesture, or map interaction alone;
- a non-map route exposes searchable unplotted records and evidence.

## Technical and delivery constraints

- Use Next.js, TypeScript, Tailwind CSS, shadcn/ui, and a reliable interactive mapping library such as MapLibre GL unless an applicable higher-authority project instruction records a justified replacement.
- Keep the web interface independent of individual source formats.
- Use a database and storage approach suitable for geospatial queries and the deployment environment.
- Keep the application maintainable, tested, performant, accessible, production-buildable, and deployable as a ChatGPT Site.
- Raw observations, normalized facts, and presentation state remain separate.
- Typed, versioned schemas and repeatable imports replace hand-maintained presentation data.
- One authoritative source of truth drives the map, filters, statistics, profiles, downloads, and calculations.

Detailed data integrity is governed by the [verification contract](verification-and-provenance-contract.md). V1 release checks are governed by the [verified-wave criteria](verified-wave-publication-criteria.md).

## Explicitly deferred

V1 MUST NOT expose or imply:

- financing transactions, lenders, investors, instruments, or allocations;
- funding gaps or opportunities;
- anti-greenwashing assessment of investable opportunities;
- project rankings by financing need, impact, return, or risk;
- citizen or organizational capital recommendations;
- personalized financial advice or guaranteed impact or return;
- investor eligibility, regulated offering access, or money movement;
- specialized multi-agent research or ingestion orchestration beyond what V1 delivery needs.

Future structural constraints remain mandatory under [Future-Financing Compatibility Constraints](future-financing-compatibility.md).

## V1 acceptance flows

### Explore a geography

A user selects a supported geography, sees its coverage and energy profile, filters technologies and lifecycle states, selects a mapped or unplotted record, and reaches its evidence and uncertainty without losing map context.

### Verify a claim

A user opens a displayed percentage or total and reaches the period, formula, numerator, denominator, constituent records, exclusions, source observations, original evidence, method version, and reproduction limits.

### Inspect uncertain location

A facility with verified identity and locality but no reliable site geometry appears in search and valid totals as **Unplotted**. No centroid or guessed point appears.

### Understand partial coverage

A partial project list remains visibly partial even when it contains many markers. It never inherits verified status from another geography or a national energy balance.

### Preserve future compatibility

A project with source-backed ownership but no financing evidence may ship in V1. Ownership history remains attachable to future financing, and no empty finance interface appears.

## Definition of done

V1 is done only when:

- the required map, search, filters, clusters, profiles, inspector, coverage, methodology, source ledger, limitations, URL state, and calculation surfaces work through the real product;
- at least one geographic wave passes every verified national-baseline gate using real traceable data;
- every displayed headline number traces to formula, inputs, evidence, period, and limitations;
- eligible, conditional, excluded, and unknown states are understandable and evidence-backed;
- the map invents no location and unplotted records remain discoverable;
- partial coverage is unmistakable;
- V1 has no premature financing interface;
- V2 evidence can attach to the V1 entity model without redefining V1 concepts;
- all applicable gates in [Verified-Wave Publication Criteria](verified-wave-publication-criteria.md) pass on production, desktop, and 390 px mobile;
- remaining geographic gaps are recorded and prioritized for later waves.

