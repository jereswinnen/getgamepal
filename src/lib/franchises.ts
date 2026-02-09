import { cacheManager } from "@/lib/cache";
import { queryIGDB } from "@/lib/igdb/client";

/**
 * Fetch a franchise and its games by IGDB franchise ID, with caching.
 * Shared by the API route (for the iOS app) and the server-component page.
 */
export async function getFranchiseById(franchiseId: string) {
  const cacheKey = `franchise-games-${franchiseId}`;

  // Check if we have a cached response
  const cachedData = await cacheManager.get(cacheKey);
  if (cachedData) {
    console.log(`Returning cached franchise data for ID: ${franchiseId}`);
    return cachedData;
  }

  console.log(`Fetching franchise data for ID: ${franchiseId}`);

  // Get the franchise details
  const franchiseQuery = `
    fields name, slug, games, url;
    where id = ${franchiseId};
    limit 1;
  `;

  const franchiseResult = await queryIGDB("franchises", franchiseQuery);

  if (!franchiseResult || franchiseResult.length === 0) {
    console.log(`Franchise not found with ID: ${franchiseId}`);
    return null;
  }

  const franchise = franchiseResult[0];
  console.log(
    `Found franchise: ${franchise.name}, games: ${franchise.games?.length || 0}`
  );

  // If no games in the franchise, return empty array
  if (!franchise.games || franchise.games.length === 0) {
    const emptyResponse = {
      franchise: {
        id: Number(franchiseId),
        name: franchise.name,
        slug: franchise.slug,
        url: franchise.url,
      },
      games: [],
    };

    await cacheManager.set(cacheKey, emptyResponse);
    return emptyResponse;
  }

  // Get the games in the franchise
  const gamesQuery = `
    fields name, cover.url, first_release_date, genres.name, total_rating, slug;
    where id = (${franchise.games.join(",")}) & cover != null;
    sort first_release_date asc;
    limit 50;
  `;

  const gamesResult = await queryIGDB("games", gamesQuery);
  console.log(
    `Found ${gamesResult.length} games in franchise ${franchise.name}`
  );

  // Process the results to format URLs
  const processedGames = gamesResult.map((game: any) => ({
    ...game,
    cover: game.cover
      ? {
          ...game.cover,
          url: game.cover.url,
        }
      : null,
  }));

  const response = {
    franchise: {
      id: Number(franchiseId),
      name: franchise.name,
      slug: franchise.slug,
      url: franchise.url,
    },
    games: processedGames,
  };

  await cacheManager.set(cacheKey, response);

  return response;
}
