"use client";

import { useEffect, useRef } from "react";
import maplibregl, { type GeoJSONSource, type Map } from "maplibre-gl";
import type { Facility } from "@/lib/domain/schemas";
import { mappedFacilitiesGeoJson } from "@/lib/atlas/query";
import type { MapViewState } from "@/hooks/use-atlas-url";

const WORLD_VIEW = { longitude: 7, latitude: 23, zoom: 1.35 };

export function MapCanvas({ facilities, selectedId, geography, viewState, facilitiesVisible, onSelect, onViewState }: { facilities: Facility[]; selectedId: string | null; geography: string; viewState: MapViewState | null; facilitiesVisible: boolean; onSelect(id: string): void; onViewState(view: MapViewState): void }) {
  const node = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const onSelectRef = useRef(onSelect);
  const onViewStateRef = useRef(onViewState);
  const facilitiesRef = useRef(facilities);
  const facilitiesVisibleRef = useRef(facilitiesVisible);
  const selectedIdRef = useRef(selectedId);
  const initialViewRef = useRef(viewState ?? WORLD_VIEW);
  const previousGeographyRef = useRef(viewState ? geography : "");
  const applySelection = (map: Map) => {
    if (!map.getLayer("facility-points")) return;
    map.setPaintProperty("facility-points", "circle-radius", ["case", ["==", ["get", "id"], selectedIdRef.current ?? ""], 9, 6]);
  };

  useEffect(() => {
    onSelectRef.current = onSelect;
    onViewStateRef.current = onViewState;
  }, [onSelect, onViewState]);

  useEffect(() => {
    if (!node.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: node.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [initialViewRef.current.longitude, initialViewRef.current.latitude], zoom: initialViewRef.current.zoom, minZoom: 1,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-left");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    map.on("moveend", () => {
      const center = map.getCenter();
      onViewStateRef.current({ longitude: center.lng, latitude: center.lat, zoom: map.getZoom() });
    });
    map.on("load", () => {
      map.addSource("facilities", { type: "geojson", data: mappedFacilitiesGeoJson(facilitiesRef.current), cluster: true, clusterMaxZoom: 10, clusterRadius: 42 });
      map.addLayer({ id: "clusters", type: "circle", source: "facilities", filter: ["has", "point_count"], paint: { "circle-color": "#d9eeec", "circle-stroke-color": "#fff", "circle-stroke-width": 2, "circle-radius": ["step", ["get", "point_count"], 19, 25, 24, 100, 30] } });
      map.addLayer({ id: "cluster-count", type: "symbol", source: "facilities", filter: ["has", "point_count"], layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 13 }, paint: { "text-color": "#0a1e40" } });
      map.addLayer({ id: "facility-points", type: "circle", source: "facilities", filter: ["!", ["has", "point_count"]], paint: { "circle-color": ["match", ["get", "classification"], "eligible", "#087f83", "conditional", "#d88a00", "excluded", "#b83d27", "unknown", "#7b838d", "#7b838d"], "circle-radius": 6, "circle-stroke-color": "#fff", "circle-stroke-width": 2 } });
      applySelection(map);
      if (!facilitiesVisibleRef.current) for (const layer of ["clusters", "cluster-count", "facility-points"]) map.setLayoutProperty(layer, "visibility", "none");
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
    facilitiesRef.current = facilities;
    const source = mapRef.current?.getSource("facilities") as GeoJSONSource | undefined;
    source?.setData(mappedFacilitiesGeoJson(facilities));
  }, [facilities]);
  useEffect(() => {
    facilitiesVisibleRef.current = facilitiesVisible;
    const map = mapRef.current;
    if (!map) return;
    for (const layer of ["clusters", "cluster-count", "facility-points"]) {
      if (map.getLayer(layer)) map.setLayoutProperty(layer, "visibility", facilitiesVisible ? "visible" : "none");
    }
  }, [facilitiesVisible]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !viewState) return;
    const center = map.getCenter();
    if (Math.abs(center.lng - viewState.longitude) > 0.0001 || Math.abs(center.lat - viewState.latitude) > 0.0001 || Math.abs(map.getZoom() - viewState.zoom) > 0.01) {
      map.stop();
      map.jumpTo({ center: [viewState.longitude, viewState.latitude], zoom: viewState.zoom });
    }
  }, [viewState]);
  useEffect(() => {
    if (previousGeographyRef.current === geography) return;
    previousGeographyRef.current = geography;
    if (viewState) return;
    const map = mapRef.current;
    if (!map) return;
    const fit = () => {
      const features = mappedFacilitiesGeoJson(facilities).features;
      const coordinates = features.flatMap((feature) => feature.geometry.type === "Point" ? [feature.geometry.coordinates] : feature.geometry.coordinates.flat());
      if (geography === "WORLD" || coordinates.length === 0) {
        map.easeTo({ center: [WORLD_VIEW.longitude, WORLD_VIEW.latitude], zoom: WORLD_VIEW.zoom });
        return;
      }
      const bounds = coordinates.reduce((current, coordinate) => current.extend(coordinate as [number, number]), new maplibregl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number]));
      map.fitBounds(bounds, { padding: 70, maxZoom: 6, duration: 500 });
    };
    if (map.loaded()) fit(); else map.once("load", fit);
  }, [facilities, geography, viewState]);
  useEffect(() => {
    selectedIdRef.current = selectedId;
    const map = mapRef.current;
    if (map) applySelection(map);
  }, [selectedId]);
  return <div className="map" ref={node} role="region" aria-label="Clean-energy facility map" data-record-count={facilities.length} data-facilities-visible={facilitiesVisible} />;
}
