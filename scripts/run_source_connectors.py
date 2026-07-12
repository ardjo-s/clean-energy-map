#!/usr/bin/env python3
"""Stage EIA-860M, GEM GIPT, and Ember observations without changing a public release."""

from __future__ import annotations

import argparse
import contextlib
import csv
import hashlib
import io
import json
import math
import os
import re
import sys
import tempfile
import urllib.parse
import urllib.request
import urllib.error
import time
from datetime import UTC, date, datetime
from pathlib import Path
from typing import Any

from xlsx_reader import iter_xlsx_records, iter_xlsx_rows

ROOT = Path(__file__).resolve().parents[1]
CONNECTOR_VERSION = "1.0.0"
PUBLIC_RELEASE = ROOT / "public/data/atlas-v1.json"
ANNUAL_EIA = ROOT / "public/data/downloads/eia860-relevant-generators.jsonl"
FIXTURES = ROOT / "data/connectors/fixtures"
DEFAULT_STORE = ROOT / "data/connectors/staging"

EIA_URL = "https://www.eia.gov/electricity/data/eia860m/xls/may_generator2026.xlsx"
EMBER_URL = "https://api.ember-energy.org/v1/electricity-generation/yearly"
GEM_URL = "https://globalenergymonitor.org/projects/global-integrated-power-tracker/"

PUBLISHED_TECHNOLOGIES = {
    "Solar Photovoltaic",
    "Solar Thermal with Energy Storage",
    "Solar Thermal without Energy Storage",
    "Onshore Wind Turbine",
    "Offshore Wind Turbine",
    "Conventional Hydroelectric",
    "Geothermal",
    "Nuclear",
    "Hydroelectric Pumped Storage",
    "Batteries",
    "Flywheels",
    "Wood/Wood Waste Biomass",
    "Other Waste Biomass",
    "Municipal Solid Waste",
    "Landfill Gas",
}


def canonical_json(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False) + "\n").encode()


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def stable_id(prefix: str, *parts: Any) -> str:
    raw = "|".join(json.dumps(part, sort_keys=True, ensure_ascii=False) for part in parts)
    return f"{prefix}-{hashlib.sha256(raw.encode()).hexdigest()[:20]}"


def read_url(url: str, *, attempts: int = 3) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "clean-energy-map-connector/1.0"})
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                payload = response.read()
                if not payload:
                    raise RuntimeError("Upstream response was empty")
                return payload
        except urllib.error.HTTPError as cause:
            if cause.code not in {408, 429, 500, 502, 503, 504} or attempt + 1 == attempts:
                raise
        except (TimeoutError, urllib.error.URLError):
            if attempt + 1 == attempts:
                raise
        time.sleep(0.25 * (2**attempt))
    raise AssertionError("unreachable")


def source_meta(
    source_id: str,
    release: str,
    canonical_url: str,
    publication_date: str | None,
    observation_period: str,
    acquisition_method: str,
    license_name: str,
    restrictions: list[str],
    upstream_schema: list[str],
    cadence: str,
    warnings: list[str],
    limitations: list[str],
    retrieved_at: str | None = None,
) -> dict[str, Any]:
    retrieved = retrieved_at or datetime.now(UTC).replace(microsecond=0).isoformat()
    freshness = "unknown"
    if publication_date:
        age = (datetime.fromisoformat(retrieved).date() - date.fromisoformat(publication_date)).days
        freshness = "current" if age <= 120 else "stale"
    return {
        "source_id": source_id,
        "release": release,
        "canonical_url": canonical_url,
        "publication_date": publication_date,
        "observation_period": observation_period,
        "retrieved_at": retrieved,
        "acquisition_method": acquisition_method,
        "checksum": None,
        "connector_version": CONNECTOR_VERSION,
        "license": license_name,
        "restrictions": restrictions,
        "upstream_schema": upstream_schema,
        "cadence": cadence,
        "freshness_state": freshness,
        "warnings": warnings,
        "limitations": limitations,
    }


def observation(source: dict[str, Any], record_key: str, field: str, value: Any, unit: str | None = None) -> dict[str, Any]:
    return {
        "id": stable_id("obs", source["source_id"], source["release"], record_key, field, value, unit),
        "source_id": source["source_id"],
        "snapshot_checksum": source["checksum"],
        "record_key": record_key,
        "field": field,
        "raw_value": value,
        "unit": unit,
        "observation_period": source["observation_period"],
    }


def observed_record(source: dict[str, Any], record_key: str, values: dict[str, Any], units: dict[str, str] | None = None) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    observations = [observation(source, record_key, field, value, (units or {}).get(field)) for field, value in sorted(values.items())]
    return {
        "id": stable_id("record", source["source_id"], source["release"], record_key),
        "record_key": record_key,
        "values": values,
        "field_observation_ids": {item["field"]: item["id"] for item in observations},
    }, observations


def load_json_payload(raw: bytes) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    payload = json.loads(raw)
    return payload.get("fixture", {}), payload.get("rows", payload.get("data", []))


def eia_rows(raw: bytes, suffix: str) -> list[dict[str, Any]]:
    if suffix == ".json":
        return load_json_payload(raw)[1]
    sheets = {
        "xl/worksheets/sheet1.xml": "operating",
        "xl/worksheets/sheet2.xml": "planned",
        "xl/worksheets/sheet3.xml": "retired",
        "xl/worksheets/sheet4.xml": "cancelled_or_postponed",
    }
    with temporary_source_file(raw, ".xlsx") as path:
        rows: list[dict[str, Any]] = []
        for sheet, inventory_status in sheets.items():
            for row in iter_xlsx_records(path, header_row=3, sheet=sheet):
                row["inventory_status"] = inventory_status
                rows.append(row)
        return rows


def annual_eia() -> dict[tuple[str, str], dict[str, Any]]:
    result = {}
    with ANNUAL_EIA.open() as stream:
        for line in stream:
            row = json.loads(line)
            result[(str(row["Plant Code"]), str(row["Generator ID"]))] = row
    return result


def status_code(value: Any) -> str | None:
    match = re.search(r"\(([A-Z]{2})\)", str(value or ""))
    return match.group(1) if match else (str(value) if value else None)


def normalize_eia(raw: bytes, suffix: str, meta: dict[str, Any]) -> dict[str, Any]:
    baseline = annual_eia()
    records, observations = [], []
    counts = {key: 0 for key in ("added", "changed", "unchanged", "retired", "cancelled", "deferred", "conflicted", "unmatched", "rejected", "review_required")}
    rejected_rows = []
    seen: set[tuple[str, str]] = set()
    for row_number, row in enumerate(eia_rows(raw, suffix), start=1):
        if row.get("Technology") not in PUBLISHED_TECHNOLOGIES:
            counts["rejected"] += 1
            rejected_rows.append({"row": row_number, "reason": "technology_out_of_scope"})
            continue
        plant = row.get("Plant ID", row.get("Plant Code"))
        generator = row.get("Generator ID")
        if plant in (None, "") or generator in (None, ""):
            counts["rejected"] += 1
            rejected_rows.append({"row": row_number, "reason": "missing_stable_identifier"})
            continue
        key = (str(int(plant)) if isinstance(plant, float) else str(plant), str(generator))
        if key in seen:
            counts["rejected"] += 1
            rejected_rows.append({"row": row_number, "record_key": f"{key[0]}:{key[1]}", "reason": "duplicate_stable_identifier"})
            continue
        seen.add(key)
        inventory = str(row.get("inventory_status", "unknown"))
        values = {
            "plant_code": key[0],
            "generator_id": key[1],
            "plant_name": row.get("Plant Name"),
            "technology": row.get("Technology"),
            "nameplate_capacity_mw": row.get("Nameplate Capacity (MW)"),
            "inventory_status": inventory,
            "status": status_code(row.get("Status")),
        }
        latitude = parse_number(row.get("Latitude"), "latitude")
        longitude = parse_number(row.get("Longitude"), "longitude")
        if latitude is not None and longitude is not None:
            values.update({"latitude": latitude, "longitude": longitude})
        record, items = observed_record(meta, f"{key[0]}:{key[1]}", values, {"nameplate_capacity_mw": "MW", "latitude": "degrees", "longitude": "degrees"})
        record["external_identifiers"] = {"eia_plant_code": key[0], "eia_generator_id": key[1]}
        if "latitude" in values:
            record["plot"] = {
                "coordinates": [values["longitude"], values["latitude"]],
                "location_observation_ids": [record["field_observation_ids"]["longitude"], record["field_observation_ids"]["latitude"]],
                "precision": "publisher_reported_approximate",
            }
        prior = baseline.get(key)
        if inventory == "retired":
            delta = "retired"
        elif inventory == "cancelled_or_postponed":
            delta = "deferred" if "postpon" in str(row.get("Status", "")).lower() else "cancelled"
        elif prior is None:
            delta = "added"
        else:
            comparable = (prior.get("Technology"), prior.get("Nameplate Capacity (MW)"), prior.get("Status"))
            current = (values["technology"], values["nameplate_capacity_mw"], values["status"])
            delta = "unchanged" if comparable == current else "changed"
        counts[delta] += 1
        record["delta"] = delta
        record["preliminary"] = True
        record["annual_final_record_preserved"] = prior is not None
        records.append(record)
        observations.extend(items)
    return {"records": sorted(records, key=lambda item: item["record_key"]), "observations": sorted(observations, key=lambda item: item["id"]), "counts": counts, "rejected_rows": rejected_rows}


@contextlib.contextmanager
def temporary_source_file(raw: bytes, suffix: str):
    descriptor, name = tempfile.mkstemp(suffix=suffix)
    path = Path(name)
    try:
        with os.fdopen(descriptor, "wb") as stream:
            stream.write(raw)
        yield path
    finally:
        path.unlink(missing_ok=True)


def parse_number(value: Any, field: str) -> float | None:
    if value in (None, "") or (isinstance(value, str) and not value.strip()):
        return None
    try:
        number = float(str(value).replace(",", "").strip())
    except ValueError as cause:
        raise ValueError(f"Invalid numeric {field}: {value!r}") from cause
    if not math.isfinite(number):
        raise ValueError(f"Invalid numeric {field}: {value!r}")
    if not (-90 <= number <= 90) and field == "latitude":
        raise ValueError(f"Invalid latitude: {number}")
    if not (-180 <= number <= 180) and field == "longitude":
        raise ValueError(f"Invalid longitude: {number}")
    return number


def generic_rows(raw: bytes, suffix: str) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    if suffix == ".json":
        return load_json_payload(raw)
    if suffix == ".xlsx":
        with temporary_source_file(raw, ".xlsx") as path:
            header_row = None
            for row_number, row in enumerate(iter_xlsx_rows(path), start=1):
                folded = {str(value).strip().casefold() for value in row if value not in (None, "")}
                if {"gem unit id", "gem id", "unit id"} & folded:
                    header_row = row_number
                    break
                if row_number >= 25:
                    break
            if header_row is None:
                raise RuntimeError("Could not find a GEM unit identifier header in the official XLSX export")
            return {}, list(iter_xlsx_records(path, header_row=header_row))
    text = raw.decode("utf-8-sig")
    return {}, list(csv.DictReader(io.StringIO(text)))


def pick(row: dict[str, Any], *names: str) -> Any:
    folded = {str(key).strip().casefold(): value for key, value in row.items()}
    for name in names:
        if name.casefold() in folded and folded[name.casefold()] not in (None, ""):
            return folded[name.casefold()]
    return None


def normalize_gem(raw: bytes, suffix: str, meta: dict[str, Any], eia_records: list[dict[str, Any]]) -> dict[str, Any]:
    _, rows = generic_rows(raw, suffix)
    eia_by_key: dict[tuple[str, str], list[dict[str, Any]]] = {}
    eia_by_name: dict[str, list[dict[str, Any]]] = {}
    for item in eia_records:
        ids = item["external_identifiers"]
        eia_by_key.setdefault((ids["eia_plant_code"], ids["eia_generator_id"]), []).append(item)
        eia_by_name.setdefault(str(item["values"].get("plant_name", "")).casefold(), []).append(item)
    records, observations = [], []
    counts = {key: 0 for key in ("added", "changed", "unchanged", "conflicted", "unmatched", "rejected", "review_required", "ambiguous", "matched")}
    rejected_rows = []
    seen: set[str] = set()
    for index, row in enumerate(rows, start=1):
        country = str(pick(row, "Country/area", "Country", "country") or "")
        technology = pick(row, "Technology", "technology")
        restriction = pick(row, "License restriction", "license_restriction")
        if country not in {"United States", "United States of America", "USA", "US"} or (technology and technology not in PUBLISHED_TECHNOLOGIES) or restriction:
            counts["rejected"] += 1
            rejected_rows.append({"row": index, "reason": "out_of_scope_or_restricted", "restriction": restriction})
            continue
        gem_id = pick(row, "GEM unit ID", "gem_unit_id", "GEM ID")
        if not gem_id:
            counts["rejected"] += 1
            rejected_rows.append({"row": index, "reason": "missing_gem_unit_id"})
            continue
        gem_id = str(gem_id)
        if gem_id in seen:
            counts["rejected"] += 1
            rejected_rows.append({"row": index, "record_key": gem_id, "reason": "duplicate_stable_identifier"})
            continue
        seen.add(gem_id)
        try:
            capacity_mw = parse_number(pick(row, "Capacity (MW)", "capacity_mw"), "capacity_mw")
            latitude = parse_number(pick(row, "Latitude", "latitude"), "latitude")
            longitude = parse_number(pick(row, "Longitude", "longitude"), "longitude")
        except ValueError as error:
            counts["rejected"] += 1
            rejected_rows.append({"row": index, "record_key": gem_id, "reason": "invalid_numeric_value", "detail": str(error)})
            continue
        values = {
            "gem_unit_id": str(gem_id),
            "name": pick(row, "Project name", "Plant name", "name"),
            "technology": technology,
            "status": pick(row, "Status", "status"),
            "capacity_mw": capacity_mw,
            "start_date": pick(row, "Start year", "start_date"),
            "retirement_date": pick(row, "Retired year", "retirement_date"),
            "owner": pick(row, "Owner", "owner"),
            "location_precision": pick(row, "Location accuracy", "location_precision"),
            "upstream_sources": pick(row, "Sources", "sources"),
        }
        values = {key: value for key, value in values.items() if value not in (None, "")}
        record, items = observed_record(meta, str(gem_id), values, {"capacity_mw": "MW"})
        eia_plant = pick(row, "EIA plant code", "eia_plant_code")
        eia_generator = pick(row, "EIA generator ID", "eia_generator_id")
        exact = eia_by_key.get((str(eia_plant), str(eia_generator)), []) if eia_plant is not None and eia_generator is not None else []
        if len(exact) > 1:
            match_state = "ambiguous"
        elif len(exact) == 1:
            target = exact[0]
            conflicts = []
            if values.get("technology") and values["technology"] != target["values"].get("technology"):
                conflicts.append("technology")
            if values.get("capacity_mw") is not None and float(values["capacity_mw"]) != float(target["values"].get("nameplate_capacity_mw") or 0):
                conflicts.append("capacity_mw")
            match_state = "conflicted" if conflicts else "matched"
            record["matched_record_id"] = target["id"]
            record["conflict_fields"] = conflicts
        else:
            candidates = eia_by_name.get(str(values.get("name", "")).casefold(), [])
            match_state = "review_required" if candidates else "unmatched"
            record["candidate_record_ids"] = [item["id"] for item in candidates]
        counts[match_state] += 1
        record["match_state"] = match_state
        record["match_method"] = "exact_external_identifier" if exact else "candidate_only_no_merge"
        precision = str(values.get("location_precision", "")).casefold()
        if latitude is not None and longitude is not None and precision in {"exact", "precise"}:
            location_values = {"latitude": latitude, "longitude": longitude}
            location_items = [observation(meta, str(gem_id), key, value, "degrees") for key, value in location_values.items()]
            observations.extend(location_items)
            record["plot"] = {"coordinates": [longitude, latitude], "location_observation_ids": [item["id"] for item in location_items], "precision": precision}
        records.append(record)
        observations.extend(items)
    return {"records": sorted(records, key=lambda item: item["record_key"]), "observations": sorted(observations, key=lambda item: item["id"]), "counts": counts, "rejected_rows": rejected_rows}


def normalize_ember(raw: bytes, suffix: str, meta: dict[str, Any]) -> dict[str, Any]:
    fixture, rows = generic_rows(raw, suffix)
    records, observations, calculations = [], [], []
    counts = {key: 0 for key in ("added", "changed", "unchanged", "conflicted", "unmatched", "rejected", "review_required")}
    value_observations: dict[str, str] = {}
    values_by_series: dict[str, float] = {}
    rejected_rows = []
    seen: set[str] = set()
    for row_number, row in enumerate(rows, start=1):
        entity = pick(row, "entity_code", "ISO 3 code")
        period = str(pick(row, "date", "Year") or "")
        category = pick(row, "Category")
        unit = pick(row, "unit", "Unit") or "TWh"
        series = pick(row, "series", "Variable")
        value = pick(row, "generation_twh", "Value")
        if entity != "USA" or period != "2024" or unit != "TWh" or (category and category != "Electricity generation") or value is None:
            counts["rejected"] += 1
            rejected_rows.append({"row": row_number, "reason": "incompatible_scope_period_or_unit"})
            continue
        if series is None or not str(series).strip():
            counts["rejected"] += 1
            rejected_rows.append({"row": row_number, "reason": "missing_indicator"})
            continue
        key = f"USA:2024:{series}:generation_twh"
        if key in seen:
            counts["rejected"] += 1
            rejected_rows.append({"row": row_number, "record_key": key, "reason": "duplicate_stable_identifier"})
            continue
        seen.add(key)
        try:
            numeric_value = parse_number(value, "generation_twh")
        except ValueError as error:
            counts["rejected"] += 1
            rejected_rows.append({"row": row_number, "record_key": key, "reason": "invalid_numeric_value", "detail": str(error)})
            continue
        if numeric_value is None:
            counts["rejected"] += 1
            rejected_rows.append({"row": row_number, "record_key": key, "reason": "missing_numeric_value"})
            continue
        values = {"territory": "USA", "period": "2024", "indicator": series, "value": numeric_value, "unit": "TWh", "method": "Ember yearly electricity data"}
        record, items = observed_record(meta, key, values, {"value": "TWh"})
        records.append(record)
        observations.extend(items)
        value_observations[str(series)] = record["field_observation_ids"]["value"]
        values_by_series[str(series)] = numeric_value
        counts["added"] += 1
        if series in {"Total", "Total Generation"}:
            value_obs = record["field_observation_ids"]["value"]
            calculations.append({"id": stable_id("calc", key, value_obs), "formula": "identity(input[0])", "input_observation_ids": [value_obs], "result": numeric_value, "unit": "TWh"})
    reconciliations = []
    full_release = json.loads((ROOT / "public/data/downloads/atlas-v1-full.json").read_text())
    eia_calculation = next(item for item in full_release["calculations"] if item["id"] == "calc-us-electricity-generation-share-2024")
    eia_inputs = {item["label"]: (item, observation_id) for item, observation_id in zip(eia_calculation["inputs"], eia_calculation["inputObservationIds"], strict=True)}
    total_inputs = [eia_inputs[name] for name in ("Utility-scale total generation", "Estimated small-scale solar PV")]
    eligible_inputs = [eia_inputs[name] for name in ("Nuclear generation", "Wind generation", "Total solar generation")]
    total_name = "Total Generation" if "Total Generation" in values_by_series else "Total"
    if total_name in values_by_series:
        eia_total_twh = sum(item[0]["value"] for item in total_inputs) / 1000
        ember_total_twh = values_by_series[total_name]
        reconciliations.append({
            "id": "reconcile-us-total-generation-2024",
            "formula": "ember_total_twh - eia_total_thousand_mwh / 1000",
            "input_observation_ids": [value_observations[total_name], *(item[1] for item in total_inputs)],
            "ember_value": ember_total_twh,
            "eia_value": eia_total_twh,
            "difference": round(ember_total_twh - eia_total_twh, 6),
            "unit": "TWh",
            "selection": "conflicted" if abs(ember_total_twh - eia_total_twh) > 0.001 else "matched",
        })
    eligible = [name for name in ("Nuclear", "Wind", "Solar") if name in values_by_series]
    if len(eligible) == 3:
        ember_eligible_twh = sum(values_by_series[name] for name in eligible)
        eia_eligible_twh = sum(item[0]["value"] for item in eligible_inputs) / 1000
        reconciliations.append({
            "id": "reconcile-us-eligible-generation-2024",
            "formula": "sum(ember_nuclear_wind_solar_twh) - sum(eia_nuclear_wind_solar_thousand_mwh) / 1000",
            "input_observation_ids": [*[value_observations[name] for name in eligible], *(item[1] for item in eligible_inputs)],
            "ember_value": round(ember_eligible_twh, 6),
            "eia_value": round(eia_eligible_twh, 6),
            "difference": round(ember_eligible_twh - eia_eligible_twh, 6),
            "unit": "TWh",
            "selection": "conflicted" if abs(ember_eligible_twh - eia_eligible_twh) > 0.001 else "matched",
        })
    counts["conflicted"] += sum(item["selection"] == "conflicted" for item in reconciliations)
    return {"records": sorted(records, key=lambda item: item["record_key"]), "observations": sorted(observations, key=lambda item: item["id"]), "calculations": calculations, "reconciliations": reconciliations, "counts": counts, "rejected_rows": rejected_rows, "fixture": fixture}


def persist_snapshot(store: Path, raw: bytes, suffix: str, meta: dict[str, Any], normalized: dict[str, Any], dry_run: bool) -> tuple[Path, bool]:
    snapshot = store / "snapshots" / meta["source_id"] / f"{meta['checksum']}-{CONNECTOR_VERSION}"
    source_name = f"source{suffix}"
    normalized_bytes = canonical_json(normalized)
    manifest = {**meta, "snapshot_files": {source_name: digest(raw), "normalized.json": digest(normalized_bytes)}}
    expected = {source_name: raw, "manifest.json": canonical_json(manifest), "normalized.json": normalized_bytes}
    if snapshot.exists():
        actual_names = {item.name for item in snapshot.iterdir() if item.is_file()}
        try:
            stored_manifest = json.loads((snapshot / "manifest.json").read_bytes())
            stored_hashes = stored_manifest["snapshot_files"]
        except (OSError, json.JSONDecodeError):
            stored_manifest = stored_hashes = None
        except (KeyError, TypeError):
            stored_hashes = None
        identity_matches = bool(stored_manifest) and all(stored_manifest.get(key) == meta.get(key) for key in ("source_id", "release", "checksum"))
        hashes_match = bool(stored_hashes) and all(digest((snapshot / name).read_bytes()) == checksum for name, checksum in stored_hashes.items())
        if actual_names != set(expected) or (snapshot / source_name).read_bytes() != raw or not identity_matches or not hashes_match:
            raise RuntimeError(f"Incomplete or tampered immutable snapshot: {snapshot}")
        return snapshot, False
    if dry_run:
        return snapshot, False
    snapshot.parent.mkdir(parents=True, exist_ok=True)
    staging = Path(tempfile.mkdtemp(prefix=f".{snapshot.name}-", dir=snapshot.parent))
    try:
        for name, content in expected.items():
            (staging / name).write_bytes(content)
        staging.replace(snapshot)
    finally:
        if staging.exists():
            for item in staging.iterdir():
                item.unlink()
            staging.rmdir()
    return snapshot, True


def acquire(path: Path | None, url: str | None, fixture: Path, offline: bool) -> tuple[bytes, str, str]:
    if path:
        return path.read_bytes(), path.suffix.lower(), "manual_official_download"
    if offline:
        return fixture.read_bytes(), fixture.suffix.lower(), "pinned_offline_fixture"
    if not url:
        raise RuntimeError("No live acquisition URL")
    return read_url(url), Path(urllib.parse.urlparse(url).path).suffix.lower() or ".json", "official_download"


def report_markdown(report: dict[str, Any]) -> str:
    lines = ["# Connector staging report", "", f"Public release: `{report['public_release']}` (unchanged)", ""]
    for source in report["sources"]:
        lines += [f"## {source['source_id']}", "", f"- Release: `{source['release']}`", f"- SHA-256: `{source['checksum']}`", f"- Freshness: `{source['freshness_state']}`", f"- Rows read: `{source['rows_read']}`", f"- Observations: `{source['observations_created']}`", f"- Counts: `{json.dumps(source['counts'], sort_keys=True)}`", f"- Restrictions: `{json.dumps(source['restrictions'])}`", f"- Coverage: {source['coverage_limitations']}", ""]
        for reconciliation in source.get("reconciliations", []):
            lines += [f"- Reconciliation `{reconciliation['id']}`: Ember `{reconciliation['ember_value']} {reconciliation['unit']}`, EIA `{reconciliation['eia_value']} {reconciliation['unit']}`, difference `{reconciliation['difference']} {reconciliation['unit']}`, state `{reconciliation['selection']}`."]
        if source.get("reconciliations"):
            lines.append("")
    lines += ["## Public impact", "", "None. Connector staging cannot mutate `public/data`; explicit activation is intentionally not implemented in V1.", ""]
    return "\n".join(lines)


def _main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--offline", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--eia-file", type=Path)
    parser.add_argument("--gem-file", type=Path)
    parser.add_argument("--ember-file", type=Path)
    parser.add_argument("--store", type=Path, default=DEFAULT_STORE)
    parser.add_argument("--report-json", type=Path)
    parser.add_argument("--report-md", type=Path)
    parser.add_argument("--json-only", action="store_true")
    args = parser.parse_args(argv)

    for output in (args.report_json, args.report_md):
        if output and (ROOT / "public/data") in output.resolve().parents:
            raise RuntimeError("Report output cannot target public/data")

    recorded_retrieval = "2026-06-24T00:00:00+00:00" if args.offline else None

    public_before = digest(PUBLIC_RELEASE.read_bytes())
    eia_raw, eia_suffix, eia_method = acquire(args.eia_file, EIA_URL, FIXTURES / "eia860m-may-2026.json", args.offline)
    eia_meta = source_meta("eia-860m", "2026-05", EIA_URL, "2026-06-24", "2026-05", eia_method, "U.S. federal government public-domain data", [], ["Operating", "Planned", "Retired", "Canceled or Postponed"], "monthly", ["Preliminary inventory; later monthly files may correct values without a specific notice."], ["Plants with at least 1 MW combined nameplate capacity.", "Does not establish production, financing, or survey-grade coordinates."], recorded_retrieval)
    eia_meta["checksum"] = digest(eia_raw)
    eia = normalize_eia(eia_raw, eia_suffix, eia_meta)

    gem_path = args.gem_file
    gem_raw, gem_suffix, gem_method = acquire(gem_path, None, FIXTURES / "gem-gipt-contract.json", args.offline)
    gem_meta = source_meta("gem-gipt", "2026-03", GEM_URL, "2026-03-01", "rolling release", gem_method, "CC BY 4.0; row-level third-party restrictions still apply", [], ["GIPT unit-level export; accepted header aliases are documented in the connector tests"], "rolling after component tracker releases", ["Automatic download requires the official GEM form; no scraping or CAPTCHA bypass is attempted."], ["Pilot limited to the United States and technologies already published by the atlas.", "Approximate GEM locations remain unplotted."], recorded_retrieval)
    gem_meta["checksum"] = digest(gem_raw)
    gem = normalize_gem(gem_raw, gem_suffix, gem_meta, eia["records"])

    if args.ember_file or args.offline:
        ember_raw, ember_suffix, ember_method = acquire(args.ember_file, None, FIXTURES / "ember-us-2024.json", args.offline)
    else:
        api_key = os.environ.get("EMBER_API_KEY")
        if not api_key:
            raise RuntimeError("EMBER_API_KEY is required for live Ember ingestion")
        query = urllib.parse.urlencode({"entity_code": "USA", "start_date": "2024", "end_date": "2024", "api_key": api_key})
        try:
            ember_raw = read_url(f"{EMBER_URL}?{query}")
        except Exception:
            raise RuntimeError("Ember API request failed; credentials were redacted") from None
        if api_key.encode() in ember_raw:
            raise RuntimeError("Ember API echoed the credential; refusing to snapshot the response")
        ember_suffix, ember_method = ".json", "official_api"
    ember_meta = source_meta("ember-yearly-electricity", "2026-06-23", EMBER_URL, "2026-06-23", "2024", ember_method, "CC BY 4.0", ["Attribution required", "No additional legal or technological restrictions"], ["Generation response: entity, entity_code, date, series, generation_twh, share_of_generation_pct"], "yearly with revisions", [], ["National aggregates only; never allocated to facilities.", "Capacity, production, primary energy, and final consumption remain separate quantities."], recorded_retrieval)
    ember_meta["checksum"] = digest(ember_raw)
    ember = normalize_ember(ember_raw, ember_suffix, ember_meta)

    source_reports = []
    for meta, raw, suffix, normalized in ((eia_meta, eia_raw, eia_suffix, eia), (gem_meta, gem_raw, gem_suffix, gem), (ember_meta, ember_raw, ember_suffix, ember)):
        path, _ = persist_snapshot(args.store, raw, suffix, meta, normalized, args.dry_run)
        source_reports.append({**meta, "snapshot_path": str(path), "rows_read": len(normalized["records"]) + normalized["counts"].get("rejected", 0), "observations_created": len(normalized["observations"]), "counts": normalized["counts"], "rejected_rows": normalized.get("rejected_rows", []), "reconciliations": normalized.get("reconciliations", []), "coverage_limitations": "; ".join(meta["limitations"]), "potentially_affected_public_values": ["US facility freshness", "US national 2024 electricity reconciliation"]})

    public_after = digest(PUBLIC_RELEASE.read_bytes())
    if public_before != public_after:
        raise RuntimeError("Public release changed during connector staging")
    release = json.loads(PUBLIC_RELEASE.read_text())["release"]
    report = {"connector_version": CONNECTOR_VERSION, "dry_run": args.dry_run, "offline": args.offline, "public_release": release["version"], "public_release_sha256": public_after, "public_release_changed": False, "sources": source_reports}
    human = report_markdown(report)
    if args.json_only:
        print(json.dumps(report, sort_keys=True, separators=(",", ":")))
    else:
        print(human)
        print("--- JSON ---")
        print(json.dumps(report, indent=2, sort_keys=True))
    if args.report_json:
        args.report_json.parent.mkdir(parents=True, exist_ok=True)
        args.report_json.write_bytes(canonical_json(report))
    if args.report_md:
        args.report_md.parent.mkdir(parents=True, exist_ok=True)
        args.report_md.write_text(human + "\n")
    return 0


def main(argv: list[str] | None = None) -> int:
    effective_argv = list(sys.argv[1:] if argv is None else argv)
    try:
        return _main(effective_argv)
    except Exception as cause:
        if "--json-only" in effective_argv:
            print(json.dumps({"error": {"type": type(cause).__name__, "message": str(cause)}, "status": "failed"}, sort_keys=True, separators=(",", ":")))
            return 1
        raise


if __name__ == "__main__":
    raise SystemExit(main())
