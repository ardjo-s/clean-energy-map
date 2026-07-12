"use client";

import { useEffect, useState } from "react";
import { atlasDatasetSchema, type AtlasDataset } from "@/lib/domain/schemas";

export function useAtlasData() {
  const [data, setData] = useState<AtlasDataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/data/atlas-v1.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Dataset unavailable (${response.status})`);
        return response.json();
      })
      .then((value: unknown) => {
        const result = atlasDatasetSchema.safeParse(value);
        if (!result.success) throw new Error("Dataset validation failed: the published file does not match the atlas contract.");
        setData(result.data);
      })
      .catch((cause: unknown) => {
        if ((cause as Error).name !== "AbortError") {
          setError(cause instanceof Error ? cause.message : "Dataset validation failed");
        }
      });
    return () => controller.abort();
  }, []);
  return { data, error };
}
