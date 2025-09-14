### Monthly Games API

This module exposes a simple, file-backed API for monthly game lineups across providers. It is designed to be clean, modular, and easy to migrate to an admin-backed datastore later.

### Data source

- File: `src/data/monthly-games.json`
- Shape: keyed by period `YYYY-MM`, each value is a list of provider entries.

Example:

```json
{
  "2025-01": [
    {
      "provider": "playstation-plus",
      "tier": "essential",
      "games": [
        { "igdbId": 7346, "startDate": "2025-01-02", "endDate": "2025-02-05" }
      ]
    },
    {
      "provider": "xbox-game-pass",
      "games": [{ "igdbId": 12345, "startDate": "2025-01-10" }]
    },
    {
      "provider": "epic-games-store",
      "games": [
        { "igdbId": 67890, "startDate": "2025-01-15", "endDate": "2025-01-22" }
      ]
    }
  ]
}
```

Types (source: `src/lib/monthly/types.ts`):

- `provider`: one of `"playstation-plus" | "xbox-game-pass" | "epic-games-store"`
- `tier` (optional, PlayStation only): `"essential" | "extra" | "premium"`
- `games[]`: `{ igdbId: number, startDate: YYYY-MM-DD, endDate?: YYYY-MM-DD, notes?: string }`

### Server utilities

- Loader and helpers: `src/lib/monthly/index.ts`
- Caching: integrated with `@/lib/cache` (memory + optional Redis + file backup)

Key helpers:

- `getCurrentYearMonth()` → `{ year, month }`
- `getMonth(year, month)` → `MonthRecord | null`
- `getMonthForProvider(year, month, provider?)` → filters by provider if passed

### API routes

- `GET /api/monthly-games` → current month
  - Optional `?provider=playstation-plus|xbox-game-pass|epic-games-store`
- `GET /api/monthly-games/[year]/[month]`
  - e.g. `/api/monthly-games/2025/1?provider=xbox-game-pass`

Response shape:

```json
{
  "status": "success",
  "year": 2025,
  "month": 1,
  "period": "2025-01",
  "entries": [
    {
      "provider": "xbox-game-pass",
      "games": [{ "igdbId": 12345, "startDate": "2025-01-10" }]
    }
  ]
}
```

Not-found returns `{ status: "not_found", message: string }` (404).

### iOS consumption

- Fetch current month: `/api/monthly-games` (optionally pass `?provider=`)
- Fetch specific month: `/api/monthly-games/2025/1`
- IGDB IDs are returned; your app can hydrate details via existing endpoints.

### Evolving to an admin panel

The current file-backed storage is intentional for simplicity. To evolve:

- Replace `src/data/monthly-games.json` with a DB table (e.g., Supabase) mirroring the same schema.
- Implement minimal admin UI to CRUD month records and provider entries.
- Keep the same `src/lib/monthly` API so routes remain unchanged.
