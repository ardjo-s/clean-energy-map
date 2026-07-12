"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AtlasFilters } from "@/lib/atlas/query";
import { emptyFilters } from "@/lib/atlas/query";
import type { Classification, Confidence, EnergyRole, Facility, Technology } from "@/lib/domain/schemas";
import type { FreshnessState, LocationState } from "@/lib/atlas/query";

export type DrawerPage = "coverage" | "sources" | "methodology" | "limitations";
export type MapViewState = { longitude: number; latitude: number; zoom: number };
export type AtlasUrlState = { facility: string | null; geography: string; drawer: DrawerPage | null; map: MapViewState | null; filters: AtlasFilters };

function finiteParameter(params: URLSearchParams, name: string, minimum: number, maximum: number): number | null {
  const raw = params.get(name);
  if (raw === null || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= minimum && value <= maximum ? value : null;
}

function readState(): AtlasUrlState {
  if (typeof window === "undefined") return { facility: null, geography: "WORLD", drawer: null, map: null, filters: emptyFilters };
  const p = new URLSearchParams(window.location.search);
  const longitude = finiteParameter(p, "lng", -180, 180);
  const latitude = finiteParameter(p, "lat", -90, 90);
  const zoom = finiteParameter(p, "zoom", 0, 24);
  const view = p.get("view");
  return {
    facility: p.get("facility"), geography: p.get("geography") ?? "WORLD",
    drawer: (["coverage", "sources", "methodology", "limitations"] as const).includes(view as DrawerPage) ? view as DrawerPage : null,
    map: longitude !== null && latitude !== null && zoom !== null ? { longitude, latitude, zoom } : null,
    filters: {
      ...emptyFilters,
      query: p.get("q") ?? "",
      technologies: p.getAll("technology") as Technology[],
      classifications: p.getAll("classification") as Classification[],
      lifecycleStates: p.getAll("lifecycle") as Facility["lifecycleState"][],
      energyRoles: p.getAll("role") as EnergyRole[],
      confidences: p.getAll("confidence") as Confidence[],
      precisions: p.getAll("precision") as Facility["location"]["precision"][],
      locationStates: p.getAll("location") as LocationState[],
      freshnessStates: p.getAll("freshness") as FreshnessState[],
      minimumCapacityMw: finiteParameter(p, "capacityMin", 0, Number.MAX_SAFE_INTEGER),
      maximumCapacityMw: finiteParameter(p, "capacityMax", 0, Number.MAX_SAFE_INTEGER),
    },
  };
}

function writeState(value: AtlasUrlState, mode: "push" | "replace") {
  const p = new URLSearchParams();
  if (value.facility) p.set("facility", value.facility);
  if (value.geography !== "WORLD") p.set("geography", value.geography);
  if (value.drawer) p.set("view", value.drawer);
  if (value.map) {
    p.set("lng", value.map.longitude.toFixed(5));
    p.set("lat", value.map.latitude.toFixed(5));
    p.set("zoom", value.map.zoom.toFixed(2));
  }
  if (value.filters.query) p.set("q", value.filters.query);
  for (const x of value.filters.technologies) p.append("technology", x);
  for (const x of value.filters.classifications) p.append("classification", x);
  for (const x of value.filters.lifecycleStates) p.append("lifecycle", x);
  for (const x of value.filters.energyRoles) p.append("role", x);
  for (const x of value.filters.confidences) p.append("confidence", x);
  for (const x of value.filters.precisions) p.append("precision", x);
  for (const x of value.filters.locationStates) p.append("location", x);
  for (const x of value.filters.freshnessStates) p.append("freshness", x);
  if (value.filters.minimumCapacityMw !== null) p.set("capacityMin", String(value.filters.minimumCapacityMw));
  if (value.filters.maximumCapacityMw !== null) p.set("capacityMax", String(value.filters.maximumCapacityMw));
  window.history[mode === "push" ? "pushState" : "replaceState"]({}, "", `${window.location.pathname}${p.size ? `?${p}` : ""}`);
}

export function useAtlasUrl() {
  const [state, setStateValue] = useState<AtlasUrlState>(readState);
  const stateRef = useRef(state);
  useEffect(() => {
    const restore = () => {
      const restored = readState();
      stateRef.current = restored;
      setStateValue(restored);
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  const setState = useCallback((next: AtlasUrlState | ((old: AtlasUrlState) => AtlasUrlState), mode: "push" | "replace" = "push") => {
    const value = typeof next === "function" ? next(stateRef.current) : next;
    stateRef.current = value;
    setStateValue(value);
    writeState(value, mode);
  }, []);
  return [state, setState] as const;
}
