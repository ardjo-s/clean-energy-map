# Energy and Geographic Methodology

Status: normative method  
Version: 1.1.0
Last reviewed: 2026-07-12  
Method changes require: version increment, recalculation impact assessment, public change entry

## Scope

This document owns:

- lifecycle-greenhouse-gas classification;
- technology and carrier taxonomy;
- energy, heat, capacity, and storage units;
- country and regional indicator formulas;
- facility lifecycle states;
- geographic identity, geometry, precision, and ocean jurisdiction.

It does not decide whether a geography is publishable as verified. That gate is defined in [Verified-Wave Publication Criteria](verified-wave-publication-criteria.md). Evidence storage and calculation lineage are defined in the [Verification and Provenance Contract](verification-and-provenance-contract.md).

## Meaning of “clean”

The atlas uses **low lifecycle greenhouse-gas emissions** as its climate classification. Zero direct operating emissions, renewable status, a green label, taxonomy alignment, or carbon capture does not by itself establish eligibility.

The applicable lifecycle boundary includes, when material:

- raw-material extraction and processing;
- equipment manufacturing and transport;
- construction and land-use change;
- fuel or feedstock cultivation, extraction, processing, and transport;
- operation, maintenance, replacement, and fugitive emissions;
- grid or storage inputs when the claim includes them;
- decommissioning, waste treatment, recycling, and end-of-life;
- reservoir methane, refrigerant leakage, biogenic-carbon timing, and other pathway-specific effects.

Climate classification remains separate from biodiversity, land, water, toxicity, radioactive waste, mining, safety, air pollution, community, governance, and human-rights impacts. Those impacts MUST be disclosed when known and cannot be described as solved by an eligible climate classification.

## Classification states

Every assessed record or methodology bucket has exactly one public state:

| State | Meaning | Treatment in a verified clean numerator |
| --- | --- | --- |
| **eligible** | Admissible evidence supports low lifecycle GHG under the released method and no exclusion applies. | Included when period, unit, geography, and indicator rules also match. |
| **conditional** | The pathway can qualify only under named conditions, and one or more facility-, site-, feedstock-, or supply-chain conditions remain unresolved or are being displayed as conditional by design. | Excluded unless and until a versioned assessment establishes `eligible`. |
| **excluded** | The pathway is outside V1 clean scope or admissible evidence fails an inclusion rule. | Excluded. |
| **unknown** | Available evidence is insufficient, unusable, contradictory beyond resolution, or absent, so the method cannot assess the record. | Excluded. |

Missing evidence never becomes `eligible`. `Conditional` is not a softer synonym for eligible. `Unknown` differs from `conditional`: conditional names a known pathway-specific gate; unknown means the available evidence cannot support an assessment.

Classification output MUST expose:

- state and plain-language rationale;
- methodology version and decision date;
- applicable technology, site, feedstock, and system boundary;
- lifecycle evidence level: facility-specific, site/pathway-specific, regional factor, or global technology benchmark;
- sourced range or value and functional unit where available;
- material conditions, exclusions, conflicts, and uncertainty;
- reviewer or automated rule provenance;
- next evidence needed for a conditional or unknown record.

## Lifecycle evidence method

### Evidence selection

Evidence level and classification state are separate fields:

| Level | Evidence | Permitted public claim |
| --- | --- | --- |
| **E0 — none/unusable** | Missing, inaccessible, incompatible, irreconcilably contradictory, or missing a usable boundary or functional unit. | `unknown`; no lifecycle number. |
| **E1 — technology family** | Authoritative national or international synthesis for a broad family. | Technology reference distribution only; never a facility value. |
| **E2 — subtype/context** | Authoritative synthesis matching a material subtype or context. | Named subtype/context distribution; still never a facility value. |
| **E3 — facility/pathway calculation** | Traceable cradle-to-grave calculation with boundary, geography, lifetime, capacity factor, inputs, allocation, uncertainty, and source dates. | Facility estimate labelled calculated and not independently reviewed. |
| **E4 — reviewed facility/pathway assessment** | E3 plus independent critical review or equivalent verification and applicable measured operating evidence. | Reviewed facility estimate within its stated boundary and validity. Never “zero carbon.” |

Use the source hierarchy in the [Verification Contract](verification-and-provenance-contract.md). Prefer matching E4/E3 evidence over E2/E1 evidence, then prefer authoritative regional evidence over a global family distribution when boundaries align. A higher evidence level does not override a product exclusion.

Never compare values with incompatible functional units, system boundaries, lifetimes, allocation rules, or included processes without an explicit transformation and caveat.

### Reference distributions and reuse

V1 uses the NLR/NREL dataset [*Life Cycle Emissions Factors for Electricity Generation Technologies*](https://doi.org/10.7799/1819907) as its primary machine-readable technology distribution and IPCC AR5 Annex III as an independent international cross-check. They remain separate observations; do not average them, present them as a trend, or treat either as a facility measurement.

- Ingest the original NLR/NREL resource as a versioned source snapshot. Preserve its minimum, quartiles, median, maximum, evidence-pool counts, boundary notes, checksum, DOI, dataset version, license, and required attribution.
- Cite and link IPCC values. Do not ship its PDF, copy its table or figure into product data, or create a derivative graphic without a documented reuse review and any required permission.
- Do not embed any reference range as an unversioned application constant.
- Do not adopt one universal numeric eligibility threshold. Wide and site-sensitive distributions require pathway gates, evidence level, and visible uncertainty.
- Never copy a technology median into a facility lifecycle-intensity field. Only E3 or E4 can support a named facility value.
- At E1/E2, public wording names “technology benchmark” or “subtype benchmark,” range, central statistic, unit, source, and vintage, and explicitly says no facility-specific footprint was established.

The [V1 lifecycle-emissions evidence register](research/lifecycle-evidence-register.md) owns the supporting exact ranges, evidence-pool details, source checks, and licensing research. Production MUST ingest the identified source resource rather than parse or copy its Markdown tables.

For French facilities, a current, legally usable ADEME Base Empreinte/Base Carbone factor SHOULD replace a generic benchmark when boundaries match. Other jurisdictions SHOULD use an equivalent authoritative regional source when available. Each factor remains a versioned observation with release and access dates.

Solar thermal heat, ambient heat, recovered heat, hydrogen, fuels, and storage use different claims or functional units. They MUST NOT inherit an electricity benchmark. Heat claims state whether the unit is input energy, delivered heat, or useful heat. Carrier claims remain separate from primary-source classification.

### Initial reference set

The initial evidence catalog SHOULD include, with release/access dates and licensing verified before publication:

- [NLR/NREL lifecycle-emissions dataset](https://doi.org/10.7799/1819907) as the structured technology-distribution source;
- [IPCC AR6 WGIII Chapter 6](https://www.ipcc.ch/report/ar6/wg3/chapter/chapter-6/) for energy-system scope and conditional pathways;
- [IPCC AR5 Annex III](https://www.ipcc.ch/site/assets/uploads/2018/02/ipcc_wg3_ar5_annex-iii.pdf) as a cited international cross-check;
- current ADEME Base Empreinte/Base Carbone and applicable ADEME technology pages for France-specific factors;
- [IRENA Energy Taxonomy 2024](https://www.irena.org/-/media/Files/IRENA/Agency/Publication/2024/Mar/IRENA_Energy_taxonomy_2024.pdf) for technology subtype vocabulary;
- [NREL harmonized lifecycle factors](https://data.nrel.gov/submissions/171) as a cross-check on published electricity studies;
- [IPCC ocean-energy assessment](https://archive.ipcc.ch/pdf/special-reports/srren/Chapter%206%20Ocean%20Energy.pdf) for marine subtype context.

The complete supplied synthesis and bibliography are in the [clean-energy source research report](../Clean_Energy_Sources_Research_20260712/research_report_20260712_clean_energy_sources.md). A bibliography entry is a candidate source, not a verified current source snapshot. The release evidence bundle records which edition and value were actually used.

### Plant and system claims

Plant-level lifecycle intensity and system-level effects from transmission, balancing, backup, curtailment, and storage are separate metrics. A low plant-level value does not prove a zero-emission system. A system-effect estimate MUST name its perimeter, scenario, grid, period, and assumptions.

## Technology taxonomy

### Primary generation and heat families

The atlas keeps these families separately identifiable:

| Family | Included subtypes and treatment |
| --- | --- |
| Solar Photovoltaic | Rooftop, utility ground-mounted, floating, building-integrated, agrivoltaic, and off-grid PV. Candidate for `eligible` with applicable lifecycle evidence. |
| Concentrated Solar Power | Parabolic trough, tower, linear Fresnel, and dish/engine. Thermal storage is recorded separately. |
| Solar Thermal Energy | Hot water, building heat, district heat, and process heat; use a heat-specific functional unit. |
| Onshore Wind | Utility, small, and micro turbines. Airborne wind remains emerging and cannot inherit a mature benchmark without evidence. |
| Offshore Wind | Fixed-bottom and floating. Floating maturity and evidence remain visible. |
| Hydropower | Run-of-river, diversion, conduit, and reservoir generation. Reservoir methane and land-use evidence may make a record conditional or unknown. Pumped storage is not in this family. |
| Geothermal Energy | Dry steam, flash, binary, and direct heat. EGS, hot-dry-rock, and closed-loop maturity and site risks remain visible. |
| Marine/Ocean Energy | Tidal range, tidal stream, wave, ocean current, OTEC, and salinity gradient. Tidal/wave benchmarks do not automatically qualify other subtypes. |
| Nuclear Fission | Low-carbon but not renewable. Reactor type, fuel cycle, waste, water, and safety context remain visible. |
| Ambient Renewable Heat | Air-, water-, or ground-source heat harvested by heat pumps. Eligibility requires the electricity mix, performance, and refrigerant boundary to be stated. |
| Recovered Heat | Otherwise-rejected industrial, wastewater, data-centre, or process heat. It is a recovery pathway, not a primary renewable source; the counterfactual and allocated inputs must be stated. |

“Eligible family” is not a record-level default. Every displayed classification still cites an applicable evidence level and method version.

### V1 classification baseline

A newly imported record starts `unknown` until its identity and applicable evidence are established. Once established, apply this baseline:

| Pathway | Baseline rule |
| --- | --- |
| Solar PV | `eligible` at E1/E2; no named facility intensity without E3/E4. |
| CSP | `eligible` only for confirmed solar-only output; `conditional` when hybrid status or solar fraction is unknown; fossil-attributable output is `excluded`. |
| Solar thermal heat | `conditional` until a heat-specific boundary, auxiliary energy, storage loss, and pathway assessment exist. |
| Onshore wind | `eligible` at E2; emerging airborne systems remain `unknown` without matching evidence. |
| Offshore wind | Fixed-bottom `eligible` at E2; floating remains `conditional` or `unknown` when evidence only matches fixed-bottom. |
| Run-of-river, diversion, or conduit hydro | `eligible` at E2 when subtype is established; `conditional` if material impoundment or methane questions remain. |
| Reservoir hydro | `conditional`; promote only with reservoir methane, pre-impoundment land carbon, age, climate, flooded area, generation, and construction evidence. A range that excludes biogenic reservoir GHG cannot support promotion. |
| Pumped-storage hydro | `excluded` from primary generation and kept in storage. |
| Hydrothermal binary geothermal | `eligible` at E2 unless site evidence contradicts it. |
| EGS binary geothermal | Candidate `eligible` at E2 with maturity visible; `unknown` when design does not match the evidence. |
| Hydrothermal flash or dry-steam geothermal | `conditional`; promotion requires facility operating-gas data, reinjection/abatement treatment, and facility lifecycle calculation. |
| Tidal and wave | `eligible` at E1 with low evidence strength; facility values require E3/E4. |
| OTEC, ocean current, osmotic/salinity gradient, or unspecified marine | `unknown`; tidal/wave values cannot be inherited. |
| Light-water-reactor nuclear | `eligible` at E2 and separate from renewable totals; facility values require matching fuel-cycle and lifecycle evidence. |
| Other fission reactor types | `unknown` until matching subtype evidence exists. |
| Ambient renewable heat | `conditional`; requires useful/delivered-heat boundary, seasonal performance, electricity period/factor, refrigerant leakage, auxiliary energy, climate, and equipment lifecycle. |
| Recovered heat | `conditional`; requires the counterfactual, source-process allocation, pumping/distribution inputs, and proof it would otherwise be dissipated. |
| Sustainable segregated solid biomass residue | `conditional` by design; only the facility-specific gate below can promote it. |
| Excluded fossil, feedstock, waste, and co-firing pathways | `excluded` regardless of a favourable external label or generic LCA. |
| Hydrogen, ammonia, synthetic fuels, batteries, and other carriers/storage | `excluded` from primary-source classification; separate carrier/storage evidence may still be shown. |

Operational evidence can contradict a generic distribution. Preserve the conflict and downgrade classification rather than selecting the more favourable source. Negative lifecycle estimates are not carbon removal unless a separately defined removal method establishes that claim.

### Conditional solid biomass residues

The only biomass pathway that can enter V1 clean scope is a segregated, unavoidable, sustainable solid residue supported by facility-specific evidence. Candidate feedstocks include sawmill or forestry residues, straw, bagasse, husks, shells, and unavoidable solid organic waste.

An individual facility can become `eligible` only when evidence establishes all applicable items:

- exact feedstock and renewable fraction;
- origin, supplier or source area, and supply radius;
- absence of dedicated energy crops, deforestation, forest overharvesting, and fossil co-firing;
- credible certification or equivalent sustainability evidence;
- baseline/counterfactual use of the residue;
- direct and indirect land-use effects;
- forest regrowth, soil-carbon effects, and carbon-payback timing;
- cultivation or collection, drying, processing, and transport;
- conversion efficiency and combustion emissions;
- lifecycle assessment boundary, value or range, and uncertainty.

Until all required evidence passes, the record remains `conditional` or `unknown` and stays out of verified clean totals. Missing supply-chain evidence is not assumed benign.

The following are excluded from V1 clean generation and heat:

- biogas and biomethane;
- dedicated energy crops;
- wood linked to deforestation or overharvesting;
- mixed waste containing plastics;
- biomass co-fired with fossil fuels;
- liquid biofuels;
- long-distance biomass supply chains that fail the released sourcing rule.

Mixed municipal waste-to-energy is excluded. A separately evidenced unavoidable solid biogenic residue is assessed only through the conditional-biomass gate above.

### Excluded fossil pathways

Unabated coal, oil, and natural gas are excluded. Fossil power with CCS/CCUS is also excluded from V1 clean scope because residual combustion, upstream methane, capture energy, and storage risk do not meet this product boundary. It MUST NOT enter clean totals even if another taxonomy calls it low-carbon.

The background research describes fossil CCS, biogas, and some waste pathways as conditionally low-carbon in broader policy contexts. The atlas deliberately uses the stricter V1 scope above; the research report does not override it.

### Carriers, storage, and enabling technologies

The following are not primary energy sources:

- hydrogen;
- ammonia;
- synthetic methane, methanol, e-kerosene, and other synthetic fuels;
- batteries;
- pumped-storage hydropower;
- thermal storage;
- compressed-air storage;
- flywheels;
- efficiency, demand reduction, and smart-grid measures.

If present, they use separate layers, filters, legends, statistics, and coverage assessments. Carrier carbon claims require source-electricity, feedstock, carbon-source, process, and leakage evidence. “Green,” “blue,” or similar color labels are observations, not proof.

The optional V1 storage layer may include grid batteries, pumped hydro, thermal storage, hydrogen storage demonstrably associated with clean generation or grid storage, and other clearly classified utility storage.

Fusion is future research, not a currently operating clean source, unless and until commercial evidence and a released lifecycle method exist.

## Quantities and units

Store values as structured numbers with original reported values and units preserved. Normalize only through a versioned transformation.

The following axes remain separate:

| Quantity | Canonical display family | Never combined with |
| --- | --- | --- |
| Electrical generation capacity | MW or GW electrical | Thermal capacity or storage energy |
| Thermal production capacity | MWth or GWth | Electrical capacity or storage energy |
| Storage discharge/charge power | MW | Generation capacity unless a clearly separate comparison is made |
| Storage energy | MWh or GWh | Any MW quantity |
| Annual electricity generation | MWh, GWh, or TWh with period | Capacity |
| Annual heat delivered | Heat-energy unit with period and boundary | Electricity generation without conversion method |

Installed, planned, and retired capacity are distinct fields. Nameplate, net, gross, AC, and DC ratings MUST NOT be merged without an explicit conversion and definition. Storage discharge never counts as primary generation.

## National and regional indicators

### Clean electricity-generation share

For reporting period `p` and geography `g`:

`clean_generation_share(g,p) = eligible_domestic_generation(g,p) / total_domestic_generation(g,p)`

- Numerator and denominator use the same period, geography, unit, and gross/net convention.
- The default is production-based: domestic generation is included; imported electricity is excluded from both numerator and denominator.
- A consumption-based indicator MAY include imports and exports only as a separately named metric with its own method.
- Storage discharge is excluded from primary-generation totals.
- A source’s broader renewable bucket is reconciled to the atlas taxonomy; the gap and exclusions are published.

### Clean installed-electrical-capacity share

At reference date `d`:

`clean_capacity_share(g,d) = eligible_installed_electrical_capacity(g,d) / total_installed_electrical_capacity(g,d)`

Only electrical generation capacity with compatible gross/net and AC/DC definitions may enter. Thermal capacity, storage power, and storage energy are excluded.

### Total energy supply and final energy consumption

Publish these only when an authoritative national energy balance provides a methodologically comparable numerator and denominator. The metric name MUST state **total energy supply** or **final energy consumption**. Neither is interchangeable with electricity generation.

### Technology shares and context

Technology-level shares use the same denominator, period, unit, and geography as the parent indicator. Imports, exports, transmission losses, curtailment, and storage remain separate contextual values.

### Required display metadata

Every percentage or headline indicator shows:

- numerator and denominator values;
- unit and formula;
- reporting year or period and reference date where applicable;
- geographic scope;
- production- or consumption-based definition;
- source publisher, dataset release, and source snapshot;
- access and last-verification dates;
- formula and methodology versions;
- included/excluded technology rules;
- conflicts, alternative source values, estimates, and limitations.

### Source and comparison rules

- Prefer authoritative national balances and internationally harmonized datasets over facility sums.
- Do not derive a national share by summing mapped facilities unless facility coverage is proven complete and measured generation exists for the same period.
- When sources disagree, publish the selected source, selection rule, alternatives, and uncertainty.
- Compare or rank countries only when definitions, periods, boundaries, and units are compatible. Otherwise disable the comparison or qualify it prominently.
- Incomplete or non-comparable inputs cannot support an unqualified ranking.

## Facility lifecycle states

Use these distinct public states:

- Operating
- Under construction
- Approved
- Permitted
- Proposed
- Suspended
- Cancelled
- Retired
- Unknown

Source-specific mappings are versioned. Preserve the reported source status, normalized status, state date, and mapping rule. Never infer operation from a passed target date. Target, approval, construction, commissioning, retirement, cancellation, and observation dates remain separate.

## Geographic model

### Geographic identity

- Use stable, documented geography identifiers and preserve source identifiers.
- Record the boundary dataset and version used for every spatial calculation.
- First-level administrative regions are available only where reliable, compatible boundaries and sources exist.
- Historical observations retain the jurisdiction and boundary context applicable to their observation period when known.
- A facility may have physical, regulatory, ownership, and source-reported jurisdictions; do not collapse unlike meanings into one country field.

### Location integrity

Every record uses one of:

- **point:** reliable evidence supports a site coordinate;
- **polygon:** reliable evidence supports a facility footprint, reservoir, offshore lease, or project area;
- **unplotted:** identity or locality is known but reliable geometry is not.

Location evidence, geometry type, derivation method, coordinate reference system, precision, and confidence are separate from general record confidence.

Allowed public precision labels SHOULD include exact site, verified footprint, approximate project area, locality-only, and unknown. A locality-only observation remains unplotted.

Prohibited substitutes include city centers, postal centroids, administrative centroids, company offices, unrelated facilities, and guessed coordinates. Coordinates MUST pass range and geometry-validity checks, but technical validity alone does not prove location truth.

Unplotted records remain searchable and appear in valid non-spatial totals with an explicit counting rule. Mapped and unplotted counts remain separate. No marker is created merely to make a record visible.

### Ocean infrastructure

Ocean records MUST distinguish:

- territorial waters;
- exclusive economic zones (EEZs);
- high seas;
- disputed or overlapping claim areas.

Each attribution preserves the boundary source, boundary version, legal or regulatory evidence, spatial method, date, and uncertainty. Proximity to a coast, nearest-country calculations, operator nationality, cable landing, or project name MUST NOT determine national attribution.

For disputed or overlapping areas:

- display the dispute or overlapping claims;
- preserve each sourced claim separately;
- avoid presenting one claimant as uncontested fact;
- keep physical location distinct from permitting, grid-connection, and ownership jurisdictions;
- exclude the record from country totals when the published indicator cannot support a defensible allocation.

High-seas records remain high seas unless authoritative evidence establishes another jurisdiction. A map overlay or spatial join is a derived claim and must retain calculation lineage.

## Method evolution

### Release 2024.2 implementation note

The target roadmap is represented as an explicit geography × technology coverage matrix. Cells without a release-ready source set are `withheld` and `not_assessed`; an empty map is never interpreted as zero infrastructure. EIA-860 owner shares are preserved as decimal source observations and normalized to percentages by multiplying by 100. Missing owner rows never imply operator ownership. The previous 1.0.0 method remains listed in dataset change history.

Any change to classification, technology mapping, biomass gates, country formulas, lifecycle mappings, units, or geographic attribution MUST:

1. create a new methodology version;
2. identify affected records and calculations;
3. rerun applicable classifications and aggregates;
4. publish old and new results with a change explanation;
5. update coverage when the change alters comparability or confidence;
6. preserve the previous release for audit.
