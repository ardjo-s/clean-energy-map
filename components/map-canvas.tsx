"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type GeoJSONSource, type Map } from "maplibre-gl";
import type { Facility } from "@/lib/domain/schemas";
import { mappedFacilitiesGeoJson } from "@/lib/atlas/query";

export function MapCanvas({ facilities, selectedId, onSelect }: { facilities: Facility[]; selectedId: string | null; onSelect(id: string): void }) {
  const node = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  useEffect(() => {
    if (!node.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: node.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [7, 23], zoom: 1.35, minZoom: 1,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-left");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    map.on("load", () => {
      map.addSource("facilities", { type: "geojson", data: mappedFacilitiesGeoJson(facilities), cluster: true, clusterMaxZoom: 10, clusterRadius: 42 });
      map.addLayer({ id: "clusters", type: "circle", source: "facilities", filter: ["has", "point_count"], paint: { "circle-color": "#d9eeec", "circle-stroke-color": "#fff", "circle-stroke-width": 2, "circle-radius": ["step", ["get", "point_count"], 19, 25, 24, 100, 30] } });
      map.addLayer({ id: "cluster-count", type: "symbol", source: "facilities", filter: ["has", "point_count"], layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 13 }, paint: { "text-color": "#0a1e40" } });
      map.addLayer({ id: "facility-points", type: "circle", source: "facilities", filter: ["!", ["has", "point_count"]], paint: { "circle-color": ["match", ["get", "classification"], "eligible", "#087f83", "conditional", "#d88a00", "excluded", "#b83d27", "unknown", "#7b838d", "#7b838d"], "circle-radius": ["case", ["==", ["get", "id"], selectedId ?? ""], 9, 6], "circle-stroke-color": "#fff", "circle-stroke-width": 2 } });
      map.on("click", "clusters", async (event) => {
        const feature = map.queryRenderedFeatures(event.point, { layers: ["clusters"] })[0];
        const id = Number(feature?.properties?.cluster_id);
        const source = map.getSource("facilities") as GeoJSONSource;
        const zoom = await source.getClusterExpansionZoom(id);
        const point = feature.geometry.type === "Point" ? feature.geometry.coordinates as [number, number] : [0, 0] as [number, number];
        map.easeTo({ center: point, zoom });
      });
      map.on("click", "facility-points", (event) => {
        const id = event.features?.[0]?.properties?.id as string | undefined;
        if (id) onSelectRef.current(id);
      });
      for (const layer of ["clusters", "facility-points"]) {
        map.on("mouseenter", layer, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", layer, () => { map.getCanvas().style.cursor = ""; });
      }
    });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);
  useEffect(() => {
    const source = mapRef.current?.getSource("facilities") as GeoJSONSource | undefined;
    source?.setData(mappedFacilitiesGeoJson(facilities));
  }, [facilities]);
  return <div className="map" ref={node} aria-label="Clean-energy facility map" />;
}
