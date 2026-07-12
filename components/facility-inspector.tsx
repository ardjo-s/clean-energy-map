"use client";

import { ExternalLink, MapPin, Share2, X } from "lucide-react";
import type { AtlasDataset, Facility } from "@/lib/domain/schemas";

const title = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
const capacityUnits = { electrical_mw: "electrical MW", thermal_mw: "thermal MW", storage_power_mw: "storage MW", storage_energy_mwh: "storage MWh" } as const;

export function FacilityInspector({ facility, data, onClose }: { facility: Facility; data: AtlasDataset; onClose(): void }) {
  const organizations = new Map(data.organizations.map((item) => [item.id, item]));
  const observations = new Map(data.observations.map((item) => [item.id, item]));
  const lifecycle = data.lifecycleEvidence.find((item) => item.id === facility.lifecycleEvidenceId);
  const operators = facility.operatorOrganizationIds.map((id) => organizations.get(id)?.officialName).filter((item) => item !== undefined);
  const ownership = facility.ownershipIds.map((id) => data.ownership.find((item) => item.id === id)).filter((item) => item !== undefined);
  const sourceIds = new Set([
    ...facility.sourceObservationIds.flatMap((id) => observations.get(id)?.sourceId ?? []),
    ...ownership.flatMap((relationship) => relationship.sourceObservationIds.flatMap((id) => observations.get(id)?.sourceId ?? [])),
    ...(lifecycle?.sourceIds ?? []),
  ]);
  const sources = data.sources.filter((item) => sourceIds.has(item.id));
  const capacity = facility.capacities.map((item) => `${item.value.toLocaleString()} ${capacityUnits[item.kind]} (${item.status})`).join(", ") || "Not reported";
  const place = [facility.jurisdiction.admin1, facility.jurisdiction.countryCode].filter(Boolean).join(", ") || title(facility.jurisdiction.context);
  return <aside className="inspector" aria-label="Facility inspector">
    <div className="sheet-handle"/>
    <header><MapPin className="pin"/><div><p className="eyebrow">{facility.id}</p><h2>{facility.officialName}</h2><p>{facility.technologyLabel} · {title(facility.lifecycleState)}</p><p><MapPin size={15}/> {place} {facility.location.geometryType === "unplotted" && <strong>· Unplotted</strong>}</p></div><button className="icon-button close-inspector" aria-label="Close inspector" onClick={onClose}><X/></button></header>
    <section><h3>Physical record</h3><dl><dt>Operator</dt><dd>{operators.join(", ") || "Not reported"}</dd><dt>Technology</dt><dd>{facility.technologyLabel}</dd><dt>Capacity</dt><dd>{capacity}</dd><dt>Energy role</dt><dd>{title(facility.energyRole)}</dd><dt>Project ID</dt><dd><code>{facility.projectId}</code></dd><dt>Phases</dt><dd>{facility.phaseIds.length ? `${facility.phaseIds.length} generator phase${facility.phaseIds.length === 1 ? "" : "s"}` : "No phase published"}</dd></dl>{facility.phaseIds.length > 0 && <details><summary>Stable phase identifiers</summary><ul>{facility.phaseIds.map((id) => <li key={id}><code>{id}</code></li>)}</ul></details>}</section>
    <section><h3>Classification evidence</h3><p className="classification"><i className={`dot ${facility.classification}`}/><strong>{title(facility.classification)}</strong></p><p>{facility.classificationReason}</p></section>
    <details open><summary>How this was verified</summary><p>Verified {new Date(facility.verifiedAt).toLocaleDateString()}. The browser record carries source pointers; the full release preserves all field observations.</p>{facility.conflicts.length > 0 ? <><h4>Conflicts</h4><ul>{facility.conflicts.map((conflict) => <li key={conflict}>{conflict}</li>)}</ul></> : <p>No recorded source conflict in this release.</p>}<p><a href="/data/downloads/atlas-v1-full.json" download>Download full field-level evidence (JSON)</a></p></details>
    <details><summary>Location and jurisdiction</summary><p>{title(facility.location.precision)} · {title(facility.location.confidence)} confidence.</p><p>Method: {title(facility.location.method)}</p><p>Context: {title(facility.jurisdiction.context)}{facility.jurisdiction.disputed ? " · Disputed" : ""}</p>{facility.jurisdiction.context === "unknown" && <p><strong>National maritime attribution is not established.</strong> Proximity is not used as evidence.</p>}</details>
    <details><summary>Lifecycle emissions</summary>{lifecycle ? <><p>{title(lifecycle.evidenceLevel)} · {lifecycle.geography}</p>{lifecycle.range ? <p>{lifecycle.range.minimum}–{lifecycle.range.maximum} {lifecycle.range.unit}{lifecycle.range.median != null ? `; median ${lifecycle.range.median}` : ""}</p> : <p>No sourced numeric range available.</p>}<p>Boundary: {lifecycle.systemBoundary}</p><ul>{lifecycle.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul></> : <p>Evidence record unavailable.</p>}</details>
    <section><h3>Ownership history</h3>{ownership.length ? <ol>{ownership.map((relationship) => { const owner = organizations.get(relationship.organizationId); const evidence = relationship.sourceObservationIds.map((id) => observations.get(id)).filter((item) => item !== undefined); return <li key={relationship.id}><strong>{owner?.officialName ?? relationship.organizationId}</strong> · {relationship.sharePercent === null ? "share not normalized" : `${relationship.sharePercent.toLocaleString()}%`}<br/><small>Phase <code>{relationship.phaseId ?? "facility-level"}</code> · effective dates unavailable</small>{evidence.map((item) => <small key={item.id} className="block">Source value {String(item.rawValue)} {item.rawUnit ?? ""} → {String(item.normalizedValue)}%</small>)}</li>; })}</ol> : <p>No EIA joint or third-party ownership row is published for this record. No owner or 100% share is inferred.</p>}</section>
    <section><h3>Sources</h3>{sources.length ? <ol>{sources.map((source) => <li key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.publisher}: {source.title} <ExternalLink size={13}/></a><br/><small>Published {source.publicationDate ?? "date unavailable"} · accessed {new Date(source.accessedAt).toLocaleDateString()}</small></li>)}</ol> : <p>No redistributable source link available.</p>}</section>
    <section><h3>Limitations</h3>{facility.limitations.length ? <ul>{facility.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul> : <p>No facility-specific limitations reported.</p>}</section>
    <footer><button onClick={() => navigator.clipboard?.writeText(location.href)}><Share2 size={17}/> Copy shareable URL</button></footer>
  </aside>;
}
