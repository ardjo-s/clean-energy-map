import { describe, expect, it } from "vitest";
import { aggregateCapacities, calculatePercent, countLocationStates } from "@/lib/atlas/calculations";
import type { Facility } from "@/lib/domain/schemas";

function facility(overrides: Partial<Facility> = {}): Facility {
  return {
    id: "facility-1",
    externalIdentifiers: { source: "1" },
    officialName: "Source-backed facility",
    alternateNames: [],
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
      precision: "unknown",
      confidence: "unknown",
      evidenceObservationIds: [],
      method: "withheld_no_reliable_geometry",
    },
    jurisdiction: {
      countryCode: "US",
      admin1: null,
      context: "land",
      disputed: false,
      evidenceObservationIds: ["observation-jurisdiction"],
    },
    operatorOrganizationIds: [],
    ownershipIds: [],
    sourceObservationIds: ["observation-name"],
    conflicts: [],
    limitations: ["Facility-level lifecycle assessment unavailable."],
    verifiedAt: "2026-07-12T00:00:00.000Z",
    ...overrides,
  };
}

describe("atlas calculations", () => {
  it("keeps electrical, thermal, storage power, and storage energy separate", () => {
    const totals = aggregateCapacities([
      facility({ capacities: [{ kind: "electrical_mw", value: 10, status: "installed", sourceObservationIds: ["a"] }] }),
      facility({ capacities: [{ kind: "thermal_mw", value: 20, status: "installed", sourceObservationIds: ["b"] }] }),
      facility({ capacities: [{ kind: "storage_power_mw", value: 30, status: "installed", sourceObservationIds: ["c"] }] }),
      facility({ capacities: [{ kind: "storage_energy_mwh", value: 40, status: "installed", sourceObservationIds: ["d"] }] }),
    ]);

    expect(totals).toEqual({ electricalMw: 10, thermalMw: 20, storagePowerMw: 30, storageEnergyMwh: 40 });
  });

  it("rejects invalid percentage denominators", () => {
    expect(() => calculatePercent(10, 0)).toThrow(/positive denominator/);
  });

  it("keeps mapped and unplotted counts reconcilable", () => {
    const mapped = facility({
      id: "mapped",
      location: {
        geometryType: "point",
        coordinates: [-120, 40],
        precision: "exact_site",
        confidence: "high",
        evidenceObservationIds: ["lat", "lon"],
        method: "source_coordinates",
      },
    });
    expect(countLocationStates([mapped, facility({ id: "unplotted" })])).toEqual({ total: 2, mapped: 1, unplotted: 1 });
  });
});
