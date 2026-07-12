import type { CountryIndicator, Facility } from "@/lib/domain/schemas";

export type CapacityTotals = {
  electricalMw: number;
  thermalMw: number;
  storagePowerMw: number;
  storageEnergyMwh: number;
};

export function aggregateCapacities(facilities: Facility[]): CapacityTotals {
  const totals: CapacityTotals = {
    electricalMw: 0,
    thermalMw: 0,
    storagePowerMw: 0,
    storageEnergyMwh: 0,
  };

  for (const facility of facilities) {
    for (const capacity of facility.capacities) {
      if (capacity.status !== "installed") continue;
      if (capacity.kind === "electrical_mw") totals.electricalMw += capacity.value;
      if (capacity.kind === "thermal_mw") totals.thermalMw += capacity.value;
      if (capacity.kind === "storage_power_mw") totals.storagePowerMw += capacity.value;
      if (capacity.kind === "storage_energy_mwh") totals.storageEnergyMwh += capacity.value;
    }
  }

  return totals;
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
