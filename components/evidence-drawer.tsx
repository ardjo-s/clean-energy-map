"use client";

import { X } from "lucide-react";
import type { AtlasDataset } from "@/lib/domain/schemas";

export type DrawerPage = "coverage" | "sources" | "methodology" | "limitations";
export function EvidenceDrawer({ page, data, onClose }: { page: DrawerPage | null; data: AtlasDataset; onClose(): void }) {
  if (!page) return null;
  const method = data.methodologyReleases.at(-1);
  return <aside className="evidence-drawer" aria-label={page}>
    <header><h2>{page[0].toUpperCase() + page.slice(1)}</h2><button className="icon-button" aria-label="Close" onClick={onClose}><X/></button></header>
    {page === "coverage" && data.coverage.map((c) => <article key={c.id}><h3>{c.geographyCode} · {c.technology?.replaceAll("_", " ") ?? "National baseline"}</h3><p><strong>{c.status.replaceAll("_", " ")}</strong>{c.measuredCoverage ? ` · ${c.measuredCoverage.resultPercent}% measured coverage` : " · Coverage not quantified"}</p><p>{c.scope}</p><ul>{c.visibleLimitations.map((x) => <li key={x}>{x}</li>)}</ul></article>)}
    {page === "sources" && data.sources.map((s) => <article key={s.id}><h3><a href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a></h3><p>{s.publisher} · {s.sourceType.replaceAll("_", " ")}</p><p>{s.coverageScope}</p><small>Accessed {new Date(s.accessedAt).toLocaleDateString()} · {s.license}</small></article>)}
    {page === "methodology" && <article><h3>Release {method?.version ?? "Unknown"}</h3><p>{method?.changeSummary ?? "No methodology summary supplied."}</p><p>Document: {method?.documentPath ?? "Not supplied"}</p><p>Dataset {data.release.version} · build {data.release.buildId}</p></article>}
    {page === "limitations" && <article><h3>Dataset limitations</h3><ul>{data.release.limitations.map((x) => <li key={x}>{x}</li>)}</ul><h3>Corrections and changes</h3><p>{data.release.changeSummary}</p></article>}
  </aside>;
}
