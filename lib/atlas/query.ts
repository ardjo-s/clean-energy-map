import type { Classification, Confidence, EnergyRole, Facility, Technology } from "@/lib/domain/schemas";

export type LocationState = "mapped" | "unplotted";
export type FreshnessState = "current" | "stale";

export type AtlasFilters = {
  technologies: Technology[];
  classifications: Classification[];
  lifecycleStates: Facility["lifecycleState"][];
  energyRoles: EnergyRole[];
  confidences: Confidence[];
  precisions: Facility["location"]["precision"][];
  locationStates: LocationState[];
  freshnessStates: FreshnessState[];
  minimumCapacityMw: number | null;
  maximumCapacityMw: number | null;
  query: string;
};

export const emptyFilters: AtlasFilters = {
  technologies: [],
  classifications: [],
  lifecycleStates: [],
  energyRoles: [],
  confidences: [],
  precisions: [],
  locationStates: [],
  freshnessStates: [],
  minimumCapacityMw: null,
  maximumCapacityMw: null,
  query: "",
};

function freshnessState(verifiedAt: string): FreshnessState {
  const age = Date.now() - new Date(verifiedAt).getTime();
  return age <= 730 * 24 * 60 * 60 * 1000 ? "current" : "stale";
}

export function filterFacilities(facilities: Facility[], filters: AtlasFilters): Facility[] {
  const query = filters.query.trim().toLocaleLowerCase();

  return facilities.filter((facility) => {
    if (filters.technologies.length && !filters.technologies.includes(facility.technology)) return false;
    if (filters.classifications.length && !filters.classifications.includes(facility.classification)) return false;
    if (filters.lifecycleStates.length && !filters.lifecycleStates.includes(facility.lifecycleState)) return false;
    if (filters.energyRoles.length && !filters.energyRoles.includes(facility.energyRole)) return false;
    if (filters.confidences.length && !filters.confidences.includes(facility.location.confidence)) return false;
    if (filters.precisions.length && !filters.precisions.includes(facility.location.precision)) return false;
    const locationState: LocationState = facility.location.geometryType === "unplotted" ? "unplotted" : "mapped";
    if (filters.locationStates.length && !filters.locationStates.includes(locationState)) return false;
    if (filters.freshnessStates.length && !filters.freshnessStates.includes(freshnessState(facility.verifiedAt))) return false;
    if (filters.minimumCapacityMw !== null || filters.maximumCapacityMw !== null) {
      const hasMatchingPower = facility.capacities.some((capacity) =>
        capacity.status === "installed" &&
        capacity.kind !== "storage_energy_mwh" &&
        (filters.minimumCapacityMw === null || capacity.value >= filters.minimumCapacityMw) &&
        (filters.maximumCapacityMw === null || capacity.value <= filters.maximumCapacityMw));
      if (!hasMatchingPower) return false;
    }

    if (!query) return true;
    const haystack = [
      facility.officialName,
      ...facility.alternateNames,
      facility.technologyLabel,
      facility.jurisdiction.countryCode ?? "",
      facility.jurisdiction.admin1 ?? "",
    ]
      .join(" ")
      .toLocaleLowerCase();
    return haystack.includes(query);
  });
}

export function mappedFacilitiesGeoJson(facilities: Facility[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: facilities.flatMap((facility): GeoJSON.Feature[] => {
      if (facility.location.geometryType === "unplotted") return [];
      if (facility.location.geometryType === "point") {
        return [
          {
            type: "Feature",
            id: facility.id,
            geometry: { type: "Point", coordinates: facility.location.coordinates },
            properties: {
              id: facility.id,
              name: facility.officialName,
              classification: facility.classification,
              technology: facility.technology,
              precision: facility.location.precision,
            },
          },
        ];
      }
      return [
        {
          type: "Feature",
          id: facility.id,
          geometry: { type: "Polygon", coordinates: facility.location.coordinates },
          properties: {
            id: facility.id,
            name: facility.officialName,
            classification: facility.classification,
            technology: facility.technology,
            precision: facility.location.precision,
          },
        },
      ];
    }),
  };
}
