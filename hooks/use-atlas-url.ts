"use client";

import { useCallback, useEffect, useState } from "react";
import type { AtlasFilters } from "@/lib/atlas/query";
import { emptyFilters } from "@/lib/atlas/query";
import type { Classification, Facility, Technology } from "@/lib/domain/schemas";

export type AtlasUrlState = { facility: string | null; geography: string; filters: AtlasFilters };

function readState(): AtlasUrlState {
  if (typeof window === "undefined") return { facility: null, geography: "WORLD", filters: emptyFilters };
  const p = new URLSearchParams(window.location.search);
  return {
    facility: p.get("facility"), geography: p.get("geography") ?? "WORLD",
    filters: {
      ...emptyFilters,
      query: p.get("q") ?? "",
      technologies: p.getAll("technology") as Technology[],
      classifications: p.getAll("classification") as Classification[],
      lifecycleStates: p.getAll("lifecycle") as Facility["lifecycleState"][],
      precisions: p.getAll("precision") as Facility["location"]["precision"][],
    },
  };
}

export function useAtlasUrl() {
  const [state, setStateValue] = useState<AtlasUrlState>(readState);
  useEffect(() => {
    const restore = () => setStateValue(readState());
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  const setState = useCallback((next: AtlasUrlState | ((old: AtlasUrlState) => AtlasUrlState), mode: "push" | "replace" = "push") => {
    setStateValue((old) => {
      const value = typeof next === "function" ? next(old) : next;
      const p = new URLSearchParams();
      if (value.facility) p.set("facility", value.facility);
      if (value.geography !== "WORLD") p.set("geography", value.geography);
      if (value.filters.query) p.set("q", value.filters.query);
      for (const x of value.filters.technologies) p.append("technology", x);
      for (const x of value.filters.classifications) p.append("classification", x);
      for (const x of value.filters.lifecycleStates) p.append("lifecycle", x);
      for (const x of value.filters.precisions) p.append("precision", x);
      window.history[mode === "push" ? "pushState" : "replaceState"]({}, "", `${window.location.pathname}${p.size ? `?${p}` : ""}`);
      return value;
    });
  }, []);
  return [state, setState] as const;
}
