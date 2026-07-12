"use client";

import dynamic from "next/dynamic";
import { BookOpen, CircleHelp, Database, Menu, Search, ShieldCheck, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { aggregateCapacities, countLocationStates } from "@/lib/atlas/calculations";
import { filterFacilities } from "@/lib/atlas/query";
import { useAtlasData } from "@/hooks/use-atlas-data";
import { useAtlasUrl, type DrawerPage, type MapViewState } from "@/hooks/use-atlas-url";
import { SearchBox, ControlPanel, Legend } from "./atlas-controls";
import { FacilityInspector } from "./facility-inspector";
import { CountryProfile } from "./country-profile";
import { EvidenceDrawer } from "./evidence-drawer";

const MapCanvas = dynamic(() => import("./map-canvas").then((module) => module.MapCanvas), { ssr: false, loading: () => <div className="map-loading">Loading map…</div> });

export function AtlasApp() {
  const { data, error } = useAtlasData();
  const [url, setUrl] = useAtlasUrl();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [facilitiesVisible, setFacilitiesVisible] = useState(true);
  useEffect(() => {
    if (!data) return;
    const geographyExists = url.geography === "WORLD" || data.geographies.some((item) => item.code === url.geography);
    const facilityExists = !url.facility || data.facilities.some((item) => item.id === url.facility);
    if (geographyExists && facilityExists) return;
    setUrl((old) => ({ ...old, geography: geographyExists ? old.geography : "WORLD", facility: facilityExists ? old.facility : null }), "replace");
  }, [data, setUrl, url.facility, url.geography]);
  const facilities = useMemo(() => {
    if (!data) return [];
    const query = url.filters.query.trim().toLocaleLowerCase();
    const organizations = new Map(data.organizations.map((item) => [item.id, item]));
    const ownership = new Map(data.ownership.map((item) => [item.id, item]));
    return filterFacilities(data.facilities, { ...url.filters, query: "" }).filter((facility) => {
      if (url.geography !== "WORLD" && facility.jurisdiction.countryCode !== url.geography) return false;
      if (!query) return true;
      const operatorNames = facility.operatorOrganizationIds.map((id) => organizations.get(id)?.officialName ?? "");
      const ownerNames = facility.ownershipIds.map((id) => organizations.get(ownership.get(id)?.organizationId ?? "")?.officialName ?? "");
      return [facility.officialName, ...facility.alternateNames, facility.technologyLabel, facility.jurisdiction.countryCode ?? "", facility.jurisdiction.admin1 ?? "", ...operatorNames, ...ownerNames].join(" ").toLocaleLowerCase().includes(query);
    });
  }, [data, url.filters, url.geography]);
  const selected = data?.facilities.find((facility) => facility.id === url.facility) ?? null;
  const locations = countLocationStates(facilities);
  const capacities = aggregateCapacities(facilities);
  const selectFacility = (id: string) => {
    setMobileSearchOpen(false);
    setUrl((old) => ({ ...old, facility: id, drawer: null }));
  };
  const selectGeography = (geography: string) => {
    setMobileSearchOpen(false);
    setUrl((old) => ({ ...old, geography, facility: null, drawer: null, map: null, filters: { ...old.filters, query: "" } }));
  };
  const openDrawer = (drawer: DrawerPage) => setUrl((old) => ({ ...old, drawer, facility: null }));
  const updateMapView = (map: MapViewState) => setUrl((old) => ({ ...old, map }), "replace");

  if (error) return <main className="fatal"><h1>Atlas unavailable</h1><p>{error}</p><p>The source-backed dataset could not be loaded. No substitute records are shown.</p></main>;
  if (!data) return <main className="loading"><span className="brand-mark">◎</span><h1>Atlas</h1><p>Loading verified evidence…</p></main>;

  const geographies = data.geographies.toSorted((left, right) => left.name.localeCompare(right.name));
  const nationalCoverage = url.geography === "WORLD" ? null : data.coverage.find((item) => item.geographyCode === url.geography && item.technology === null) ?? null;
  const verifiedWaves = data.coverage.filter((item) => item.technology === null && item.publicationStatus === "verified_wave");
  const coverageMessage = nationalCoverage ? `${nationalCoverage.publicationStatus.replaceAll("_", " ")} · ${nationalCoverage.status.replaceAll("_", " ")}` : `${verifiedWaves.length} verified wave${verifiedWaves.length === 1 ? "" : "s"} · global coverage varies`;

  return <main className="app-shell">
    <header className="app-header"><div className="brand"><span className="brand-mark">◎</span><strong>Atlas</strong><span>Verifiable Clean Energy Atlas</span></div><SearchBox filters={url.filters} facilities={facilities} geographies={geographies} mobileOpen={mobileSearchOpen} onChange={(filters) => setUrl((old) => ({ ...old, filters }), "replace")} onSelect={selectFacility} onGeography={selectGeography}/><nav aria-label="Evidence"><button onClick={() => openDrawer("coverage")}><ShieldCheck/>Coverage</button><button onClick={() => openDrawer("sources")}><Database/>Sources</button><button onClick={() => openDrawer("methodology")}><BookOpen/>Methodology</button><button aria-label="Limitations and help" onClick={() => openDrawer("limitations")}><CircleHelp/></button></nav><button className="mobile-search" aria-label={mobileSearchOpen ? "Close search" : "Search"} aria-expanded={mobileSearchOpen} onClick={() => setMobileSearchOpen((open) => !open)}>{mobileSearchOpen ? <X/> : <Search/>}</button><button className="mobile-menu" aria-label="Open coverage menu" onClick={() => openDrawer("coverage")}><Menu/></button></header>
    <div className="workspace">
      <MapCanvas facilities={facilities} selectedId={selected?.id ?? null} geography={url.geography} viewState={url.map} facilitiesVisible={facilitiesVisible} onSelect={selectFacility} onViewState={updateMapView}/>
      <ControlPanel open={filtersOpen} setOpen={setFiltersOpen} filters={url.filters} allFacilities={data.facilities} geography={url.geography} geographies={geographies} facilitiesVisible={facilitiesVisible} onFacilitiesVisible={setFacilitiesVisible} onGeography={selectGeography} onChange={(filters) => setUrl((old) => ({ ...old, filters }), "replace")}/>
      <Legend {...locations} capacities={capacities} facilities={facilities}/>
      {!selected && !url.drawer && url.geography !== "WORLD" && <CountryProfile code={url.geography} data={data} onClose={() => selectGeography("WORLD")}/>}
      {selected && !url.drawer && <FacilityInspector facility={selected} data={data} onClose={() => setUrl((old) => ({ ...old, facility: null }))}/>}
      <EvidenceDrawer page={url.drawer} geography={url.geography} data={data} onClose={() => setUrl((old) => ({ ...old, drawer: null }))}/>
    </div>
    <footer className="status-rail"><button onClick={() => openDrawer("coverage")}><i className={`square ${nationalCoverage?.publicationStatus === "verified_wave" ? "eligible" : "conditional"}`}/>{coverageMessage} ⓘ</button><span>{locations.total.toLocaleString()} records = {locations.mapped.toLocaleString()} mapped + {locations.unplotted.toLocaleString()} unplotted</span><span>Dataset <strong>{data.release.version}</strong></span><span>Released {new Date(data.release.releasedAt).toLocaleDateString()}</span></footer>
  </main>;
}
