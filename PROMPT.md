# Clean Energy Map — Master Build Prompt

Build and continuously improve **Global Clean Energy Atlas**: a production-quality, map-first web application documenting the world's clean electricity generation and energy-storage infrastructure.

Use **Next.js, TypeScript, Tailwind CSS, shadcn/ui**, and a reliable interactive mapping library such as MapLibre GL. Keep the application maintainable, tested, accessible, performant, deployable as a ChatGPT Site, and excellent on both desktop and a **390 px mobile viewport**.

## Product goal

Create a trustworthy global reference for discovering, comparing, and verifying clean-energy facilities. The map must help users understand what exists, where it is, how much capacity it represents, who operates it, its lifecycle state, and how strong the underlying evidence is.

The long-term public-interest mission is to help any citizen, community, institution, public authority, foundation, cooperative, or professional organization understand where capital is genuinely needed and how it can support clean-energy projects that create durable climate and societal value rather than greenwashing. The product should progressively connect verified physical infrastructure, real financing needs, available funding mechanisms, project accountability, expected impact, and observed outcomes.

Do not reduce this mission to a generic investment marketplace or a promotional list of “green” products. The atlas must help users distinguish projects that merely carry a sustainability label from projects supported by verifiable evidence of lifecycle climate benefit, additionality, credible delivery, responsible governance, and positive long-term contribution to society and the planet.

Use a strict **“clean in lifecycle CO₂ terms”** scope. A technology qualifies only when credible lifecycle evidence indicates low greenhouse-gas emissions across raw-material extraction, construction, operation, maintenance, decommissioning, and end-of-life. Zero emissions at the point of operation are not sufficient by themselves.

The product must never imply that its database is exhaustive when coverage is incomplete. Prefer verified, traceable records over impressive-looking counts.

## Infrastructure scope

Cover facilities using these separately identifiable main categories:

- Solar Photovoltaic
- Concentrated Solar Power
- Solar Thermal Energy
- Onshore Wind
- Offshore Wind
- Hydropower, including run-of-river and reservoir plants
- Geothermal Energy
- Marine/Ocean Energy, including tidal and wave power
- Nuclear Fission
- Ambient Renewable Heat
- Recovered Heat

Treat **Sustainable Solid Biomass Residues** as a conditional category, never as clean by default. It may include sustainably sourced sawmill residues, forestry residues, straw, bagasse, husks, shells, and unavoidable solid organic waste only when credible evidence supports a low lifecycle-carbon footprint. Evaluate regrowth, soil-carbon changes, land-use effects, transport, processing, combustion emissions, and the time required to reabsorb emitted CO₂. Preserve the feedstock, origin, supply radius, certification or sustainability evidence, lifecycle assessment, and uncertainty for every included biomass facility.

Exclude the following from clean-generation and clean-heat categories:

- Natural gas, coal, and oil
- Fossil-fuel power with carbon capture and storage
- Biogas and biomethane
- Dedicated energy crops
- Wood linked to deforestation or forest overharvesting
- Mixed waste containing plastics
- Biomass co-fired with fossil fuels
- Liquid biofuels
- Long-distance biomass supply chains

Do not classify hydrogen, ammonia, synthetic fuels, batteries, or pumped-storage hydropower as primary energy sources. They are energy carriers or storage technologies. When useful, show them only in clearly separate map layers, filters, statistics, and legends that cannot be confused with primary generation or heat sources.

The optional storage layer may cover:

- Grid-scale batteries
- Pumped-storage hydropower
- Thermal energy storage
- Hydrogen storage when it is demonstrably associated with clean electricity generation or grid storage
- Other utility-scale storage technologies, clearly classified

Keep renewable electricity, renewable heat, recovered heat, nuclear generation, conditional biomass, energy carriers, and storage visibly separate in filters, statistics, legends, and coverage reporting. Never add electrical generation capacity, thermal capacity, storage power, and storage energy into a single total. Do not expand the initial product into a general transmission-grid, fossil-fuel, carbon-capture, data-center, or connectivity atlas.

## Geographic coverage

Design for worldwide coverage from the start. Support navigation by:

- World
- Continent and major region
- Country
- First-level administrative region where reliable data permits
- Map viewport

Do not claim simultaneous global completeness. Track and display coverage status for every geography and technology as **complete, substantial, partial, sparse, not assessed, or unavailable**, with a short explanation of the evidence behind that assessment.

Geography selection must update the map, statistics, search results, filters, coverage information, and URL. URLs must preserve enough state to share the selected geography, map position, active filters, view, and inspected facility.

## Country and regional energy-mix indicators

For every country, and for subnational regions when authoritative comparable data exists, provide a dated energy-profile panel. Keep these indicators distinct:

- **Clean share of electricity generation** = verified clean electricity generated during the reporting period divided by total electricity generated during the same period
- **Clean share of installed electrical capacity** = verified clean generating capacity divided by total generating capacity at the same reference date
- **Clean share of total energy supply or final energy consumption** only when a source publishes a methodologically comparable national energy balance
- Technology-level shares for solar, wind, hydropower, geothermal, marine, nuclear, qualifying biomass, and other eligible categories
- Storage, imports, exports, transmission losses, and curtailment as separate contextual indicators, never as primary generation

Every percentage must display its numerator, denominator, unit, reporting year or period, geographic scope, source, source release, verification date, and formula. State whether the denominator is electricity generation, installed electrical capacity, total energy supply, or final energy consumption. Never label an electricity-generation share as the broader “energy mix.”

Do not derive a country's energy-mix share by summing mapped facilities unless facility coverage is proven complete and measured generation data is available for the same period. Prefer authoritative national energy balances and internationally harmonized datasets. If multiple sources disagree, show the selected source, selection rule, alternative values, and uncertainty.

Define the treatment of imports and exports explicitly. By default, production-based electricity shares use domestic generation and exclude imported electricity from the numerator and denominator; consumption-based indicators must be labeled separately. Exclude storage discharge from primary-generation totals to avoid double counting. Treat qualifying biomass according to the lifecycle rules in this prompt, and publish any gap between the atlas definition and the source dataset's broader “renewable” definition.

Allow users to compare countries only when definitions, periods, and units are compatible. Disable or visibly qualify rankings based on incomplete or non-comparable inputs.

## Lifecycle model

Track lifecycle states as distinct values:

- Operating
- Under construction
- Approved
- Permitted
- Proposed
- Suspended
- Cancelled
- Retired
- Unknown

Never infer that a facility is operating merely because its planned completion date has passed. Preserve both the reported target date and the evidence-backed lifecycle state.

## Record and provenance requirements

For every facility or storage site, preserve whenever available:

- Stable internal identifier
- Official and alternate names
- Facility type and technology subtype
- Generation or storage classification
- Installed, planned, and retired capacity, with units
- Annual generation where reported, with year and units
- Storage power and energy capacity, recorded separately
- Operator and owner, with effective dates where known
- Lifecycle state and state date
- Commissioning, construction, approval, retirement, and target dates
- Country and administrative regions
- Coordinates or geometry
- Geometry type: point, polygon, or unplotted
- Location evidence and geocoding method
- Positional precision
- Confidence level
- Source links
- Source publisher and document title
- Source publication or observation date
- Date the source was accessed
- Date the record was last verified
- Conflicts, uncertainty, and reviewer notes

Represent capacity values as structured numeric fields, not presentation strings. Preserve the original reported value and unit alongside normalized values. Calculate all displayed totals and breakdowns from the database after applying the current filters.

Every important claim shown to users must be traceable to at least one source. A record may have multiple sources, and conflicting sources must remain visible rather than being silently overwritten.

## Finance-ready domain model

Design the data model and product boundaries from the beginning so that project-finance, corporate-finance, public-finance, and investment databases can be connected later without restructuring the core atlas.

Do not attach a single free-text “financed by” field to a facility. Model the financial domain as normalized, time-aware, source-backed entities and relationships:

- **Facility**: the physical generating, heat, carrier, or storage asset shown on the map
- **Project**: the development or commercial undertaking, which may contain one or many facilities or phases
- **Project phase**: a separately financed construction stage, unit, expansion, repowering, or portfolio allocation
- **Organization**: developer, sponsor, shareholder, lender, arranger, underwriter, guarantor, insurer, export-credit agency, public authority, grant provider, fund, asset manager, contractor, or offtaker
- **Legal entity or special-purpose vehicle**: the borrower, issuer, owner, holding company, joint venture, or project company, with jurisdiction and identifiers
- **Organization relationship**: parent, subsidiary, managed-by, beneficial-owner, joint-venture, or successor relationship, with effective dates and evidence
- **Financing transaction**: a dated financing event connected to the exact project, phase, facility, portfolio, company, or SPV it finances
- **Instrument or tranche**: project loan, corporate loan, bond, green bond, tax equity, common equity, preferred equity, grant, subsidy, guarantee, insurance, export credit, development-finance participation, lease, securitization, refinancing, or other classified instrument
- **Transaction participation**: the exact role of each organization in each transaction or tranche
- **Financial allocation**: an explicitly sourced amount assigned from a portfolio-level transaction to a project, phase, or facility
- **Source observation**: the evidence supporting every financial field and relationship

For financial records, preserve whenever available:

- Stable identifiers and external database identifiers
- Announcement, signing, financial-close, first-disbursement, maturity, refinancing, cancellation, and repayment dates
- Transaction status: rumored, announced, mandated, signed, closed, partially disbursed, fully disbursed, refinanced, cancelled, repaid, defaulted, or unknown
- Original amount and currency
- Committed, drawn, outstanding, repaid, and allocated amounts as separate values
- Instrument type, tranche, seniority, security, tenor, maturity, interest-rate type, reported pricing, and use of proceeds
- Equity stake or ownership percentage, including direct versus beneficial ownership
- Investor, lender, sponsor, arranger, underwriter, guarantor, insurer, public-funder, and offtaker roles
- Recipient, borrower, issuer, project company, and ultimate parent
- Public support, grants, subsidies, guarantees, tax credits, and concessional terms
- Whether financing is project-specific, phase-specific, facility-specific, corporate, or portfolio-level
- Allocation method and allocation confidence
- Applicable sustainability label, taxonomy, framework, or certification
- Source links, source dates, access dates, verification dates, confidence, conflicts, and uncertainty

Store original currencies and reported amounts without alteration. If normalized currency values are displayed, preserve the exchange-rate source, rate date, conversion method, and resulting value. Never compare or total nominal amounts across currencies or years without an explicit, reproducible normalization method.

One facility may have multiple projects, phases, owners, financings, refinancings, and financial participants over time. One transaction may finance multiple facilities or an entire corporate or portfolio scope. Never attribute the full value of a portfolio or corporate financing to an individual facility unless a reliable source provides that allocation. Keep unallocated financing visible at its true scope.

Prepare versioned connector interfaces for future licensed and open financial datasets. Each connector must map external identifiers to internal entities, preserve the provider's raw records, licensing constraints, update timestamps, and field-level provenance, and produce reviewable match candidates rather than silently merging organizations, projects, or transactions.

Treat commercially licensed, confidential, paywalled, or personally sensitive financial information according to its access and redistribution terms. The public product must expose only fields that may legally be displayed, while retaining source metadata and access controls where required.

Distinguish financial attribution levels in the product and data model:

- **Direct project finance**: evidence explicitly connects a transaction or tranche to a project, phase, or facility
- **Portfolio finance**: evidence covers a named group of projects, with facility allocations shown only when published or reproducibly calculated
- **Corporate finance**: funding is provided to a company and must not be described as financing a specific facility
- **Company exposure estimate**: an analytical allocation of corporate financing based on a published segment or activity adjuster, clearly labeled as an estimate rather than a traced flow of funds

If company exposure estimates are provided, publish the formula, input period, company perimeter, activity denominator, eligible clean-energy numerator, treatment of subsidiaries and joint ventures, ownership dates, and uncertainty. Preserve the unadjusted transaction amount alongside the adjusted estimate. Never use an opaque allocation factor, and never present adjusted corporate exposure as direct project finance.

Avoid double counting syndicated transactions, bond or equity underwriting, refinancings, tranches, co-financing, and repeated observations from multiple providers. Document whether league-table amounts are credited in full, pro rata, or by another rule. Keep commitments, underwriting, disbursements, holdings, and outstanding exposure analytically separate.

## Public-interest capital guidance and anti-greenwashing

Design the future product to answer four separate questions without conflating them:

1. **Is the project genuinely clean?** Assess lifecycle greenhouse-gas emissions, technology eligibility, supply-chain impacts, land and water impacts, biodiversity, circularity, decommissioning, and material unresolved harms.
2. **Is additional capital genuinely needed?** Identify the remaining financing gap, intended use of proceeds, project phase, funding deadline, existing commitments, subsidies, and whether new funding would be additional or merely replace already secured capital.
3. **Is the project likely to create durable public value?** Assess expected avoided emissions, system value, energy access, resilience, local benefits, community participation, employment quality, affordability, governance, human-rights safeguards, and alignment with a credible transition pathway.
4. **What are the financial conditions and risks?** Present instrument type, eligibility, liquidity, term, expected return only when evidenced, downside risks, fees, guarantees, currency exposure, counterparty risk, construction risk, regulatory risk, and the possibility of partial or total capital loss.

Keep **sustainability value**, **financing need**, **project quality**, and **financial return or risk** as separate dimensions. Never infer financial profitability from climate benefit. Never infer sustainability from a green label, taxonomy alignment, marketing claim, expected return, or third-party score alone.

For every project-level funding opportunity, preserve and expose whenever legally available:

- Exact project, phase, facility, SPV, issuer, and ultimate beneficial owners
- Capital sought, capital already committed, remaining verified funding gap, currency, deadline, and minimum participation
- Instrument, legal structure, investor eligibility, jurisdiction, platform or intermediary, fees, liquidity, maturity, security, guarantees, and seniority
- Detailed use of proceeds and controls preventing diversion to excluded activities
- Financial model assumptions and whether they are audited, independently reviewed, management-provided, estimated, or unavailable
- Expected climate and social outcomes, baseline, counterfactual, additionality claim, time horizon, measurement method, and responsible verifier
- Actual post-financing outcomes compared with forecasts
- Permits, offtake agreements, construction contracts, grid connection, community consultation, litigation, controversies, sanctions, and material dependencies
- Conflicts of interest, related-party transactions, commissions, referral fees, sponsorship, and paid placement
- Source evidence, verification status, last review date, uncertainty, and reasons for inclusion or exclusion

Create an explicit, versioned **anti-greenwashing assessment**. It must use transparent evidence gates before any project can be shown as a credible funding candidate:

- Passes the lifecycle-CO₂ eligibility rules
- Contains no excluded fuel, feedstock, activity, or fossil cross-subsidy hidden in the financing perimeter
- Has a traceable use of proceeds
- Has identifiable accountable legal entities and beneficial owners
- Has credible permits, delivery pathway, and project status
- Publishes material environmental and social risks rather than hiding them
- Provides a measurable impact baseline and post-financing monitoring plan
- States additionality and the verified financing gap
- Discloses conflicts, fees, incentives, and commercial relationships
- Has no unresolved evidence failure severe enough to make the sustainability claim misleading

Display failed, unknown, and not-assessed criteria as prominently as passed criteria. Never convert missing evidence into a positive score. Do not create one opaque composite score. Show the underlying dimensions, evidence, weights if any, sensitivity, and methodology version.

Any project ranking or recommendation must be reproducible, user-controllable, and separated by objective, such as highest verified climate additionality, greatest financing need, strongest community benefit, highest evidence quality, or a user-defined risk profile. Never allow payment, sponsorship, referral revenue, commercial partnership, or data-provider preference to improve ranking or verification status.

Make clear that the atlas provides evidence and decision support, not personalized financial advice, a guarantee of impact, or a guarantee of return. Where regulated investments are displayed, show jurisdiction, investor eligibility, legal documentation, risk warnings, and the regulated intermediary responsible for the offering. Do not enable money movement until identity, compliance, consumer-protection, suitability, licensing, custody, and payment responsibilities are explicitly designed and legally validated for each jurisdiction.

Track outcomes after funding. Compare promised and realized construction progress, capacity, generation, lifecycle emissions, avoided emissions, local benefits, use of proceeds, repayments, defaults, and controversies. A project cannot retain a strong sustainability assessment solely because its pre-financing documents were convincing.

## Public methodology and auditability

Make verification a first-class product surface, inspired by the open, collaborative, and regularly updated methodology model used by CarbonBombs.org. Publish a dedicated methodology area covering both energy and finance. It must be understandable to a general reader and precise enough for an independent analyst to reproduce every published metric.

Publish versioned methodology documents for:

- Scope and lifecycle-CO₂ eligibility rules for every technology
- Conditional biomass inclusion and exclusion decisions
- Facility, project, phase, company, legal-entity, and transaction definitions
- Source hierarchy and source-selection rules
- Ingestion, normalization, unit conversion, and entity-resolution procedures
- Duplicate reconciliation and conflict-handling rules
- Location precision and mapping rules
- Lifecycle-status mappings from every source
- Energy production, capacity, storage, heat, and country-mix formulas
- Currency conversion, inflation adjustment, transaction attribution, segment adjustment, and financial aggregation
- Coverage assessment and confidence scoring
- Update schedules, correction procedures, known limitations, and licensing constraints

For every derived value, preserve a machine-readable calculation record containing the formula version, input record identifiers, input values, units, transformations, result, execution timestamp, and software or pipeline version. A user must be able to move from a headline statistic to its constituent records, then to field-level observations and original sources.

Create a visible **How this number was calculated** action for country shares, global totals, project metrics, company metrics, and financial totals. Show included and excluded records, applied filters, formula, reference period, and downloadable supporting data.

Provide versioned dataset releases, a data dictionary, machine-readable schemas, methodology version, release date, source snapshot dates, change log, and reproducible build identifier. Offer downloads in practical open formats when licensing permits. For restricted inputs, publish the derived methodology, permitted outputs, provenance metadata, and enough aggregate evidence to understand the result without redistributing protected data.

Maintain a public limitations register. State source freshness, geographic and technological gaps, unmatched entities, unresolved ownership chains, unavailable transaction allocations, estimated values, incompatible reporting periods, and known discrepancies. Treat published values as evidence-backed estimates where appropriate, not absolute truth.

Support a documented correction and contribution workflow. Every accepted correction must cite reliable evidence, retain the previous value in history, identify the methodology and dataset release affected, and pass the same validation rules as automated imports. Never make silent manual corrections only in the user interface.

## Source policy

Prefer authoritative, recent sources in this order:

1. Government agencies, energy ministries, regulators, and permit databases
2. Transmission system operators, independent system operators, utilities, and market operators
3. International public institutions and well-documented open datasets
4. Official facility, operator, owner, and developer disclosures
5. Environmental assessments, planning documents, and regulatory filings
6. High-quality research institutions and industry datasets
7. Reputable journalism only when primary evidence is unavailable

Do not use search-result snippets, unsourced aggregators, or generated text as evidence. Preserve source licensing and attribution requirements. Record when a source covers only a subset of facilities or technologies.

## Map integrity

Map accuracy is critical.

- Never invent coordinates.
- Never place a facility at a city center, postal-code centroid, administrative centroid, company office, or unrelated site merely to make it appear on the map.
- Use points only for sites supported by reliable location evidence.
- Use polygons for verified facility footprints, reservoirs, offshore lease areas, or large project areas when suitable geometry is available.
- Store the geometry's evidence, precision, and confidence separately from general record confidence.
- Keep facilities with unreliable locations searchable and included in appropriate totals, but label them clearly as **Unplotted**.
- Distinguish exact site locations, approximate project areas, and locality-only evidence visually and textually.
- Never convert locality-only evidence into a precise point.

Cluster dense point data without hiding the underlying record count. Make cluster totals respond correctly to active filters and zoom level.

## Core experience

Make the interactive map the dominant full-screen canvas. Keep it pannable and zoomable while users search, filter, compare statistics, or inspect a facility.

Provide:

- Compact global search for facilities, operators, owners, technologies, countries, and regions
- Fast filters for technology, generation versus storage, lifecycle, capacity range, geography, verification freshness, precision, and confidence
- Technology views for All, Solar PV, Concentrated Solar Power, Solar Thermal, Onshore Wind, Offshore Wind, Hydropower, Geothermal, Marine/Ocean, Nuclear, Ambient Renewable Heat, Recovered Heat, Conditional Biomass, Energy Carriers, and Storage
- Marker clustering and understandable map legends
- Statistics for record count, mapped count, unplotted count, capacity, lifecycle, and technology mix
- A facility inspector with provenance, dates, confidence, uncertainty, and direct source links
- A coverage panel explaining what the current view does and does not contain
- A source ledger searchable by publisher, geography, dataset, technology, and freshness
- A future-compatible finance inspector capable of showing verified sponsors, owners, lenders, investors, public support, transactions, instruments, allocations, and changes over time without replacing the facility inspector
- A future funding-opportunity view that separates verified sustainability value, additionality, remaining financing need, evidence quality, financial conditions, and risk
- Transparent anti-greenwashing assessments with passed, failed, unknown, and not-assessed evidence gates
- Country and regional profiles showing clean shares of electricity generation, installed electrical capacity, and broader energy supply or consumption only when definitions are explicit and comparable
- Methodology, limitations, dataset-download, change-log, and “How this number was calculated” surfaces
- Clear loading, empty, partial-data, offline, and error states
- Shareable URLs and browser navigation that restore application state

Use a side drawer for facility details on desktop and a bottom sheet on mobile. Do not navigate away from the map to inspect a facility. Selecting a facility may pan or zoom the map only when this improves context and does not obscure the selected geometry.

## Visual direction

Take functional inspiration from Power Atlas's map-first composition, compact floating controls, geographic navigation, statistics panel, system lenses, and detail drawers, but create an original identity and component design.

Use a restrained editorial aesthetic:

- Calm neutral basemap
- High-contrast, color-blind-conscious technology palette
- Separate visual encoding for lifecycle and confidence
- Compact floating panels with strong hierarchy
- Minimal chrome and generous map space
- Clear typography and readable numeric formatting
- Smooth, restrained transitions that never delay interaction
- Visible keyboard focus and WCAG-conscious contrast

Avoid decorative dashboards, excessive gradients, glass effects that reduce readability, and visualizations unsupported by the data.

## Responsive behavior

At a 390 px viewport:

- Keep the map usable and visible behind controls.
- Collapse geography navigation into a compact selector.
- Present filters and details as bottom sheets.
- Prevent horizontal page overflow.
- Keep primary actions reachable without precision tapping.
- Respect mobile safe areas.
- Ensure search, map controls, legends, and sheets do not cover one another.

On desktop, use compact floating panels and drawers without shrinking the map into a secondary content area.

## Data architecture and pipeline

Build a durable, repeatable ingestion pipeline rather than hand-maintaining presentation data.

- Define typed schemas for facilities, projects, project phases, geometries, organizations, legal entities, organization relationships, capacities, lifecycle events, financing transactions, instruments, tranches, participations, allocations, sources, source observations, and coverage assessments.
- Define future-compatible schemas for funding opportunities, financing gaps, use-of-proceeds controls, impact baselines, additionality claims, risk disclosures, eligibility rules, conflicts of interest, anti-greenwashing assessments, assessment criteria, outcome observations, and realized-versus-forecast comparisons.
- Define typed, versioned schemas for country energy balances, mix indicators, indicator inputs, formulas, calculation runs, methodology releases, limitations, and dataset releases.
- Keep raw source data immutable and separate from normalized records.
- Normalize names, units, technologies, organizations, dates, lifecycle states, and geography identifiers.
- Reconcile duplicates using documented rules and reviewable match evidence.
- Resolve facilities, projects, legal entities, organizations, and external financial records independently; never treat similar names as sufficient proof of identity.
- Preserve source disagreements and field-level provenance.
- Validate coordinate ranges, geometry validity, units, dates, required fields, and relational integrity.
- Detect improbable capacity values, duplicate geometries, conflicting lifecycle states, stale records, and missing attribution.
- Make imports idempotent and produce a human-readable change report.
- Never delete a record solely because it disappears from a later source; investigate and preserve its history.
- Support manual review decisions without losing the original observations.

Choose storage and database technology appropriate for geospatial queries and the deployment environment. Keep the web interface independent from individual source formats.

## Transparency rules

- Never describe partial coverage as complete.
- Never display totals that include records excluded by the visible filters.
- Never hide unplotted records from coverage totals; show mapped and unplotted counts separately.
- Never merge generation capacity and storage energy capacity into one number.
- Never combine electrical capacity, thermal capacity, storage power, or storage energy into one number.
- Never label biomass as clean without facility-specific evidence covering feedstock, sourcing, land-use and soil-carbon effects, transport, processing, carbon payback time, and uncertainty.
- Never classify hydrogen, ammonia, synthetic fuels, batteries, or pumped-storage hydropower as primary energy sources.
- Never include an excluded fuel or feedstock in clean-energy totals, even when it is marketed as renewable or paired with carbon capture.
- Never combine renewable and nuclear statistics without also offering separate totals.
- Clearly label estimates, approximate values, stale verification, unresolved conflicts, and unknown fields.
- Show the last data update and last verification date separately.

## Quality gates

For every release, run and pass:

- Production build
- Type checking and linting
- Unit and integration tests
- Schema and data-integrity tests
- Import idempotency tests
- Duplicate-detection tests
- Financial entity-resolution, transaction-scope, allocation, currency, and temporal-relationship tests
- Anti-greenwashing evidence-gate, missing-evidence, ranking-independence, conflict-of-interest, funding-gap, and realized-outcome tests
- Country energy-mix denominator, reporting-period, import/export, storage double-counting, and cross-source comparability tests
- Derived-value reproducibility and calculation-lineage tests
- Capacity aggregation tests
- Search, filter, URL-state, and facility-inspector tests
- Map interaction and clustering checks
- Keyboard and accessibility checks
- Desktop visual verification
- 390 px mobile visual verification
- Horizontal and vertical overflow checks
- Browser-console error checks
- Live production smoke verification

Test explicitly that:

- Filtered totals equal the visible dataset selection.
- Mapped plus unplotted counts equal the matching record count.
- Electrical generation MW, thermal MW, storage MW, and storage MWh remain separate.
- Excluded fuels and feedstocks never appear in clean-energy totals.
- Conditional biomass appears only when its facility-specific lifecycle and sourcing evidence passes the defined inclusion rules.
- Energy carriers and storage technologies never appear in primary-energy-source totals.
- Portfolio or corporate financing is never presented as facility-level financing without an evidenced allocation.
- Financial totals preserve currency, date basis, transaction scope, and committed-versus-disbursed meaning.
- Ownership and financing roles display their effective dates and source evidence.
- Every country-level percentage exposes a reproducible numerator, denominator, period, definition, and source.
- Electricity generation, electrical capacity, total energy supply, and final energy consumption are never mislabeled or merged.
- Every headline energy or finance figure can be traced through calculation inputs to original source observations.
- Dataset, methodology, source freshness, corrections, limitations, and change history are publicly visible.
- No project is presented as a credible funding candidate without passing the published evidence gates; unknown or failed criteria remain visible.
- Sustainability benefit, additionality, financing need, evidence quality, financial return, and financial risk remain separate and independently sourced.
- Paid placement, sponsorship, commissions, or partnerships can never influence methodology, ranking, verification status, or inclusion claims.
- Selecting a geography updates all dependent surfaces and the URL.
- Reloading a shared URL restores the same state.
- A facility with uncertain coordinates is searchable but not plotted.
- Source links, dates, and uncertainty appear in the inspector.
- Clusters update after filters change.
- Drawers and bottom sheets do not disable map navigation unnecessarily.
- The interface works without overflow at 390 px.

## Autonomous working method

Work autonomously while meaningful improvements remain. Repeatedly:

1. Audit current geographic, technological, and lifecycle coverage.
2. Identify the highest-impact evidence or product gap.
3. Research recent authoritative sources.
4. Import and preserve raw observations.
5. Normalize, reconcile, and validate records.
6. Review location evidence before plotting anything.
7. Run data and product quality gates.
8. Verify the deployed experience on desktop and mobile.
9. Commit a durable checkpoint with a concise English message.
10. Publish only verified releases, then continue with the next highest-impact gap.

Do not optimize for record count. Optimize for correctness, provenance, transparency, useful coverage, maintainability, and map accuracy. When evidence is incomplete, preserve and expose the uncertainty instead of guessing.

## Definition of done

The product is successful when users can navigate the world smoothly, find and inspect clean-energy facilities, understand the limits of coverage, verify every important claim from its sources, distinguish renewable generation from nuclear and storage, and trust that no location or total was invented. In its mature form, it must also help citizens and organizations identify where capital is genuinely needed, evaluate which projects offer credible and additional sustainability value, understand the associated financial conditions and risks, and avoid greenwashing without confusing public-interest guidance with guaranteed impact or personalized investment advice.

There must be no untraceable headline numbers, no guessed map positions, no hidden uncertainty, no inconsistent filtered totals, and no broken desktop or 390 px mobile experience.
