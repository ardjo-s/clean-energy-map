import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { validateBrowserDatasetIntegrity, validateDatasetIntegrity, validateReleasePairIntegrity } from "@/lib/atlas/integrity";
import { atlasDatasetSchema, sourceSchema } from "@/lib/domain/schemas";

function release(name: "atlas-v1.json" | "downloads/atlas-v1-full.json") {
  return atlasDatasetSchema.parse(
    JSON.parse(readFileSync(path.join(process.cwd(), "public", "data", name), "utf8")),
  );
}

describe("release integrity", () => {
  test("the current full release has coordinate observations matching every plotted point", () => {
    const full = release("downloads/atlas-v1-full.json");
    expect(validateDatasetIntegrity(full).filter((issue) => issue.code === "coordinate_evidence_mismatch")).toEqual([]);

    const plotted = full.facilities.find((facility) => facility.location.geometryType === "point");
    expect(plotted?.location.geometryType).toBe("point");
    if (!plotted || plotted.location.geometryType !== "point") return;
    plotted.location.coordinates[0] += 0.001;
    expect(validateDatasetIntegrity(full)).toContainEqual(
      expect.objectContaining({ code: "coordinate_evidence_mismatch", entityId: plotted.id }),
    );
  });

  test("compact release is self-contained and matches canonical full projections", () => {
    const compact = release("atlas-v1.json");
    const full = release("downloads/atlas-v1-full.json");
    expect(validateBrowserDatasetIntegrity(compact)).toEqual([]);
    expect(validateDatasetIntegrity(compact)).toEqual([]);
    expect(validateReleasePairIntegrity(compact, full)).toEqual([]);
    compact.projects.splice(compact.projects.findIndex((item) => item.id === compact.facilities[0].projectId), 1);
    expect(validateBrowserDatasetIntegrity(compact)).toContainEqual(
      expect.objectContaining({ code: "browser_facility_missing_project" }),
    );
  });

  test("browser integrity rejects a missing phase and its evidence", () => {
    const compact = release("atlas-v1.json");
    const phase = compact.phases.shift();
    expect(phase).toBeDefined();
    expect(validateBrowserDatasetIntegrity(compact)).toContainEqual(
      expect.objectContaining({ code: "browser_facility_missing_phase" }),
    );
    if (!phase) return;
    compact.phases.unshift(phase);
    compact.observations.splice(compact.observations.findIndex((item) => item.id === phase.sourceObservationIds[0]), 1);
    expect(validateBrowserDatasetIntegrity(compact)).toContainEqual(
      expect.objectContaining({ code: "browser_phase_missing_observation", entityId: phase.id }),
    );
  });

  test("pair verification detects shared public-value drift", () => {
    const compact = release("atlas-v1.json");
    const full = release("downloads/atlas-v1-full.json");
    compact.facilities[0].officialName = "Changed only in compact";
    expect(validateReleasePairIntegrity(compact, full)).toContainEqual(
      expect.objectContaining({ code: "compact_facility_mismatch", entityId: compact.facilities[0].id }),
    );

    const indicatorCompact = release("atlas-v1.json");
    indicatorCompact.countryIndicators[0].value += 1;
    expect(validateReleasePairIntegrity(indicatorCompact, full)).toContainEqual(
      expect.objectContaining({ code: "compact_indicator_mismatch", entityId: indicatorCompact.countryIndicators[0].id }),
    );

    const calculationCompact = release("atlas-v1.json");
    calculationCompact.calculations[0].result += 1;
    expect(validateReleasePairIntegrity(calculationCompact, full)).toContainEqual(
      expect.objectContaining({ code: "compact_calculation_mismatch", entityId: calculationCompact.calculations[0].id }),
    );
  });

  test("pair verification ignores collection order but validates exact compact transforms", () => {
    const compact = release("atlas-v1.json");
    const full = release("downloads/atlas-v1-full.json");
    compact.projects.reverse();
    compact.phases.reverse();
    expect(validateReleasePairIntegrity(compact, full)).toEqual([]);
    compact.facilities[0].limitations = ["Arbitrary compact limitation"];
    expect(validateReleasePairIntegrity(compact, full)).toContainEqual(
      expect.objectContaining({ code: "compact_facility_mismatch", entityId: compact.facilities[0].id }),
    );
  });

  test("pair verification covers release metadata, pointers, shared observations, and duplicates", () => {
    const full = release("downloads/atlas-v1-full.json");

    const metadataCompact = release("atlas-v1.json");
    metadataCompact.release.changeSummary = "Drifted summary";
    expect(validateReleasePairIntegrity(metadataCompact, full)).toContainEqual(
      expect.objectContaining({ code: "compact_release_mismatch" }),
    );

    const pointerCompact = release("atlas-v1.json");
    const pointer = pointerCompact.observations.find((item) => item.id.startsWith("compact-"));
    expect(pointer).toBeDefined();
    if (!pointer) return;
    pointer.rawValue = "wrong-source";
    expect(validateReleasePairIntegrity(pointerCompact, full)).toContainEqual(
      expect.objectContaining({ code: "compact_source_pointer_mismatch", entityId: pointer.id }),
    );

    const observationCompact = release("atlas-v1.json");
    const shared = observationCompact.observations.find((item) => !item.id.startsWith("compact-"));
    expect(shared).toBeDefined();
    if (!shared) return;
    shared.normalizedValue = "drifted";
    expect(validateReleasePairIntegrity(observationCompact, full)).toContainEqual(
      expect.objectContaining({ code: "compact_observation_mismatch", entityId: shared.id }),
    );

    const duplicateCompact = release("atlas-v1.json");
    duplicateCompact.projects.push(duplicateCompact.projects[0]);
    expect(validateReleasePairIntegrity(duplicateCompact, full)).toContainEqual(
      expect.objectContaining({ code: "duplicate_compact_project_id", entityId: duplicateCompact.projects[0].id }),
    );
  }, 15_000);

  test("pair verification reports every missing canonical collection", () => {
    const compact = release("atlas-v1.json");
    const full = release("downloads/atlas-v1-full.json");
    const collections: Array<[string, Array<unknown>]> = [
      ["methodology", compact.methodologyReleases],
      ["geography", compact.geographies],
      ["source", compact.sources],
      ["organization", compact.organizations],
      ["project", compact.projects],
      ["phase", compact.phases],
      ["ownership", compact.ownership],
      ["lifecycle", compact.lifecycleEvidence],
      ["indicator", compact.countryIndicators],
      ["calculation", compact.calculations],
      ["coverage", compact.coverage],
    ];
    for (const [name, collection] of collections) {
      const removed = collection.shift();
      expect(removed).toBeDefined();
      expect(validateReleasePairIntegrity(compact, full).some((issue) => issue.code === `compact_${name}_missing`)).toBe(true);
      collection.unshift(removed);
    }
  }, 20_000);

  test("sources require an immutable snapshot identity", () => {
    const source = release("downloads/atlas-v1-full.json").sources[0];
    expect(sourceSchema.safeParse({ ...source, snapshotSha256: null }).success).toBe(false);
    expect(sourceSchema.safeParse({ ...source, snapshotPath: null }).success).toBe(false);
  });

  test("legacy releases receive explicit contract versions at the parse boundary", () => {
    const compact = release("atlas-v1.json");
    expect(compact.release.schemaVersions).toEqual({
      dataset: "atlas-dataset-v1",
      source: "source-v1",
      observation: "observation-v1",
      facility: "facility-v1",
      calculation: "calculation-v1",
    });
  });
});
