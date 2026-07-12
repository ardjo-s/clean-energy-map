"use client";

import { useEffect, useState } from "react";
import type { AtlasDataset } from "@/lib/domain/schemas";

export function useAtlasData() {
  const [data, setData] = useState<AtlasDataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/data/atlas-v1.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Dataset unavailable (${response.status})`);
        return response.json() as Promise<AtlasDataset>;
      })
      .then(setData)
      .catch((cause: unknown) => {
        if ((cause as Error).name !== "AbortError") setError((cause as Error).message);
      });
    return () => controller.abort();
  }, []);
  return { data, error };
}
