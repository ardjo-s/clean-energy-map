import type { AtlasFilters } from "@/lib/atlas/query";
import { calculationSchema, type AtlasDataset, type CountryIndicator, type Facility } from "@/lib/domain/schemas";

export type CapacityTotals = {
  electricalMw: number;
  thermalMw: number;
  storagePowerMw: number;
  storageEnergyMwh: number;
};

const capacityKinds = {
  electrical_mw: { total: "electricalMw", unit: "MW" },
  thermal_mw: { total: "thermalMw", unit: "MWth" },
  storage_power_mw: { total: "storagePowerMw", unit: "MW" },
  storage_energy_mwh: { total: "storageEnergyMwh", unit: "MWh" },
} as const;

type CapacityLineageContext = Pick<AtlasDataset, "release" | "observations" | "sources">;

function installedCapacities(facilities: Facility[]) {
  return facilities.flatMap((facility) => facility.capacities
    .filter((capacity) => capacity.status === "installed")
    .map((capacity) => ({ facility, capacity })));
}

export function aggregateCapacities(facilities: Facility[]): CapacityTotals {
  const totals: CapacityTotals = {
    electricalMw: 0,
    thermalMw: 0,
    storagePowerMw: 0,
    storageEnergyMwh: 0,
  };

  for (const { capacity } of installedCapacities(facilities)) {
    totals[capacityKinds[capacity.kind].total] += capacity.value;
  }

  return totals;
}

export async function filteredCapacityLineage(
  data: CapacityLineageContext,
  facilities: Facility[],
  geography: string,
  filters: AtlasFilters,
  executedAt = new Date().toISOString(),
) {
  const normalizedFilters = Object.fromEntries(
    Object.entries(filters)
      .toSorted(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
      .map(([key, value]) => [key, Array.isArray(value) ? value.toSorted() : value]),
  );
  const scope = { datasetReleaseId: data.release.id, geography, filters: normalizedFilters, facilityIds: facilities.map((facility) => facility.id).toSorted() };
  const scopeBytes = new TextEncoder().encode(JSON.stringify(scope));
  const scopeHash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", scopeBytes))].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const entries = installedCapacities(facilities);
  const observationIds = new Set(entries.flatMap(({ capacity }) => capacity.sourceObservationIds));
  const observations = data.observations.filter((item) => observationIds.has(item.id));
  if (observations.length !== observationIds.size) throw new Error("Filtered capacity lineage is missing source observations.");
  const sourceIds = new Set(observations.map((item) => item.sourceId));
  const sources = data.sources.filter((item) => sourceIds.has(item.id));
  if (sources.length !== sourceIds.size) throw new Error("Filtered capacity lineage is missing source records.");
  const calculations = Object.entries(capacityKinds).flatMap(([kind, metadata]) => {
    const included = entries.filter(({ capacity }) => capacity.kind === kind);
    if (included.length === 0) return [];
    const inputObservationIds = [...new Set(included.flatMap(({ capacity }) => capacity.sourceObservationIds))].toSorted();
    return [calculationSchema.parse({
      id: `calc-filtered-installed-capacity-${metadata.total}-${data.release.buildId}-${scopeHash}`,
      formulaVersion: "filtered-installed-capacity-v1",
      formula: `sum(installed ${kind} values for the exact released facility selection)`,
      inputObservationIds,
      inputs: included.map(({ facility, capacity }) => ({
        label: `${facility.officialName} (${facility.id})`,
        value: capacity.value,
        unit: metadata.unit,
        included: true,
        reason: "Installed capacity with matching geography and active filters.",
      })),
      result: included.reduce((sum, { capacity }) => sum + capacity.value, 0),
      resultUnit: metadata.unit,
      executedAt,
      softwareVersion: "atlas-filtered-capacity-1.0.0",
      limitations: [
        "Capacity is not electricity generation.",
        "Planned and retired capacities are excluded.",
        "Nameplate, thermal, storage-power, and storage-energy quantities remain separate.",
      ],
    })];
  });
  return {
    contractVersion: "filtered-capacity-lineage-v1",
    datasetRelease: data.release,
    scope: { ...scope, sha256: scopeHash },
    calculations,
    zeroResults: Object.entries(capacityKinds)
      .filter(([kind]) => !entries.some(({ capacity }) => capacity.kind === kind))
      .map(([kind, item]) => ({ kind, result: 0, unit: item.unit, reason: "No installed source observation matched the exact released facility selection." })),
    observations,
    sources,
  };
}

export function calculatePercent(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    throw new Error("A percentage requires finite inputs and a positive denominator.");
  }
  return (numerator / denominator) * 100;
}

export function validateIndicatorArithmetic(indicator: CountryIndicator): boolean {
  const calculated = calculatePercent(indicator.numerator.value, indicator.denominator.value);
  return Math.abs(calculated - indicator.value) < 0.0001;
}

export function countLocationStates(facilities: Facility[]) {
  const mapped = facilities.filter((facility) => facility.location.geometryType !== "unplotted").length;
  return { total: facilities.length, mapped, unplotted: facilities.length - mapped };
}
