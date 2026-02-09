import { cacheManager } from "@/lib/cache";
import { queryIGDB } from "@/lib/igdb/client";

/**
 * Fetch a game by its IGDB ID, with caching.
 * Shared by the API route (for the iOS app) and the server-component page.
 */
export async function getGameById(gameId: string) {
  const cacheKey = `game-detail-${gameId}`;

  // Check if we have a cached response
  const cachedData = await cacheManager.get(cacheKey);
  if (cachedData) {
    console.log(`Returning cached game data for ID: ${gameId}`);
    return cachedData;
  }

  console.log(`Fetching game data for ID: ${gameId}`);

  const query = `
    fields name, cover.url, summary, screenshots.url, videos.*, platforms.name,
    involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
    first_release_date, genres.name, game_modes.name, url, total_rating, rating_count, similar_games,
    franchise.name, franchise.id, franchises.name, franchises.id;
    where id = ${gameId};
    limit 1;
  `;

  const gameResult = await queryIGDB("games", query, cacheKey);

  if (!gameResult || gameResult.length === 0) {
    console.log(`Game not found with ID: ${gameId}`);
    return null;
  }

  const game = gameResult[0];
  console.log(`Found game: ${game.name}`);

  // Process the game data
  const processedGame = {
    ...game,
    cover: game.cover
      ? {
          ...game.cover,
          url: game.cover.url,
        }
      : null,
    screenshots: game.screenshots
      ? game.screenshots.map((screenshot: any) => ({
          ...screenshot,
          url: screenshot.url,
        }))
      : [],
    franchise: game.franchise
      ? {
          id: game.franchise.id,
          name: game.franchise.name,
        }
      : null,
    franchises: game.franchises
      ? game.franchises.map((franchise: any) => ({
          id: franchise.id,
          name: franchise.name,
        }))
      : [],
  };

  // Cache the processed game data
  await cacheManager.set(cacheKey, processedGame);

  return processedGame;
}

/**
 * Fetch popular games from IGDB.
 * Shared by the popular games page (server component).
 */
export async function getPopularGames() {
  const results = await queryIGDB(
    "games",
    `fields name, cover.url;
     where rating > 80 & cover != null;
     sort rating desc;
     limit 12;`
  );

  return results || [];
}
