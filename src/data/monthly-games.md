### Editing monthly-games data

- File: `src/data/monthly-games.json`
- Structure: map of periods `YYYY-MM` → array of provider entries

Providers:

- `playstation-plus` (tiers: `essential`, `extra`, `premium`)
- `xbox-game-pass`
- `epic-games-store`

Example entry:

```json
{
  "2025-09": [
    {
      "provider": "xbox-game-pass",
      "games": [{ "igdbId": 12345, "startDate": "2025-09-10" }]
    },
    {
      "provider": "playstation-plus",
      "tier": "essential",
      "games": [
        { "igdbId": 7346, "startDate": "2025-09-02", "endDate": "2025-10-05" }
      ]
    }
  ]
}
```

After editing, refresh the API cache so changes are picked up immediately:

```bash
curl -X POST http://localhost:3000/api/monthly-games/refresh | jq
```

Live version
curl -L -X POST http://gamepalapp.com/api/monthly-games/refresh

To refresh a specific month only:

```bash
curl -X POST "http://localhost:3000/api/monthly-games/refresh?period=2025-09" | jq
```
