# Verification and Provenance Contract

Status: normative evidence contract  
Version: 1.1.0
Last reviewed: 2026-07-12  
Contract changes require: schema/version impact review, migration plan, public change entry

## Purpose

Every important atlas claim must be inspectable as an evidence chain:

`displayed claim → calculation → normalized facts → source observations → source snapshots/original sources`

The chain may disclose a licensing restriction or a reproducibility limit. It may not contain an invented value, silent manual override, or unrecorded transformation.

## Core evidence concepts

| Concept | Definition |
| --- | --- |
| **Source** | A publisher, dataset, document, filing, register, or other identifiable evidence origin. |
| **Source snapshot** | The immutable bytes, permitted archived representation, or retrieval manifest observed at a specific time. |
| **Source observation** | A value or assertion exactly as reported by a source, tied to a source location and observation context. |
| **Normalized fact** | A typed interpretation selected or derived from one or more observations under a versioned rule. |
| **Conflict** | Two or more admissible observations that cannot simultaneously describe the same field, scope, and time. |
| **Calculation record** | A machine-readable execution of a versioned formula over identified facts or observations. |
| **Methodology release** | The versioned rules used to classify, normalize, reconcile, calculate, and assess coverage. |
| **Dataset release** | An immutable, identified collection of normalized data, lineage, calculations, limitations, and source-snapshot references. |
| **Verification** | A dated determination that evidence and method satisfy named gates; never a timeless badge. |

Raw observations and normalized facts MUST remain separately queryable. Presentation strings are not source data.

## Source policy

Prefer authoritative, recent evidence in this order:

1. government agencies, energy ministries, regulators, permit databases, and official statistics;
2. transmission system operators, independent system operators, utilities, and market operators;
3. international public institutions and well-documented open datasets;
4. official facility, operator, owner, and developer disclosures;
5. environmental assessments, planning documents, regulatory filings, and court records;
6. high-quality research institutions and documented industry datasets;
7. reputable journalism only when primary evidence is unavailable.

Rank alone does not make a source applicable. Selection also considers scope, field definition, observation period, update date, primary-versus-derived status, methodology, internal consistency, licensing, and known bias.

Search-result snippets, unsourced aggregators, generated text, marketing labels, map guesses, and unattributed copied datasets are not evidence. A reputable secondary source never silently replaces an available primary source.

Each source record MUST preserve:

- stable source identifier;
- publisher and document or dataset title;
- canonical link and, when permitted, snapshot reference;
- publication, release, revision, and observation dates when available;
- access timestamp;
- geographic, technological, temporal, and lifecycle scope;
- update cadence and known subset limitations;
- license, attribution, access, redistribution, and retention constraints;
- language and machine-readable format where relevant;
- checksum or equivalent snapshot identity where permitted;
- ingestion connector and version;
- last review date and steward notes.

## Immutable raw layer

- Preserve each acquired source snapshot or a legally permitted retrieval manifest as immutable input.
- A changed upstream file creates a new snapshot; it does not mutate the old snapshot.
- Preserve provider row keys, record locations, sheet/table/page/section identifiers, and raw values.
- A normalized model never becomes the only copy of an upstream observation.
- If a record disappears from a later source, investigate and preserve its history. Disappearance alone is not deletion, retirement, or cancellation evidence.
- Restricted, confidential, paywalled, or personal information is stored and exposed only under applicable access and redistribution terms.

## Source observations

Every observation MUST be attributable to:

- observation identifier;
- source and source-snapshot identifier;
- upstream record identifier or precise document location;
- subject candidate and field asserted;
- original value, spelling, unit, date precision, and status vocabulary;
- geographic and temporal scope;
- extraction method and timestamp;
- source confidence notes, uncertainty, caveats, and explicit conflicts;
- permitted public visibility.

An observation records what the source said, not what the atlas wishes it meant. Unit conversion, taxonomy mapping, geospatial joins, entity resolution, and corrections occur in separate versioned steps.

## Normalized V1 domain

Typed, versioned schemas MUST cover at least:

- facilities;
- projects and project phases;
- facility/project/phase relationships;
- organizations and legal entities needed for identity and ownership;
- time-aware ownership and organization relationships;
- jurisdictions and geometries;
- capacity, generation, heat, storage, and lifecycle events;
- sources, source snapshots, and source observations;
- classifications and lifecycle-evidence assessments;
- lifecycle reference distributions and evidence levels;
- country energy balances and mix indicators;
- indicator inputs, formulas, and calculation runs;
- coverage assessments;
- methodology releases, dataset releases, limitations, changes, and corrections.

The finance-only extension is owned by [Future-Financing Compatibility Constraints](future-financing-compatibility.md). V1 MUST NOT simulate finance data in generic text fields.

## Facility record contract

Preserve the following whenever available. Unknown values stay explicitly unknown rather than receiving defaults.

### Identity and structure

- stable internal identifier;
- external source identifiers;
- official and alternate names;
- facility, project, and phase relationships;
- facility type, technology family, and subtype;
- generation, heat, carrier, or storage class;
- clean-classification state, rationale, and methodology version.

### Quantities

- installed, planned, and retired capacity as separate structured numeric values;
- original reported value, unit, qualifier, gross/net convention, AC/DC convention, and normalized value;
- annual generation or delivered heat with reporting period and unit;
- storage power and storage energy as separate fields;
- uncertainty range, estimate status, and calculation lineage.

### Actors and time

- operator and owner with effective dates, roles, and evidence;
- lifecycle state, source-reported state, normalized mapping rule, and state date;
- commissioning, construction, approval, permit, retirement, cancellation, and target dates with precision;
- organization succession, parent, subsidiary, joint-venture, and beneficial-ownership assertions only when evidenced.

### Geography

- country and administrative regions with identifier and attribution meaning;
- coordinates or geometry;
- geometry type: point, polygon, or unplotted;
- location evidence and geocoding or spatial-derivation method;
- positional precision and location confidence, separate from record confidence;
- ocean zone, regulatory jurisdiction, and dispute evidence where applicable.

### Evidence and quality

- field-level source observations;
- source links, publisher, title, source date, access date, and license;
- record last-updated and last-verified timestamps as separate values;
- conflicts, uncertainty, confidence, reviewer notes, and limitations;
- history of selected facts and prior values.

Capacity and date values MUST be typed data, not presentation strings. The interface calculates totals from normalized structured values after current filters are applied.

## Lifecycle-evidence data contract

A technology or subtype reference distribution MUST retain:

- evidence, source, source-release, resource-version, and license identifiers;
- retrieval timestamp and source-snapshot checksum;
- technology family and subtype;
- geographic scope, functional unit, and lifecycle boundary;
- statistic kind and, when supplied, minimum, first quartile, median, third quartile, and maximum;
- source reference and estimate counts without presenting them as representativeness or probability;
- harmonization status and method;
- material exclusions and caveats.

A record classification MUST retain:

- classification state and E0–E4 evidence level;
- basis and contrary evidence identifiers;
- methodology version, decision date, and decision process;
- conditions, exclusion reason, uncertainty, and validity period;
- next evidence needed.

Reference distributions and facility values use separate fields. E1/E2 data MUST NOT populate a facility lifecycle-intensity value. Exact evidence semantics and baseline states are owned by the [Energy and Geographic Methodology](energy-and-geographic-methodology.md).

## Normalization and reconciliation

### Versioned transformations

Every normalization records:

- rule and software version;
- input observation identifiers;
- original and normalized values;
- unit conversion, rounding, parsing, and taxonomy mapping;
- execution timestamp;
- warnings, failed validations, and review status.

Name, unit, technology, organization, date, lifecycle, and geography mappings are explicit. A parser result is not automatically a verified fact.

### Entity resolution

- Resolve facilities, projects, phases, legal entities, organizations, and external records independently.
- Similar names, coordinates, owners, or capacities alone are insufficient proof of identity.
- Automated resolution produces reviewable match candidates with contributing features and conflicts.
- Merges and splits require an evidence-backed decision with effective date, reviewer or rule, and reversible history.
- Never silently merge similarly named projects, organizations, or facilities.
- Preserve aliases and predecessor/successor relationships instead of rewriting history.

### Conflicts, uncertainty, and confidence

- Keep every admissible conflicting observation visible.
- A selected fact records the selection rule, chosen observation, alternatives, rationale, decision date, and method version.
- Conflict, staleness, incompleteness, and non-comparability lower fact confidence or coverage; they do not disappear in a polished display.
- Evidence confidence, location confidence, calculation reproducibility, and coverage level are separate dimensions. Do not collapse them into one opaque score.
- Estimated, approximate, inferred, and source-reported values have distinct provenance labels.
- If a conflict cannot be resolved under the released rule, publish the conflict and use `unknown`, a range, or no aggregate as appropriate.

## Validation and ingestion

Imports MUST be repeatable and idempotent. Re-running the same source snapshot and connector version produces the same normalized candidates and no duplicate records.

Automated validation MUST cover, as applicable:

- required fields and schema versions;
- numeric parsing, allowed units, and conversion compatibility;
- coordinate ranges, geometry validity, and coordinate reference systems;
- location-evidence presence before plotting;
- date validity, date precision, and impossible sequences;
- lifecycle mapping and conflicting current states;
- referential and temporal integrity;
- improbable capacity or generation values;
- duplicate identifiers and suspiciously duplicate geometries;
- missing attribution, source, license, or verification dates;
- stale records and source snapshots;
- excluded technologies or feedstocks entering clean totals;
- incompatible period, denominator, or geography in energy indicators.

Each import produces a human-readable and machine-readable change report: added, changed, unchanged, conflicted, unmatched, rejected, and review-required observations and candidates.

Manual review decisions MUST retain the original observations, reviewer identity or process, timestamp, rationale, affected rule version, and prior decision. A UI-only edit with no durable lineage is prohibited.

## Calculation lineage

Every derived public value has a machine-readable calculation record containing:

- stable calculation identifier;
- formula identifier and version;
- methodology, schema, dataset, and software/pipeline versions;
- input record and observation identifiers;
- input values, units, periods, geography, and classification states;
- applied filters, transformations, conversions, allocations, and rounding;
- included and excluded records with exclusion reasons;
- result, output unit, and uncertainty where supported;
- execution timestamp and reproducible build identifier;
- limitations and license-driven reproduction restrictions.

No displayed headline number may exist only as copied prose or a hard-coded constant.

The public “How this number was calculated” surface MUST show, in understandable form:

- what the number means;
- numerator, denominator, period, and formula where applicable;
- current filters and scope;
- included and excluded inputs;
- source and observation links;
- method and dataset versions;
- conflicts, estimates, restrictions, and limitations;
- downloadable supporting data when permitted.

A user must be able to move from an aggregate to constituent records, then to field observations and original sources. When licensing blocks raw redistribution, show the permitted provenance metadata, derived method and output, restriction, and exact part that cannot be independently reproduced.

## Public releases

Each dataset release MUST publish or link to:

- stable release identifier and release date;
- schema and data dictionary versions;
- machine-readable schema references;
- methodology version;
- source-snapshot dates and freshness summary;
- calculation and reproducible build identifiers;
- included geographies, technologies, lifecycle states, and record counts;
- mapped and unplotted counts;
- coverage assessments and verified-wave decisions;
- change log from the previous release;
- corrections included and outstanding;
- public limitations register;
- license and attribution manifest;
- open-format downloads when permitted.

Published releases are immutable. A correction creates a new release and retains the old release for audit.

## Limitations register

Maintain a public, versioned register covering at least:

- source freshness and missed update cycles;
- geographic and technology gaps;
- source subsets and unmeasured coverage;
- unplotted or low-precision records;
- unmatched and possibly duplicated entities;
- unresolved ownership or jurisdiction chains;
- conflicting values and incompatible periods;
- estimated values and generic lifecycle factors;
- restricted evidence and reproduction limits;
- source outages and unavailable data;
- methodological changes awaiting recalculation.

Limitations appear next to affected claims as well as in the central register. A central disclaimer alone is insufficient.

## Corrections and contributions

The public correction and contribution workflow MUST:

1. require an identified claim or record and reliable supporting evidence;
2. preserve the submitted source and access/legal constraints;
3. run the same validation, identity, location, and classification rules as imports;
4. record review decision and rationale;
5. retain the previous fact and calculation in history;
6. identify affected methodology and dataset releases;
7. recalculate affected aggregates and coverage;
8. publish accepted changes in the next release change log.

No silent manual correction only in the interface is allowed.

## Freshness and verification

“Last data update” and “last verified” are different:

- **last data update** is when the normalized record or calculation changed;
- **last verified** is when named evidence and gates were reviewed successfully.

A source publication date, access date, observation date, calculation time, and verification date remain separate. Stale verification is visible and may downgrade coverage or verified-wave status under the [publication criteria](verified-wave-publication-criteria.md).

## Minimum audit invariant

The compact V1 browser release keeps calculation input observations and sourced ownership assertions in the browser dataset. The full download remains authoritative for every facility field, project, and phase observation. Compact records link to the exact matching full release instead of silently presenting their source pointers as complete field evidence.

For any public facility fact, country percentage, aggregate, classification, geometry, ownership assertion, or coverage claim, the system MUST answer:

1. What exactly is being claimed?
2. Which released method defines it?
3. Which normalized facts or calculation inputs support it?
4. Which raw observations support those facts?
5. Which original sources made those observations, when, and under what license?
6. What conflicts, uncertainty, omissions, and restrictions remain?
7. What changed since the previous release?

If the system cannot answer, the claim is not verified and must be withheld, downgraded, or labelled not reproducible.
