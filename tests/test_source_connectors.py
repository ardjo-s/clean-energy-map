from __future__ import annotations

import contextlib
import hashlib
import io
import json
import sys
import tempfile
import unittest
import zipfile
from unittest import mock
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import run_source_connectors as connectors


def meta(source_id: str, period: str = "2024") -> dict:
    value = connectors.source_meta(
        source_id,
        "test-release",
        "https://example.test/official",
        "2026-07-01",
        period,
        "pinned_offline_fixture",
        "test license",
        [],
        ["test schema"],
        "monthly",
        [],
        [],
    )
    value["checksum"] = "fixture-checksum"
    return value


class ConnectorTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.eia_raw = (connectors.FIXTURES / "eia860m-may-2026.json").read_bytes()
        cls.eia_meta = meta("eia-860m", "2026-05")
        cls.eia = connectors.normalize_eia(cls.eia_raw, ".json", cls.eia_meta)

    def test_output_is_deterministic_and_every_value_has_an_observation(self) -> None:
        again = connectors.normalize_eia(self.eia_raw, ".json", self.eia_meta)
        self.assertEqual(connectors.canonical_json(self.eia), connectors.canonical_json(again))
        ids = {item["id"] for item in self.eia["observations"]}
        for record in self.eia["records"]:
            self.assertEqual(set(record["values"]), set(record["field_observation_ids"]))
            self.assertTrue(set(record["field_observation_ids"].values()) <= ids)

    def test_second_import_has_no_duplicate_and_snapshots_are_immutable(self) -> None:
        source = dict(self.eia_meta, checksum=connectors.digest(self.eia_raw))
        with tempfile.TemporaryDirectory() as directory:
            store = Path(directory)
            first, first_created = connectors.persist_snapshot(store, self.eia_raw, ".json", source, self.eia, False)
            second, second_created = connectors.persist_snapshot(store, self.eia_raw, ".json", source, self.eia, False)
            self.assertEqual(first, second)
            self.assertTrue(first_created)
            self.assertFalse(second_created)
            self.assertEqual(len(list((store / "snapshots/eia-860m").iterdir())), 1)

            changed_raw = self.eia_raw.replace(b"140.3", b"140.4", 1)
            changed_source = dict(source, checksum=connectors.digest(changed_raw))
            changed = connectors.normalize_eia(changed_raw, ".json", changed_source)
            connectors.persist_snapshot(store, changed_raw, ".json", changed_source, changed, False)
            self.assertEqual(len(list((store / "snapshots/eia-860m").iterdir())), 2)
            self.assertTrue((first / "source.json").exists())

            (first / "manifest.json").unlink()
            with self.assertRaisesRegex(RuntimeError, "Incomplete or tampered"):
                connectors.persist_snapshot(store, self.eia_raw, ".json", source, self.eia, False)

    def test_upstream_disappearance_does_not_delete_history(self) -> None:
        payload = json.loads(self.eia_raw)
        payload["rows"] = payload["rows"][:1]
        reduced = connectors.canonical_json(payload)
        with tempfile.TemporaryDirectory() as directory:
            store = Path(directory)
            original_source = dict(self.eia_meta, checksum=connectors.digest(self.eia_raw))
            reduced_source = dict(self.eia_meta, checksum=connectors.digest(reduced))
            original, _ = connectors.persist_snapshot(store, self.eia_raw, ".json", original_source, self.eia, False)
            connectors.persist_snapshot(store, reduced, ".json", reduced_source, connectors.normalize_eia(reduced, ".json", reduced_source), False)
            self.assertTrue(original.exists())

    def test_no_plot_without_location_observations(self) -> None:
        for record in self.eia["records"]:
            if "plot" in record:
                self.assertEqual(len(record["plot"]["location_observation_ids"]), 2)
                self.assertTrue(all(record["plot"]["location_observation_ids"]))

    def test_blank_coordinates_are_unplotted_and_duplicate_eia_keys_are_rejected(self) -> None:
        row = json.loads(self.eia_raw)["rows"][0]
        row["Latitude"] = ""
        raw = connectors.canonical_json({"rows": [row, row]})
        result = connectors.normalize_eia(raw, ".json", self.eia_meta)
        self.assertNotIn("plot", result["records"][0])
        self.assertEqual(result["counts"]["rejected"], 1)
        self.assertEqual(result["rejected_rows"][0]["reason"], "duplicate_stable_identifier")

    def gem(self, row: dict) -> dict:
        raw = connectors.canonical_json({"rows": [row]})
        return connectors.normalize_gem(raw, ".json", meta("gem-gipt", "rolling"), self.eia["records"])

    def test_gem_never_auto_merges_by_name_and_approximate_location_is_unplotted(self) -> None:
        result = self.gem({
            "country": "USA",
            "gem_unit_id": "GEM-REVIEW-1",
            "name": "Sand Point",
            "technology": "Onshore Wind Turbine",
            "capacity_mw": 0.5,
            "location_precision": "approximate",
            "latitude": 55.3,
            "longitude": -160.4,
        })
        self.assertEqual(result["records"][0]["match_state"], "review_required")
        self.assertEqual(result["records"][0]["match_method"], "candidate_only_no_merge")
        self.assertNotIn("plot", result["records"][0])

    def test_exact_identifier_conflict_is_preserved(self) -> None:
        result = self.gem({
            "country": "USA",
            "gem_unit_id": "GEM-CONFLICT-1",
            "name": "Sand Point",
            "technology": "Onshore Wind Turbine",
            "capacity_mw": 99,
            "eia_plant_code": "1",
            "eia_generator_id": "WT1",
        })
        record = result["records"][0]
        self.assertEqual(record["match_state"], "conflicted")
        self.assertEqual(record["conflict_fields"], ["capacity_mw"])
        self.assertGreater(len(result["observations"]), 0)

    def test_gem_parses_formatted_numbers_and_rejects_duplicate_ids(self) -> None:
        raw = connectors.canonical_json({"rows": [
            {"country": "USA", "gem_unit_id": "GEM-1", "technology": "Nuclear", "capacity_mw": "1,200", "location_precision": "exact", "latitude": "40.5", "longitude": "-75.2"},
            {"country": "USA", "gem_unit_id": "GEM-1", "technology": "Nuclear", "capacity_mw": 1200},
        ]})
        result = connectors.normalize_gem(raw, ".json", meta("gem-gipt"), self.eia["records"])
        self.assertEqual(result["records"][0]["values"]["capacity_mw"], 1200)
        self.assertEqual(result["records"][0]["plot"]["coordinates"], [-75.2, 40.5])
        self.assertEqual(result["counts"]["rejected"], 1)

    def test_inline_xlsx_strings_are_retained(self) -> None:
        worksheet = b'''<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>GEM unit ID</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>GEM-42</t></is></c></row></sheetData></worksheet>'''
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "fixture.xlsx"
            with zipfile.ZipFile(path, "w") as workbook:
                workbook.writestr("xl/worksheets/sheet1.xml", worksheet)
            from xlsx_reader import iter_xlsx_records
            self.assertEqual(list(iter_xlsx_records(path, header_row=1)), [{"GEM unit ID": "GEM-42"}])

    def test_restricted_gem_row_is_rejected(self) -> None:
        result = self.gem({"country": "USA", "gem_unit_id": "GEM-BLOCKED", "technology": "Onshore Wind Turbine", "license_restriction": "No redistribution"})
        self.assertEqual(result["counts"]["rejected"], 1)
        self.assertEqual(result["records"], [])

    def test_ember_blocks_incompatible_periods_and_units(self) -> None:
        raw = connectors.canonical_json({"rows": [
            {"entity_code": "USA", "date": "2024", "series": "Wind", "generation_twh": 1, "unit": "GW"},
            {"entity_code": "USA", "date": "2023", "series": "Wind", "generation_twh": 1, "unit": "TWh"},
            {"entity_code": "USA", "date": "2024", "series": "Total Generation", "generation_twh": 10, "unit": "TWh"},
        ]})
        result = connectors.normalize_ember(raw, ".json", meta("ember", "2024"))
        self.assertEqual(result["counts"]["rejected"], 2)
        self.assertEqual(len(result["records"]), 1)
        calculation = result["calculations"][0]
        values = {item["id"]: item["raw_value"] for item in result["observations"]}
        self.assertEqual(values[calculation["input_observation_ids"][0]], calculation["result"])

    def test_ember_rejects_missing_indicator(self) -> None:
        raw = connectors.canonical_json({"rows": [{"entity_code": "USA", "date": "2024", "generation_twh": 1, "unit": "TWh"}]})
        result = connectors.normalize_ember(raw, ".json", meta("ember", "2024"))
        self.assertEqual(result["records"], [])
        self.assertEqual(result["rejected_rows"], [{"row": 1, "reason": "missing_indicator"}])

    def test_ember_reconciliation_keeps_both_source_values_and_observation_ids(self) -> None:
        raw = (connectors.FIXTURES / "ember-us-2024.json").read_bytes()
        result = connectors.normalize_ember(raw, ".json", meta("ember", "2024"))
        self.assertEqual(len(result["reconciliations"]), 2)
        total = next(item for item in result["reconciliations"] if item["id"] == "reconcile-us-total-generation-2024")
        self.assertEqual(total["ember_value"], 4391.02)
        self.assertEqual(total["eia_value"], 4392.552)
        self.assertEqual(total["difference"], -1.532)
        self.assertGreaterEqual(len(total["input_observation_ids"]), 3)

    def test_command_never_changes_public_release(self) -> None:
        before = hashlib.sha256(connectors.PUBLIC_RELEASE.read_bytes()).hexdigest()
        with tempfile.TemporaryDirectory() as directory, contextlib.redirect_stdout(io.StringIO()):
            rc = connectors.main(["--offline", "--store", directory])
        after = hashlib.sha256(connectors.PUBLIC_RELEASE.read_bytes()).hexdigest()
        self.assertEqual(rc, 0)
        self.assertEqual(before, after)

    def test_offline_json_output_is_deterministic_and_failures_are_structured(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            outputs = []
            for _ in range(2):
                stream = io.StringIO()
                with contextlib.redirect_stdout(stream):
                    self.assertEqual(connectors.main(["--offline", "--dry-run", "--json-only", "--store", directory]), 0)
                outputs.append(stream.getvalue())
            self.assertEqual(outputs[0], outputs[1])
            json.loads(outputs[0])

            stream = io.StringIO()
            with contextlib.redirect_stdout(stream):
                rc = connectors.main(["--offline", "--json-only", "--report-json", str(connectors.PUBLIC_RELEASE)])
            self.assertEqual(rc, 1)
            self.assertEqual(json.loads(stream.getvalue())["status"], "failed")

    def test_cli_json_only_failure_uses_process_arguments(self) -> None:
        stream = io.StringIO()
        with mock.patch.object(sys, "argv", ["run_source_connectors.py", "--offline", "--json-only", "--report-json", str(connectors.PUBLIC_RELEASE)]), contextlib.redirect_stdout(stream):
            self.assertEqual(connectors.main(), 1)
        self.assertEqual(json.loads(stream.getvalue())["status"], "failed")

    def test_dry_run_validates_existing_snapshot_and_freshness_uses_retrieval_date(self) -> None:
        source = dict(self.eia_meta, checksum=connectors.digest(self.eia_raw))
        with tempfile.TemporaryDirectory() as directory:
            store = Path(directory)
            snapshot, _ = connectors.persist_snapshot(store, self.eia_raw, ".json", source, self.eia, False)
            (snapshot / "normalized.json").write_text("tampered")
            with self.assertRaisesRegex(RuntimeError, "Incomplete or tampered"):
                connectors.persist_snapshot(store, self.eia_raw, ".json", source, self.eia, True)
        recorded = connectors.source_meta("test", "1", "https://example.test", "2020-01-01", "2020", "fixture", "license", [], [], "yearly", [], [], "2020-02-01T00:00:00+00:00")
        self.assertEqual(recorded["freshness_state"], "current")


if __name__ == "__main__":
    unittest.main()
