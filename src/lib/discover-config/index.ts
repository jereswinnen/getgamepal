import { cacheManager } from "@/lib/cache";
import { discoverConfig } from "@/data/discover-config";
import type { DiscoverConfig } from "./types";

const CACHE_KEY = "discover-config";

export async function readDiscoverConfig(): Promise<DiscoverConfig> {
  const cached = await cacheManager.get<DiscoverConfig>(CACHE_KEY);
  if (cached) return cached;

  await cacheManager.set(CACHE_KEY, discoverConfig);
  return discoverConfig;
}
