"use client";

import { ExternalLink, X } from "lucide-react";
import type { AtlasDataset, CountryIndicator } from "@/lib/domain/schemas";

const metricTypes: CountryIndicator["type"][] = ["electricity_generation_share", "installed_electrical_capacity_share", "total_energy_supply_share", "final_energy_consumption_share"];
const labels: Record<CountryIndicator["type"], string> = { electricity_generation_share: "Electricity generation", installed_electrical_capacity_share: "Installed electrical capacity", total_energy_supply_share: "Total energy supply", final_energy_consumption_share: "Final energy consumption" };

export function CountryProfile({ code, data, onClose }: { code: string; data: AtlasDataset; onClose(): void }) {
  const geography = data.geographies.find((item) => item.code === code);
  const nationalCoverage = data.coverage.find((item) => item.geographyCode === code && item.technology === null);
  const indicators = new Map(data.countryIndicators.filter((item) => item.countryCode === code).map((item) => [item.type, item]));
  const observations = new Map(data.observations.map((item) => [item.id, item]));
  return <aside className="country-profile" aria-label={`${geography?.name ?? code} energy profile`}>
    <header><div><p className="eyebrow">{nationalCoverage?.publicationStatus.replaceAll("_", " ") ?? "coverage unknown"}</p><h2>{geography?.name ?? code}</h2><p>{nationalCoverage?.status.replaceAll("_", " ") ?? "Not assessed"} coverage · release {data.release.version}</p></div><button className="icon-button" onClick={onClose} aria-label="Close country profile"><X/></button></header>
    {metricTypes.map((type) => {
      const indicator = indicators.get(type);
      if (!indicator) return <details key={type} open className="missing-indicator"><summary><span>{labels[type]}</span><strong>Not assessed</strong></summary><div><p>No release-ready value exists for {geography?.name ?? code} in dataset {data.release.version}. No electricity proxy or mapped-facility sum is substituted.</p></div></details>;
      const calculation = data.calculations.find((item) => item.id === indicator.calculationId);
      const sources = data.sources.filter((item) => indicator.sourceIds.includes(item.id));
      const inputs = calculation?.inputObservationIds.map((id) => observations.get(id)).filter((item) => item !== undefined) ?? [];
      return <details key={type} open><summary><span>{labels[type]}</span><strong>{indicator.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}%</strong></summary><div>
        <p><strong>Definition:</strong> {indicator.numerator.definition} ÷ {indicator.denominator.definition}.</p>
        <p><strong>Period:</strong> {indicator.period.start} – {indicator.period.end}<br/><strong>Verified:</strong> {new Date(indicator.verifiedAt).toLocaleDateString()}</p>
        <p><strong>Numerator:</strong> {indicator.numerator.value.toLocaleString()} {indicator.numerator.unit}<br/><strong>Denominator:</strong> {indicator.denominator.value.toLocaleString()} {indicator.denominator.unit}</p>
        <p><strong>Formula:</strong> {calculation?.formula ?? `${indicator.numerator.value} / ${indicator.denominator.value} × 100`}</p>
        <p><strong>Imports:</strong> {indicator.importsTreatment}<br/><strong>Storage:</strong> {indicator.storageTreatment}</p>
        {calculation && <section className="calculation-trace"><h3>Calculation inputs</h3>{calculation.inputs.map((input) => <p key={input.label}><strong>{input.included ? "Included" : "Excluded"}:</strong> {input.label} — {input.value.toLocaleString()} {input.unit}. {input.reason}</p>)}<h3>Source observations</h3>{inputs.map((input) => <p key={input.id}><code>{input.field}</code>: raw {String(input.rawValue)} {input.rawUnit ?? ""} → normalized {String(input.normalizedValue)}. Confidence {input.confidence}.</p>)}</section>}
        <h3>Original sources</h3>{sources.map((source) => <p key={source.id}><a href={source.url} target="_blank" rel="noreferrer">{source.publisher}: {source.title} <ExternalLink size={13}/></a><br/><small>Published {source.publicationDate ?? "date unavailable"} · accessed {new Date(source.accessedAt).toLocaleDateString()}</small></p>)}
        {indicator.limitations.length > 0 && <><h3>Limitations</h3><ul>{indicator.limitations.map((item) => <li key={item}>{item}</li>)}</ul></>}
      </div></details>;
    })}
    <footer className="profile-download"><a href="/data/downloads/atlas-v1-full.json" download>Download full calculation evidence (JSON)</a></footer>
  </aside>;
}
