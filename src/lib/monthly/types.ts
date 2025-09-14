export type ProviderId =
  | "playstation-plus"
  | "xbox-game-pass"
  | "epic-games-store";

export type PlaystationTier = "essential" | "extra" | "premium";

export interface MonthlyGame {
  igdbId: number;
  startDate: string; // ISO 8601 date (YYYY-MM-DD)
  endDate?: string; // ISO 8601 date (YYYY-MM-DD)
  notes?: string;
}

export interface ProviderEntry {
  provider: ProviderId;
  tier?: PlaystationTier; // Only for PlayStation Plus
  games: MonthlyGame[];
}

export interface MonthRecord {
  year: number; // e.g., 2025
  month: number; // 1-12
  period: string; // YYYY-MM
  entries: ProviderEntry[];
}

export type PeriodMap = Record<string, ProviderEntry[]>; // key: YYYY-MM
