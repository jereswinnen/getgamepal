import { queryIGDB } from "./client";
import { discoverySections, getSectionById } from "./sections";
import { cacheManager } from "../cache";
import {
  DiscoveryResponse,
  FeaturedResponse,
  GameResult,
  DiscoverySectionMeta,
} from "./types";

// Cache keys
const DISCOVERY_CACHE_PREFIX = "discovery:";
const ALL_SECTIONS_CACHE_KEY = `${DISCOVERY_CACHE_PREFIX}all_sections`;
const LAST_REFRESH_KEY = `${DISCOVERY_CACHE_PREFIX}last_refresh`;

// Cache TTL in seconds (24 hours)
const CACHE_TTL = 24 * 60 * 60;

/**
 * Format cover URLs to use https and the appropriate size
 */
function formatCoverUrl(game: GameResult): GameResult {
  if (game.cover && game.cover.url) {
    // Replace URLs to use https and bigger image size
    let url = game.cover.url.replace("//images", "https://images");
    url = url.replace("t_thumb", "t_cover_big");
    game.cover.url = url;
  }
  return game;
}

/**
 * Get the time since last refresh
 */
export async function getLastRefreshTime(): Promise<string | null> {
  return cacheManager.get<string>(LAST_REFRESH_KEY);
}

/**
 * Update the last refresh time
 */
async function updateLastRefreshTime(): Promise<void> {
  await cacheManager.set(LAST_REFRESH_KEY, new Date().toISOString());
}

/**
 * Get all discovery sections metadata
 */
export async function getAllSectionsMeta(): Promise<DiscoverySectionMeta[]> {
  try {
    // Try to get from cache first
    const cachedSections = await cacheManager.get<DiscoverySectionMeta[]>(
      ALL_SECTIONS_CACHE_KEY
    );
    if (cachedSections) {
      return cachedSections;
    }

    // Build sections metadata with game counts
    const sectionsWithCounts: DiscoverySectionMeta[] = [];

    for (const section of discoverySections) {
      const cacheKey = `${DISCOVERY_CACHE_PREFIX}${section.id}`;
      const cachedData = await cacheManager.get<GameResult[]>(cacheKey);

      sectionsWithCounts.push({
        id: section.id,
        name: section.name,
        description: section.description,
        count: cachedData?.length || 0,
        lastUpdated: (await getLastRefreshTime()) || new Date().toISOString(),
      });
    }

    // Cache the sections metadata
    await cacheManager.set(ALL_SECTIONS_CACHE_KEY, sectionsWithCounts);

    return sectionsWithCounts;
  } catch (error) {
    console.error("Error getting discovery sections:", error);
    return discoverySections.map(({ id, name, description }) => ({
      id,
      name,
      description,
    }));
  }
}

/**
 * Get games for a specific discovery section
 */
export async function getSectionGames(
  sectionId: string
): Promise<DiscoveryResponse | null> {
  try {
    const section = getSectionById(sectionId);
    if (!section) {
      throw new Error(`Section '${sectionId}' not found`);
    }

    const cacheKey = `${DISCOVERY_CACHE_PREFIX}${sectionId}`;

    // Try to get from cache first
    let games = await cacheManager.get<GameResult[]>(cacheKey);
    let fromCache = true;

    // If not in cache, fetch from IGDB API
    if (!games) {
      fromCache = false;
      games = await queryIGDB<GameResult[]>(
        section.endpoint,
        section.query.trim(),
        cacheKey
      );

      // Apply transformation if available
      if (section.transform && Array.isArray(games)) {
        games = section.transform(games);
        await cacheManager.set(cacheKey, games);
      }

      // Update last refresh time
      await updateLastRefreshTime();
    }

    // Process the game data
    if (Array.isArray(games)) {
      games = games.map(formatCoverUrl);
    } else {
      games = [];
    }

    // Build the response
    const response: DiscoveryResponse = {
      section: {
        id: section.id,
        name: section.name,
        description: section.description,
        count: games.length,
        lastUpdated: fromCache
          ? (await getLastRefreshTime()) || new Date().toISOString()
          : new Date().toISOString(),
      },
      games,
    };

    return response;
  } catch (error) {
    console.error(`Error getting games for section '${sectionId}':`, error);
    return null;
  }
}

/**
 * Get featured games from multiple sections
 */
export async function getFeaturedGames(
  limit = 3
): Promise<FeaturedResponse | null> {
  try {
    const sections = await getAllSectionsMeta();
    const featured: Record<string, GameResult[]> = {};

    // Fetch games for each section and take the top items
    for (const section of sections) {
      const response = await getSectionGames(section.id);
      if (response && response.games && response.games.length > 0) {
        featured[section.id] = response.games.slice(0, limit);
      }
    }

    return {
      sections,
      featured,
    };
  } catch (error) {
    console.error("Error getting featured games:", error);
    return null;
  }
}

/**
 * Manually refresh all discovery sections
 */
export async function refreshAllSections(): Promise<boolean> {
  try {
    // Clear cache for discovery sections
    for (const section of discoverySections) {
      const cacheKey = `${DISCOVERY_CACHE_PREFIX}${section.id}`;

      // Fetch fresh data from IGDB
      const games = await queryIGDB<GameResult[]>(
        section.endpoint,
        section.query.trim()
      );

      // Apply transformation if available
      const transformedGames =
        section.transform && Array.isArray(games)
          ? section.transform(games)
          : games;

      // Update cache
      await cacheManager.set(cacheKey, transformedGames);
    }

    // Update last refresh time
    await updateLastRefreshTime();

    // Update sections metadata
    await getAllSectionsMeta();

    return true;
  } catch (error) {
    console.error("Error refreshing discovery sections:", error);
    return false;
  }
}
