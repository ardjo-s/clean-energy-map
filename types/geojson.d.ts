declare namespace GeoJSON {
  type Position = number[];
  type Geometry =
    | { type: "Point"; coordinates: Position }
    | { type: "Polygon"; coordinates: Position[][] };
  type Feature = {
    type: "Feature";
    id?: string | number;
    geometry: Geometry;
    properties: Record<string, unknown>;
  };
  type FeatureCollection = {
    type: "FeatureCollection";
    features: Feature[];
  };
}
