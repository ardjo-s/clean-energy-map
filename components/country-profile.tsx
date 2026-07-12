"use client";

import { X } from "lucide-react";
import type { AtlasDataset } from "@/lib/domain/schemas";

const labels: Record<string, string> = { electricity_generation_share: "Electricity generation", installed_electrical_capacity_share: "Installed electrical capacity", total_energy_supply_share: "Total energy supply", final_energy_consumption_share: "Final energy consumption" };
export function CountryProfile({ code, data, onClose }: { code: string; data: AtlasDataset; onClose(): void }) {
  const indicators = data.countryIndicators.filter((x) => x.countryCode === code);
  if (!indicators.length) return null;
  return <aside className="country-profile"><header><h2>{code} country profile</h2><button className="icon-button" onClick={onClose} aria-label="Close country profile"><X/></button></header>{indicators.map((i) => {
    const calc = data.calculations.find((x) => x.id === i.calculationId);
    const sources = data.sources.filter((x) => i.sourceIds.includes(x.id));
    return <details key={i.id} open><summary><span>{labels[i.type]}</span><strong>{i.value.toLocaleString()}%</strong></summary><div><p>Period: {i.period.start} – {i.period.end}</p><p>Numerator: {i.numerator.value.toLocaleString()} {i.numerator.unit} — {i.numerator.definition}</p><p>Denominator: {i.denominator.value.toLocaleString()} {i.denominator.unit} — {i.denominator.definition}</p><p>Formula: {calc?.formula ?? `${i.numerator.value} / ${i.denominator.value} × 100`}</p><p>Imports: {i.importsTreatment}<br/>Storage: {i.storageTreatment}</p>{calc?.inputs.map((x) => <p key={x.label}>{x.included ? "Included" : "Excluded"}: {x.label} — {x.value} {x.unit}. {x.reason}</p>)}{sources.map((s) => <p key={s.id}><a href={s.url}>{s.publisher}: {s.title} ↗</a></p>)}{i.limitations.length > 0 && <ul>{i.limitations.map((x) => <li key={x}>{x}</li>)}</ul>}</div></details>;
  })}</aside>;
}
