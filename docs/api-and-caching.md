# GamePal API and Caching Documentation

This document provides a comprehensive overview of GamePal's API endpoints and caching system.

## Table of Contents

1. [Caching System](#caching-system)
2. [API Endpoints](#api-endpoints)
3. [Best Practices](#best-practices)
4. [IGDB Integration](#igdb-integration)

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

#### `/api/games/[gameId]`

- **Method**: GET
- **Purpose**: Retrieves detailed information for a specific game
- **Parameters**: `gameId` - IGDB ID of the game
- **Behavior**:
  - Checks cache first
  - Falls back to IGDB API for fresh data
  - Processes image URLs and other data for consistency
  - Pre-fetches and caches related data (similar games and franchise games)
  - Background refreshes related data when serving cached responses
  - Caches results for 24 hours
- **Example**: `/api/games/123`
- **Returns**: Complete game object with all details needed for the game page

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

#### `/api/games/[gameId]/franchise-games`

- **Method**: GET
- **Purpose**: Retrieves games from the same franchise as the specified game
- **Parameters**: `gameId` - IGDB ID of the game
- **Behavior**:
  - Checks cache first
  - Determines the franchise of the game
  - Fetches other games in the same franchise, excluding the current game
  - Caches results for 24 hours
- **Example**: `/api/games/123/franchise-games`
- **Returns**: Object containing franchise details and an array of games in the franchise

#### `/api/franchises/[franchiseId]`

- **Method**: GET
- **Purpose**: Retrieves information about a franchise and its games
- **Parameters**: `franchiseId` - IGDB ID of the franchise
- **Behavior**:
  - Checks cache first
  - Falls back to IGDB franchise and games data
  - Retrieves full franchise details and all games in the franchise
  - Caches results for 24 hours
- **Example**: `/api/franchises/123`
- **Returns**: Object containing franchise details and an array of games in the franchise

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
5. **Pre-fetching Related Data**: When serving a primary resource, pre-fetch related resources that are likely to be needed:
   - Example: The game details endpoint pre-fetches similar games and franchise games
   - Use asynchronous patterns (like setTimeout) to avoid delaying the primary response
   - Check if related data is already cached before fetching

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

## IGDB Integration

GamePal integrates with the IGDB API in two ways:

1. **Internal Client Library**

   - Located at `src/lib/igdb/client.ts`
   - Provides the `queryIGDB` function for internal service-to-service requests
   - Handles authentication, rate limiting, and caching automatically
   - Used by all internal API endpoints that need IGDB data

2. **External Proxy Endpoint**
   - Located at `/api/v4/[...path]`
   - Provides external access to IGDB API for client-side requests
   - Hides API keys from clients
   - Useful for complex or custom queries not covered by existing endpoints

### Best Practices for IGDB Integration

1. **Use the Internal Client Library**: When creating new API endpoints that need IGDB data, use the `queryIGDB` function from the IGDB client library. This ensures consistent authentication, rate limiting, and caching.

2. **Avoid Direct API Calls**: Never call the IGDB API directly from API routes. Always use the client library to ensure proper error handling, caching, and rate limit compliance.

3. **Cache Appropriately**: Use the optional cacheKey parameter in queryIGDB for data that can be safely cached.

4. **Rate Limiting Awareness**: The client library handles rate limiting, but be mindful when designing new features to minimize API calls.
