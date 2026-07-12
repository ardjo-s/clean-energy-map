#!/usr/bin/env python3
"""Build the pinned V1 U.S. atlas release from authoritative source snapshots."""

from __future__ import annotations

import hashlib
import json
import re
import shutil
import tempfile
import zipfile
from collections import defaultdict
from dataclasses import dataclass
from datetime import UTC, datetime
from html.parser import HTMLParser
from pathlib import Path
from typing import Any

from xlsx_reader import iter_xlsx_records, iter_xlsx_rows

ROOT = Path(__file__).resolve().parents[1]
EIA_ZIP = ROOT / "data/raw/eia/eia8602024.zip"
NLR_XLSX = ROOT / "data/raw/nlr/EF_Table_FINAL.xlsx"
OUTPUT = ROOT / "public/data/atlas-v1.json"
FULL_OUTPUT = ROOT / "public/data/downloads/atlas-v1-full.json"
RAW_ROWS = ROOT / "public/data/downloads/eia860-relevant-generators.jsonl"
RETRIEVED_AT = "2026-07-12T19:00:00Z"
METHOD_VERSION = "1.0.0"
EXPECTED_EIA_SHA256 = "0aaae04812cd4ab87a3e346bdf93848a3cc15053fd4dc2a4cf82d2aeac95f12b"
EXPECTED_NLR_SHA256 = "ef4885c8519ff7fbcb5147842dc0549d7b9955b28eeee23609ad9032a37bd5cb"


@dataclass(frozen=True)
class TechRule:
    technology: str
    label: str
    role: str
    classification: str
    lifecycle_id: str
    reason: str


TECH_RULES: dict[str, TechRule] = {
    "Solar Photovoltaic": TechRule("solar_photovoltaic", "Solar photovoltaic", "electricity_generation", "eligible", "lca-solar-pv", "Eligible at technology evidence level E1; no facility-specific lifecycle value is claimed."),
    "Solar Thermal with Energy Storage": TechRule("concentrated_solar_power", "Concentrated solar power", "electricity_generation", "eligible", "lca-csp", "Eligible as reported solar generation; storage remains separate from primary generation."),
    "Solar Thermal without Energy Storage": TechRule("concentrated_solar_power", "Concentrated solar power", "electricity_generation", "eligible", "lca-csp", "Eligible as reported solar-only generation; no facility-specific lifecycle value is claimed."),
    "Onshore Wind Turbine": TechRule("onshore_wind", "Onshore wind", "electricity_generation", "eligible", "lca-onshore-wind", "Eligible at subtype evidence level E2; no facility-specific lifecycle value is claimed."),
    "Offshore Wind Turbine": TechRule("offshore_wind", "Offshore wind", "electricity_generation", "eligible", "lca-offshore-wind", "Eligible at subtype evidence level E2; maritime jurisdiction remains explicitly unresolved where absent from EIA."),
    "Conventional Hydroelectric": TechRule("hydropower_unspecified", "Hydropower — subtype unverified", "electricity_generation", "conditional", "lca-hydropower", "Conditional because EIA-860 does not establish run-of-river versus reservoir methane context."),
    "Geothermal": TechRule("geothermal", "Geothermal", "electricity_generation", "conditional", "lca-geothermal", "Conditional until binary/flash subtype and operating-gas evidence are resolved at facility level."),
    "Nuclear": TechRule("nuclear_fission", "Nuclear fission", "electricity_generation", "eligible", "lca-nuclear-lwr", "Eligible at LWR subtype level E2; NRC states U.S. commercial operating reactors are PWR or BWR light-water reactors."),
    "Hydroelectric Pumped Storage": TechRule("pumped_hydro_storage", "Pumped hydro storage", "storage", "excluded", "lca-pumped-storage", "Excluded from primary generation and shown only as storage."),
    "Batteries": TechRule("battery_storage", "Battery storage", "storage", "excluded", "lca-battery-storage", "Excluded from primary generation and shown only as storage."),
    "Flywheels": TechRule("other_storage", "Flywheel storage", "storage", "excluded", "lca-other-storage", "Excluded from primary generation; no compatible lifecycle range is assigned."),
    "Wood/Wood Waste Biomass": TechRule("solid_biomass_residues", "Solid biomass — evidence incomplete", "electricity_generation", "unknown", "lca-biopower", "Unknown: a fuel-family code cannot establish feedstock, origin, land-use, transport, or carbon-payback evidence."),
    "Other Waste Biomass": TechRule("solid_biomass_residues", "Biomass — evidence incomplete", "electricity_generation", "unknown", "lca-biopower", "Unknown: the EIA family mixes solid, liquid, and gaseous pathways and lacks the facility evidence required for eligibility."),
    "Municipal Solid Waste": TechRule("solid_biomass_residues", "Municipal solid waste", "electricity_generation", "excluded", "lca-biopower", "Excluded because the source does not establish a segregated plastic-free biogenic residue stream."),
    "Landfill Gas": TechRule("solid_biomass_residues", "Landfill gas", "electricity_generation", "excluded", "lca-biopower", "Excluded by the V1 biogas and biomethane rule."),
}

STATUS_MAP = {
    "OP": "operating",
    "SB": "suspended",
    "OA": "suspended",
    "OS": "suspended",
}


class TableParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.rows: list[list[str]] = []
        self.row: list[str] | None = None
        self.cell: list[str] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "tr":
            self.row = []
        elif tag in {"td", "th"} and self.row is not None:
            self.cell = []

    def handle_data(self, data: str) -> None:
        if self.cell is not None:
            self.cell.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag in {"td", "th"} and self.cell is not None and self.row is not None:
            self.row.append(" ".join("".join(self.cell).split()))
            self.cell = None
        elif tag == "tr" and self.row is not None:
            if self.row:
                self.rows.append(self.row)
            self.row = None


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def stable_id(prefix: str, *parts: Any) -> str:
    raw = "|".join(str(part) for part in parts)
    return f"{prefix}-{hashlib.sha1(raw.encode()).hexdigest()[:14]}"


def number(value: str) -> float:
    return float(value.replace(",", ""))


def first_annual_2024(path: Path) -> list[str]:
    parser = TableParser()
    parser.feed(path.read_text(encoding="utf-8", errors="replace"))
    for row in parser.rows:
        if row and row[0] == "2024" and len(row) >= 10:
            return row
    raise RuntimeError(f"No annual 2024 row in {path}")


def lifecycle_ranges() -> dict[str, tuple[float, float, float]]:
    wanted = {
        "Photovoltaic (All Technologies)": "solar",
        "Concentrating Solar Power (Trough and Tower)": "csp",
        "Land-based": "onshore",
        "Offshore": "offshore",
        "Hydropower (All Technologies)": "hydro",
        "Geothermal (All Technologies)": "geothermal",
        "Nuclear - Light Water Reactor (LWR)": "nuclear",
        "Biopower (All Technologies)": "biopower",
        "Pumped-Storage Hydropower": "pumped",
        "Li-Ion Battery Storage": "battery",
    }
    result: dict[str, tuple[float, float, float]] = {}
    for index, row in enumerate(iter_xlsx_rows(NLR_XLSX), start=1):
        if index <= 3 or len(row) < 27 or row[1] not in wanted:
            continue
        result[wanted[str(row[1])]] = (float(row[22]), float(row[24]), float(row[26]))
    if result.keys() != set(wanted.values()):
        raise RuntimeError(f"Missing lifecycle rows: {set(wanted.values()) - result.keys()}")
    return result


def source(id_: str, publisher: str, title: str, url: str, source_type: str, published: str | None, license_: str, scope: str, snapshot: Path | None, redistribution: str = "permitted") -> dict[str, Any]:
    return {
        "id": id_,
        "publisher": publisher,
        "title": title,
        "url": url,
        "sourceType": source_type,
        "publicationDate": published,
        "accessedAt": RETRIEVED_AT,
        "license": license_,
        "coverageScope": scope,
        "snapshotSha256": sha256(snapshot) if snapshot else None,
        "snapshotPath": str(snapshot.relative_to(ROOT)) if snapshot else None,
        "redistribution": redistribution,
    }


def observation(source_id: str, entity_type: str, entity_id: str, field: str, raw: Any, normalized: Any, confidence: str = "high", note: str | None = None) -> dict[str, Any]:
    return {
        "id": stable_id("obs", source_id, entity_type, entity_id, field),
        "sourceId": source_id,
        "entityType": entity_type,
        "entityId": entity_id,
        "field": field,
        "rawValue": raw,
        "rawUnit": None,
        "normalizedValue": normalized,
        "observedAt": "2024-12-31",
        "retrievedAt": RETRIEVED_AT,
        "confidence": confidence,
        "conflictGroup": None,
        "reviewerNote": note,
    }


def make_lifecycle_evidence(ranges: dict[str, tuple[float, float, float]]) -> list[dict[str, Any]]:
    def record(id_: str, technology: str, classification: str, key: str | None, level: str, limitations: list[str]) -> dict[str, Any]:
        values = ranges[key] if key else None
        return {
            "id": id_,
            "technology": technology,
            "classification": classification,
            "evidenceLevel": level,
            "range": None if values is None else {"minimum": values[0], "median": values[1], "maximum": values[2], "unit": "gCO2e/kWh"},
            "systemBoundary": "Published total life-cycle distribution; not a named-facility measurement.",
            "geography": "Literature synthesis; geographic applicability varies by study.",
            "sourceIds": ["src-nlr-lifecycle-2021"],
            "limitations": limitations,
        }

    generic = ["Technology benchmark only; no facility-specific lifecycle intensity is established."]
    return [
        record("lca-solar-pv", "solar_photovoltaic", "eligible", "solar", "technology_literature", generic),
        record("lca-csp", "concentrated_solar_power", "eligible", "csp", "technology_literature", generic + ["Hybrid fossil contribution is not resolved by the benchmark."]),
        record("lca-onshore-wind", "onshore_wind", "eligible", "onshore", "technology_literature", generic),
        record("lca-offshore-wind", "offshore_wind", "eligible", "offshore", "technology_literature", generic + ["Fixed-bottom and floating applicability must not be silently exchanged."]),
        record("lca-hydropower", "hydropower_unspecified", "conditional", "hydro", "technology_literature", generic + ["The NLR distribution excludes biogenic reservoir greenhouse gases; IPCC reports a much higher all-hydro upper bound."]),
        record("lca-geothermal", "geothermal", "conditional", "geothermal", "technology_literature", generic + ["Binary and flash operating emissions differ materially."]),
        record("lca-nuclear-lwr", "nuclear_fission", "eligible", "nuclear", "technology_literature", generic + ["Range applies to light-water reactors, not every fission design."]),
        record("lca-biopower", "solid_biomass_residues", "unknown", "biopower", "technology_literature", generic + ["Feedstock and counterfactual heterogeneity prevents a facility pass."]),
        record("lca-pumped-storage", "pumped_hydro_storage", "excluded", "pumped", "technology_literature", ["Storage is not primary generation; charging electricity is context-dependent."]),
        record("lca-battery-storage", "battery_storage", "excluded", "battery", "technology_literature", ["Storage is not primary generation; charging electricity is context-dependent."]),
        record("lca-other-storage", "other_storage", "excluded", None, "technology_literature", ["No compatible flywheel lifecycle distribution is assigned in this release."]),
    ]


def build() -> dict[str, Any]:
    if sha256(EIA_ZIP) != EXPECTED_EIA_SHA256 or sha256(NLR_XLSX) != EXPECTED_NLR_SHA256:
        raise RuntimeError("Pinned source checksum mismatch")

    sources = [
        source("src-eia-860-2024", "U.S. Energy Information Administration", "Form EIA-860 detailed data, final 2024", "https://www.eia.gov/electricity/data/eia860/", "government", "2025-09-09", "U.S. federal government public-domain data; acknowledgement requested.", "U.S. electric power plants with at least 1 MW combined nameplate capacity.", EIA_ZIP),
        source("src-eia-epm-1-1-2024", "U.S. Energy Information Administration", "Electric Power Monthly Table 1.1, final annual 2024", "https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=table_1_01", "government", "2026-06-25", "U.S. federal government public-domain data; acknowledgement requested.", "U.S. annual net electricity generation, all sectors.", ROOT / "data/raw/eia/epm-table-1-1.html"),
        source("src-eia-epm-1-1a-2024", "U.S. Energy Information Administration", "Electric Power Monthly Table 1.1.A, final annual 2024", "https://www.eia.gov/electricity/monthly/epm_table_grapher.php?t=table_1_01_a", "government", "2026-06-25", "U.S. federal government public-domain data; acknowledgement requested.", "U.S. annual renewable net generation by source, all sectors.", ROOT / "data/raw/eia/epm-table-1-1-a.html"),
        source("src-eia-epa-4-2a-2024", "U.S. Energy Information Administration", "Electric Power Annual Table 4.2.A, 2024", "https://www.eia.gov/electricity/annual/table.php?t=epa_04_02_a.html", "government", "2025-10-16", "U.S. federal government public-domain data; acknowledgement requested.", "U.S. existing net summer capacity by energy source and producer type.", ROOT / "data/raw/eia/epa-table-4-2-a.html"),
        source("src-nlr-lifecycle-2021", "National Renewable Energy Laboratory / National Laboratory of the Rockies", "Life Cycle Emissions Factors for Electricity Generation Technologies, resource version 1", "https://doi.org/10.7799/1819907", "research", "2021-08-23", "NLR dataset license; full notice shipped at data/raw/nlr/LICENSE.txt; DOE/NREL/ALLIANCE credit required; no endorsement.", "Technology-level lifecycle literature distributions.", NLR_XLSX),
        source("src-nrc-power-reactors", "U.S. Nuclear Regulatory Commission", "Power Reactors", "https://www.nrc.gov/reactors/power", "government", "2025-09-30", "U.S. federal government publication; check page-specific third-party notices.", "Commercial U.S. reactor type statement: PWR and BWR only.", ROOT / "data/raw/nrc/power-reactors.html"),
    ]

    with tempfile.TemporaryDirectory(prefix="atlas-eia-") as temp:
        temp_path = Path(temp)
        with zipfile.ZipFile(EIA_ZIP) as archive:
            for member in ["2___Plant_Y2024.xlsx", "3_1_Generator_Y2024.xlsx", "3_4_Energy_Storage_Y2024.xlsx"]:
                archive.extract(member, temp_path)

        plants = {int(row["Plant Code"]): row for row in iter_xlsx_records(temp_path / "2___Plant_Y2024.xlsx") if isinstance(row.get("Plant Code"), (int, float))}
        storage = {
            (int(row["Plant Code"]), str(row["Generator ID"])): row
            for row in iter_xlsx_records(temp_path / "3_4_Energy_Storage_Y2024.xlsx")
            if isinstance(row.get("Plant Code"), (int, float))
        }
        relevant = [row for row in iter_xlsx_records(temp_path / "3_1_Generator_Y2024.xlsx") if row.get("Technology") in TECH_RULES]

    RAW_ROWS.parent.mkdir(parents=True, exist_ok=True)
    with RAW_ROWS.open("w", encoding="utf-8") as stream:
        for row in relevant:
            kept = {key: row.get(key) for key in ["Utility ID", "Utility Name", "Plant Code", "Plant Name", "State", "County", "Generator ID", "Technology", "Prime Mover", "Status", "Nameplate Capacity (MW)", "Summer Capacity (MW)", "Operating Month", "Operating Year", "Energy Source 1"]}
            kept["source"] = "EIA-860 final 2024, 3_1_Generator_Y2024.xlsx, Operable"
            stream.write(json.dumps(kept, sort_keys=True, separators=(",", ":")) + "\n")

    groups: dict[tuple[int, str], list[dict[str, Any]]] = defaultdict(list)
    for row in relevant:
        groups[(int(row["Plant Code"]), TECH_RULES[str(row["Technology"])].technology)].append(row)
    plant_techs: dict[int, set[str]] = defaultdict(set)
    for plant_code, normalized_tech in groups:
        plant_techs[plant_code].add(normalized_tech)

    observations: list[dict[str, Any]] = []
    facilities: list[dict[str, Any]] = []
    projects_by_plant: dict[int, dict[str, Any]] = {}
    phases: list[dict[str, Any]] = []
    organizations: dict[str, dict[str, Any]] = {}
    capacity_observation_ids: dict[str, list[str]] = defaultdict(list)

    for (plant_code, normalized_tech), rows in sorted(groups.items()):
        plant = plants.get(
            plant_code,
            {
                "Plant Code": plant_code,
                "Plant Name": rows[0]["Plant Name"],
                "State": rows[0]["State"],
                "County": rows[0]["County"],
                "City": None,
                "Latitude": None,
                "Longitude": None,
            },
        )
        rule = TECH_RULES[str(rows[0]["Technology"])]
        facility_id = f"us-eia-{plant_code}-{normalized_tech}"
        project_id = f"us-eia-project-{plant_code}"
        operator_id = f"us-eia-org-{int(rows[0]['Utility ID'])}"
        plant_name = str(plant.get("Plant Name") or f"EIA plant code {plant_code} (name unavailable)")
        raw_techs = sorted({str(row["Technology"]) for row in rows})
        generator_ids = sorted(str(row["Generator ID"]) for row in rows)
        statuses = sorted({str(row["Status"]) for row in rows})
        nameplate = round(sum(float(row["Nameplate Capacity (MW)"]) for row in rows if isinstance(row.get("Nameplate Capacity (MW)"), (int, float))), 6)
        summer_values = [float(row["Summer Capacity (MW)"]) for row in rows if isinstance(row.get("Summer Capacity (MW)"), (int, float))]
        summer = round(sum(summer_values), 6)

        identity = observation("src-eia-860-2024", "facility", facility_id, "identity", json.dumps({"plantName": plant.get("Plant Name"), "generatorIds": generator_ids, "technologies": raw_techs, "operator": rows[0]["Utility Name"]}, sort_keys=True), plant_name)
        capacity_obs = observation("src-eia-860-2024", "facility", facility_id, "nameplate_capacity", nameplate, nameplate)
        capacity_obs["rawUnit"] = "MW"
        status_obs = observation("src-eia-860-2024", "facility", facility_id, "generator_status_codes", ",".join(statuses), "operating" if "OP" in statuses else "suspended")
        state_obs = observation("src-eia-860-2024", "facility", facility_id, "state", plant.get("State"), plant.get("State"))
        group_observations = [identity, capacity_obs, status_obs, state_obs]

        latitude, longitude = plant.get("Latitude"), plant.get("Longitude")
        valid_point = isinstance(latitude, (int, float)) and isinstance(longitude, (int, float)) and -90 <= float(latitude) <= 90 and -180 <= float(longitude) <= 180 and not (float(latitude) == 0 and float(longitude) == 0)
        if valid_point:
            lat_obs = observation("src-eia-860-2024", "facility", facility_id, "latitude", latitude, latitude, "medium", "EIA-reported plant coordinate; not survey-grade geometry.")
            lon_obs = observation("src-eia-860-2024", "facility", facility_id, "longitude", longitude, longitude, "medium", "EIA-reported plant coordinate; not survey-grade geometry.")
            group_observations.extend([lat_obs, lon_obs])
            location = {"geometryType": "point", "coordinates": [float(longitude), float(latitude)], "precision": "approximate_site", "confidence": "medium", "evidenceObservationIds": [lat_obs["id"], lon_obs["id"]], "method": "source_coordinates"}
        else:
            location = {"geometryType": "unplotted", "coordinates": None, "precision": "locality_only" if plant.get("City") else "unknown", "confidence": "low", "evidenceObservationIds": [state_obs["id"]], "method": "withheld_no_reliable_geometry"}

        observations.extend(group_observations)
        capacity_observation_ids[normalized_tech].append(capacity_obs["id"])
        phase_ids: list[str] = []
        for row in sorted(rows, key=lambda item: str(item["Generator ID"])):
            phase_id = stable_id("phase", plant_code, row["Generator ID"])
            phase_ids.append(phase_id)
            lifecycle = STATUS_MAP.get(str(row["Status"]), "unknown")
            phases.append({"id": phase_id, "projectId": project_id, "name": f"Generator {row['Generator ID']}", "facilityIds": [facility_id], "lifecycleState": lifecycle, "stateDate": None, "sourceObservationIds": [status_obs["id"], capacity_obs["id"]]})

        if project_id not in projects_by_plant:
            projects_by_plant[plant_code] = {"id": project_id, "officialName": plant_name, "alternateNames": [], "facilityIds": [], "phaseIds": [], "sourceObservationIds": [identity["id"]]}
        projects_by_plant[plant_code]["facilityIds"].append(facility_id)
        projects_by_plant[plant_code]["phaseIds"].extend(phase_ids)
        organizations.setdefault(operator_id, {"id": operator_id, "officialName": str(rows[0]["Utility Name"]), "alternateNames": [], "organizationType": "operator", "jurisdictionCode": "US", "externalIdentifiers": {"eiaUtilityId": str(int(rows[0]["Utility ID"]))}, "sourceObservationIds": [identity["id"]]})

        capacities: list[dict[str, Any]] = []
        if rule.role == "storage":
            capacities.append({"kind": "storage_power_mw", "value": nameplate, "status": "installed", "sourceObservationIds": [capacity_obs["id"]]})
            energy_values = [float(storage[(plant_code, str(row["Generator ID"]))]["Nameplate Energy Capacity (MWh)"]) for row in rows if (plant_code, str(row["Generator ID"])) in storage and isinstance(storage[(plant_code, str(row["Generator ID"]))].get("Nameplate Energy Capacity (MWh)"), (int, float))]
            if energy_values:
                energy = round(sum(energy_values), 6)
                energy_obs = observation("src-eia-860-2024", "facility", facility_id, "storage_energy_capacity", energy, energy)
                energy_obs["rawUnit"] = "MWh"
                observations.append(energy_obs)
                capacities.append({"kind": "storage_energy_mwh", "value": energy, "status": "installed", "sourceObservationIds": [energy_obs["id"]]})
        else:
            capacities.append({"kind": "electrical_mw", "value": nameplate, "status": "installed", "sourceObservationIds": [capacity_obs["id"]]})

        limitations = ["EIA-860 covers generators at plants with at least 1 MW combined nameplate capacity; smaller systems are not individually mapped.", "Coordinates are publisher-reported plant observations and are displayed as approximate, not survey-grade.", "No facility-specific lifecycle intensity has been established."]
        if normalized_tech == "offshore_wind":
            limitations.append("EIA-860 does not provide the maritime-zone evidence required to distinguish territorial waters, EEZ, high seas, or disputed areas; context remains unknown.")
        if rule.classification in {"conditional", "unknown", "excluded"}:
            limitations.append(rule.reason)

        facilities.append({
            "id": facility_id,
            "externalIdentifiers": {"eiaPlantCode": str(plant_code), "eiaGeneratorIds": ",".join(generator_ids)},
            "officialName": plant_name if len(plant_techs[plant_code]) == 1 else f"{plant_name} — {rule.label}",
            "alternateNames": [],
            "projectId": project_id,
            "phaseIds": phase_ids,
            "technology": normalized_tech,
            "technologyLabel": rule.label,
            "energyRole": rule.role,
            "classification": rule.classification,
            "classificationReason": rule.reason,
            "lifecycleEvidenceId": rule.lifecycle_id,
            "lifecycleState": "operating" if "OP" in statuses else "suspended",
            "stateDate": None,
            "capacities": capacities,
            "annualGeneration": None,
            "location": location,
            "jurisdiction": {"countryCode": "US", "admin1": str(plant.get("State") or "") or None, "context": "unknown" if normalized_tech == "offshore_wind" else "land", "disputed": False, "evidenceObservationIds": [state_obs["id"]]},
            "operatorOrganizationIds": [operator_id],
            "ownershipIds": [],
            "sourceObservationIds": [item["id"] for item in group_observations],
            "conflicts": [],
            "limitations": limitations,
            "verifiedAt": RETRIEVED_AT,
        })

    # National indicators, pinned to final 2024 values parsed from source snapshots.
    epm = first_annual_2024(ROOT / "data/raw/eia/epm-table-1-1.html")
    renew = first_annual_2024(ROOT / "data/raw/eia/epm-table-1-1-a.html")
    capacity = first_annual_2024(ROOT / "data/raw/eia/epa-table-4-2-a.html")
    nuclear = number(epm[6])
    utility_total = number(epm[12])
    small_solar_generation = number(epm[13])
    wind = number(renew[1])
    total_solar = number(renew[13])
    generation_numerator = nuclear + wind + total_solar
    generation_denominator = utility_total + small_solar_generation

    indicator_observations: list[dict[str, Any]] = []
    for field, raw, source_id in [
        ("nuclear_generation", nuclear, "src-eia-epm-1-1-2024"),
        ("wind_generation", wind, "src-eia-epm-1-1a-2024"),
        ("total_solar_generation", total_solar, "src-eia-epm-1-1a-2024"),
        ("utility_scale_total_generation", utility_total, "src-eia-epm-1-1-2024"),
        ("small_scale_solar_generation", small_solar_generation, "src-eia-epm-1-1-2024"),
    ]:
        item = observation(source_id, "country_indicator", "us-electricity-generation-share-2024", field, raw, raw)
        item["rawUnit"] = "thousand MWh"
        indicator_observations.append(item)
    observations.extend(indicator_observations)

    eligible_capacity = round(sum(float(row["Summer Capacity (MW)"]) for row in relevant if TECH_RULES[str(row["Technology"])].classification == "eligible" and isinstance(row.get("Summer Capacity (MW)"), (int, float))), 6)
    utility_total_capacity = number(capacity[10])
    small_solar_capacity = number(capacity[11])
    capacity_numerator = eligible_capacity + small_solar_capacity
    capacity_denominator = utility_total_capacity + small_solar_capacity
    cap_eligible_obs = observation("src-eia-860-2024", "country_indicator", "us-installed-capacity-share-2024", "eligible_utility_scale_summer_capacity", eligible_capacity, eligible_capacity)
    cap_eligible_obs["rawUnit"] = "MW"
    cap_total_obs = observation("src-eia-epa-4-2a-2024", "country_indicator", "us-installed-capacity-share-2024", "utility_scale_total_summer_capacity", utility_total_capacity, utility_total_capacity)
    cap_total_obs["rawUnit"] = "MW"
    cap_small_obs = observation("src-eia-epa-4-2a-2024", "country_indicator", "us-installed-capacity-share-2024", "small_scale_solar_capacity", small_solar_capacity, small_solar_capacity)
    cap_small_obs["rawUnit"] = "MW"
    observations.extend([cap_eligible_obs, cap_total_obs, cap_small_obs])

    generation_calc = {
        "id": "calc-us-electricity-generation-share-2024",
        "formulaVersion": METHOD_VERSION,
        "formula": "100 × (nuclear + wind + total solar) / (utility-scale total generation + estimated small-scale solar PV)",
        "inputObservationIds": [item["id"] for item in indicator_observations],
        "inputs": [
            {"label": "Nuclear generation", "value": nuclear, "unit": "thousand MWh", "included": True, "reason": "Eligible LWR technology class; shown separately from renewables."},
            {"label": "Wind generation", "value": wind, "unit": "thousand MWh", "included": True, "reason": "Eligible onshore and offshore wind technology class."},
            {"label": "Total solar generation", "value": total_solar, "unit": "thousand MWh", "included": True, "reason": "Eligible PV and solar-thermal electricity, including estimated small-scale PV."},
            {"label": "Utility-scale total generation", "value": utility_total, "unit": "thousand MWh", "included": True, "reason": "Domestic production denominator."},
            {"label": "Estimated small-scale solar PV", "value": small_solar_generation, "unit": "thousand MWh", "included": True, "reason": "Added because it is outside the utility-scale total and inside total solar."},
        ],
        "result": generation_numerator / generation_denominator * 100,
        "resultUnit": "percent",
        "executedAt": RETRIEVED_AT,
        "softwareVersion": "atlas-v0.1.0",
        "limitations": ["Hydropower, geothermal, and biomass are excluded from the eligible numerator until site/pathway evidence satisfies V1 rules.", "This is production-based domestic generation; imports are not included.", "EIA values may not sum exactly because of independent rounding."],
    }
    capacity_calc = {
        "id": "calc-us-installed-capacity-share-2024",
        "formulaVersion": METHOD_VERSION,
        "formula": "100 × (eligible EIA-860 utility-scale net summer capacity + small-scale solar PV) / (all utility-scale net summer capacity + small-scale solar PV)",
        "inputObservationIds": [cap_eligible_obs["id"], cap_total_obs["id"], cap_small_obs["id"]],
        "inputs": [
            {"label": "Eligible utility-scale net summer capacity", "value": eligible_capacity, "unit": "MW", "included": True, "reason": "Generator rows classified eligible by V1 methodology."},
            {"label": "Estimated small-scale solar PV capacity", "value": small_solar_capacity, "unit": "MW", "included": True, "reason": "Eligible aggregate capacity; never plotted as facilities."},
            {"label": "All utility-scale net summer capacity", "value": utility_total_capacity, "unit": "MW", "included": True, "reason": "Matching national denominator from EIA Electric Power Annual."},
        ],
        "result": capacity_numerator / capacity_denominator * 100,
        "resultUnit": "percent",
        "executedAt": RETRIEVED_AT,
        "softwareVersion": "atlas-v0.1.0",
        "limitations": ["Eligible utility-scale capacity is reproduced from EIA-860 generator rows; blank summer-capacity fields are not imputed.", "Hydropower, geothermal, and biomass remain outside the eligible numerator pending site/pathway evidence."],
    }

    country_indicators = [
        {
            "id": "us-electricity-generation-share-2024", "countryCode": "US", "type": "electricity_generation_share", "value": generation_calc["result"], "unit": "percent",
            "period": {"start": "2024-01-01", "end": "2024-12-31"},
            "numerator": {"value": generation_numerator, "unit": "thousand MWh", "definition": "Domestic net generation from V1-eligible nuclear, wind, and solar technologies."},
            "denominator": {"value": generation_denominator, "unit": "thousand MWh", "definition": "Total domestic utility-scale net generation plus estimated small-scale solar PV generation."},
            "productionOrConsumption": "production", "importsTreatment": "Imports and exports are outside this domestic production indicator.", "storageTreatment": "Pumped-storage generation is excluded from primary generation and appears only in EIA's separate negative storage line.",
            "calculationId": generation_calc["id"], "sourceIds": ["src-eia-epm-1-1-2024", "src-eia-epm-1-1a-2024", "src-nlr-lifecycle-2021", "src-nrc-power-reactors"], "verifiedAt": RETRIEVED_AT,
            "limitations": generation_calc["limitations"],
        },
        {
            "id": "us-installed-capacity-share-2024", "countryCode": "US", "type": "installed_electrical_capacity_share", "value": capacity_calc["result"], "unit": "percent",
            "period": {"start": "2024-12-31", "end": "2024-12-31"},
            "numerator": {"value": capacity_numerator, "unit": "MW", "definition": "Net summer capacity from V1-eligible utility-scale generators plus estimated small-scale solar PV."},
            "denominator": {"value": capacity_denominator, "unit": "MW", "definition": "All utility-scale net summer capacity plus estimated small-scale solar PV capacity."},
            "productionOrConsumption": "production", "importsTreatment": "Capacity is domestic physical capacity; imports do not apply.", "storageTreatment": "Pumped hydro, batteries, and other storage are excluded from primary generating capacity.",
            "calculationId": capacity_calc["id"], "sourceIds": ["src-eia-860-2024", "src-eia-epa-4-2a-2024", "src-nlr-lifecycle-2021", "src-nrc-power-reactors"], "verifiedAt": RETRIEVED_AT,
            "limitations": capacity_calc["limitations"],
        },
    ]

    mapped = [facility for facility in facilities if facility["location"]["geometryType"] != "unplotted"]
    mapped_mw = sum(sum(capacity_item["value"] for capacity_item in facility["capacities"] if capacity_item["kind"] in {"electrical_mw", "storage_power_mw"}) for facility in mapped)
    total_mw = sum(sum(capacity_item["value"] for capacity_item in facility["capacities"] if capacity_item["kind"] in {"electrical_mw", "storage_power_mw"}) for facility in facilities)
    normalization = len(relevant)
    coverage = [{
        "id": "coverage-us-national-electricity-2024", "geographyCode": "US", "technology": None, "status": "substantial",
        "scope": "Verified national electricity baseline; EIA-860 utility-scale facilities, EIA national generation/capacity totals, and explicit distributed-resource gap.",
        "measuredCoverage": {"numerator": normalization, "denominator": normalization, "unit": "EIA-860 relevant operable generator rows", "method": "Relevant source rows normalized into generator phases; no row dropped.", "resultPercent": 100},
        "authoritativeBaseline": True, "facilitySourcesPresent": True, "reproducibleMethod": True,
        "visibleLimitations": [f"{len(facilities) - len(mapped):,} facility-technology records are unplotted because a valid publisher-reported coordinate was unavailable.", f"Mapped nameplate power coverage is {mapped_mw / total_mw * 100:.2f}% for the included facility scope.", "Systems below the EIA-860 plant threshold are represented only in national aggregates where EIA publishes them; no coordinates are invented.", "Heat infrastructure, total energy supply, final energy consumption, complete retirement history, and maritime-zone geometry are not assessed in this release.", "Facility generation from EIA-923 is a prioritized next ingestion and is not inferred from capacity."],
        "sourceIds": ["src-eia-860-2024", "src-eia-epm-1-1-2024", "src-eia-epm-1-1a-2024", "src-eia-epa-4-2a-2024"], "assessedAt": RETRIEVED_AT,
    }]
    for technology in sorted({facility["technology"] for facility in facilities}):
        subset = [facility for facility in facilities if facility["technology"] == technology]
        subset_mapped = [facility for facility in subset if facility["location"]["geometryType"] != "unplotted"]
        coverage.append({
            "id": f"coverage-us-{technology}-2024", "geographyCode": "US", "technology": technology, "status": "substantial" if subset_mapped else "sparse",
            "scope": "EIA-860 final 2024 generator inventory within its documented plant threshold.",
            "measuredCoverage": {"numerator": len(subset_mapped), "denominator": len(subset), "unit": "facility-technology records", "method": "Publisher-reported coordinates passed range validation; no geocoded centroids.", "resultPercent": len(subset_mapped) / len(subset) * 100},
            "authoritativeBaseline": True, "facilitySourcesPresent": True, "reproducibleMethod": True,
            "visibleLimitations": ["This coordinate measure does not prove exhaustive coverage below EIA's reporting threshold.", "Reported coordinates are approximate plant observations, not verified footprints."],
            "sourceIds": ["src-eia-860-2024"], "assessedAt": RETRIEVED_AT,
        })

    build_id = hashlib.sha256(f"{EXPECTED_EIA_SHA256}|{EXPECTED_NLR_SHA256}|{METHOD_VERSION}".encode()).hexdigest()[:16]
    return {
        "release": {"id": "atlas-v1-us-wave-2024.1", "version": "2024.1", "releasedAt": RETRIEVED_AT, "methodologyReleaseId": "methodology-1.0.0", "buildId": build_id, "sourceSnapshotDates": {item["id"]: item["publicationDate"] or item["accessedAt"] for item in sources}, "changeSummary": "Initial verified U.S. national electricity baseline and EIA-860 facility wave.", "limitations": coverage[0]["visibleLimitations"]},
        "methodologyReleases": [{"id": "methodology-1.0.0", "version": METHOD_VERSION, "releasedAt": RETRIEVED_AT, "documentPath": "docs/energy-and-geographic-methodology.md", "changeSummary": "Initial four-state lifecycle, geography, aggregation, and coverage method."}],
        "sources": sources,
        "observations": sorted(observations, key=lambda item: item["id"]),
        "organizations": sorted(organizations.values(), key=lambda item: item["id"]),
        "projects": sorted(projects_by_plant.values(), key=lambda item: item["id"]),
        "phases": sorted(phases, key=lambda item: item["id"]),
        "ownership": [],
        "lifecycleEvidence": make_lifecycle_evidence(lifecycle_ranges()),
        "facilities": sorted(facilities, key=lambda item: item["id"]),
        "countryIndicators": country_indicators,
        "calculations": [generation_calc, capacity_calc],
        "coverage": coverage,
    }


def main() -> None:
    data = build()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    FULL_OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    full_encoded = json.dumps(data, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n"
    FULL_OUTPUT.write_text(full_encoded, encoding="utf-8")

    # The browser view keeps every facility but points to the downloadable full
    # evidence release instead of forcing tens of thousands of raw observations
    # and generator phases into the initial mobile payload.
    source_pointers = []
    for item in data["sources"]:
        source_pointers.append({
            "id": f"compact-{item['id']}",
            "sourceId": item["id"],
            "entityType": "methodology",
            "entityId": "methodology-1.0.0",
            "field": "source_pointer",
            "rawValue": item["id"],
            "rawUnit": None,
            "normalizedValue": item["id"],
            "observedAt": None,
            "retrievedAt": RETRIEVED_AT,
            "confidence": "high",
            "conflictGroup": None,
            "reviewerNote": "Full field-level observations are in /data/downloads/atlas-v1-full.json.",
        })
    compact_facilities = []
    for facility in data["facilities"]:
        compact = dict(facility)
        compact["phaseIds"] = []
        compact["sourceObservationIds"] = ["compact-src-eia-860-2024"]
        if compact["technology"] == "nuclear_fission":
            compact["sourceObservationIds"].append("compact-src-nrc-power-reactors")
        compact["limitations"] = [facility["classificationReason"]]
        if compact["location"]["geometryType"] == "unplotted":
            compact["limitations"].append("No valid publisher-reported coordinate; the record is searchable but unplotted.")
        if compact["technology"] == "offshore_wind":
            compact["limitations"].append("Maritime-zone context is not established by EIA-860 and remains unknown.")
        compact_facilities.append(compact)
    compact_data = {
        **data,
        "observations": source_pointers,
        "projects": [],
        "phases": [],
        "ownership": [],
        "facilities": compact_facilities,
    }
    compact_encoded = json.dumps(compact_data, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n"
    OUTPUT.write_text(compact_encoded, encoding="utf-8")
    print(f"Wrote {OUTPUT.relative_to(ROOT)} ({len(data['facilities']):,} facilities, {len(compact_encoded):,} bytes)")
    print(f"Wrote {FULL_OUTPUT.relative_to(ROOT)} ({len(full_encoded):,} bytes, complete evidence release)")


if __name__ == "__main__":
    main()
