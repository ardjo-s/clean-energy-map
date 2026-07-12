"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Search, X } from "lucide-react";
import type { AtlasDataset } from "@/lib/domain/schemas";
import type { DrawerPage } from "@/hooks/use-atlas-url";

const repository = "https://github.com/ardjo-s/clean-energy-map/blob/agent/verifiable-atlas-v1";

export function EvidenceDrawer({ page, geography, data, onClose }: { page: DrawerPage | null; geography: string; data: AtlasDataset; onClose(): void }) {
  const [query, setQuery] = useState("");
  const drawerRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!page) return;
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const drawer = drawerRef.current;
    const focusable = () => [...(drawer?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])') ?? [])];
    focusable()[0]?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    drawer?.addEventListener("keydown", handleKeyDown);
    return () => {
      drawer?.removeEventListener("keydown", handleKeyDown);
      openerRef.current?.focus();
    };
  }, [page]);
  if (!page) return null;
  const method = data.methodologyReleases.find((item) => item.id === data.release.methodologyReleaseId);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const geographyNames = new Map(data.geographies.map((item) => [item.code, item.name]));
  const coverage = data.coverage.filter((item) => {
    if (normalizedQuery) return `${geographyNames.get(item.geographyCode) ?? ""} ${item.geographyCode} ${item.technology?.replaceAll("_", " ") ?? "national baseline"} ${item.status} ${item.publicationStatus}`.toLocaleLowerCase().includes(normalizedQuery);
    return geography === "WORLD" ? item.technology === null : item.geographyCode === geography;
  });
  const sources = data.sources.filter((item) => !normalizedQuery || `${item.publisher} ${item.title} ${item.coverageScope} ${item.sourceType} ${item.publicationDate ?? ""}`.toLocaleLowerCase().includes(normalizedQuery));
  return <aside ref={drawerRef} className="evidence-drawer" role="dialog" aria-modal="true" aria-label={page}>
    <header><div><p className="eyebrow">Evidence surface</p><h2>{page[0].toUpperCase() + page.slice(1)}</h2></div><button className="icon-button" aria-label={`Close ${page}`} onClick={onClose}><X/></button></header>
    {(page === "coverage" || page === "sources") && <label className="drawer-search"><Search size={17}/><input type="search" aria-label={`Search ${page}`} placeholder={page === "coverage" ? "Geography, technology, status" : "Publisher, dataset, scope, freshness"} value={query} onChange={(event) => setQuery(event.target.value)}/></label>}
    {page === "coverage" && <><p className="drawer-summary">{coverage.length.toLocaleString()} assessment{coverage.length === 1 ? "" : "s"}. Empty map layers mean unassessed coverage, never zero infrastructure.</p>{coverage.map((item) => <article key={item.id}><p className={`publication-status ${item.publicationStatus}`}>{item.publicationStatus.replaceAll("_", " ")}</p><h3>{geographyNames.get(item.geographyCode) ?? item.geographyCode} · {item.technology?.replaceAll("_", " ") ?? "National baseline"}</h3><p><strong>{item.status.replaceAll("_", " ")}</strong>{item.measuredCoverage ? ` · ${item.measuredCoverage.resultPercent.toFixed(2)}% measured ${item.measuredCoverage.unit}` : " · Coverage not quantified"}</p><p>{item.scope}</p><dl className="gate-list"><dt>Energy baseline</dt><dd>{item.authoritativeBaseline ? "Passed" : "Missing"}</dd><dt>Facility sources</dt><dd>{item.facilitySourcesPresent ? "Passed" : "Missing"}</dd><dt>Measured coverage</dt><dd>{item.measuredCoverage ? "Passed" : "Missing"}</dd><dt>Reproducible method</dt><dd>{item.reproducibleMethod ? "Passed" : "Missing"}</dd></dl><ul>{item.visibleLimitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul></article>)}</>}
    {page === "sources" && <><p className="drawer-summary">{sources.length} source snapshot{sources.length === 1 ? "" : "s"} in release {data.release.version}.</p>{sources.map((source) => <article key={source.id}><h3><a href={source.url} target="_blank" rel="noreferrer">{source.title} <ExternalLink size={13}/></a></h3><p>{source.publisher} · {source.sourceType.replaceAll("_", " ")}</p><p>{source.coverageScope}</p><dl className="source-meta"><dt>Published</dt><dd>{source.publicationDate ?? "Unavailable"}</dd><dt>Accessed</dt><dd>{new Date(source.accessedAt).toLocaleDateString()}</dd><dt>License</dt><dd>{source.license}</dd><dt>Redistribution</dt><dd>{source.redistribution}</dd><dt>Snapshot</dt><dd><code>{source.snapshotSha256?.slice(0, 16) ?? "Not archived"}</code>{source.snapshotPath ? ` · ${source.snapshotPath}` : ""}</dd></dl></article>)}</>}
    {page === "methodology" && <article><h3>Methodology {method?.version ?? "Unknown"}</h3><p>{method?.changeSummary ?? "No methodology summary supplied."}</p><p>Dataset {data.release.version} · reproducible build <code>{data.release.buildId}</code>.</p><h3>Documents and data</h3><ul className="download-list"><li><a href={`${repository}/${method?.documentPath ?? "docs/energy-and-geographic-methodology.md"}`} target="_blank" rel="noreferrer">Energy and geography methodology</a></li><li><a href={`${repository}/docs/verification-and-provenance-contract.md`} target="_blank" rel="noreferrer">Verification and provenance contract</a></li><li><a href={`${repository}/docs/verified-wave-publication-criteria.md`} target="_blank" rel="noreferrer">Verified-wave publication criteria</a></li><li><a href={`${repository}/lib/domain/schemas.ts`} target="_blank" rel="noreferrer">Machine-readable schema source</a></li><li><a href="/data/atlas-v1.json" download>Browser dataset JSON</a></li><li><a href="/data/downloads/atlas-v1-full.json" download>Full evidence dataset JSON</a></li><li><a href="/data/downloads/eia860-relevant-generators.jsonl" download>Raw relevant generator rows JSONL</a></li><li><a href="/data/downloads/eia860-relevant-ownership.jsonl" download>Raw relevant ownership rows JSONL</a></li></ul></article>}
    {page === "limitations" && <article><h3>Dataset limitations</h3><ul>{data.release.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul><h3>Change history</h3>{data.release.changeHistory.map((change) => <p key={change.version}><strong>{change.version}</strong> · {new Date(change.releasedAt).toLocaleDateString()}<br/>{change.summary}</p>)}<h3>Corrections</h3><p>Corrections require reliable evidence, retained history, methodology impact review, and the same validation gates as imports.</p><p><a href={data.release.correctionsUrl} target="_blank" rel="noreferrer">Submit an evidenced correction <ExternalLink size={13}/></a></p></article>}
  </aside>;
}
