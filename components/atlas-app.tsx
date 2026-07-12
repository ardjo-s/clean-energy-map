"use client";

import dynamic from "next/dynamic";
import { BookOpen, CircleHelp, Database, Menu, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { filterFacilities } from "@/lib/atlas/query";
import { countLocationStates } from "@/lib/atlas/calculations";
import { useAtlasData } from "@/hooks/use-atlas-data";
import { useAtlasUrl } from "@/hooks/use-atlas-url";
import { SearchBox, ControlPanel, Legend } from "./atlas-controls";
import { FacilityInspector } from "./facility-inspector";
import { CountryProfile } from "./country-profile";
import { EvidenceDrawer, type DrawerPage } from "./evidence-drawer";

const MapCanvas = dynamic(() => import("./map-canvas").then((x) => x.MapCanvas), { ssr: false, loading: () => <div className="map-loading">Loading map…</div> });

export function AtlasApp() {
  const { data, error } = useAtlasData();
  const [url, setUrl] = useAtlasUrl();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [drawer, setDrawer] = useState<DrawerPage | null>(null);
  const facilities = useMemo(() => {
    if (!data) return [];
    const query = url.filters.query.trim().toLocaleLowerCase();
    return filterFacilities(data.facilities, { ...url.filters, query: "" }).filter((facility) => {
      if (url.geography !== "WORLD" && facility.jurisdiction.countryCode !== url.geography) return false;
      if (!query) return true;
      const operators = facility.operatorOrganizationIds.map((id) => data.organizations.find((o) => o.id === id)?.officialName ?? "");
      return [facility.officialName, ...facility.alternateNames, facility.technologyLabel, facility.jurisdiction.countryCode ?? "", facility.jurisdiction.admin1 ?? "", ...operators].join(" ").toLocaleLowerCase().includes(query);
    });
  }, [data, url]);
  const selected = data?.facilities.find((f) => f.id === url.facility) ?? null;
  const locations = countLocationStates(facilities);
  const select = (id: string) => setUrl((old) => ({ ...old, facility: id }));
  if (error) return <main className="fatal"><h1>Atlas unavailable</h1><p>{error}</p><p>The source-backed dataset could not be loaded. No substitute records are shown.</p></main>;
  if (!data) return <main className="loading"><span className="brand-mark">◎</span><h1>Atlas</h1><p>Loading verified evidence…</p></main>;
  const coverage = url.geography === "WORLD" ? data.coverage : data.coverage.filter((c) => c.geographyCode === url.geography);
  return <main className="app-shell">
    <header className="app-header"><div className="brand"><span className="brand-mark">◎</span><strong>Atlas</strong><span>Verifiable Clean Energy Atlas</span></div><SearchBox filters={url.filters} facilities={facilities} onChange={(filters) => setUrl((old) => ({ ...old, filters }), "replace")} onSelect={select}/><nav><button onClick={() => setDrawer("coverage")}><ShieldCheck/>Coverage</button><button onClick={() => setDrawer("sources")}><Database/>Sources</button><button onClick={() => setDrawer("methodology")}><BookOpen/>Methodology</button><button aria-label="Help" onClick={() => setDrawer("limitations")}><CircleHelp/></button></nav><button className="mobile-search" aria-label="Search"><Search/></button><button className="mobile-menu" aria-label="Menu" onClick={() => setDrawer("coverage")}><Menu/></button></header>
    <div className="workspace">
      <MapCanvas facilities={facilities} selectedId={selected?.id ?? null} onSelect={select}/>
      <ControlPanel open={filtersOpen} setOpen={setFiltersOpen} filters={url.filters} allFacilities={data.facilities} geography={url.geography} geographies={[...new Set(data.coverage.map((x) => x.geographyCode))].sort()} onGeography={(geography) => setUrl((old) => ({ ...old, geography, facility: null }))} onChange={(filters) => setUrl((old) => ({ ...old, filters }), "replace")}/>
      <Legend {...locations}/>
      {!selected && url.geography !== "WORLD" && <CountryProfile code={url.geography} data={data} onClose={() => setUrl((old) => ({ ...old, geography: "WORLD" }))}/>} 
      {selected && <FacilityInspector facility={selected} data={data} onClose={() => setUrl((old) => ({ ...old, facility: null }))}/>} 
      <EvidenceDrawer page={drawer} data={data} onClose={() => setDrawer(null)}/>
    </div>
    <footer className="status-rail"><span><i className="square eligible"/> {coverage.some((x) => x.authoritativeBaseline && x.reproducibleMethod) ? "Verified coverage available" : "Coverage status documented"}</span><button onClick={() => setDrawer("coverage")}><i className="square conditional"/>Coverage varies by geography ⓘ</button><span>Dataset: <strong>{data.release.version}</strong></span><span>Released: {new Date(data.release.releasedAt).toLocaleDateString()}</span></footer>
  </main>;
}
