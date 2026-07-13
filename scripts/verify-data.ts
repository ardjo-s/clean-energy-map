import { readFile } from "node:fs/promises";
import path from "node:path";
import { atlasDatasetSchema } from "../lib/domain/schemas";
import { validateBrowserDatasetIntegrity, validateDatasetIntegrity, validateReleasePairIntegrity } from "../lib/atlas/integrity";

async function main() {
  const publicPath = path.join(process.cwd(), "public", "data", "atlas-v1.json");
  const fullPath = path.join(process.cwd(), "public", "data", "downloads", "atlas-v1-full.json");
  const compact = atlasDatasetSchema.parse(JSON.parse(await readFile(publicPath, "utf8")));
  const full = atlasDatasetSchema.parse(JSON.parse(await readFile(fullPath, "utf8")));
  const issues = [
    ...validateDatasetIntegrity(full),
    ...validateDatasetIntegrity(compact),
    ...validateBrowserDatasetIntegrity(compact),
    ...validateReleasePairIntegrity(compact, full),
  ];
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
