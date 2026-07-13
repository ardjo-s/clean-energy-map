import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { atlasDatasetSchema } from "../lib/domain/schemas";
import { validateBrowserDatasetIntegrity, validateDatasetIntegrity, validateReleasePairIntegrity } from "../lib/atlas/integrity";

async function main() {
  const { values } = parseArgs({
    options: {
      compact: { type: "string" },
      full: { type: "string" },
    },
  });
  const publicPath = values.compact ?? path.join(process.cwd(), "public", "data", "atlas-v1.json");
  const fullPath = values.full ?? path.join(process.cwd(), "public", "data", "downloads", "atlas-v1-full.json");
  const compactBytes = await readFile(publicPath);
  const compact = atlasDatasetSchema.parse(JSON.parse(compactBytes.toString("utf8")));
  const full = atlasDatasetSchema.parse(JSON.parse(await readFile(fullPath, "utf8")));
  const issues = [
    ...validateDatasetIntegrity(full),
    ...validateBrowserDatasetIntegrity(compact),
    ...validateReleasePairIntegrity(compact, full),
  ];
  const maximumCompactBytes = 32 * 1024 * 1024;
  if (compactBytes.byteLength > maximumCompactBytes) {
    issues.push({ code: "compact_payload_budget_exceeded", message: `Compact browser release is ${compactBytes.byteLength} bytes; maximum is ${maximumCompactBytes}.` });
  }
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
