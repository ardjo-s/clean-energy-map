import { z } from "zod";

export const classificationSchema = z.enum([
  "eligible",
  "conditional",
  "excluded",
  "unknown",
]);

export const coverageStatusSchema = z.enum([
  "complete",
  "substantial",
  "partial",
  "sparse",
  "not_assessed",
  "unavailable",
]);

export const coveragePublicationStatusSchema = z.enum([
  "verified_wave",
  "candidate",
  "withheld",
]);

export const lifecycleStateSchema = z.enum([
  "operating",
  "under_construction",
  "approved",
  "permitted",
  "proposed",
  "suspended",
  "cancelled",
  "retired",
  "unknown",
]);

export const technologySchema = z.enum([
  "solar_photovoltaic",
  "concentrated_solar_power",
  "solar_thermal",
  "onshore_wind",
  "offshore_wind",
  "hydropower_run_of_river",
  "hydropower_reservoir",
  "hydropower_unspecified",
  "geothermal",
  "marine_ocean",
  "nuclear_fission",
  "ambient_renewable_heat",
  "recovered_heat",
  "solid_biomass_residues",
  "battery_storage",
  "pumped_hydro_storage",
  "thermal_storage",
  "hydrogen_storage",
  "other_storage",
  "hydrogen_carrier",
  "ammonia_carrier",
  "synthetic_fuel_carrier",
]);

export const energyRoleSchema = z.enum([
  "electricity_generation",
  "heat_generation",
  "storage",
  "energy_carrier",
]);

export const capacityKindSchema = z.enum([
  "electrical_mw",
  "thermal_mw",
  "storage_power_mw",
  "storage_energy_mwh",
]);

export const confidenceSchema = z.enum(["high", "medium", "low", "unknown"]);
export const precisionSchema = z.enum([
  "exact_site",
  "approximate_site",
  "project_area",
  "locality_only",
  "unknown",
]);

export const geographySchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["country", "region", "ocean_area"]),
});

export const sourceSchema = z.object({
  id: z.string().min(1),
  publisher: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  sourceType: z.enum([
    "government",
    "system_operator",
    "international_institution",
    "official_disclosure",
    "regulatory_filing",
    "research",
    "journalism",
  ]),
  publicationDate: z.string().date().nullable(),
  accessedAt: z.string().datetime(),
  license: z.string().min(1),
  coverageScope: z.string().min(1),
  snapshotSha256: z.string().regex(/^[a-f0-9]{64}$/).nullable(),
  snapshotPath: z.string().nullable(),
  redistribution: z.enum(["permitted", "restricted", "unknown"]),
});

export const observationSchema = z.object({
  id: z.string().min(1),
  sourceId: z.string().min(1),
  entityType: z.enum([
    "facility",
    "project",
    "phase",
    "organization",
    "ownership",
    "country_indicator",
    "coverage",
    "methodology",
  ]),
  entityId: z.string().min(1),
  field: z.string().min(1),
  rawValue: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  rawUnit: z.string().nullable(),
  normalizedValue: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  observedAt: z.string().date().nullable(),
  retrievedAt: z.string().datetime(),
  confidence: confidenceSchema,
  conflictGroup: z.string().nullable(),
  reviewerNote: z.string().nullable(),
});

export const capacitySchema = z.object({
  kind: capacityKindSchema,
  value: z.number().nonnegative(),
  status: z.enum(["installed", "planned", "retired"]),
  sourceObservationIds: z.array(z.string()).min(1),
});

const pointLocationSchema = z.object({
  geometryType: z.literal("point"),
  coordinates: z.tuple([
    z.number().min(-180).max(180),
    z.number().min(-90).max(90),
  ]),
  precision: precisionSchema,
  confidence: confidenceSchema,
  evidenceObservationIds: z.array(z.string()).min(1),
  method: z.enum([
    "source_coordinates",
    "verified_geometry_centroid",
    "reviewed_geocoding",
  ]),
});

const polygonLocationSchema = z.object({
  geometryType: z.literal("polygon"),
  coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))).min(1),
  precision: precisionSchema,
  confidence: confidenceSchema,
  evidenceObservationIds: z.array(z.string()).min(1),
  method: z.literal("source_geometry"),
});

const unplottedLocationSchema = z.object({
  geometryType: z.literal("unplotted"),
  coordinates: z.null(),
  precision: z.union([z.literal("locality_only"), z.literal("unknown")]),
  confidence: confidenceSchema,
  evidenceObservationIds: z.array(z.string()),
  method: z.literal("withheld_no_reliable_geometry"),
});

export const locationSchema = z.discriminatedUnion("geometryType", [
  pointLocationSchema,
  polygonLocationSchema,
  unplottedLocationSchema,
]);

export const jurisdictionSchema = z.object({
  countryCode: z.string().length(2).nullable(),
  admin1: z.string().nullable(),
  context: z.enum([
    "land",
    "territorial_waters",
    "exclusive_economic_zone",
    "high_seas",
    "disputed_ocean_area",
    "unknown",
  ]),
  disputed: z.boolean(),
  evidenceObservationIds: z.array(z.string()).min(1),
});

export const organizationSchema = z.object({
  id: z.string().min(1),
  officialName: z.string().min(1),
  alternateNames: z.array(z.string()),
  organizationType: z.enum([
    "operator",
    "owner",
    "developer",
    "public_authority",
    "utility",
    "other",
  ]),
  jurisdictionCode: z.string().nullable(),
  externalIdentifiers: z.record(z.string(), z.string()),
  sourceObservationIds: z.array(z.string()).min(1),
});

export const projectSchema = z.object({
  id: z.string().min(1),
  officialName: z.string().min(1),
  alternateNames: z.array(z.string()),
  facilityIds: z.array(z.string()).min(1),
  phaseIds: z.array(z.string()),
  sourceObservationIds: z.array(z.string()).min(1),
});

export const phaseSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  name: z.string().min(1),
  facilityIds: z.array(z.string()).min(1),
  lifecycleState: lifecycleStateSchema,
  stateDate: z.string().date().nullable(),
  sourceObservationIds: z.array(z.string()).min(1),
});

export const ownershipSchema = z.object({
  id: z.string().min(1),
  facilityId: z.string().min(1),
  phaseId: z.string().min(1).nullable(),
  organizationId: z.string().min(1),
  role: z.enum(["owner", "operator", "developer"]),
  sharePercent: z.number().min(0).max(100).nullable(),
  effectiveFrom: z.string().date().nullable(),
  effectiveTo: z.string().date().nullable(),
  sourceObservationIds: z.array(z.string()).min(1),
});

export const lifecycleEvidenceSchema = z.object({
  id: z.string().min(1),
  technology: technologySchema,
  classification: classificationSchema,
  evidenceLevel: z.enum(["technology_literature", "regional_factor", "facility_lca"]),
  range: z
    .object({
      minimum: z.number(),
      median: z.number().nullable(),
      maximum: z.number(),
      unit: z.literal("gCO2e/kWh"),
    })
    .nullable(),
  systemBoundary: z.string().min(1),
  geography: z.string().min(1),
  sourceIds: z.array(z.string()).min(1),
  limitations: z.array(z.string()).min(1),
});

export const facilitySchema = z.object({
  id: z.string().min(1),
  externalIdentifiers: z.record(z.string(), z.string()),
  officialName: z.string().min(1),
  alternateNames: z.array(z.string()),
  projectId: z.string().min(1),
  phaseIds: z.array(z.string()),
  technology: technologySchema,
  technologyLabel: z.string().min(1),
  energyRole: energyRoleSchema,
  classification: classificationSchema,
  classificationReason: z.string().min(1),
  lifecycleEvidenceId: z.string().min(1),
  lifecycleState: lifecycleStateSchema,
  stateDate: z.string().date().nullable(),
  capacities: z.array(capacitySchema),
  annualGeneration: z
    .object({
      value: z.number(),
      unit: z.literal("MWh"),
      year: z.number().int().min(1900).max(2200),
      sourceObservationIds: z.array(z.string()).min(1),
    })
    .nullable(),
  location: locationSchema,
  jurisdiction: jurisdictionSchema,
  operatorOrganizationIds: z.array(z.string()),
  ownershipIds: z.array(z.string()),
  sourceObservationIds: z.array(z.string()).min(1),
  conflicts: z.array(z.string()),
  limitations: z.array(z.string()),
  verifiedAt: z.string().datetime(),
});

export const indicatorTypeSchema = z.enum([
  "electricity_generation_share",
  "installed_electrical_capacity_share",
  "total_energy_supply_share",
  "final_energy_consumption_share",
]);

export const calculationSchema = z.object({
  id: z.string().min(1),
  formulaVersion: z.string().min(1),
  formula: z.string().min(1),
  inputObservationIds: z.array(z.string()).min(1),
  inputs: z.array(
    z.object({
      label: z.string().min(1),
      value: z.number(),
      unit: z.string().min(1),
      included: z.boolean(),
      reason: z.string().min(1),
    }),
  ),
  result: z.number(),
  resultUnit: z.string().min(1),
  executedAt: z.string().datetime(),
  softwareVersion: z.string().min(1),
  limitations: z.array(z.string()),
});

export const countryIndicatorSchema = z.object({
  id: z.string().min(1),
  countryCode: z.string().length(2),
  type: indicatorTypeSchema,
  value: z.number(),
  unit: z.literal("percent"),
  period: z.object({ start: z.string().date(), end: z.string().date() }),
  numerator: z.object({ value: z.number(), unit: z.string().min(1), definition: z.string().min(1) }),
  denominator: z.object({ value: z.number().positive(), unit: z.string().min(1), definition: z.string().min(1) }),
  productionOrConsumption: z.enum(["production", "consumption"]),
  importsTreatment: z.string().min(1),
  storageTreatment: z.string().min(1),
  calculationId: z.string().min(1),
  sourceIds: z.array(z.string()).min(1),
  verifiedAt: z.string().datetime(),
  limitations: z.array(z.string()),
});

export const coverageAssessmentSchema = z.object({
  id: z.string().min(1),
  geographyCode: z.string().min(1),
  technology: technologySchema.nullable(),
  publicationStatus: coveragePublicationStatusSchema,
  status: coverageStatusSchema,
  scope: z.string().min(1),
  measuredCoverage: z
    .object({
      numerator: z.number().nonnegative(),
      denominator: z.number().positive(),
      unit: z.string().min(1),
      method: z.string().min(1),
      resultPercent: z.number().min(0).max(100),
    })
    .nullable(),
  authoritativeBaseline: z.boolean(),
  facilitySourcesPresent: z.boolean(),
  reproducibleMethod: z.boolean(),
  visibleLimitations: z.array(z.string()).min(1),
  sourceIds: z.array(z.string()),
  assessedAt: z.string().datetime(),
});

export const methodologyReleaseSchema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  releasedAt: z.string().datetime(),
  documentPath: z.string().min(1),
  changeSummary: z.string().min(1),
});

export const datasetReleaseSchema = z.object({
  id: z.string().min(1),
  version: z.string().min(1),
  releasedAt: z.string().datetime(),
  methodologyReleaseId: z.string().min(1),
  buildId: z.string().min(1),
  sourceSnapshotDates: z.record(z.string(), z.string()),
  changeSummary: z.string().min(1),
  changeHistory: z.array(z.object({
    version: z.string().min(1),
    releasedAt: z.string().datetime(),
    summary: z.string().min(1),
  })).min(1),
  correctionsUrl: z.string().url(),
  limitations: z.array(z.string()).min(1),
});

export const atlasDatasetSchema = z.object({
  release: datasetReleaseSchema,
  methodologyReleases: z.array(methodologyReleaseSchema).min(1),
  geographies: z.array(geographySchema).min(1),
  sources: z.array(sourceSchema).min(1),
  observations: z.array(observationSchema),
  organizations: z.array(organizationSchema),
  projects: z.array(projectSchema),
  phases: z.array(phaseSchema),
  ownership: z.array(ownershipSchema),
  lifecycleEvidence: z.array(lifecycleEvidenceSchema).min(1),
  facilities: z.array(facilitySchema),
  countryIndicators: z.array(countryIndicatorSchema),
  calculations: z.array(calculationSchema),
  coverage: z.array(coverageAssessmentSchema).min(1),
});

export type Classification = z.infer<typeof classificationSchema>;
export type Technology = z.infer<typeof technologySchema>;
export type EnergyRole = z.infer<typeof energyRoleSchema>;
export type Confidence = z.infer<typeof confidenceSchema>;
export type Facility = z.infer<typeof facilitySchema>;
export type Source = z.infer<typeof sourceSchema>;
export type AtlasDataset = z.infer<typeof atlasDatasetSchema>;
export type CountryIndicator = z.infer<typeof countryIndicatorSchema>;
export type CoverageAssessment = z.infer<typeof coverageAssessmentSchema>;
export type CoveragePublicationStatus = z.infer<typeof coveragePublicationStatusSchema>;
export type Geography = z.infer<typeof geographySchema>;
