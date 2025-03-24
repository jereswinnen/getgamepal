# GamePal API and Caching Documentation

This document provides a comprehensive overview of GamePal's API endpoints and caching system.

## Table of Contents

1. [Caching System](#caching-system)
2. [API Endpoints](#api-endpoints)
3. [Best Practices](#best-practices)

## Caching System

GamePal implements a sophisticated multi-tier caching system to improve performance, reduce external API calls, and enhance user experience.

### Architecture

The caching system consists of three layers:

1. **Memory Cache (NodeCache)**

   - In-process memory storage
   - Fastest retrieval times
   - Lost on server restart
   - Primary cache layer for active data

2. **Redis Cache (Optional)**

   - Persistent across server restarts
   - Shared across server instances (in clustered deployments)
   - Available only when REDIS_URL is configured
   - Second lookup layer when memory cache misses

3. **File Cache**
   - JSON files stored in `.cache` directory
   - Ultimate fallback mechanism
   - Persists through server restarts and Redis outages
   - Slowest but most resilient storage layer

### Cache Operations

The `cacheManager` interface provides these main operations:

- `get(key)`: Retrieves data, checking memory → Redis → file cache in order
- `set(key, data)`: Stores data in all available cache layers
- `delete(key)`: Removes data from all cache layers
- `clear()`: Purges all cached data across all layers
- `keys()`: Lists all active cache keys
- `getStats()`: Returns metrics on cache performance

### Cache Duration and Refresh Behavior

- **Cache Expiration**: Data is cached for 24 hours by default
- **Expiration Handling**: When data expires, the application must fetch fresh data
- **No Automatic Refresh**: The cache doesn't proactively refresh; it responds to requests
- **Timestamp Updates**:
  - `cacheStats.lastRefresh`: Updates when any cache entry is written
  - `section.lastUpdated`: Updates when that specific section is refreshed

### Cache Statistics

The debug endpoint returns these statistics:

```json
{
  "cacheStats": {
    "hits": 1,
    "misses": 17,
    "lastRefresh": "2025-03-24T09:15:39.272Z"
  }
}
```

- **hits**: Number of successful retrievals from any cache layer
- **misses**: Number of times data wasn't found in any cache layer
- **lastRefresh**: Timestamp of the most recent cache write operation

## API Endpoints

GamePal offers several API endpoints organized by domain:

### Game Information Endpoints

#### `/api/games/[gameId]/similar`

- **Method**: GET
- **Purpose**: Retrieves games similar to the specified game
- **Parameters**: `gameId` - IGDB ID of the game
- **Behavior**:
  - Checks cache first
  - Falls back to IGDB similar_games data
  - If no similar games found, recommends games in the same genre
  - Caches results for 24 hours
- **Example**: `/api/games/123/similar`
- **Returns**: Array of similar games with cover art, name, and release date

### Discovery Endpoints

#### `/api/discovery/sections`

- **Method**: GET
- **Purpose**: Retrieves metadata for all discovery sections
- **Returns**: Array of section objects with id, name, description, and count

#### `/api/discovery/[section]`

- **Method**: GET
- **Purpose**: Retrieves games in a specific discovery section
- **Parameters**: `section` - ID of the section (e.g., "trending", "upcoming")
- **Example**: `/api/discovery/trending`
- **Returns**: Array of games for the requested section

#### `/api/discovery/featured`

- **Method**: GET
- **Purpose**: Retrieves featured games for the home page
- **Returns**: Array of highlighted games with additional metadata

#### `/api/discovery/refresh`

- **Method**: POST
- **Purpose**: Forces refresh of discovery section cache
- **Parameters**: (optional) `section` - ID of specific section to refresh
- **Returns**: Status of refresh operation

#### `/api/discovery/debug`

- **Method**: GET
- **Purpose**: Returns debugging information about cache state
- **Returns**: Cache statistics, keys, and section metadata
- **Method**: POST
- **Purpose**: Clears specific or all cache entries
- **Body**:
  ```json
  {
    "key": "cache-key-to-clear",
    "clearAll": false
  }
  ```
- **Returns**: Status of cache clear operation

### IGDB Proxy Endpoints

#### `/api/v4/[...path]`

- **Method**: POST
- **Purpose**: Proxies requests to IGDB API with authentication
- **Parameters**: `path` - IGDB endpoint path
- **Body**: IGDB query string
- **Example**: POST to `/api/v4/games` with body: `fields name, cover.url; limit 10;`
- **Returns**: Raw IGDB API response
- **Note**: Handles authentication and token refresh automatically

## Best Practices

### Optimizing Cache Usage

1. **Consistent Keys**: Use predictable, consistent naming for cache keys
2. **Appropriate TTLs**: Consider data freshness requirements when setting cache durations
3. **Graceful Degradation**: Always handle cache misses properly
4. **Cache Invalidation**: Clear relevant caches when updating data

### API Usage Patterns

1. **Batching**: Combine related requests to reduce API calls
2. **Error Handling**: Always handle API errors gracefully
3. **Pagination**: Respect pagination limits for large datasets
4. **Rate Limiting**: Be aware of IGDB rate limits (especially in development)

### Monitoring and Debugging

1. Use the `/api/discovery/debug` endpoint to monitor cache performance
2. Look for patterns in cache hit/miss ratios
3. Monitor cache refresh timestamps to ensure data is being updated regularly
4. Clear cache selectively when troubleshooting data issues
