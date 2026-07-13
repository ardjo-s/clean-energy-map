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

const compactRelease = release("atlas-v1.json");
const fullRelease = release("downloads/atlas-v1-full.json");
const compact = () => structuredClone(compactRelease);
const full = () => structuredClone(fullRelease);

describe("release integrity", () => {
  test("the current full release has coordinate observations matching every plotted point", () => {
    const dataset = full();
    expect(validateDatasetIntegrity(dataset).filter((issue) => issue.code === "coordinate_evidence_mismatch")).toEqual([]);

    const plotted = dataset.facilities.find((facility) => facility.location.geometryType === "point");
    expect(plotted?.location.geometryType).toBe("point");
    if (!plotted || plotted.location.geometryType !== "point") return;
    plotted.location.coordinates[0] += 0.001;
    expect(validateDatasetIntegrity(dataset)).toContainEqual(
      expect.objectContaining({ code: "coordinate_evidence_mismatch", entityId: plotted.id }),
    );
  });

  test("compact release is self-contained and matches canonical full projections", () => {
    const browser = compact();
    expect(validateBrowserDatasetIntegrity(browser)).toEqual([]);
    expect(validateDatasetIntegrity(browser)).toEqual([]);
    expect(validateReleasePairIntegrity(browser, fullRelease)).toEqual([]);
    browser.projects.splice(browser.projects.findIndex((item) => item.id === browser.facilities[0].projectId), 1);
    expect(validateBrowserDatasetIntegrity(browser)).toContainEqual(
      expect.objectContaining({ code: "browser_facility_missing_project" }),
    );
  });

  test("browser integrity rejects a missing phase and its evidence", () => {
    const browser = compact();
    const phase = browser.phases.shift();
    expect(phase).toBeDefined();
    expect(validateBrowserDatasetIntegrity(browser)).toContainEqual(
      expect.objectContaining({ code: "browser_facility_missing_phase" }),
    );
    if (!phase) return;
    browser.phases.unshift(phase);
    browser.observations.splice(browser.observations.findIndex((item) => item.id === phase.sourceObservationIds[0]), 1);
    expect(validateBrowserDatasetIntegrity(browser)).toContainEqual(
      expect.objectContaining({ code: "browser_phase_missing_observation", entityId: phase.id }),
    );
  });

  test("pair verification detects shared public-value drift", () => {
    const browser = compact();
    browser.facilities[0].officialName = "Changed only in compact";
    browser.countryIndicators[0].value += 1;
    browser.calculations[0].result += 1;
    const issues = validateReleasePairIntegrity(browser, fullRelease);
    expect(issues).toContainEqual(
      expect.objectContaining({ code: "compact_facility_mismatch", entityId: browser.facilities[0].id }),
    );
    expect(issues).toContainEqual(
      expect.objectContaining({ code: "compact_indicator_mismatch", entityId: browser.countryIndicators[0].id }),
    );
    expect(issues).toContainEqual(
      expect.objectContaining({ code: "compact_calculation_mismatch", entityId: browser.calculations[0].id }),
    );
  });

  test("pair verification ignores collection order but validates exact compact transforms", () => {
    const browser = compact();
    browser.projects.reverse();
    browser.phases.reverse();
    expect(validateReleasePairIntegrity(browser, fullRelease)).toEqual([]);
    browser.facilities[0].limitations = ["Arbitrary compact limitation"];
    expect(validateReleasePairIntegrity(browser, fullRelease)).toContainEqual(
      expect.objectContaining({ code: "compact_facility_mismatch", entityId: browser.facilities[0].id }),
    );
  });

  test("pair verification covers release metadata, pointers, shared observations, and duplicates", () => {
    const canonicalFull = fullRelease;

    const metadataCompact = compact();
    metadataCompact.release.changeSummary = "Drifted summary";
    expect(validateReleasePairIntegrity(metadataCompact, canonicalFull)).toContainEqual(
      expect.objectContaining({ code: "compact_release_mismatch" }),
    );

    const pointerCompact = compact();
    const pointer = pointerCompact.observations.find((item) => item.id.startsWith("compact-"));
    expect(pointer).toBeDefined();
    if (!pointer) return;
    pointer.rawValue = "wrong-source";
    expect(validateReleasePairIntegrity(pointerCompact, canonicalFull)).toContainEqual(
      expect.objectContaining({ code: "compact_source_pointer_mismatch", entityId: pointer.id }),
    );

    const observationCompact = compact();
    const shared = observationCompact.observations.find((item) => !item.id.startsWith("compact-"));
    expect(shared).toBeDefined();
    if (!shared) return;
    shared.normalizedValue = "drifted";
    expect(validateReleasePairIntegrity(observationCompact, canonicalFull)).toContainEqual(
      expect.objectContaining({ code: "compact_observation_mismatch", entityId: shared.id }),
    );

    const duplicateCompact = compact();
    duplicateCompact.projects.push(duplicateCompact.projects[0]);
    expect(validateReleasePairIntegrity(duplicateCompact, canonicalFull)).toContainEqual(
      expect.objectContaining({ code: "duplicate_compact_project_id", entityId: duplicateCompact.projects[0].id }),
    );
  }, 15_000);

  test("pair verification reports every missing canonical collection", () => {
    const browser = compact();
    const collections: Array<[string, Array<unknown>]> = [
      ["methodology", browser.methodologyReleases],
      ["geography", browser.geographies],
      ["source", browser.sources],
      ["organization", browser.organizations],
      ["project", browser.projects],
      ["phase", browser.phases],
      ["ownership", browser.ownership],
      ["lifecycle", browser.lifecycleEvidence],
      ["indicator", browser.countryIndicators],
      ["calculation", browser.calculations],
      ["coverage", browser.coverage],
    ];
    for (const [, collection] of collections) {
      const item = collection.shift();
      expect(item).toBeDefined();
    }
    const issues = validateReleasePairIntegrity(browser, fullRelease);
    for (const [name] of collections) expect(issues.some((issue) => issue.code === `compact_${name}_missing`)).toBe(true);
  }, 20_000);

  test("sources require an immutable snapshot identity", () => {
    const source = fullRelease.sources[0];
    expect(sourceSchema.safeParse({ ...source, snapshotSha256: null }).success).toBe(false);
    expect(sourceSchema.safeParse({ ...source, snapshotPath: null }).success).toBe(false);
  });

  test("legacy releases receive explicit contract versions at the parse boundary", () => {
    expect(compactRelease.release.schemaVersions).toEqual({
      dataset: "atlas-dataset-v1",
      source: "source-v1",
      observation: "observation-v1",
      facility: "facility-v1",
      calculation: "calculation-v1",
    });
  });
});
