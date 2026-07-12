# V1 Lifecycle-Emissions Evidence Register

Status: supporting research; the normative classification method remains [Energy and Geographic Methodology](../energy-and-geographic-methodology.md)  
Research cut-off: 2026-07-12  
Applies to: V1 lifecycle classification and evidence display  
Primary machine-readable benchmark: NLR/NREL dataset DOI `10.7799/1819907`  
Primary international cross-check: IPCC AR5 WGIII Annex III, Table A.III.2

## Decision summary

V1 should use the NLR/NREL downloadable dataset as the machine-readable reference distribution and IPCC AR5 Annex III as an independent international benchmark. The two sources must remain separate observations. They use different study pools, dates, subtechnology groupings, and boundaries; their values must not be averaged or presented as a time trend [S1][S3][S4].

The published values are technology or subtype distributions, not measurements of a named facility. An atlas record may say, for example, “eligible; global technology benchmark; IPCC range 7–56 gCO2e/kWh, median 11.” It may not say “this wind farm emits 11 gCO2e/kWh” unless a facility-specific assessment supports that number. IPCC itself warns that LCA results depend on timing, region, operating mode, background system, modelling choices, and the exact research question [S2].

V1 must not adopt one universal numerical pass threshold. The evidence shows why: IPCC hydropower spans 1–2,200 gCO2e/kWh, NLR/NREL biopower spans -1,000–1,300 gCO2e/kWh, and NREL found operational geothermal flash emissions far outside some generic LCA estimates [S1][S3][S7]. Classification therefore combines a scope gate, pathway-specific conditions, evidence level, and visible uncertainty.

Reuse constraints affect implementation. The NLR/NREL data license permits use and copying without a fee but requires the entire notice in copies of the data, credit to DOE/NREL/Alliance, and no implied endorsement [S15]. IPCC permits limited figures or short excerpts for personal, non-commercial use with full acknowledgement, prohibits altered figures, and requires permission for other uses [S16]. V1 should use the NLR/NREL dataset for public structured values, cite and link IPCC, and treat reproduction of IPCC tables or derivative graphics as permission-review work.

## Interpretation contract

### Units and statistics

- All numeric electricity factors below are grams of carbon-dioxide equivalent per kilowatt-hour of electricity generated: `gCO2e/kWh`.
- IPCC notation is `minimum / median / maximum` from Table A.III.2 [S1].
- NLR/NREL notation in this register is `minimum / median / maximum`, transcribed from the `Total Life Cycle` columns of `EF_Table_FINAL.xlsx` in dataset version 1 [S3]. The source also supplies first and third quartiles.
- NLR/NREL values are distributions of published estimates compiled by the LCA Harmonization project and later updates. The downloadable 2021 table is not itself a set of newly harmonized facility factors [S3][S4]. When a cited harmonization study reports an adjusted range, this register labels it **harmonized** explicitly.
- Binary floating-point artifacts in the XLSX are normalized only where the intended value is unambiguous: for example, `1.29999999339838` is recorded as `1.3`. Other source precision is retained in the exact register even when it is too precise for public display.
- Heat, storage, and carrier claims use different boundaries. An electricity factor must never be relabelled as `gCO2e/kWhth`, delivered heat, useful heat, stored energy, or avoided emissions.

### Evidence levels

Evidence level and classification state are separate fields. A record can be `eligible` with only a technology benchmark, but the interface must say that no facility-specific footprint was established.

| Level | Evidence | Permitted claim |
| --- | --- | --- |
| **E0 — none/unusable** | Missing, inaccessible, incompatible, contradicted without a selection rule, or lacking a usable boundary or functional unit. | `unknown`; no lifecycle number. |
| **E1 — technology family** | Authoritative international or national synthesis for a broad technology family, such as IPCC hydropower or NLR/NREL all-PV. | Technology reference range only. Never a facility value. |
| **E2 — subtype/context** | Authoritative synthesis matching a material subtype or context, such as land-based wind, LWR nuclear, HT flash geothermal, or run-of-river hydro. | Subtype reference range with named context. Still not a facility value. |
| **E3 — facility/pathway calculation** | Traceable facility-specific cradle-to-grave calculation with functional unit, system boundary, geography, lifetime, capacity factor, input data, allocation, uncertainty, and source dates. | Facility estimate, labelled calculated and not independently verified. |
| **E4 — reviewed facility/pathway assessment** | E3 plus independent critical review or equivalent verification; material operating emissions use contemporaneous measured data where applicable. | Facility-specific reviewed estimate within its stated validity and boundary. Not “zero carbon.” |

An E3 or E4 assessment does not automatically override a higher-authority exclusion. An excluded fossil pathway remains excluded even if its facility LCA is complete.

## Exact reference ranges

### Main V1 electricity families

The NLR/NREL source counts are references/estimates in the downloadable table. Counts describe the evidence pool, not probability or representativeness.

| V1 technology scope | IPCC min / median / max | NLR/NREL min / median / max | NLR/NREL evidence pool | Evidence level | Critical scope note |
| --- | ---: | ---: | ---: | --- | --- |
| Solar PV — rooftop | `26 / 41 / 60` | Combined PV: `10.9 / 43.4 / 226` | 17 refs / 46 estimates for combined PV | E1; E2 when mounting and module match | IPCC splits rooftop and utility; NLR/NREL combined PV does not prove a rooftop facility value. |
| Solar PV — utility | `18 / 48 / 180` | Combined PV: `10.9 / 43.4 / 226` | 17 / 46 | E1; E2 when mounting and module match | A 2024 NREL U.S. utility-PV study reports `10–36`, but only for six U.S. manufacturing/location cases; it is not a global replacement factor [S9]. |
| Concentrating solar power | `8.8 / 27 / 63` | `11 / 28 / 241` | 10 / 36 | E1 | NLR/NREL combines trough and tower. Fossil hybridization and solar fraction must be known. NREL’s harmonization work set solar fraction to 1 for solar-only comparison [S11]. |
| Onshore/land-based wind | `7 / 11 / 56` | `1.3 / 12.15 / 81` | Included in 69 / 186 for all wind | E2 | NREL’s dedicated harmonization study reduced the published all-wind range `1.7–81` to a harmonized `3.0–45`, with median changing from `12` to `11` [S5]. |
| Offshore wind | `8 / 12 / 35` | `5.281554 / 19.328125 / 43.7` | Subset of 69 / 186 | E2, lower maturity than land-based | NREL Wind Vision reported fewer offshore estimates than land-based estimates; floating wind must not inherit fixed-bottom evidence silently [S5]. |
| Hydropower — all generation | `1 / 24 / 2,200` | `0.574 / 20.5 / 74.8770828326524` | 22 / 149 | E1 | The NLR/NREL pool comes from Hydropower Vision, which excluded biogenic reservoir GHG from its numerical scope. It cannot rebut the IPCC high end [S8]. |
| Geothermal — all electricity | `6 / 38 / 79` | `5.6 / 36.7 / 245.2` | 15 / 35 | E1 | The NLR/NREL pool distinguishes EGS binary, hydrothermal flash, and hydrothermal binary; subtype materially changes the result [S7]. |
| Ocean — tidal and wave evidence base | `5.6 / 17 / 28` | `2 / 8 / 23` | 5 / 10 | E1, sparse | IPCC says very few LCAs existed and its category was based on named wave, tidal turbine, and tidal barrage examples. Do not transfer this range to OTEC, osmotic, or generic “marine” records [S2]. |
| Nuclear fission — LWR evidence | Nuclear family: `3.7 / 12 / 110` | LWR: `3.1 / 13 / 220` | 27 / 99 | E2 for LWR; E0/E1 for unmatched reactor types | NREL’s harmonized LWR study reports median `12`, IQR width `17`, and range width `110`; ore grade, background energy, and LCA method remain influential [S6]. |
| Solid biopower — broad literature pool | Dedicated biomass and crop residues: `130 / 230 / 420` | All biopower: `-1,000 / 52 / 1,300` | 57 (+2) / 276 (+4) | E1 only; insufficient for a facility pass | The source pools mix feedstocks, counterfactuals, allocation, and avoided-emission conventions. Negative values mean avoided-emission accounting, not atmospheric removal [S1][S4]. |

The exact NLR/NREL first-quartile and third-quartile values for implementation are in the source XLSX [S3]. V1 should ingest the original resource and preserve all five statistics rather than copying this Markdown table into code.

### Site-sensitive subtype evidence

| Subtype | NLR/NREL min / Q1 / median / Q3 / max | V1 implication |
| --- | ---: | --- |
| EGS binary geothermal | `16.9 / 27.175 / 31.95 / 47.45 / 79` | Technology can be eligible at E2 when subtype is established; EGS maturity remains visible. |
| Hydrothermal flash geothermal | `15 / 39.4 / 47 / 118.35 / 245.2` | Conditional without facility gas/reinjection evidence. NREL separately found operating-plant CO2 `110 / 119 / 151 / 307.6 / 690.2`, versus LCA operation `9.7 / 34.6 / 73.2 / 118.3 / 240.2` [S7]. |
| Hydrothermal binary geothermal | `5.6 / 5.7675 / 11.25 / 38.5 / 97.2` | Eligible candidate at E2 when closed-loop subtype is established; local operating evidence can still override. |
| Reservoir hydropower, excluding biogenic reservoir GHG | `1.6008 / 5.72132805575 / 12.76 / 21.45 / 42.976094547408` | Never use alone for a reservoir eligibility decision. Add reservoir methane and land-use evidence [S8]. |
| Run-of-river hydropower | `0.574 / 11.2275 / 22.735 / 29.1825 / 74.8770828326524` | Eligible candidate at E2 if it is genuinely run-of-river and not pumped storage. NREL notes a separate small-system pessimistic outlier of about `720` not represented in this table [S8]. |
| Light-water reactor | `3.1 / 7.7 / 13 / 31 / 220` | Eligible candidate at E2. Do not use for non-LWR, fusion, or a specific fuel cycle without matching evidence. |

### Excluded comparators and storage

These rows prevent favourable labels from hiding scope. Their inclusion here does not admit them to V1 clean-generation totals.

| Pathway | IPCC min / median / max | NLR/NREL min / median / max | V1 treatment |
| --- | ---: | ---: | --- |
| Pulverized coal | `740 / 820 / 910` | All coal: `675 / 1,001 / 1,689` | `excluded` |
| Natural-gas combined cycle | `410 / 490 / 650` | Conventional gas: `307 / 486 / 988` | `excluded` |
| Oil generation | Not in Table A.III.2 | `510 / 840 / 1,170` | `excluded` |
| Coal CCS, oxyfuel | `100 / 160 / 200` | — | `excluded` under V1 policy |
| Coal CCS, pulverized coal | `190 / 220 / 250` | — | `excluded` |
| Coal CCS, IGCC | `170 / 200 / 230` | — | `excluded` |
| Gas combined cycle with CCS | `94 / 170 / 340` | NGCC-CCS: `65 / 111 / 245` | `excluded` |
| Biomass co-firing | `620 / 740 / 890` | Broad co-firing pool: `-1,000 / 170 / 1,300` | `excluded`; favourable allocation cannot erase fossil co-firing |
| Pumped-storage hydropower | Not primary generation | `4.50928462709285 / 7.387899543379 / 607.8334` | `excluded` from primary-generation classification; separate storage evidence |
| Lithium-ion battery storage | Not primary generation | `17.6744090756429 / 32.8896216667688 / 82` | Separate storage layer; factor excludes charging-electricity implications unless explicitly included |
| Hydrogen storage | Not primary generation | `23.47 / 37.949854 / 52.83` | Separate storage/carrier layer; only one qualifying reference and estimate in NLR/NREL [S3][S4] |

## V1 four-state baseline

The table gives the baseline only when the stated identity and conditions are evidenced. A newly imported record still starts `unknown` until its technology identity, source observations, and applicable rule are established.

| V1 pathway | Baseline state | Required downgrade or promotion rule |
| --- | --- | --- |
| Solar PV | **eligible** at E1/E2 | `unknown` if technology or generation identity is not established. A named facility receives no exact intensity without E3/E4. |
| CSP | **eligible** only for confirmed solar-only output | `conditional` if hybrid status or solar fraction is unknown. Fossil-attributable generation is `excluded` from clean totals. |
| Solar thermal heat | **conditional** | Promote only with a heat-specific functional unit, boundary, auxiliary energy, storage losses, and facility/pathway evidence. No electricity range may be inherited. |
| Onshore wind | **eligible** at E2 | Emerging airborne systems are `unknown` unless separately evidenced. |
| Offshore wind | **eligible** at E2 | Floating systems remain `conditional` or `unknown` when only fixed-bottom evidence is available. |
| Run-of-river/diversion/conduit hydro | **eligible** at E2 when subtype is established | `conditional` if material impoundment or methane questions remain; `unknown` when subtype is absent. |
| Reservoir hydro | **conditional** | Promote only when reservoir methane, pre-impoundment land carbon, age, climate, flooded area, generation, and relevant construction effects are assessed. |
| Pumped-storage hydro | **excluded** from primary generation | Keep in storage. Never count discharge as primary generation. |
| Hydrothermal binary geothermal | **eligible** at E2 | Downgrade for contrary site emissions or unmatched open-loop operation. |
| EGS binary geothermal | **eligible** candidate at E2 | Display maturity and uncertainty. `unknown` if the facility design does not match the evidence. |
| Hydrothermal flash/dry-steam geothermal | **conditional** | Promote only with facility operating gas data, reinjection/abatement treatment, and a facility lifecycle calculation. |
| Tidal and wave | **eligible** at E1, low evidence strength | Exact facility value requires E3/E4. |
| OTEC, ocean-current, osmotic/salinity-gradient, or unspecified marine | **unknown** | Assess separately; tidal/wave values cannot be inherited. |
| Nuclear LWR | **eligible** at E2 and shown separately from renewable energy | Exact facility value requires matching fuel-cycle, lifetime, capacity factor, construction, and end-of-life evidence. |
| Other fission reactor type | **unknown** unless matching evidence exists | Do not inherit the LWR range solely from the label `nuclear`. |
| Ambient renewable heat | **conditional** | Requires delivered/useful heat boundary, seasonal performance, electricity factor and period, refrigerant leakage, auxiliary energy, climate, and equipment lifecycle. EU renewable accounting requires output to significantly exceed the primary input, but that legal accounting rule is not a lifecycle-emissions certificate [S13]. |
| Recovered heat | **conditional** | Requires the counterfactual, source-process allocation, pumping/distribution inputs, and proof that heat is an otherwise dissipated by-product. EU guidance treats the definition as cumulative conditions; the legal label is not a generic zero-carbon factor [S14]. |
| Sustainable segregated solid biomass residue | **conditional** by design | Promote to `eligible` only with E3/E4 evidence for feedstock, origin, counterfactual, land/soil carbon, regrowth and timing, processing, transport, efficiency, combustion, and uncertainty. Missing inputs produce `conditional` or `unknown`, never eligible. |
| Coal, oil, gas, fossil CCS, biogas/biomethane, dedicated energy crops, deforestation/overharvesting wood, mixed plastic waste, fossil co-firing, liquid biofuels, or a long-distance biomass chain failing the released rule | **excluded** | A favourable external taxonomy or generic LCA does not override the V1 exclusion. |
| Hydrogen, ammonia, synthetic fuels, batteries, thermal storage, and other storage/carriers | **excluded** from primary-source classification | They may appear only in separate carrier/storage layers with their own lifecycle evidence. `Excluded from primary generation` is not a claim that every use is high-carbon. |
| Unmatched technology or unusable/conflicting evidence | **unknown** | Stay out of clean numerators until a versioned assessment resolves it. |

## Rules preventing facility-level overclaim

1. **Never copy a median into a facility field.** Store technology distributions as reference evidence linked to a classification, not as `facility.lifecycle_intensity`.
2. **Always name evidence scope.** Public labels must say `global technology benchmark`, `subtype benchmark`, `regional factor`, `facility calculation`, or `reviewed facility assessment`.
3. **Show range, central statistic, unit, source, and vintage together.** A lone median hides the IPCC hydropower and NLR/NREL biomass tails.
4. **No “zero carbon.”** `eligible` means admissible under V1 lifecycle rules, not zero emissions or absence of non-climate harm.
5. **No cross-functional-unit transfer.** Electricity, useful heat, delivered heat, storage output, fuel mass, and avoided emissions remain distinct.
6. **No range averaging.** IPCC and NLR/NREL observations are not independent samples with compatible boundaries. Store both and explain differences.
7. **No false trend.** A lower value in a newer study does not prove global improvement. The 2024 NREL PV range `10–36` describes selected U.S. cases, not all global utility PV [S9].
8. **Site-sensitive pathways require site evidence.** Reservoir hydro, flash/dry-steam geothermal, biomass, ambient heat, and recovered heat cannot become eligible from a family median alone.
9. **Operational evidence can contradict generic LCA.** NREL’s geothermal review found operating-plant CO2 substantially above the LCA operational distribution. Preserve the conflict and downgrade rather than selecting the favourable source [S7].
10. **Negative estimates are not removals by default.** NREL’s biopower figure labels negative values as avoided emissions, not removal from the atmosphere [S4].
11. **Storage is not generation.** Pumped hydro, batteries, and hydrogen storage factors describe storage-system literature under specific output assumptions; discharge must not enter primary-generation totals [S4][S8].
12. **Every classification is versioned.** Store rule version, source IDs, assessment date, reviewer/process, evidence level, conditions, contrary evidence, and next evidence needed.

### Required public wording

Allowed without facility-specific LCA:

> Eligible under methodology 1.x. Evidence level E2: onshore-wind technology benchmark. IPCC literature range 7–56 gCO2e/kWh; median 11. No facility-specific lifecycle intensity has been established.

Prohibited without E3/E4:

> This facility emits 11 gCO2e/kWh.

Also prohibited:

> Zero-carbon facility. Verified clean. Avoids X tonnes of CO2.

The last claim requires a separately versioned counterfactual calculation with generation, displaced-mix method, period, marginal/average choice, uncertainty, and sources.

## Minimum data contract

Each reference distribution should retain:

`evidence_id`, `source_id`, `source_release`, `resource_version`, `retrieved_at`, `technology_family`, `subtype`, `geographic_scope`, `functional_unit`, `lifecycle_boundary`, `statistic_kind`, `minimum`, `q1`, `median`, `q3`, `maximum`, `sample_reference_count`, `sample_estimate_count`, `harmonization_status`, `material_exclusions`, `license_id`, and `caveat`.

Each record classification should retain:

`classification_state`, `evidence_level`, `basis_evidence_ids`, `contrary_evidence_ids`, `methodology_version`, `decision_date`, `decision_process`, `conditions`, `exclusion_reason`, `uncertainty`, `validity_period`, and `next_evidence_needed`.

No range should be embedded as an unversioned UI constant. Ingest the source resource as a source snapshot, preserve the raw workbook, store the extraction transformation and checksum, and expose the original DOI/source URL where licensing permits.

## Licensing and use constraints

| Source | Verified constraint | V1 action |
| --- | --- | --- |
| NLR/NREL dataset `10.7799/1819907` | The catalog license grants fee-free use/copy, requires the entire notice in all copies of the data, requires DOE/NREL/Alliance credit in resulting publications, prohibits using those names for advertising or endorsement without permission, and supplies the data as-is without warranty [S15]. | Include the exact source notice in the release attribution/third-party-notices bundle and any raw or derived dataset copy; credit the named organizations; retain DOI and dataset version; do not use logos or imply endorsement. |
| NREL/NLR fact sheets and research-hub pages | Research-hub pages state copyright and reserve text/data-mining rights unless an open-access license applies [S9]. The reports are authoritative references, not an automatic open-data grant. | Cite and link. Do not scrape or redistribute page text, PDFs, or figures as product assets unless their specific terms permit it. Use the separately licensed dataset for structured values. |
| IPCC report and Table A.III.2 | IPCC allows personal non-commercial copying and limited figures/short excerpts with full acknowledgement; figures may not be altered; other uses require permission [S16]. | Do not ship the IPCC PDF, table image, or a redrawn derivative figure. Link the report and cite table/page. Treat bulk public transcription or commercial reuse as permission-review. Prefer the NLR/NREL licensed dataset for downloadable values. |
| EU legal definitions | Used here only to define ambient and recovered heat, not to supply lifecycle factors [S13][S14]. | Cite the consolidated act/guidance. Do not convert a legal renewable-accounting definition into an `eligible` lifecycle result. |

This section is implementation guidance, not a legal opinion. The public release gate should record a named license review and the exact notice shipped with each redistributed source-derived dataset.

## Source freshness and URL verification

All URLs below returned a live response on 2026-07-12. The NLR data catalog metadata reported “last updated 2026-05-22,” while resource version history still identified the XLSX as version 1 dated 2021-08-23 [S3]. Treat `2021-08-23` as the data-resource release until a new resource version or checksum proves a content update; do not infer a 2026 scientific update from catalog metadata alone.

The XLSX downloaded on 2026-07-12 was 28,555 bytes with SHA-256 `ef4885c8519ff7fbcb5147842dc0549d7b9955b28eeee23609ad9032a37bd5cb`. A production source snapshot should verify and record its own checksum rather than assuming this research-time hash remains current.

The historic `nrel.gov` document URLs now have equivalent live `docs.nlr.gov` URLs. Use DOI links where available and retain the original publisher name on the cited publication.

## Sources

[S1] IPCC (2014), *Annex III: Technology-specific Cost and Performance Parameters*, Table A.III.2, pp. 1335–1336. https://www.ipcc.ch/site/assets/uploads/2018/02/ipcc_wg3_ar5_annex-iii.pdf

[S2] IPCC (2014), *Annex II: Metrics & Methodology*, §§ A.II.6.3 and A.II.9.3. https://www.ipcc.ch/site/assets/uploads/2018/02/ipcc_wg3_ar5_annex-ii.pdf

[S3] Nicholson, S. and G. Heath (2021), *Life Cycle Emissions Factors for Electricity Generation Technologies*, NLR/NREL Data Catalog, DOI `10.7799/1819907`; resource `EF_Table_FINAL.xlsx`. https://doi.org/10.7799/1819907

[S4] NREL (2021), *Life Cycle Greenhouse Gas Emissions from Electricity Generation: Update*, NREL/FS-6A50-80580. https://docs.nlr.gov/docs/fy21osti/80580.pdf

[S5] Dolan, S. L. and G. A. Heath (2012), “Life Cycle Greenhouse Gas Emissions of Utility-Scale Wind Power: Systematic Review and Harmonization,” *Journal of Industrial Ecology* 16(S1), S136–S154, DOI `10.1111/j.1530-9290.2012.00464.x`. https://research-hub.nlr.gov/en/publications/life-cycle-greenhouse-gas-emissions-of-utility-scale-wind-power-s-4/

[S6] Warner, E. S. and G. A. Heath (2012), “Life Cycle Greenhouse Gas Emissions of Nuclear Electricity Generation: Systematic Review and Harmonization,” *Journal of Industrial Ecology* 16(S1), S73–S92, DOI `10.1111/j.1530-9290.2012.00472.x`. https://research-hub.nlr.gov/en/publications/life-cycle-greenhouse-gas-emissions-of-nuclear-electricity-genera-4/

[S7] Eberle, A., G. Heath, S. Nicholson, and A. Carpenter (2017), *Systematic Review of Life Cycle Greenhouse Gas Emissions from Geothermal Electricity*, NREL/TP-6A20-68474, DOI `10.2172/1398245`. https://docs.nlr.gov/docs/fy17osti/68474.pdf

[S8] U.S. Department of Energy (2016), *Hydropower Vision Report Appendices*, Appendix G. https://www.energy.gov/sites/prod/files/2016/10/f33/Hydropower-Vision-Appendices-10212016.pdf

[S9] Smith, B., A. Sekar, H. Mirletz, G. Heath, and R. Margolis (2024), *An Updated Life Cycle Assessment of Utility-Scale Solar Photovoltaic Systems Installed in the United States*, NREL/TP-7A40-87372, DOI `10.2172/2331420`. https://www.nlr.gov/docs/fy24osti/87372.pdf

[S10] NREL (2013), *Life Cycle Greenhouse Gas Emissions from Solar Photovoltaics*, NREL/FS-6A20-56487. https://docs.nlr.gov/docs/fy13osti/56487.pdf

[S11] NREL (2012), *Life Cycle Greenhouse Gas Emissions from Concentrating Solar Power*, NREL/FS-6A20-56416. https://docs.nlr.gov/docs/fy13osti/56416.pdf

[S12] IPCC (2022), *Climate Change 2022: Mitigation of Climate Change*, Chapter 6: Energy Systems. https://www.ipcc.ch/report/ar6/wg3/chapter/chapter-6/

[S13] European Union, consolidated Directive (EU) 2018/2001, Article 2 and renewable heat-pump accounting provisions. https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=consolidation%3A2018L2001%2F20240606_0030010

[S14] European Commission (2025), *Guidance on heating and cooling aspects in Articles 15a, 22a, 23 and 24 of Directive (EU) 2018/2001*, section 2. https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A52025XC02238

[S15] NLR Data Catalog, *Dataset License* for submission 171. https://data.nlr.gov/node/171/license

[S16] IPCC, *Copyright*, retrieved 2026-07-12. https://www.ipcc.ch/copyright/

## Research method and remaining gaps

This register used primary assessment reports, government/laboratory datasets and reports, peer-reviewed harmonization records hosted by the producing laboratory, primary EU legal text, and source-owner license pages. Exact IPCC triples were checked against Table A.III.2. NLR/NREL values and evidence counts were checked against the live downloadable XLSX, not copied from secondary charts. The current source URLs and DOI redirects were checked on 2026-07-12.

No defensible generic cross-jurisdiction lifecycle range was found in the two anchor datasets for solar thermal heat, ambient renewable heat, or recovered heat. That is a finding, not a hole to fill with electricity numbers. These pathways remain conditional until a heat-specific evidence register is built with compatible delivered/useful-heat functional units, auxiliary electricity, refrigerants where applicable, counterfactual allocation, and jurisdiction-appropriate factors.

The next research release should add authoritative regional electricity and heat factors only after license review, beginning with the first verified geography. It should also add facility-level methane methods for reservoirs, current geothermal operating-emissions protocols, and a biomass-residue decision template. None of those gaps justifies weakening the V1 states or inventing a facility value.
