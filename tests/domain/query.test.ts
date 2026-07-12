import { describe, expect, it } from "vitest";
import { emptyFilters, filterFacilities, mappedFacilitiesGeoJson } from "@/lib/atlas/query";
import type { Facility } from "@/lib/domain/schemas";

const base = {
  id: "facility-unplotted",
  externalIdentifiers: { source: "1" },
  officialName: "Unplotted Solar Site",
  alternateNames: ["Solar Alpha"],
  projectId: "project-1",
  phaseIds: [],
  technology: "solar_photovoltaic",
  technologyLabel: "Solar photovoltaic",
  energyRole: "electricity_generation",
  classification: "eligible",
  classificationReason: "Technology-level lifecycle evidence.",
  lifecycleEvidenceId: "lifecycle-solar",
  lifecycleState: "operating",
  stateDate: null,
  capacities: [],
  annualGeneration: null,
  location: {
    geometryType: "unplotted",
    coordinates: null,
    precision: "locality_only",
    confidence: "medium",
    evidenceObservationIds: [],
    method: "withheld_no_reliable_geometry",
  },
  jurisdiction: {
    countryCode: "US",
    admin1: "California",
    context: "land",
    disputed: false,
    evidenceObservationIds: ["jurisdiction"],
  },
  operatorOrganizationIds: [],
  ownershipIds: [],
  sourceObservationIds: ["name"],
  conflicts: [],
  limitations: ["No reliable coordinates."],
  verifiedAt: "2026-07-12T00:00:00.000Z",
} satisfies Facility;

describe("atlas query", () => {
  it("searches unplotted records", () => {
    expect(filterFacilities([base], { ...emptyFilters, query: "alpha" })).toHaveLength(1);
  });

  it("never plots unplotted records", () => {
    expect(mappedFacilitiesGeoJson([base]).features).toHaveLength(0);
  });

  it("filters explicit classification states", () => {
    expect(filterFacilities([base], { ...emptyFilters, classifications: ["unknown"] })).toHaveLength(0);
    expect(filterFacilities([base], { ...emptyFilters, classifications: ["eligible"] })).toHaveLength(1);
  });
});
