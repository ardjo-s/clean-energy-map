import type { Classification, Facility, Technology } from "@/lib/domain/schemas";

export type AtlasFilters = {
  technologies: Technology[];
  classifications: Classification[];
  lifecycleStates: Facility["lifecycleState"][];
  precisions: Facility["location"]["precision"][];
  query: string;
};

export const emptyFilters: AtlasFilters = {
  technologies: [],
  classifications: [],
  lifecycleStates: [],
  precisions: [],
  query: "",
};

export function filterFacilities(facilities: Facility[], filters: AtlasFilters): Facility[] {
  const query = filters.query.trim().toLocaleLowerCase();

  return facilities.filter((facility) => {
    if (filters.technologies.length && !filters.technologies.includes(facility.technology)) return false;
    if (filters.classifications.length && !filters.classifications.includes(facility.classification)) return false;
    if (filters.lifecycleStates.length && !filters.lifecycleStates.includes(facility.lifecycleState)) return false;
    if (filters.precisions.length && !filters.precisions.includes(facility.location.precision)) return false;

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
