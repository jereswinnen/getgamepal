### Editing discover-config data

- File: `src/data/discover-config.ts`
- Structure: object with two arrays of IGDB IDs

#### `excludedTrendingGameIDs`

Game IDs filtered out of the trending games list on the Discover tab. Used to remove evergreen titles (e.g. GTA V, Roblox, Solitaire) that would otherwise dominate trending results.

#### `curatedSeriesIDs`

IGDB collection/series IDs used for the "Curated Series" section on the Discover tab. Each day, one series is randomly picked from this list and displayed with its games.

#### Adding or removing entries

Edit the arrays in `src/data/discover-config.ts`. Each entry has a trailing comment with the game/series name for easy identification. After editing, refresh the API cache:

```bash
curl -X POST http://localhost:3000/api/discover/config/refresh | jq
```

Live version:

```bash
curl -L -X POST https://gamepalapp.com/api/discover/config/refresh
```

#### Fetching current config

```bash
curl http://localhost:3000/api/discover/config | jq
```

Live version:

```bash
curl -L https://gamepalapp.com/api/discover/config
```
