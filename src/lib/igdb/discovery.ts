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
    url = url.replace("t_thumb", "t_cover_big_2x");
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
  const now = new Date().toISOString();
  await cacheManager.set(LAST_REFRESH_KEY, now);
  console.log(`Updated last refresh time to ${now}`);
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
    const lastRefreshTime =
      (await getLastRefreshTime()) || new Date().toISOString();

    // First attempt to gather data from cache
    for (const section of discoverySections) {
      const cacheKey = `${DISCOVERY_CACHE_PREFIX}${section.id}`;
      const cachedData = await cacheManager.get<GameResult[]>(cacheKey);

      // If not cached, we'll fetch it now to get accurate counts
      let games = cachedData;
      if (!games) {
        try {
          console.log(`Fetching games for section ${section.id}...`);
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

          console.log(
            `Fetched ${games?.length || 0} games for section ${section.id}`
          );
        } catch (error) {
          console.error(
            `Error pre-fetching games for section ${section.id}:`,
            error
          );
          games = [];
        }
      }

      sectionsWithCounts.push({
        id: section.id,
        name: section.name,
        description: section.description,
        count: games?.length || 0,
        lastUpdated: lastRefreshTime,
      });
    }

    // Cache the sections metadata
    await cacheManager.set(ALL_SECTIONS_CACHE_KEY, sectionsWithCounts);
    console.log(
      "Cached sections metadata:",
      sectionsWithCounts.map((s) => `${s.id}: ${s.count} games`).join(", ")
    );

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
 * Update section metadata counts
 */
async function updateSectionMetaCounts(): Promise<void> {
  try {
    console.log("Updating section metadata counts...");
    // Get current metadata
    const cachedSections = await cacheManager.get<DiscoverySectionMeta[]>(
      ALL_SECTIONS_CACHE_KEY
    );

    if (cachedSections) {
      const lastRefreshTime =
        (await getLastRefreshTime()) || new Date().toISOString();
      const updatedSections = [...cachedSections];

      // Update counts for each section
      for (let i = 0; i < updatedSections.length; i++) {
        const section = updatedSections[i];
        const cacheKey = `${DISCOVERY_CACHE_PREFIX}${section.id}`;
        const games = await cacheManager.get<GameResult[]>(cacheKey);

        updatedSections[i] = {
          ...section,
          count: games?.length || 0,
          lastUpdated: lastRefreshTime,
        };
      }

      // Update cache
      await cacheManager.set(ALL_SECTIONS_CACHE_KEY, updatedSections);
      console.log(
        "Updated sections metadata:",
        updatedSections.map((s) => `${s.id}: ${s.count} games`).join(", ")
      );
    }
  } catch (error) {
    console.error("Error updating section metadata counts:", error);
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
      console.log(`Fetching games for section ${sectionId} from IGDB API...`);
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

      // Update section metadata counts
      await updateSectionMetaCounts();
    }

    console.log(
      `Retrieved ${games?.length || 0} games for section ${sectionId}`
    );

    // Process the game data
    if (Array.isArray(games)) {
      games = games.map(formatCoverUrl);
    } else {
      games = [];
    }

    // Get current metadata for this section
    const allSections = await getAllSectionsMeta();
    const sectionMeta = allSections.find((s) => s.id === sectionId) || {
      id: section.id,
      name: section.name,
      description: section.description,
      count: games.length,
      lastUpdated: fromCache
        ? (await getLastRefreshTime()) || new Date().toISOString()
        : new Date().toISOString(),
    };

    // Build the response
    const response: DiscoveryResponse = {
      section: {
        ...sectionMeta,
        count: games.length, // Ensure count matches actual games length
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

    // Get updated sections metadata after fetching games
    const updatedSections = await getAllSectionsMeta();

    return {
      sections: updatedSections,
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
    console.log("Starting refresh of all discovery sections...");

    // First, clear the metadata cache
    await cacheManager.delete(ALL_SECTIONS_CACHE_KEY);
    console.log("Cleared sections metadata cache");

    // Update the last refresh time right away
    await updateLastRefreshTime();

    // Process each section
    for (const section of discoverySections) {
      const cacheKey = `${DISCOVERY_CACHE_PREFIX}${section.id}`;

      // Delete existing cache for this section
      await cacheManager.delete(cacheKey);
      console.log(`Cleared cache for section ${section.id}`);

      // Fetch fresh data from IGDB
      console.log(`Fetching fresh data for section ${section.id}...`);
      try {
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
        console.log(
          `Updated cache for section ${section.id} with ${
            transformedGames?.length || 0
          } games`
        );
      } catch (error) {
        console.error(`Error refreshing section ${section.id}:`, error);
      }
    }

    // Update sections metadata with new counts
    await updateSectionMetaCounts();

    console.log("Completed refresh of all discovery sections");

    return true;
  } catch (error) {
    console.error("Error refreshing discovery sections:", error);
    return false;
  }
}
