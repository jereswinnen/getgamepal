import { promises as fs } from "fs";
import path from "path";
import { cacheManager } from "@/lib/cache";
import type {
  MonthRecord,
  PeriodMap,
  ProviderEntry,
  ProviderId,
} from "./types";

const DATA_FILE_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "monthly-games.json"
);
const CACHE_KEY_PREFIX = "monthly-games";

function getPeriodKey(year: number, month: number): string {
  const m = String(month).padStart(2, "0");
  return `${year}-${m}`;
}

export async function readPeriodMap(): Promise<PeriodMap> {
  const cacheKey = `${CACHE_KEY_PREFIX}-period-map`;
  const cached = await cacheManager.get<PeriodMap>(cacheKey);
  if (cached) return cached;

  const raw = await fs.readFile(DATA_FILE_PATH, "utf-8");
  const parsed = JSON.parse(raw) as PeriodMap;
  await cacheManager.set(cacheKey, parsed);
  return parsed;
}

export async function getMonth(
  year: number,
  month: number
): Promise<MonthRecord | null> {
  const period = getPeriodKey(year, month);
  const cacheKey = `${CACHE_KEY_PREFIX}-${period}`;
  const cached = await cacheManager.get<MonthRecord>(cacheKey);
  if (cached) return cached;

  const map = await readPeriodMap();
  const entries = map[period];
  if (!entries) return null;

  const record: MonthRecord = { year, month, period, entries };
  await cacheManager.set(cacheKey, record);
  return record;
}

export async function getMonthForProvider(
  year: number,
  month: number,
  provider?: ProviderId
): Promise<MonthRecord | null> {
  const record = await getMonth(year, month);
  if (!record) return null;
  if (!provider) return record;
  const filtered: ProviderEntry[] = record.entries.filter(
    (e) => e.provider === provider
  );
  return { ...record, entries: filtered };
}

export function getCurrentYearMonth(baseDate = new Date()): {
  year: number;
  month: number;
} {
  return { year: baseDate.getUTCFullYear(), month: baseDate.getUTCMonth() + 1 };
}
