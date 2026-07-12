import { readFile } from "node:fs/promises";
import path from "node:path";
import type { AtlasDataset } from "../lib/domain/schemas";
import { validateDatasetIntegrity } from "../lib/atlas/integrity";

async function main() {
  const publicPath = path.join(process.cwd(), "public", "data", "atlas-v1.json");
  const fullPath = path.join(process.cwd(), "public", "data", "downloads", "atlas-v1-full.json");
  const compact = JSON.parse(await readFile(publicPath, "utf8")) as AtlasDataset;
  const full = JSON.parse(await readFile(fullPath, "utf8")) as AtlasDataset;
  if (full.release.id !== compact.release.id || full.facilities.length !== compact.facilities.length) {
    console.error("compact_release_mismatch: Browser and full evidence releases differ.");
    process.exit(1);
  }

  const issues = validateDatasetIntegrity(full);
  if (issues.length) {
    console.error(issues.map((issue) => `${issue.code}${issue.entityId ? ` [${issue.entityId}]` : ""}: ${issue.message}`).join("\n"));
    process.exit(1);
  }

  const mapped = full.facilities.filter((facility) => facility.location.geometryType !== "unplotted").length;
  const unplotted = full.facilities.length - mapped;
  console.log(
    `Data verified: ${full.release.id}; ${full.facilities.length} facilities (${mapped} mapped, ${unplotted} unplotted).`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
