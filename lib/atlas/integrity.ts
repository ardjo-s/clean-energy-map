import type { AtlasDataset, Facility } from "@/lib/domain/schemas";
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
): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];

  if (!projectIds.has(facility.projectId)) {
    issues.push({ code: "missing_project", message: "Facility project reference is missing.", entityId: facility.id });
  }

  if (!lifecycleEvidenceIds.has(facility.lifecycleEvidenceId)) {
    issues.push({ code: "missing_lifecycle_evidence", message: "Lifecycle evidence reference is missing.", entityId: facility.id });
  }

  for (const observationId of facility.sourceObservationIds) {
    if (!observations.has(observationId)) {
      issues.push({ code: "missing_observation", message: `Missing observation ${observationId}.`, entityId: facility.id });
    }
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
    ["facility", dataset.facilities.map((item) => item.id)],
    ["calculation", dataset.calculations.map((item) => item.id)],
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
  for (const facility of dataset.facilities) {
    issues.push(...facilityIssues(facility, observations, lifecycleEvidenceIds, projectIds));
  }

  const calculationIds = new Set(dataset.calculations.map((calculation) => calculation.id));
  for (const indicator of dataset.countryIndicators) {
    if (!calculationIds.has(indicator.calculationId)) {
      issues.push({ code: "indicator_missing_calculation", message: "Country indicator calculation is missing.", entityId: indicator.id });
    } else if (!validateIndicatorArithmetic(indicator)) {
      issues.push({ code: "indicator_arithmetic", message: "Country indicator value does not match its inputs.", entityId: indicator.id });
    }
    if (indicator.numerator.unit !== indicator.denominator.unit) {
      issues.push({ code: "indicator_unit_mismatch", message: "Indicator numerator and denominator units differ.", entityId: indicator.id });
    }
  }

  const verifiedBaseline = dataset.coverage.some(
    (coverage) =>
      coverage.technology === null &&
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
