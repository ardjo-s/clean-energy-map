import { technologySchema, type AtlasDataset, type Facility } from "@/lib/domain/schemas";
import { validateIndicatorArithmetic } from "@/lib/atlas/calculations";

export type IntegrityIssue = {
  code: string;
  message: string;
  entityId?: string;
};

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated];
}

function facilityIssues(
  facility: Facility,
  observations: Map<string, AtlasDataset["observations"][number]>,
  lifecycleEvidenceIds: Set<string>,
  projectIds: Set<string>,
  phaseIds: Set<string>,
  organizationIds: Set<string>,
  ownershipById: Map<string, AtlasDataset["ownership"][number]>,
): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];

  if (!projectIds.has(facility.projectId)) {
    issues.push({ code: "missing_project", message: "Facility project reference is missing.", entityId: facility.id });
  }

  if (!lifecycleEvidenceIds.has(facility.lifecycleEvidenceId)) {
    issues.push({ code: "missing_lifecycle_evidence", message: "Lifecycle evidence reference is missing.", entityId: facility.id });
  }

  for (const phaseId of facility.phaseIds) {
    if (!phaseIds.has(phaseId)) issues.push({ code: "missing_phase", message: `Missing phase ${phaseId}.`, entityId: facility.id });
  }

  for (const organizationId of facility.operatorOrganizationIds) {
    if (!organizationIds.has(organizationId)) issues.push({ code: "missing_operator", message: `Missing operator ${organizationId}.`, entityId: facility.id });
  }

  for (const ownershipId of facility.ownershipIds) {
    const relationship = ownershipById.get(ownershipId);
    if (!relationship) issues.push({ code: "missing_ownership", message: `Missing ownership ${ownershipId}.`, entityId: facility.id });
    else if (relationship.facilityId !== facility.id) issues.push({ code: "ownership_facility_mismatch", message: `Ownership ${ownershipId} targets another facility.`, entityId: facility.id });
  }

  for (const observationId of facility.sourceObservationIds) {
    if (!observations.has(observationId)) {
      issues.push({ code: "missing_observation", message: `Missing observation ${observationId}.`, entityId: facility.id });
    }
  }

  for (const capacity of facility.capacities) {
    for (const observationId of capacity.sourceObservationIds) {
      if (!observations.has(observationId)) issues.push({ code: "capacity_missing_observation", message: `Missing capacity observation ${observationId}.`, entityId: facility.id });
    }
  }

  for (const observationId of facility.jurisdiction.evidenceObservationIds) {
    if (!observations.has(observationId)) issues.push({ code: "jurisdiction_missing_observation", message: `Missing jurisdiction observation ${observationId}.`, entityId: facility.id });
  }

  if (facility.location.geometryType !== "unplotted") {
    const locationEvidence = facility.location.evidenceObservationIds
      .map((id) => observations.get(id))
      .filter(Boolean);
    const fields = new Set(locationEvidence.map((observation) => observation?.field));
    if (facility.location.geometryType === "point" && (!fields.has("latitude") || !fields.has("longitude"))) {
      issues.push({
        code: "coordinate_without_field_evidence",
        message: "A plotted point requires source observations for both latitude and longitude.",
        entityId: facility.id,
      });
    }
    if (facility.location.geometryType === "point") {
      const [longitude, latitude] = facility.location.coordinates;
      const latitudeValues = locationEvidence
        .filter((observation) => observation?.field === "latitude")
        .map((observation) => observation?.normalizedValue);
      const longitudeValues = locationEvidence
        .filter((observation) => observation?.field === "longitude")
        .map((observation) => observation?.normalizedValue);
      if (!latitudeValues.includes(latitude) || !longitudeValues.includes(longitude)) {
        issues.push({
          code: "coordinate_evidence_mismatch",
          message: "Plotted coordinates must exactly match normalized latitude and longitude observations.",
          entityId: facility.id,
        });
      }
    }
  }

  if (facility.energyRole === "storage" && facility.capacities.some((capacity) => capacity.kind === "electrical_mw")) {
    issues.push({
      code: "storage_as_generation",
      message: "Storage cannot expose electrical generation capacity.",
      entityId: facility.id,
    });
  }

  if (
    ["battery_storage", "pumped_hydro_storage", "thermal_storage", "hydrogen_storage", "other_storage"].includes(
      facility.technology,
    ) &&
    facility.energyRole !== "storage"
  ) {
    issues.push({ code: "storage_role_mismatch", message: "Storage technology must use the storage role.", entityId: facility.id });
  }

  if (
    ["hydrogen_carrier", "ammonia_carrier", "synthetic_fuel_carrier"].includes(facility.technology) &&
    facility.energyRole !== "energy_carrier"
  ) {
    issues.push({ code: "carrier_role_mismatch", message: "Energy carriers cannot be primary generation.", entityId: facility.id });
  }

  if (facility.technology === "solid_biomass_residues" && facility.classification === "eligible") {
    issues.push({
      code: "biomass_eligible_without_facility_gate",
      message: "V1 does not permit biomass to be eligible without a dedicated facility evidence gate.",
      entityId: facility.id,
    });
  }

  if (facility.location.geometryType === "unplotted" && facility.location.coordinates !== null) {
    issues.push({ code: "unplotted_has_coordinates", message: "Unplotted records cannot carry coordinates.", entityId: facility.id });
  }

  return issues;
}

export function validateDatasetIntegrity(dataset: AtlasDataset): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  const idGroups: Array<[string, string[]]> = [
    ["source", dataset.sources.map((item) => item.id)],
    ["observation", dataset.observations.map((item) => item.id)],
    ["organization", dataset.organizations.map((item) => item.id)],
    ["project", dataset.projects.map((item) => item.id)],
    ["phase", dataset.phases.map((item) => item.id)],
    ["ownership", dataset.ownership.map((item) => item.id)],
    ["lifecycle_evidence", dataset.lifecycleEvidence.map((item) => item.id)],
    ["facility", dataset.facilities.map((item) => item.id)],
    ["calculation", dataset.calculations.map((item) => item.id)],
    ["country_indicator", dataset.countryIndicators.map((item) => item.id)],
    ["coverage", dataset.coverage.map((item) => item.id)],
    ["geography", dataset.geographies.map((item) => item.code)],
  ];

  for (const [kind, ids] of idGroups) {
    for (const id of duplicates(ids)) {
      issues.push({ code: `duplicate_${kind}_id`, message: `Duplicate ${kind} identifier: ${id}.`, entityId: id });
    }
  }

  const sourceIds = new Set(dataset.sources.map((source) => source.id));
  for (const observation of dataset.observations) {
    if (!sourceIds.has(observation.sourceId)) {
      issues.push({ code: "observation_missing_source", message: "Observation source is missing.", entityId: observation.id });
    }
  }

  const observations = new Map(dataset.observations.map((observation) => [observation.id, observation]));
  const lifecycleEvidenceIds = new Set(dataset.lifecycleEvidence.map((evidence) => evidence.id));
  const projectIds = new Set(dataset.projects.map((project) => project.id));
  const phaseIds = new Set(dataset.phases.map((phase) => phase.id));
  const organizationIds = new Set(dataset.organizations.map((organization) => organization.id));
  const facilityIds = new Set(dataset.facilities.map((facility) => facility.id));
  const ownershipById = new Map(dataset.ownership.map((relationship) => [relationship.id, relationship]));
  for (const facility of dataset.facilities) {
    issues.push(...facilityIssues(facility, observations, lifecycleEvidenceIds, projectIds, phaseIds, organizationIds, ownershipById));
  }

  for (const project of dataset.projects) {
    for (const facilityId of project.facilityIds) {
      if (!facilityIds.has(facilityId)) issues.push({ code: "project_missing_facility", message: `Missing facility ${facilityId}.`, entityId: project.id });
    }
    for (const phaseId of project.phaseIds) {
      if (!phaseIds.has(phaseId)) issues.push({ code: "project_missing_phase", message: `Missing phase ${phaseId}.`, entityId: project.id });
    }
    for (const observationId of project.sourceObservationIds) {
      if (!observations.has(observationId)) issues.push({ code: "project_missing_observation", message: `Missing observation ${observationId}.`, entityId: project.id });
    }
  }

  for (const phase of dataset.phases) {
    if (!projectIds.has(phase.projectId)) issues.push({ code: "phase_missing_project", message: `Missing project ${phase.projectId}.`, entityId: phase.id });
    for (const facilityId of phase.facilityIds) {
      if (!facilityIds.has(facilityId)) issues.push({ code: "phase_missing_facility", message: `Missing facility ${facilityId}.`, entityId: phase.id });
    }
    for (const observationId of phase.sourceObservationIds) {
      if (!observations.has(observationId)) issues.push({ code: "phase_missing_observation", message: `Missing observation ${observationId}.`, entityId: phase.id });
    }
  }

  for (const relationship of dataset.ownership) {
    if (!facilityIds.has(relationship.facilityId)) issues.push({ code: "ownership_missing_facility", message: `Missing facility ${relationship.facilityId}.`, entityId: relationship.id });
    if (relationship.phaseId && !phaseIds.has(relationship.phaseId)) issues.push({ code: "ownership_missing_phase", message: `Missing phase ${relationship.phaseId}.`, entityId: relationship.id });
    if (!organizationIds.has(relationship.organizationId)) issues.push({ code: "ownership_missing_organization", message: `Missing organization ${relationship.organizationId}.`, entityId: relationship.id });
    for (const observationId of relationship.sourceObservationIds) {
      if (!observations.has(observationId)) issues.push({ code: "ownership_missing_observation", message: `Missing observation ${observationId}.`, entityId: relationship.id });
    }
  }

  for (const organization of dataset.organizations) {
    for (const observationId of organization.sourceObservationIds) {
      if (!observations.has(observationId)) issues.push({ code: "organization_missing_observation", message: `Missing observation ${observationId}.`, entityId: organization.id });
    }
  }

  for (const evidence of dataset.lifecycleEvidence) {
    for (const sourceId of evidence.sourceIds) {
      if (!sourceIds.has(sourceId)) issues.push({ code: "lifecycle_missing_source", message: `Missing source ${sourceId}.`, entityId: evidence.id });
    }
  }

  const calculationIds = new Set(dataset.calculations.map((calculation) => calculation.id));
  for (const calculation of dataset.calculations) {
    for (const observationId of calculation.inputObservationIds) {
      if (!observations.has(observationId)) issues.push({ code: "calculation_missing_observation", message: `Missing input observation ${observationId}.`, entityId: calculation.id });
    }
  }
  for (const indicator of dataset.countryIndicators) {
    if (!calculationIds.has(indicator.calculationId)) {
      issues.push({ code: "indicator_missing_calculation", message: "Country indicator calculation is missing.", entityId: indicator.id });
    } else if (!validateIndicatorArithmetic(indicator)) {
      issues.push({ code: "indicator_arithmetic", message: "Country indicator value does not match its inputs.", entityId: indicator.id });
    }
    if (indicator.numerator.unit !== indicator.denominator.unit) {
      issues.push({ code: "indicator_unit_mismatch", message: "Indicator numerator and denominator units differ.", entityId: indicator.id });
    }
    for (const sourceId of indicator.sourceIds) {
      if (!sourceIds.has(sourceId)) issues.push({ code: "indicator_missing_source", message: `Missing source ${sourceId}.`, entityId: indicator.id });
    }
  }

  const geographyCodes = new Set(dataset.geographies.map((geography) => geography.code));
  const coverageByScope = new Map<string, AtlasDataset["coverage"][number]>();
  for (const coverage of dataset.coverage) {
    if (!geographyCodes.has(coverage.geographyCode)) {
      issues.push({ code: "coverage_missing_geography", message: `Missing geography ${coverage.geographyCode}.`, entityId: coverage.id });
    }
    const scopeKey = `${coverage.geographyCode}|${coverage.technology ?? "national"}`;
    if (coverageByScope.has(scopeKey)) issues.push({ code: "duplicate_coverage_scope", message: `Duplicate coverage scope ${scopeKey}.`, entityId: coverage.id });
    coverageByScope.set(scopeKey, coverage);
    for (const sourceId of coverage.sourceIds) {
      if (!sourceIds.has(sourceId)) issues.push({ code: "coverage_missing_source", message: `Missing source ${sourceId}.`, entityId: coverage.id });
    }
    const fullGate = coverage.authoritativeBaseline && coverage.facilitySourcesPresent && coverage.measuredCoverage !== null && coverage.reproducibleMethod && coverage.visibleLimitations.length > 0 && coverage.sourceIds.length > 0;
    if (coverage.publicationStatus === "verified_wave" && !fullGate) {
      issues.push({ code: "verified_wave_gate_failure", message: "Verified coverage does not satisfy the publication gate.", entityId: coverage.id });
    }
    if (coverage.sourceIds.length === 0 && !(["not_assessed", "unavailable"] as const).includes(coverage.status as "not_assessed" | "unavailable")) {
      issues.push({ code: "assessed_coverage_without_source", message: "Assessed coverage requires at least one source.", entityId: coverage.id });
    }
  }
  for (const geography of dataset.geographies) {
    const requiredScopes: Array<string | null> = [null, ...technologySchema.options];
    for (const technology of requiredScopes) {
      const scopeKey = `${geography.code}|${technology ?? "national"}`;
      if (!coverageByScope.has(scopeKey)) issues.push({ code: "missing_coverage_scope", message: `Missing coverage for ${scopeKey}.`, entityId: geography.code });
    }
  }

  const verifiedBaseline = dataset.coverage.some(
    (coverage) =>
      coverage.technology === null &&
      coverage.publicationStatus === "verified_wave" &&
      coverage.authoritativeBaseline &&
      coverage.facilitySourcesPresent &&
      coverage.measuredCoverage !== null &&
      coverage.reproducibleMethod &&
      coverage.visibleLimitations.length > 0,
  );
  if (!verifiedBaseline) {
    issues.push({
      code: "missing_verified_wave",
      message: "No geography satisfies the full verified national-baseline gate.",
    });
  }

  return issues;
}

export function validateBrowserDatasetIntegrity(dataset: AtlasDataset): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  const observations = new Set(dataset.observations.map((item) => item.id));
  const sources = new Set(dataset.sources.map((item) => item.id));
  const organizations = new Set(dataset.organizations.map((item) => item.id));
  const facilities = new Set(dataset.facilities.map((item) => item.id));
  const ownership = new Set(dataset.ownership.map((item) => item.id));
  const projects = new Set(dataset.projects.map((item) => item.id));
  const phases = new Set(dataset.phases.map((item) => item.id));

  for (const calculation of dataset.calculations) {
    for (const observationId of calculation.inputObservationIds) {
      if (!observations.has(observationId)) issues.push({ code: "browser_calculation_missing_observation", message: `Missing browser calculation observation ${observationId}.`, entityId: calculation.id });
    }
  }
  for (const indicator of dataset.countryIndicators) {
    for (const sourceId of indicator.sourceIds) {
      if (!sources.has(sourceId)) issues.push({ code: "browser_indicator_missing_source", message: `Missing browser indicator source ${sourceId}.`, entityId: indicator.id });
    }
  }
  for (const relationship of dataset.ownership) {
    if (!facilities.has(relationship.facilityId)) issues.push({ code: "browser_ownership_missing_facility", message: `Missing browser facility ${relationship.facilityId}.`, entityId: relationship.id });
    if (!organizations.has(relationship.organizationId)) issues.push({ code: "browser_ownership_missing_organization", message: `Missing browser organization ${relationship.organizationId}.`, entityId: relationship.id });
    for (const observationId of relationship.sourceObservationIds) {
      if (!observations.has(observationId)) issues.push({ code: "browser_ownership_missing_observation", message: `Missing browser ownership observation ${observationId}.`, entityId: relationship.id });
    }
  }
  for (const facility of dataset.facilities) {
    if (!projects.has(facility.projectId)) issues.push({ code: "browser_facility_missing_project", message: `Missing browser project ${facility.projectId}.`, entityId: facility.id });
    for (const phaseId of facility.phaseIds) {
      if (!phases.has(phaseId)) issues.push({ code: "browser_facility_missing_phase", message: `Missing browser phase ${phaseId}.`, entityId: facility.id });
    }
    for (const observationId of facility.sourceObservationIds) {
      if (!observations.has(observationId)) issues.push({ code: "browser_facility_missing_pointer", message: `Missing browser source pointer ${observationId}.`, entityId: facility.id });
    }
    for (const ownershipId of facility.ownershipIds) {
      if (!ownership.has(ownershipId)) issues.push({ code: "browser_facility_missing_ownership", message: `Missing browser ownership ${ownershipId}.`, entityId: facility.id });
    }
  }
  for (const project of dataset.projects) {
    for (const observationId of project.sourceObservationIds) {
      if (!observations.has(observationId)) issues.push({ code: "browser_project_missing_observation", message: `Missing browser project observation ${observationId}.`, entityId: project.id });
    }
  }
  for (const phase of dataset.phases) {
    for (const observationId of phase.sourceObservationIds) {
      if (!observations.has(observationId)) issues.push({ code: "browser_phase_missing_observation", message: `Missing browser phase observation ${observationId}.`, entityId: phase.id });
    }
  }
  return issues;
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value).toSorted(([left], [right]) => left.localeCompare(right)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function compareCollection<T>(
  compact: T[],
  full: T[],
  key: (item: T) => string,
  collection: string,
): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  for (const id of duplicates(compact.map(key))) {
    issues.push({ code: `duplicate_compact_${collection}_id`, message: `Duplicate compact ${collection} identifier: ${id}.`, entityId: id });
  }
  for (const id of duplicates(full.map(key))) {
    issues.push({ code: `duplicate_full_${collection}_id`, message: `Duplicate full ${collection} identifier: ${id}.`, entityId: id });
  }
  const compactById = new Map(compact.map((item) => [key(item), item]));
  const fullById = new Map(full.map((item) => [key(item), item]));
  for (const [id, item] of compactById) {
    const fullItem = fullById.get(id);
    if (!fullItem || canonical(item) !== canonical(fullItem)) {
      issues.push({ code: `compact_${collection}_mismatch`, message: `Compact and full ${collection} ${id} differ.`, entityId: id });
    }
  }
  for (const id of fullById.keys()) {
    if (!compactById.has(id)) issues.push({ code: `compact_${collection}_missing`, message: `Compact release is missing ${collection} ${id}.`, entityId: id });
  }
  return issues;
}

function expectedCompactSourcePointer(
  source: AtlasDataset["sources"][number],
  release: AtlasDataset["release"],
): AtlasDataset["observations"][number] {
  return {
    id: `compact-${source.id}`,
    sourceId: source.id,
    entityType: "methodology",
    entityId: release.methodologyReleaseId,
    field: "source_pointer",
    rawValue: source.id,
    rawUnit: null,
    normalizedValue: source.id,
    observedAt: null,
    retrievedAt: release.releasedAt,
    confidence: "high",
    conflictGroup: null,
    reviewerNote: "Full field-level observations are in /data/downloads/atlas-v1-full.json.",
  };
}

function expectedCompactFacility(facility: AtlasDataset["facilities"][number]) {
  const sourceObservationIds = ["compact-src-eia-860-2024"];
  if (facility.technology === "nuclear_fission") sourceObservationIds.push("compact-src-nrc-power-reactors");
  const limitations = [facility.classificationReason];
  if (facility.location.geometryType === "unplotted") limitations.push("No valid publisher-reported coordinate; the record is searchable but unplotted.");
  if (facility.technology === "offshore_wind") limitations.push("Maritime-zone context is not established by EIA-860 and remains unknown.");
  return { ...facility, sourceObservationIds, limitations };
}

export function validateReleasePairIntegrity(compact: AtlasDataset, full: AtlasDataset): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  if (canonical(compact.release) !== canonical(full.release)) {
    issues.push({ code: "compact_release_mismatch", message: "Compact and full release metadata differ." });
  }

  issues.push(...compareCollection(compact.facilities, full.facilities.map(expectedCompactFacility), (item) => item.id, "facility"));
  issues.push(...compareCollection(compact.methodologyReleases, full.methodologyReleases, (item) => item.id, "methodology"));
  issues.push(...compareCollection(compact.geographies, full.geographies, (item) => item.code, "geography"));
  issues.push(...compareCollection(compact.sources, full.sources, (item) => item.id, "source"));
  issues.push(...compareCollection(compact.organizations, full.organizations, (item) => item.id, "organization"));
  issues.push(...compareCollection(compact.projects, full.projects, (item) => item.id, "project"));
  issues.push(...compareCollection(compact.phases, full.phases, (item) => item.id, "phase"));
  issues.push(...compareCollection(compact.ownership, full.ownership, (item) => item.id, "ownership"));
  issues.push(...compareCollection(compact.lifecycleEvidence, full.lifecycleEvidence, (item) => item.id, "lifecycle"));
  issues.push(...compareCollection(compact.countryIndicators, full.countryIndicators, (item) => item.id, "indicator"));
  issues.push(...compareCollection(compact.calculations, full.calculations, (item) => item.id, "calculation"));
  issues.push(...compareCollection(compact.coverage, full.coverage, (item) => item.id, "coverage"));
  const compactPointers = compact.observations.filter((item) => item.id.startsWith("compact-"));
  const sharedObservations = compact.observations.filter((item) => !item.id.startsWith("compact-"));
  issues.push(...compareCollection(
    compactPointers,
    full.sources.map((source) => expectedCompactSourcePointer(source, full.release)),
    (item) => item.id,
    "source_pointer",
  ));
  const fullObservations = new Map(full.observations.map((item) => [item.id, item]));
  for (const observation of sharedObservations) {
    const fullObservation = fullObservations.get(observation.id);
    if (!fullObservation || canonical(observation) !== canonical(fullObservation)) {
      issues.push({ code: "compact_observation_mismatch", message: `Compact and full observation ${observation.id} differ.`, entityId: observation.id });
    }
  }
  return issues;
}
