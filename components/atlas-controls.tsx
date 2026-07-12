"use client";

import { Filter, Globe2, Layers3, Search, X } from "lucide-react";
import { emptyFilters, type AtlasFilters, type FreshnessState, type LocationState } from "@/lib/atlas/query";
import type { CapacityTotals } from "@/lib/atlas/calculations";
import type { Classification, Confidence, EnergyRole, Facility, Geography, Technology } from "@/lib/domain/schemas";

const classifications: Classification[] = ["eligible", "conditional", "excluded", "unknown"];
const lifecycle: Facility["lifecycleState"][] = ["operating", "under_construction", "approved", "permitted", "proposed", "suspended", "cancelled", "retired", "unknown"];
const roles: EnergyRole[] = ["electricity_generation", "heat_generation", "storage", "energy_carrier"];
const confidences: Confidence[] = ["high", "medium", "low", "unknown"];
const locationStates: LocationState[] = ["mapped", "unplotted"];
const freshnessStates: FreshnessState[] = ["current", "stale"];
const precisions: Facility["location"]["precision"][] = ["exact_site", "approximate_site", "project_area", "locality_only", "unknown"];

function toggle<T>(values: T[], value: T) { return values.includes(value) ? values.filter((x) => x !== value) : [...values, value]; }
function title(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (x) => x.toUpperCase()); }
function optionalNumber(value: string) { const parsed = Number(value); return value === "" || !Number.isFinite(parsed) ? null : Math.max(0, parsed); }

export function SearchBox({ filters, facilities, geographies, mobileOpen = false, onChange, onSelect, onGeography }: { filters: AtlasFilters; facilities: Facility[]; geographies: Geography[]; mobileOpen?: boolean; onChange(f: AtlasFilters): void; onSelect(id: string): void; onGeography(code: string): void }) {
  const query = filters.query.trim().toLocaleLowerCase();
  const facilityResults = query ? facilities.slice(0, 6) : [];
  const geographyResults = query ? geographies.filter((item) => `${item.name} ${item.code}`.toLocaleLowerCase().includes(query)).slice(0, 4) : [];
  return <div className={`search-wrap${mobileOpen ? " mobile-open" : ""}`}>
    <Search size={20} aria-hidden="true"/><input aria-label="Search facilities, countries, operators" placeholder="Search facilities, countries, operators" value={filters.query} onChange={(event) => onChange({ ...filters, query: event.target.value })}/>
    {filters.query && <button className="icon-button clear" aria-label="Clear search" onClick={() => onChange({ ...filters, query: "" })}><X size={18}/></button>}
    {(facilityResults.length > 0 || geographyResults.length > 0) && <ul className="search-results" aria-label="Search results">
      {geographyResults.map((item) => <li key={item.code}><button aria-label={`Open geography ${item.name}`} onClick={() => onGeography(item.code)}><strong>{item.name}</strong><span>{title(item.type)} · coverage profile</span></button></li>)}
      {facilityResults.map((facility) => <li key={facility.id}><button onClick={() => onSelect(facility.id)}><strong>{facility.officialName}</strong><span>{facility.technologyLabel} · {facility.location.geometryType === "unplotted" ? "Unplotted" : "Mapped"}</span></button></li>)}
    </ul>}
  </div>;
}

export function ControlPanel({ open, setOpen, filters, allFacilities, geography, geographies, facilitiesVisible, onFacilitiesVisible, onGeography, onChange }: { open: boolean; setOpen(v: boolean): void; filters: AtlasFilters; allFacilities: Facility[]; geography: string; geographies: Geography[]; facilitiesVisible: boolean; onFacilitiesVisible(v: boolean): void; onGeography(v: string): void; onChange(f: AtlasFilters): void }) {
  const technologies = [...new Set(allFacilities.map((facility) => facility.technology))].sort() as Technology[];
  const count = filters.technologies.length + filters.classifications.length + filters.lifecycleStates.length + filters.energyRoles.length + filters.confidences.length + filters.precisions.length + filters.locationStates.length + filters.freshnessStates.length + Number(filters.minimumCapacityMw !== null) + Number(filters.maximumCapacityMw !== null);
  return <div className="left-controls">
    <label className="control geography"><Globe2 size={18}/><select aria-label="Geography" value={geography} onChange={(event) => onGeography(event.target.value)}><option value="WORLD">World</option>{geographies.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label>
    <button className="control filter-trigger" aria-expanded={open} onClick={() => setOpen(!open)}><Filter size={18}/> Filters {count > 0 && <b>{count}</b>}</button>
    {open && <aside className="filter-panel" aria-label="Filters">
      <div className="panel-heading"><strong>Filters</strong><button className="text-button" onClick={() => onChange({ ...emptyFilters, query: filters.query })}>Clear</button></div>
      <fieldset><legend>Classification</legend>{classifications.map((value) => <label key={value}><input aria-label={title(value)} type="checkbox" checked={filters.classifications.includes(value)} onChange={() => onChange({ ...filters, classifications: toggle(filters.classifications, value) })}/><span className={`dot ${value}`}/>{title(value)}</label>)}</fieldset>
      <fieldset><legend>Energy role</legend>{roles.map((value) => <label key={value}><input type="checkbox" checked={filters.energyRoles.includes(value)} onChange={() => onChange({ ...filters, energyRoles: toggle(filters.energyRoles, value) })}/>{title(value)}</label>)}</fieldset>
      {technologies.length > 0 && <fieldset><legend>Technology in this release</legend>{technologies.map((value) => <label key={value}><input type="checkbox" checked={filters.technologies.includes(value)} onChange={() => onChange({ ...filters, technologies: toggle(filters.technologies, value) })}/>{title(value)}</label>)}</fieldset>}
      <fieldset><legend>Lifecycle</legend>{lifecycle.map((value) => <label key={value}><input type="checkbox" checked={filters.lifecycleStates.includes(value)} onChange={() => onChange({ ...filters, lifecycleStates: toggle(filters.lifecycleStates, value) })}/>{title(value)}</label>)}</fieldset>
      <fieldset><legend>Mapped state</legend>{locationStates.map((value) => <label key={value}><input type="checkbox" checked={filters.locationStates.includes(value)} onChange={() => onChange({ ...filters, locationStates: toggle(filters.locationStates, value) })}/>{title(value)}</label>)}</fieldset>
      <fieldset><legend>Location precision</legend>{precisions.map((value) => <label key={value}><input type="checkbox" checked={filters.precisions.includes(value)} onChange={() => onChange({ ...filters, precisions: toggle(filters.precisions, value) })}/>{title(value)}</label>)}</fieldset>
      <fieldset><legend>Location confidence</legend>{confidences.map((value) => <label key={value}><input type="checkbox" checked={filters.confidences.includes(value)} onChange={() => onChange({ ...filters, confidences: toggle(filters.confidences, value) })}/>{title(value)}</label>)}</fieldset>
      <fieldset><legend>Verification freshness</legend>{freshnessStates.map((value) => <label key={value}><input type="checkbox" checked={filters.freshnessStates.includes(value)} onChange={() => onChange({ ...filters, freshnessStates: toggle(filters.freshnessStates, value) })}/>{value === "current" ? "Verified within 24 months" : "Older than 24 months"}</label>)}</fieldset>
      <fieldset><legend>Installed power range (MW)</legend><div className="range-inputs"><label>Minimum<input aria-label="Minimum installed power MW" type="number" min="0" inputMode="decimal" value={filters.minimumCapacityMw ?? ""} onChange={(event) => onChange({ ...filters, minimumCapacityMw: optionalNumber(event.target.value) })}/></label><label>Maximum<input aria-label="Maximum installed power MW" type="number" min="0" inputMode="decimal" value={filters.maximumCapacityMw ?? ""} onChange={(event) => onChange({ ...filters, maximumCapacityMw: optionalNumber(event.target.value) })}/></label></div><small>Matches one reported electrical, thermal, or storage-power value. Units remain separate in totals.</small></fieldset>
    </aside>}
    <details className="layer-panel"><summary><Layers3 size={17}/> Map layers</summary><label><input type="checkbox" checked={facilitiesVisible} onChange={(event) => onFacilitiesVisible(event.target.checked)}/> Facilities</label><label className="disabled-layer"><input type="checkbox" checked disabled/> Clusters · automatic</label><label className="disabled-layer"><input type="checkbox" disabled/> Regions · unavailable</label><label className="disabled-layer"><input type="checkbox" disabled/> EEZ boundaries · unavailable</label></details>
  </div>;
}

function downloadCapacityLineage(facilities: Facility[]) {
  const observations = facilities.flatMap((facility) => facility.capacities
    .filter((capacity) => capacity.status === "installed")
    .map((capacity) => ({ facilityId: facility.id, kind: capacity.kind, value: capacity.value, sourceObservationIds: capacity.sourceObservationIds })));
  const payload = {
    formula: "sum installed capacity values by capacity kind",
    period: "latest retained facility observations in this release",
    exclusions: ["planned capacities", "retired capacities", "facilities excluded by the active filters"],
    facilityIds: facilities.map((facility) => facility.id),
    observations,
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "filtered-capacity-lineage.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function Legend({ total, mapped, unplotted, capacities, facilities }: { total: number; mapped: number; unplotted: number; capacities: CapacityTotals; facilities: Facility[] }) {
  const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
  return <div className="legend" aria-label="Map legend"><div>{classifications.map((classification) => <span key={classification}><i className={`dot ${classification}`}/>{title(classification)}</span>)}</div><div><strong>{number.format(total)} records</strong><span>◉ Mapped {number.format(mapped)}</span><span>○ Unplotted {number.format(unplotted)}</span></div><div className="capacity-legend"><strong>Installed capacity</strong><span>{number.format(capacities.electricalMw)} electrical MW</span><span>{number.format(capacities.thermalMw)} thermal MW</span><span>{number.format(capacities.storagePowerMw)} storage MW</span><span>{number.format(capacities.storageEnergyMwh)} storage MWh</span><button className="text-button" onClick={() => downloadCapacityLineage(facilities)}>Download calculation lineage</button></div></div>;
}
