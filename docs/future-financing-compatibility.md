# Future-Financing Compatibility Constraints

Status: normative compatibility contract; finance behavior is deferred  
Version: 1.0.0  
Last reviewed: 2026-07-12  
Applies now: V1 structural foundation and interface prohibition  
Activates later: V2 financing behavior; V3 capital guidance

## Boundary

V1 is **financing-ready and financing-free**.

V1 MUST preserve the identities, histories, evidence, and relationship boundaries needed by V2 and V3. V1 MUST NOT expose financing transactions, funding opportunities, investment rankings, capital recommendations, personalized financial advice, or money movement.

No placeholder finance panel, “coming soon” investment card, empty financing total, inferred lender, or generic `financed_by` field is allowed in V1.

Future compatibility MUST NOT delay a geography’s V1 release unless a V1 energy claim itself depends on ownership or organizational evidence. Known, source-backed ownership may ship; absent financing data is not a V1 gap.

## Required V1 foundation

V1 MUST implement stable, separately identified, time-aware concepts for:

| Concept | Stable meaning |
| --- | --- |
| **Facility** | A physical generating, heat, carrier, or storage asset. |
| **Project** | A development or commercial undertaking that may contain one or many facilities or phases. |
| **Project phase** | A construction stage, unit, expansion, repowering, or portfolio allocation boundary. |
| **Organization** | A public, private, cooperative, nonprofit, or other actor with a role supported by evidence. |
| **Legal entity / SPV** | The legally identified owner, borrower, issuer, project company, holding company, or joint venture; not interchangeable with a brand. |
| **Organization relationship** | Parent, subsidiary, managed-by, beneficial-owner, joint-venture, successor, or other typed relationship with effective dates and evidence. |
| **Ownership interest** | A direct or beneficial interest with percentage or unknown share, role, effective dates, and evidence. |
| **Jurisdiction** | Physical, incorporation, regulatory, permitting, or other explicitly typed jurisdiction. |
| **Source observation** | Evidence for every identity, field, relationship, or date. |
| **Methodology and dataset release** | The versioned meaning and published state used by the evidence. |

V1 relationships MUST support one-to-many and many-to-many history. One facility may participate in multiple projects and phases. Projects and owners may change. Similar names never prove identity. Do not collapse a project, facility, operator, owner, corporate parent, and legal borrower into one record.

The organization-role vocabulary must be extensible without changing organization identity. It MUST be able to distinguish developer, sponsor, shareholder, lender, arranger, underwriter, guarantor, insurer, export-credit agency, public authority, grant provider, fund, asset manager, contractor, and offtaker roles.

Organization and legal-entity identity preserves, when available, official and alternate names, registry or external identifiers, entity type, incorporation or governing jurisdiction, predecessor/successor history, and effective dates. A public brand is not used as a substitute for the evidenced legal entity.

The V1 foundation MUST NOT require a financial transaction row, financing role, monetary amount, or opportunity assessment to represent a physical facility.

## Compatibility invariants

- Stable V1 identifiers survive later finance ingestion; aliases and external identifiers attach without replacing them.
- Facility, project, phase, organization, and legal-entity resolution remain independent.
- Ownership and organization relationships preserve effective dates and observations.
- Future finance links target the exact known scope; they never rely on free text or visual proximity.
- Raw provider data remains separate from normalized entities.
- Match candidates remain reviewable; no connector silently merges an organization, project, facility, or transaction.
- V2/V3 additions use versioned migrations and preserve V1 release reproducibility.
- A future methodology change cannot retroactively alter a V1 entity without a recorded migration, evidence decision, and change history.

## V2 — Financing Atlas extension

V2 may activate only after V1 evidence foundations are stable enough that financing can attach without changing their meanings. V2 adds source-backed financing evidence; it does not yet imply that a project needs capital or merits a recommendation.

### Finance entities

The typed, time-aware extension MUST include:

| Entity | Required meaning |
| --- | --- |
| **Financing transaction** | A dated event connected to the exact project, phase, facility, portfolio, organization, or SPV it finances. |
| **Instrument / tranche** | A project loan, corporate loan, bond, green bond, tax equity, common or preferred equity, grant, subsidy, guarantee, insurance, export credit, development-finance participation, lease, securitization, refinancing, or classified other instrument. |
| **Transaction participation** | The exact role of an organization in a transaction or tranche. |
| **Financial allocation** | A sourced amount assigned from a broader transaction to a project, phase, or facility, with method and confidence. |
| **Source observation** | Field-level evidence for identity, role, amount, date, status, scope, and allocation. |

### Finance record contract

Preserve whenever available:

#### Identity, time, and status

- stable internal and external database identifiers;
- exact transaction, instrument, tranche, participant, recipient, borrower, issuer, project company, and ultimate-parent identities;
- announcement, signing, financial close, first disbursement, maturity, refinancing, cancellation, and repayment dates;
- status: rumored, announced, mandated, signed, closed, partially disbursed, fully disbursed, refinanced, cancelled, repaid, defaulted, or unknown;
- project-, phase-, facility-, corporate-, and portfolio-scope links with effective dates.

#### Amount and instrument

- original amount and currency;
- committed, drawn, outstanding, repaid, and allocated amounts as separate values;
- instrument type, tranche, seniority, security, tenor, maturity, interest-rate type, reported pricing, and use of proceeds;
- equity stake or ownership percentage, distinguishing direct from beneficial ownership;
- public support, grants, subsidies, guarantees, tax credits, and concessional terms;
- applicable sustainability label, taxonomy, framework, or certification as evidence, never proof of sustainability.

#### Roles and scope

- investor, lender, sponsor, arranger, underwriter, guarantor, insurer, public funder, contractor, and offtaker roles;
- whether financing is project-specific, phase-specific, facility-specific, corporate, or portfolio-level;
- allocation method, inputs, period, and confidence;
- source links, dates, access and verification dates, license, conflicts, uncertainty, and redistribution rules.

Unknown fields remain unknown. Do not create a participant role or amount from a company list, headline, logo, or provider convention without field-level evidence.

One facility may have multiple projects, phases, owners, transactions, refinancings, and participants over time. One transaction may finance multiple facilities, a portfolio, or a corporate perimeter. These cardinalities are normal and MUST NOT be flattened into one “current financing” record.

### Attribution levels

The product and model MUST distinguish:

1. **Direct project finance:** evidence connects a transaction or tranche to a named project, phase, or facility.
2. **Portfolio finance:** evidence covers a named group; facility allocations appear only when published or reproducibly calculated.
3. **Corporate finance:** funding goes to a company and is not described as financing a particular facility.
4. **Company exposure estimate:** an analytical allocation based on a published segment or activity adjuster, labelled as an estimate rather than traced flow of funds.

A portfolio or corporate transaction MUST NOT be attributed in full to a facility. Unallocated financing remains visible at its true scope.

If a company exposure estimate is published, expose:

- formula and version;
- input period and company perimeter;
- activity denominator and eligible clean-energy numerator;
- subsidiary, joint-venture, and ownership-date treatment;
- unadjusted transaction amount;
- adjusted estimate, uncertainty, and sensitivity.

Opaque allocation factors are prohibited. An adjusted corporate estimate is never labelled direct project finance.

### Currency and time

- Preserve original currency and reported amount without alteration.
- A normalized value preserves exchange-rate source, rate date, conversion method, target currency, and result.
- Nominal amounts across currencies or years are not compared or summed without an explicit, reproducible currency and inflation method.
- Commitments, underwriting, disbursements, holdings, repayments, and outstanding exposure remain analytically separate.
- Refinancings do not become additive new capital without an explicit analytical rule.

### Double-counting controls

Document and test treatment of:

- syndicated transactions;
- bond and equity underwriting;
- tranches;
- co-financing;
- refinancings;
- repeated observations from multiple providers;
- full versus pro-rata league-table credit;
- portfolio allocations and company exposure estimates.

Provider duplication and repeated press coverage are multiple observations, not multiple transactions.

### Connectors, licensing, and access

Versioned connectors for open and licensed datasets MUST:

- preserve raw provider records and external identifiers;
- record provider license, redistribution, retention, and access constraints;
- record update timestamp and connector version;
- map field-level observations to internal candidates;
- produce reviewable identity and transaction matches;
- preserve unmatched records and conflicts;
- prevent restricted fields from leaking into public outputs.

Commercially licensed, confidential, paywalled, personally sensitive, sanctions-related, or otherwise restricted information is handled according to law and contract. Public surfaces expose only legally displayable fields while retaining permitted provenance metadata and access controls.

### V2 surface rule

A finance inspector, when V2 is explicitly activated, remains attached to and distinct from the facility inspector. It may show verified sponsors, owners, lenders, investors, public support, transactions, instruments, allocations, scope, and changes over time. It MUST show uncertainty and must never imply a funding need, recommendation, or facility allocation that the evidence does not establish.

## V3 — Capital Guidance extension

V3 may activate only after V2 scope and attribution are reliable and the legal, methodological, conflict-of-interest, and outcome-monitoring controls below are implemented. It must answer four separate questions:

1. **Is the project genuinely clean?** Lifecycle GHG, technology eligibility, supply-chain impacts, land, water, biodiversity, circularity, decommissioning, and unresolved harms.
2. **Is additional capital genuinely needed?** Remaining verified financing gap, use of proceeds, phase, deadline, commitments, subsidies, and whether funding is additional or replaces secured capital.
3. **Is durable public value likely?** Avoided emissions, system value, energy access, resilience, local benefits, community participation, employment quality, affordability, governance, human-rights safeguards, and credible transition alignment.
4. **What are the financial conditions and risks?** Instrument, eligibility, liquidity, term, evidenced expected return, downside, fees, guarantees, currency, counterparty, construction and regulatory risk, and possible partial or total capital loss.

Sustainability value, financing need, project quality, evidence quality, expected return, and financial risk remain independently sourced dimensions. Climate benefit does not imply profitability. A green label, marketing claim, taxonomy, score, or expected return does not imply sustainability.

A V3 opportunity surface MUST display verified sustainability value, additionality, remaining financing need, evidence quality, financial conditions, and risk as separate sections. It must not replace or obscure the physical facility and V2 financing evidence.

### Funding-opportunity evidence

Before displaying a project-level opportunity, preserve and expose whenever legally available:

- exact project, phase, facility, SPV, issuer, and ultimate beneficial owners;
- capital sought, already committed, remaining verified gap, currency, deadline, and minimum participation;
- instrument, legal structure, investor eligibility, jurisdiction, platform/intermediary, fees, liquidity, maturity, security, guarantees, and seniority;
- detailed use of proceeds and controls against diversion to excluded activities;
- financial-model assumptions and whether audited, independently reviewed, management-provided, estimated, or unavailable;
- expected climate and social outcomes, baseline, counterfactual, additionality claim, horizon, measurement method, and responsible verifier;
- actual post-financing outcomes compared with forecasts;
- permits, offtake agreements, construction contracts, grid connection, community consultation, litigation, controversies, sanctions, and material dependencies;
- conflicts of interest, related-party transactions, commissions, referral fees, sponsorship, and paid placement;
- source evidence, verification status, last review, uncertainty, and inclusion/exclusion rationale.

Typed future schemas MUST keep funding opportunities, financing gaps, use-of-proceeds controls, impact baselines, additionality claims, risk disclosures, eligibility rules, conflicts of interest, anti-greenwashing assessments, assessment criteria, outcome observations, and realized-versus-forecast comparisons distinct.

### Anti-greenwashing assessment

The assessment is explicit and versioned. A project cannot appear as a credible funding candidate unless evidence shows that it:

- passes released lifecycle-CO₂ eligibility rules;
- contains no excluded fuel, feedstock, activity, or hidden fossil cross-subsidy in the financing perimeter;
- has traceable use of proceeds;
- has identifiable accountable legal entities and beneficial owners;
- has credible permits, delivery pathway, and project status;
- publishes material environmental and social risks;
- has a measurable impact baseline and post-financing monitoring plan;
- states additionality and a verified financing gap;
- discloses conflicts, fees, incentives, and commercial relationships;
- has no unresolved evidence failure severe enough to make the sustainability claim misleading.

Passed, failed, unknown, and not-assessed criteria receive equal structural visibility. Missing evidence never passes. Do not create one opaque composite score. If weights or summaries exist, expose each dimension, evidence, weight, sensitivity, and methodology version.

### Ranking and recommendation constraints

- Any ranking is reproducible, user-controllable, and named for one objective, such as verified climate additionality, financing need, community benefit, evidence quality, or a user-defined risk profile.
- Incomplete or non-comparable inputs cannot support an unqualified ranking.
- Payment, sponsorship, referral revenue, commission, partnership, or data-provider preference cannot improve ranking, verification, methodology, or inclusion.
- A recommendation states evidence, objective, assumptions, jurisdiction, eligibility, uncertainty, and conflicts.
- Public-interest guidance never becomes a guarantee of impact or return or personalized financial advice.

### Regulated access and money movement

Where a regulated investment is displayed, show jurisdiction, investor eligibility, legal documentation, risk warnings, and the regulated intermediary responsible.

Do not enable identity-sensitive access or money movement until compliance, consumer protection, suitability, licensing, custody, payments, privacy, sanctions, complaints, and responsibility boundaries are explicitly designed and legally validated for every applicable jurisdiction.

### Outcome accountability

Track promised versus realized:

- construction progress;
- capacity and generation;
- lifecycle and avoided emissions;
- local and community benefits;
- use of proceeds;
- repayments and defaults;
- controversies and material harms.

A project cannot retain a strong sustainability assessment solely because pre-financing documents were persuasive. New outcomes can downgrade the assessment and must preserve history.

## Future public methodology

Before V2/V3 publication, add versioned public methods for:

- finance entity and role definitions;
- financial source selection and connector licensing;
- entity resolution and relationship history;
- transaction scope and allocation;
- currency conversion and inflation adjustment;
- commitments, disbursements, holdings, refinancing, and aggregation;
- segment or company-exposure adjustment;
- financing-gap and additionality calculation;
- anti-greenwashing gates and conflict-of-interest controls;
- ranking objectives, weights, sensitivity, and independence;
- impact baseline, counterfactual, forecast, and observed-outcome comparison;
- corrections, limitations, and restricted data.

Every financial headline follows the same calculation lineage contract as V1 energy claims.

## Activation gates

Finance-specific checks are mandatory only for the stage that exposes that behavior. They are not V1 release gates.

### Before V2

- independent entity resolution for facilities, projects, phases, organizations, legal entities, and transactions;
- temporal ownership and organization relationships;
- transaction-scope and allocation tests;
- currency, amount-state, and date-basis tests;
- syndicated, tranche, refinancing, and provider-duplicate controls;
- restricted-data and public-field enforcement;
- source-to-financial-total calculation lineage;
- proof that corporate or portfolio finance is never presented as facility finance without evidenced allocation.

### Before V3

- anti-greenwashing pass/fail/unknown/not-assessed behavior;
- missing-evidence failure behavior;
- financing-gap and additionality reproducibility;
- ranking independence from commercial influence;
- conflict-of-interest disclosure and enforcement;
- separation of sustainability, need, quality, return, and risk;
- realized-versus-forecast outcome updates;
- regulated eligibility and warnings;
- legal approval for every enabled jurisdiction and any money-movement responsibility.

## Non-regression rule

V2 and V3 may add finance evidence and guidance only if:

- V1 physical records, classifications, locations, calculations, and releases remain reproducible;
- finance relationships attach to exact scopes;
- no future interface weakens uncertainty or evidence visibility;
- no commercial interest can influence atlas truth;
- a finance correction cannot silently rewrite a physical-energy fact;
- users can always distinguish observed flow of funds from analytical exposure and guidance.
