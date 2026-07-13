# Verified-Wave Publication Criteria

Status: normative release gate  
Version: 1.1.0
Last reviewed: 2026-07-12  
Applies to: every V1 geography, dataset release, and production publication

## Publication model

The atlas publishes in cumulative verified waves. It MUST NOT wait for uniform global coverage, and it MUST NOT imply that published geographies are equally complete.

A geography can be visible before verification only as a clearly labelled partial publication. The word **verified** is reserved for a geography whose current release passes every applicable national-baseline and product gate in this document.

Publication states are:

| State | Meaning |
| --- | --- |
| **verified wave** | The geography passed every applicable gate for the named dataset and methodology release. |
| **partial publication** | Useful source-backed records or indicators are available, but at least one verified-wave gate is missing or failed. The failures are prominent. |
| **withheld** | Evidence is unsafe, legally unusable, internally invalid, or too misleading to publish even as partial. The limitation may still be listed. |

Verified-wave status is release-specific and dated. It is not a permanent badge and does not mean every facility has been individually verified.

## Coverage vocabulary and matrix

Every geography × technology × lifecycle-scope cell has one coverage level:

| Level | Meaning |
| --- | --- |
| **complete** | A defined authoritative source universe is expected to enumerate the in-scope population for the period, all entries and documented exceptions are accounted for, and validation found no material unmeasured gap. |
| **substantial** | Measured coverage captures most of the defined in-scope universe under a published threshold, with bounded gaps that do not make the label misleading. |
| **partial** | A useful, measured subset exists, but important parts of the in-scope universe are absent or the denominator is incomplete. |
| **sparse** | Only isolated records or a narrow source subset exist; aggregate interpretation would be misleading. |
| **not assessed** | No coverage assessment has been completed. This is not evidence of absence. |
| **unavailable** | Required evidence is known to be unavailable, inaccessible, legally unusable, or not published, with a recorded reason. |

The method for `substantial` and `partial` MUST name the universe, denominator, threshold, excluded categories, period, and source limitations. Do not invent a universal percentage when source structures differ. A qualitative level without measured or source-declared scope cannot support verified-wave status.

Coverage level, fact confidence, location precision, and clean classification are separate. Many accurate markers can coexist with sparse coverage; an unplotted record can have high identity confidence; a verified wave can still disclose bounded gaps.

Verified-wave status does not require every coverage cell to be `complete`. It requires authoritative sources for every materially present technology, measured scope, reproducible handling, and visible gaps. A material technology that is `not assessed` or `unavailable` because no authoritative or otherwise justified facility source exists fails G2; a measured `partial` cell may pass when its bounded limitations are explicit.

The public coverage panel MUST show:

- release and assessment date;
- geography and technology cell;
- lifecycle states included;
- level and measurement method;
- known universe, matched count, unmatched count, and denominator where available;
- authoritative sources and their declared scope;
- mapped and unplotted counts;
- freshness and licensing limits;
- omissions, conflicts, and next improvement.

## Verified national-baseline gates

A country receives verified-wave status only when all gates below pass for the same release.

### G1 — Authoritative energy profile

- At least one authoritative national source or methodologically appropriate international public source provides the required national baseline.
- Electricity generation and installed electrical capacity are kept separate.
- Total energy supply and final energy consumption appear only when authoritative comparable balances exist.
- Numerator, denominator, period, unit, geography, production/consumption basis, imports/exports, and storage treatment are explicit.
- Atlas taxonomy mappings and the gap from any broader source “renewable” definition are published.
- Conflicting alternative sources and the selection rule are recorded.

Failure examples: a current facility sum used as national generation; an electricity share labelled “energy mix”; incompatible periods; storage discharge counted as generation.

### G2 — Authoritative facility sources by relevant technology

- Identify every technology materially present or reported in the national energy profile, official capacity statistics, or planning/permit system.
- For each relevant technology, register an authoritative facility source or document why no usable source exists.
- Record source scope, lifecycle states, capacity threshold, update cadence, excluded facility classes, and licensing.
- A materially present technology with no authoritative or otherwise justified source blocks verified-wave status; it may still appear in a partial publication.
- Offshore technologies include authoritative lease, permit, regulator, or equivalent jurisdiction evidence.

A marker list from an aggregator does not satisfy this gate.

### G3 — Measured coverage

- Complete the geography × technology × lifecycle coverage matrix.
- Define the target universe and counting rule for each relevant cell.
- Reconcile source records to normalized facilities, projects, and phases without silently merging them.
- Quantify matched, unmatched, rejected, conflicted, mapped, and unplotted records.
- Explain source overlap, duplicate treatment, thresholds, and exclusions.
- Demonstrate that the public coverage label follows the released rule.

Marker density, record count, or a successful import is not coverage measurement.

### G4 — Reproducible methodology and calculations

- Energy, classification, location, lifecycle, reconciliation, and coverage methods have released versions.
- Source snapshots or legally permitted retrieval manifests are identified.
- Headline calculations have machine-readable lineage and reproduce from the released permitted inputs.
- Schema, data dictionary, formula, software/pipeline, and build versions are recorded.
- Import is idempotent for the same snapshots and versions.

If licensing prevents complete independent reproduction, disclose the exact restriction and publish the maximum permitted method, provenance, inputs, and outputs. A material unverifiable claim cannot receive verified status merely because its source is restricted.

### G5 — Visible gaps and limitations

- Publish technology, lifecycle, geographic, temporal, source, mapping, and licensing gaps.
- Show stale, conflicting, estimated, generic-LCA, unmatched, and unplotted data next to affected claims.
- State what verified-wave status does and does not mean.
- Provide a correction/contribution route and outstanding correction list.
- Prioritize remaining gaps for the next release.

A generic disclaimer detached from affected claims fails this gate.

### G6 — Legal usability and attribution

- Every public field and download complies with source license, attribution, access, privacy, and redistribution terms.
- Required attribution is visible and included in release manifests.
- Source-specific notices, credit language, and non-endorsement requirements are shipped wherever the licensed data requires them.
- Restricted raw data cannot leak through downloads, client bundles, logs, or source views.
- Evidence needed to substantiate a public claim remains retainable or re-retrievable under the documented method.

### G7 — Geographic and ocean integrity

- Every plotted geometry has location evidence, method, precision, and confidence.
- Locality-only and unreliable locations are unplotted but searchable.
- No city, postal, administrative, or company-office centroid substitutes for a site.
- Territorial waters, EEZs, high seas, and disputed/overlapping areas use versioned boundary and jurisdiction evidence.
- Proximity does not create national attribution.
- Country totals document treatment of disputed and high-seas records.

### G8 — Release integrity

- All applicable V1 data, calculation, product, accessibility, responsive, and production gates below pass.
- Manual verification uses the actual production build and released dataset, not only fixtures or component previews.
- The release manifest and public surfaces identify the same dataset, methodology, and build versions.

## Wave selection

Wave order optimizes trustworthy coverage speed, not geopolitical prominence or record count.

Before implementation of a candidate wave, record a decision comparing:

1. **source authority:** official status, primary evidence, method quality, freshness;
2. **legal usability:** public display, retention, redistribution, attribution, and reproducible-output rights;
3. **coverage:** national energy balances, facility registers by relevant technology, location evidence, identifiers, and measurable source scope;
4. **delivery speed:** source accessibility, formats, reconciliation complexity, update burden, and validation effort.

The decision record MUST cite candidate sources, record material unknowns, explain the chosen first wave, and state why rejected candidates are later rather than silently abandoned. A prioritization score can order research; it cannot waive a publication gate.

After the first verified wave, choose the next candidate by the highest evidence value and learning reuse, while preserving the target roadmap: United States, China, every European country, India, Japan, Russia, Australia, available African jurisdictions, and relevant ocean infrastructure.

## Required wave evidence bundle

Each candidate wave supplies:

- decision and scope record;
- source registry and license/attribution manifest;
- source snapshots or retrieval manifests with dates and checksums where permitted;
- raw-ingestion and normalization change reports;
- entity-resolution, duplicate, conflict, and manual-review reports;
- geography × technology × lifecycle coverage matrix;
- mapped/unplotted and location-precision report;
- national energy indicator inputs and calculation records;
- classification and lifecycle-evidence report;
- methodology, schema, formula, dataset, and build versions;
- limitations and outstanding corrections;
- automated test results and manual product-verification record;
- release notes and prioritized next gaps.

Missing evidence is a failed gate, not an invitation to estimate silently.

## V1 release quality gates

### Build and automated checks

Run and pass:

- production build;
- TypeScript type checking;
- linting;
- unit and integration tests;
- schema and data-integrity tests;
- import idempotency tests;
- duplicate-detection and entity-resolution tests;
- country energy-mix denominator, reporting-period, import/export, and storage-double-counting tests;
- derived-value reproducibility and calculation-lineage tests;
- capacity aggregation and unit-separation tests;
- search, filter, URL-state, country-profile, and facility-inspector tests;
- map interaction and clustering checks;
- accessibility and keyboard checks;
- a documented performance budget and representative production measurements for initial load, map interaction, filtering, clustering, and inspector opening.

Finance- and opportunity-specific tests are not V1 gates because those behaviors are forbidden in V1. They become mandatory at the activation points in [Future-Financing Compatibility Constraints](future-financing-compatibility.md).

### Data-integrity assertions

Tests and release evidence MUST prove:

- filtered totals equal the matching released selection;
- mapped plus unplotted counts equal the matching record count under the published counting rule;
- electrical MW, thermal MW, storage MW, and storage MWh remain separate;
- installed, planned, and retired capacity remain separate;
- excluded fuels and feedstocks never enter clean totals;
- conditional biomass enters eligible totals only after every facility-specific evidence gate passes;
- carriers and storage never enter primary-source totals;
- renewable and nuclear values remain separately available;
- every country percentage exposes numerator, denominator, period, definition, and source;
- electricity generation, capacity, total energy supply, and final energy consumption are not merged or mislabeled;
- storage discharge is not counted as primary generation;
- every headline value traces to observations and original sources;
- dataset, methodology, freshness, corrections, limitations, and change history are visible;
- a passed target date never changes lifecycle state;
- disappearing upstream records are preserved for review and history;
- no uncertain location receives a guessed marker;
- source links, dates, precision, confidence, conflicts, and uncertainty appear in the inspector.

### Product interaction checks

Verify through the actual product:

- geography selection updates map, statistics, search, filters, coverage, profile, and URL;
- reloading and browser navigation restore the same shareable state;
- search finds mapped and unplotted records;
- filters update records, totals, clusters, profiles, and coverage consistently;
- clusters update after every relevant filter and expose correct counts;
- country profiles keep all indicator types distinct;
- facility inspection remains on the map and exposes provenance;
- calculation disclosures reach formula, inputs, exclusions, sources, and limitations;
- loading, empty, partial, offline, stale, restricted, and error states do not imply false absence or completeness;
- drawers and bottom sheets do not unnecessarily disable map navigation;
- V1 exposes no financing transaction, opportunity, ranking, recommendation, or money-movement surface.

### Desktop, mobile, and accessibility checks

Verify at representative desktop dimensions and exactly 390 px width:

- map remains primary and usable;
- no horizontal overflow and no unintended vertical document overflow;
- search, selector, map controls, legend, filters, and sheets do not cover one another;
- safe areas and reachable target sizes work on mobile;
- side drawer and bottom sheet preserve context and can be dismissed;
- keyboard operation, visible focus, focus restoration, reading order, accessible names, semantics, and escape behavior work;
- essential content does not depend on color, hover, gesture, or the map alone;
- contrast and reduced-motion behavior are acceptable;
- long names, numbers, source titles, URLs, empty states, and error text do not overflow;
- no browser-console errors or hydration failures occur.

### Production verification

- Test the production build with the release dataset.
- Verify a representative mapped facility, unplotted facility, country profile, classification, coverage panel, source ledger entry, and calculation trace.
- Verify at least one conflict or limitation path and one empty/partial path.
- Run a live production smoke check when deployment is available.
- Record unavailable deployment as an explicit unverified gate; local success is not live proof.

## Acceptance cases

### Different coverage, different claims

If the United States passes the national baseline and another country has only a partial list, the United States may be verified while the other remains partial. Neither inherits the other’s status.

### Disputed offshore project

If an offshore project lies in a disputed area, show sourced overlapping claims and uncertainty. Do not assign the nearest country as fact. Exclude it from a country aggregate unless a released allocation rule supports inclusion.

### Conditional biomass

If feedstock or transport evidence is unclear, the record is conditional or unknown and absent from eligible totals. It is never eligible by default.

### Reproducible percentage

If a card shows 72% clean electricity, its disclosure identifies reporting period, eligible-generation numerator, total-generation denominator, technology treatment, imports/exports rule, formula, sources, inputs, and limitations.

### Uncertain position

If name and municipality are verified but site geometry is not, the record is searchable and validly countable as unplotted. No municipality centroid appears.

## Status maintenance

- Reassess verified waves on the declared source update cadence and after material methodology changes.
- A new release may retain, downgrade, or withdraw current verified status. Record the reason and affected claims.
- Prior released status remains historically accurate for its named release but cannot be presented as current after supersession.
- Source staleness, licensing loss, newly discovered gaps, or failed reproducibility can trigger downgrade or withholding.
- Corrections rerun affected calculations, coverage, and gates before publication.

## Continuous wave loop

While meaningful in-scope improvements remain:

1. audit geographic, technology, lifecycle, source, and freshness coverage;
2. select the highest-impact evidence or product gap under the wave-selection rule;
3. research current authoritative, legally usable sources;
4. preserve raw observations and source scope;
5. normalize, reconcile, validate, and review location evidence;
6. run data, calculation, product, accessibility, desktop, and mobile gates;
7. verify the production experience and record limitations;
8. create a durable checkpoint with a concise English change description when version control is available;
9. publish only the status the evidence supports, then continue to the next gap.

Do not optimize this loop for record count. A new source that improves provenance, coverage measurement, or correction safety may be more valuable than many weak markers.

## Publication decision

The machine-readable `publicationStatus` is `verified_wave`, `candidate`, or `withheld`. Only `verified_wave` can represent a passed national baseline. The current V1 release publishes the United States as the sole verified wave; every other target cell is withheld until its own evidence gate passes.

The release steward records `PASS`, `PARTIAL`, or `WITHHOLD` for every gate with evidence links. Any `FAIL`, missing evidence, or unresolved material risk prevents `verified wave` status.

No deadline, target record count, visual readiness, stakeholder preference, or prior verified badge can override a failed gate.
