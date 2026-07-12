"use client";

import { ExternalLink, MapPin, Share2, X } from "lucide-react";
import type { AtlasDataset, Facility } from "@/lib/domain/schemas";

const title = (x: string) => x.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
export function FacilityInspector({ facility, data, onClose }: { facility: Facility; data: AtlasDataset; onClose(): void }) {
  const lifecycle = data.lifecycleEvidence.find((x) => x.id === facility.lifecycleEvidenceId);
  const organizations = facility.operatorOrganizationIds.map((id) => data.organizations.find((x) => x.id === id)?.officialName).filter(Boolean);
  const sourceIds = new Set([...facility.sourceObservationIds.flatMap((id) => data.observations.find((o) => o.id === id)?.sourceId ?? []), ...(lifecycle?.sourceIds ?? [])]);
  const sources = data.sources.filter((x) => sourceIds.has(x.id));
  const capacity = facility.capacities.map((c) => `${c.value.toLocaleString()} ${c.kind.replaceAll("_", " ")}`).join(", ") || "Not reported";
  const place = [facility.jurisdiction.admin1, facility.jurisdiction.countryCode].filter(Boolean).join(", ") || title(facility.jurisdiction.context);
  return <aside className="inspector" aria-label="Facility inspector">
    <div className="sheet-handle"/>
    <header><MapPin className="pin"/><div><h2>{facility.officialName}</h2><p>{facility.technologyLabel} · {title(facility.lifecycleState)}</p><p><MapPin size={15}/> {place} {facility.location.geometryType === "unplotted" && <strong>· Unplotted</strong>}</p></div><button className="icon-button close-inspector" aria-label="Close inspector" onClick={onClose}><X/></button></header>
    <section><h3>Facility</h3><dl><dt>Operator</dt><dd>{organizations.join(", ") || "Not reported"}</dd><dt>Technology</dt><dd>{facility.technologyLabel}</dd><dt>Capacity</dt><dd>{capacity}</dd><dt>Energy role</dt><dd>{title(facility.energyRole)}</dd></dl></section>
    <section><h3>Evidence</h3><p className="classification"><i className={`dot ${facility.classification}`}/><strong>{title(facility.classification)}</strong></p><p>{facility.classificationReason}</p></section>
    <details open><summary>How this was verified</summary><p>Verified {new Date(facility.verifiedAt).toLocaleDateString()}. {facility.sourceObservationIds.length} field-level observation{facility.sourceObservationIds.length === 1 ? "" : "s"}.</p>{facility.conflicts.length > 0 && <><h4>Conflicts</h4><ul>{facility.conflicts.map((x) => <li key={x}>{x}</li>)}</ul></>}</details>
    <details><summary>Location precision</summary><p>{title(facility.location.precision)} · {title(facility.location.confidence)} confidence.</p><p>Method: {title(facility.location.method)}</p><p>Jurisdiction: {title(facility.jurisdiction.context)}{facility.jurisdiction.disputed ? " · Disputed" : ""}</p></details>
    <details><summary>Lifecycle emissions</summary>{lifecycle ? <><p>{title(lifecycle.evidenceLevel)} · {lifecycle.geography}</p>{lifecycle.range ? <p>{lifecycle.range.minimum}–{lifecycle.range.maximum} {lifecycle.range.unit}{lifecycle.range.median != null ? `; median ${lifecycle.range.median}` : ""}</p> : <p>No sourced numeric range available.</p>}<p>Boundary: {lifecycle.systemBoundary}</p><ul>{lifecycle.limitations.map((x) => <li key={x}>{x}</li>)}</ul></> : <p>Evidence record unavailable.</p>}</details>
    <section><h3>Sources</h3>{sources.length ? <ol>{sources.map((s) => <li key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.publisher}: {s.title} <ExternalLink size={13}/></a></li>)}</ol> : <p>No redistributable source link available.</p>}</section>
    <section><h3>Limitations</h3>{facility.limitations.length ? <ul>{facility.limitations.map((x) => <li key={x}>{x}</li>)}</ul> : <p>No facility-specific limitations reported.</p>}</section>
    <footer><button onClick={() => navigator.clipboard?.writeText(location.href)}><Share2 size={17}/> Share</button></footer>
  </aside>;
}
