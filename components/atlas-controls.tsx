"use client";

import { Filter, Globe2, Layers3, Search, X } from "lucide-react";
import type { AtlasFilters } from "@/lib/atlas/query";
import type { Classification, Facility, Technology } from "@/lib/domain/schemas";

const classifications: Classification[] = ["eligible", "conditional", "excluded", "unknown"];
const lifecycle: Facility["lifecycleState"][] = ["operating", "under_construction", "approved", "permitted", "proposed", "retired"];

function toggle<T>(values: T[], value: T) { return values.includes(value) ? values.filter((x) => x !== value) : [...values, value]; }
function title(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (x) => x.toUpperCase()); }

export function SearchBox({ filters, facilities, onChange, onSelect }: { filters: AtlasFilters; facilities: Facility[]; onChange(f: AtlasFilters): void; onSelect(id: string): void }) {
  const results = filters.query.trim() ? facilities.slice(0, 8) : [];
  return <div className="search-wrap">
    <Search size={20} aria-hidden="true"/><input aria-label="Search facilities, countries, operators" placeholder="Search facilities, countries, operators" value={filters.query} onChange={(e) => onChange({ ...filters, query: e.target.value })}/>
    {filters.query && <button className="icon-button clear" aria-label="Clear search" onClick={() => onChange({ ...filters, query: "" })}><X size={18}/></button>}
    {results.length > 0 && <ul className="search-results" aria-label="Search results">{results.map((facility) => <li key={facility.id}><button onClick={() => onSelect(facility.id)}><strong>{facility.officialName}</strong><span>{facility.technologyLabel} · {facility.location.geometryType === "unplotted" ? "Unplotted" : "Mapped"}</span></button></li>)}</ul>}
  </div>;
}

export function ControlPanel({ open, setOpen, filters, allFacilities, geography, geographies, onGeography, onChange }: { open: boolean; setOpen(v: boolean): void; filters: AtlasFilters; allFacilities: Facility[]; geography: string; geographies: string[]; onGeography(v: string): void; onChange(f: AtlasFilters): void }) {
  const technologies = [...new Set(allFacilities.map((f) => f.technology))] as Technology[];
  const count = filters.technologies.length + filters.classifications.length + filters.lifecycleStates.length + filters.precisions.length;
  return <div className="left-controls">
    <label className="control geography"><Globe2 size={18}/><select aria-label="Geography" value={geography} onChange={(event) => onGeography(event.target.value)}><option value="WORLD">World</option>{geographies.map((code) => <option key={code} value={code}>{code}</option>)}</select></label>
    <button className="control filter-trigger" aria-expanded={open} onClick={() => setOpen(!open)}><Filter size={18}/> Filters {count > 0 && <b>{count}</b>}</button>
    {open && <aside className="filter-panel" aria-label="Filters">
      <div className="panel-heading"><strong>Filters</strong><button className="text-button" onClick={() => onChange({ ...filters, technologies: [], classifications: [], lifecycleStates: [], precisions: [] })}>Clear</button></div>
      <fieldset><legend>Classification</legend>{classifications.map((value) => <label key={value}><input type="checkbox" checked={filters.classifications.includes(value)} onChange={() => onChange({ ...filters, classifications: toggle(filters.classifications, value) })}/><span className={`dot ${value}`}/>{title(value)}</label>)}</fieldset>
      {technologies.length > 0 && <fieldset><legend>Technology</legend>{technologies.map((value) => <label key={value}><input type="checkbox" checked={filters.technologies.includes(value)} onChange={() => onChange({ ...filters, technologies: toggle(filters.technologies, value) })}/>{title(value)}</label>)}</fieldset>}
      <fieldset><legend>Lifecycle</legend>{lifecycle.map((value) => <label key={value}><input type="checkbox" checked={filters.lifecycleStates.includes(value)} onChange={() => onChange({ ...filters, lifecycleStates: toggle(filters.lifecycleStates, value) })}/>{title(value)}</label>)}</fieldset>
      <fieldset><legend>Location</legend>{(["exact_site", "approximate_site", "project_area", "locality_only", "unknown"] as Facility["location"]["precision"][]).map((value) => <label key={value}><input type="checkbox" checked={filters.precisions.includes(value)} onChange={() => onChange({ ...filters, precisions: toggle(filters.precisions, value) })}/>{title(value)}</label>)}</fieldset>
    </aside>}
    <details className="layer-panel"><summary><Layers3 size={17}/> Map layers</summary><label><input type="checkbox" defaultChecked/> Facilities</label><label><input type="checkbox" defaultChecked/> Clusters</label><label><input type="checkbox" defaultChecked/> Grid & basemap</label><label><input type="checkbox"/> Regions</label><label><input type="checkbox"/> EEZ boundaries</label></details>
  </div>;
}

export function Legend({ mapped, unplotted }: { mapped: number; unplotted: number }) {
  return <div className="legend" aria-label="Map legend"><div>{classifications.map((c) => <span key={c}><i className={`dot ${c}`}/>{title(c)}</span>)}</div><div><span>◉ Mapped {mapped}</span><span>○ Unplotted {unplotted}</span></div></div>;
}
