# First verified wave: source decision

Status: **decided**  
Decision date: 2026-07-12  
Research scope: United States, France, United Kingdom, Australia  
Decision owner: V1 data stewardship

## Decision

Publish the **United States** as the first candidate verified wave.

The United States has the fastest defensible path through the national-baseline gate because one authoritative publisher, the U.S. Energy Information Administration (EIA), provides:

- generator-level capacity and location observations;
- plant-level generation and fuel observations;
- national electricity generation and capacity aggregates;
- separate total-energy and end-use series;
- layouts, survey definitions, historical releases, and stable identifiers; and
- an explicit public-domain reuse statement.

This is a source decision, not automatic verified status. The wave becomes verified only after ingestion, reconciliation, coverage measurement, calculation reproduction, limitation publication, and all gates in [Verified-wave publication criteria](../verified-wave-publication-criteria.md) pass.

## Decision matrix

| Jurisdiction | Authority and national measures | Facility coverage | Legal usability | Speed / principal gap | Decision |
|---|---|---|---|---|---|
| **United States** | EIA supplies electricity, capacity, generation, consumption, and total-energy data with survey documentation. | EIA-860 covers plants with at least 1 MW combined nameplate capacity; EIA-923 supplies plant-level generation/fuel. EIA-861M separately measures smaller and distributed resources in aggregate. | EIA government publications and data are public domain; acknowledgement requested. | One publisher, common plant/generator identifiers, documented threshold. Small systems cannot be mapped individually and must remain aggregate/unplotted. | **First wave** |
| **France** | RTE/ODRÉ supplies the statutory installation register; SDES supplies the national energy balance and separate primary/final consumption. | Excellent statutory register, but installations below 36 kW are published only as geographic aggregates and some network operators are added as data become available. Exact-site coordinate semantics must be audited before plotting. | National register is Licence Ouverte 2.0. Individual resource licences and attribution must be retained. | Strong second candidate. Requires reconciliation across RTE/ODRÉ and SDES and a specific audit preventing IRIS or municipality geometry from becoming invented site points. | Second wave candidate |
| **United Kingdom** | DESNZ DUKES/Energy Trends covers generation, consumption, fuel, and capacity. ECUK separates primary and final consumption. | DUKES has a power-station table; REPD tracks renewable projects through planning and operation. REPD is not a complete all-technology operating-facility register and needs reconciliation with DUKES. | Crown material is normally OGL v3.0, subject to third-party exceptions. The active GOV.UK publication, not the stale data.gov.uk record, is authoritative. | Good official statistics; slower facility reconciliation and lifecycle/status normalization. | Later wave |
| **Australia** | DCCEEW Australian Energy Statistics is the authoritative official national energy series. | AEMO's generation file covers the National Electricity Market, not all Australia; it contains participant-provided and forward-looking records. Western Australia and other non-NEM systems require additional authorities. | energy.gov.au material is generally CC BY 4.0 unless otherwise noted. AEMO data include third-party material and an “as is” disclaimer; reuse terms require resource-level review. | National facility coverage is split across markets and publishers; legal/source reconciliation is materially slower. | Later wave |

## Authoritative first-wave source set

All URLs below are primary publisher pages checked on 2026-07-12. Snapshot the actual downloaded files, their checksums, retrieval timestamps, and the source-page metadata. Never treat a mutable landing page as the preserved observation.

### 1. Facility, generator, capacity, lifecycle, and coordinates

**EIA-860 annual detailed data**  
<https://www.eia.gov/electricity/data/eia860/>

- Publisher: U.S. Energy Information Administration.
- Current final release available at decision time: 2024; 2025 is labelled early release.
- Coverage: generators at electric power plants with **1 MW or greater combined nameplate capacity**, including operable, proposed, and current-cycle retired/cancelled tabs as documented by EIA.
- Useful grains: utility, plant, generator, generator ownership, wind, solar, energy storage, environmental equipment.
- Stable source identities: EIA plant code and generator ID. Keep both; a generator is not a plant or a project.
- Location rule: ingest reported plant latitude/longitude as an observation with its source precision and validation state. Do not replace missing or rejected coordinates with city, ZIP, county, or state centroids.
- Lifecycle rule: normalize EIA status codes through a versioned mapping. A target date alone never proves operation.
- Important limit: the current-cycle retired tab is not a comprehensive historical retirement register. Use the documented monthly inventory/history when historical lifecycle coverage is claimed.

**Preliminary Monthly Electric Generator Inventory (EIA-860M)**  
<https://www.eia.gov/electricity/data/eia860m/>

- Use only where freshness is required and label it preliminary.
- Preserve its release separately from final annual EIA-860; do not silently overwrite final observations.

### 2. Generation, fuel, and calculation constituents

**EIA-923 detailed data**  
<https://www.eia.gov/electricity/data/eia923/>

- Plant-level and generator-level generation/fuel observations, with annual final and monthly preliminary releases.
- Use the final annual release for first-wave headline calculations unless the UI explicitly labels a preliminary period.
- Keep net generation separate from nameplate capacity. Keep electrical generation units separate from fuel consumption and useful thermal output.
- Do not count storage discharge as primary generation. Preserve the reported energy-source and prime-mover codes before classification.

**EIA electricity data index and Electric Power Annual tables**  
<https://www.eia.gov/electricity/data.php>  
<https://www.eia.gov/electricity/annual/>

- Authoritative published aggregates for reconciling EIA-860 capacity and EIA-923 generation calculations.
- Use explicit table/release identifiers in each calculation, not the landing page alone.

### 3. Below-threshold and distributed coverage

**EIA-861M detailed data**  
<https://www.eia.gov/electricity/data/eia861m/>

- Supplies aggregate observations for non-net-metered generators under 1 MW and EIA estimates for small-scale photovoltaic capacity/generation.
- These records measure the principal EIA-860 facility threshold gap.
- They are aggregate coverage inputs, not facilities. They remain unplotted unless an independent authoritative source provides a real site location and identity.
- Coverage reporting must state that presence in the national totals does not imply individually enumerated or mapped systems.

### 4. National electricity-generation share and capacity share

**Electricity Data Browser / EIA API**  
<https://www.eia.gov/electricity/data/browser/>  
<https://www.eia.gov/opendata/>

- Use EIA-923-derived annual net generation by energy source for the electricity-generation numerator and total net generation for its denominator.
- Use EIA-860/Electric Power Annual capacity by energy source for installed-capacity share.
- Pin the API route, facets, units, frequency, period, response payload, and retrieval date in the calculation record.
- Do not mix utility-scale-only capacity with a denominator that includes small-scale solar. Numerator and denominator must share scope.

### 5. Total energy supply and final energy consumption

**Monthly Energy Review**  
<https://www.eia.gov/totalenergy/data/monthly/>

- Provides national energy production, consumption, imports, exports, and energy-flow series.
- For any “total energy supply” display, define the exact EIA series and formula; do not relabel primary energy consumption as supply without explanation.

**State Energy Data System (SEDS)**  
<https://www.eia.gov/state/seds/>

- Provides consumption by source and end-use sector, including U.S. totals.
- Use the published EIA definitions to distinguish primary/total energy from end-use or final consumption. Record conversion factors and excluded electrical-system losses explicitly.
- If the selected EIA series does not exactly implement the atlas definition of final energy consumption, publish that metric as unavailable until a reproducible transform is approved; never substitute a nearby measure silently.

### 6. Licence and attribution

**EIA Copyrights and Reuse**  
<https://www.eia.gov/about/copyrights_reuse.php>

- EIA states that U.S. government publications are in the public domain and that its website data, files, databases, reports, graphs, charts, and other information products may be used or distributed.
- EIA asks users to acknowledge the source and publication date.
- Protected third-party material is an exception. Snapshot metadata must record whether a downloaded resource contains such material.
- Required atlas attribution form: `Source: U.S. Energy Information Administration, <release/publication date>; retrieved <date>.`

## Measured coverage contract for the first wave

The first-wave implementation must publish at least these measures, for one pinned annual reporting period:

1. **Enumerated capacity coverage** = operable nameplate MW represented by valid normalized EIA-860 generators / matching EIA published utility-scale nameplate MW.
2. **Generation reconciliation** = summed included EIA-923 net generation / matching EIA published utility-scale net generation.
3. **Mapped capacity coverage** = capacity of included facilities with accepted reported site coordinates / capacity of included facilities.
4. **Unplotted record and capacity counts** = records and MW rejected or missing for mapping, grouped by reason.
5. **Distributed-resource gap** = EIA-861M small-scale/under-1-MW capacity and generation / matching all-scale published totals, where comparable.
6. **Technology coverage** = each relevant EIA energy-source/prime-mover group marked covered, partial, excluded by method, or not assessed.
7. **Freshness** = source release date, reporting period, retrieval date, and whether final or preliminary for every constituent source.

No percentage may exceed 100% without a failed reconciliation. Any mismatch in scope, units, revisions, or reporting period blocks verified status until explained and versioned.

## Known limits that must appear in the product

- EIA-860 is not an inventory of every physical energy installation. Its documented threshold excludes individually enumerating many systems below 1 MW.
- Small and distributed systems from EIA-861M are aggregate or estimated and cannot become map markers.
- Facility coordinates are reported observations, not proof of survey-grade site geometry. Invalid, missing, conflicting, or insufficiently precise coordinates remain unplotted.
- EIA generator/plant status is not the atlas clean-energy classification. `eligible`, `conditional`, `excluded`, and `unknown` require separate lifecycle-evidence rules.
- Biomass is never eligible from fuel code alone. Missing feedstock, land-use, supply-chain, or lifecycle evidence yields conditional or unknown according to the methodology.
- Storage capacity and discharge remain separate from primary generation. MW and MWh remain separate.
- EIA-860 ownership observations describe generator ownership, not financing transactions. V1 exposes no financing interface.
- National totals can cover estimated distributed activity more fully than the facility map. The UI must make this difference unmistakable.

## Rejected shortcuts

- Do not use third-party global facility datasets as the first-wave authority when EIA publishes the observation.
- Do not plot state, county, ZIP, municipality, or balancing-authority centroids as facilities.
- Do not combine annual final and monthly preliminary releases without an explicit versioned calculation.
- Do not infer a clean classification directly from `renewable`, energy-source, or prime-mover labels.
- Do not claim all-energy or all-facility completeness from passing electricity-only reconciliation.

## Next-wave order

1. **France**: audit exact coordinate semantics and network-operator inclusion in the statutory register; reconcile it with SDES national balance data.
2. **United Kingdom**: reconcile DUKES power stations, REPD projects, and DESNZ consumption series; quantify missing technologies and smaller installations.
3. **Australia**: assemble an Australia-wide facility authority set spanning NEM and non-NEM systems and complete resource-level reuse review.

Primary comparison sources:

- France installation register: <https://www.data.gouv.fr/datasets/registre-national-des-installations-de-production-et-de-stockage-delectricite-au-31-05-2026>
- France 2024 national energy balance: <https://www.statistiques.developpement-durable.gouv.fr/bilan-energetique-de-la-france-pour-2024>
- UK electricity statistics: <https://www.gov.uk/government/collections/electricity-statistics>
- UK DUKES electricity chapter: <https://www.gov.uk/government/statistics/electricity-chapter-5-digest-of-united-kingdom-energy-statistics-dukes>
- UK REPD current publication: <https://www.gov.uk/government/publications/renewable-energy-planning-database-quarterly-extract>
- UK ECUK 2025: <https://www.gov.uk/government/statistics/energy-consumption-in-the-uk-2025>
- Open Government Licence v3.0: <https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/>
- Australian Energy Statistics: <https://www.energy.gov.au/energy-data/australian-energy-statistics>
- energy.gov.au copyright / CC BY 4.0 notice: <https://www.energy.gov.au/copyright>
- AEMO NEM generation information: <https://www.aemo.com.au/energy-systems/electricity/national-electricity-market-nem/nem-forecasting-and-planning/forecasting-and-planning-data/generation-information>

