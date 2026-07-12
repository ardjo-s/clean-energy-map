import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import { validateDatasetIntegrity, validateReleasePairIntegrity } from "@/lib/atlas/integrity";
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

  test("compact references resolve against the canonical full release", () => {
    const compact = release("atlas-v1.json");
    const full = release("downloads/atlas-v1-full.json");
    expect(validateReleasePairIntegrity(compact, full)).toEqual([]);
    compact.facilities[0].projectId = "missing-project";
    expect(validateReleasePairIntegrity(compact, full)).toContainEqual(
      expect.objectContaining({ code: "compact_dangling_project" }),
    );
  });

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
