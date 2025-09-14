import { NextRequest, NextResponse } from "next/server";
import { cacheManager } from "@/lib/cache";
import { queryIGDB } from "@/lib/igdb/client";

// Main handler for the API route
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ gameId: string }> }
) {
  try {
    // Await params before using gameId
    const params = await context.params;
    const gameId = params.gameId;

    // Handle the case where gameId is not provided
    if (!gameId) {
      return NextResponse.json(
        { error: "Game ID is required" },
        { status: 400 }
      );
    }

    console.log(`Fetching similar games for game ID: ${gameId}`);

    // Create a cache key for this specific request
    const cacheKey = `similar-games-${gameId}`;

    // Check if we have a cached response
    const cachedData = await cacheManager.get(cacheKey);
    if (cachedData) {
      console.log(`Returning cached similar games for game ID: ${gameId}`);
      return NextResponse.json(cachedData);
    }

    // First, check if the game exists and get its similar_games field
    console.log(`Fetching game data for ID: ${gameId}`);
    const query = `
      fields similar_games, name, genres.name;
      where id = ${gameId};
      limit 1;
    `;

    const gameResult = await queryIGDB("games", query);

    if (!gameResult || gameResult.length === 0) {
      console.log(`Game not found with ID: ${gameId}`);
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const game = gameResult[0];
    console.log(
      `Found game: ${game.name}, similar games: ${
        game.similar_games?.length || 0
      }`
    );

    // If no similar games, try to find some based on genre
    if (!game.similar_games || game.similar_games.length === 0) {
      console.log(`No similar games found for ${game.name}, trying genres`);
      let similarGames = [];

      // If the game has genres, use them to find similar games
      if (game.genres && game.genres.length > 0) {
        const genreIds = game.genres.map((g: any) => g.id).join(",");
        console.log(`Finding games with genres: ${genreIds}`);

        const genreQuery = `
          fields name, cover.url, first_release_date, genres.name, total_rating;
          where genres = (${genreIds}) & id != ${gameId} & cover != null;
          sort total_rating desc;
          limit 6;
        `;

        similarGames = await queryIGDB("games", genreQuery);
      } else {
        // If no genres, just get popular games
        console.log(`No genres found for ${game.name}, finding popular games`);
        const popularQuery = `
          fields name, cover.url, first_release_date, total_rating;
          where total_rating > 75 & cover != null & id != ${gameId};
          sort total_rating desc;
          limit 6;
        `;

        similarGames = await queryIGDB("games", popularQuery);
      }

      console.log(`Found ${similarGames.length} alternative similar games`);

      // Process the results to format URLs and add info
      const processedGames = similarGames.map((similarGame: any) => ({
        ...similarGame,
        similarityReason: "Same genre",
        cover: similarGame.cover
          ? {
              ...similarGame.cover,
              url: similarGame.cover.url,
            }
          : null,
      }));

      // Cache the results
      await cacheManager.set(cacheKey, processedGames);

      return NextResponse.json(processedGames);
    }

    // If we do have similar games, fetch the details for those games
    const similarGameIds = game.similar_games.slice(0, 6);
    console.log(
      `Fetching details for similar game IDs: ${similarGameIds.join(", ")}`
    );

    const similarQuery = `
      fields name, cover.url, first_release_date, genres.name, total_rating;
      where id = (${similarGameIds.join(",")}) & cover != null;
      limit 6;
    `;

    const similarGamesData = await queryIGDB("games", similarQuery);

    console.log(`Found ${similarGamesData.length} similar games with details`);

    // Process the results to format URLs
    const processedGames = similarGamesData.map((similarGame: any) => ({
      ...similarGame,
      similarityReason: "Recommended by IGDB",
      cover: similarGame.cover
        ? {
            ...similarGame.cover,
            url: similarGame.cover.url,
          }
        : null,
    }));

    // Cache the results
    await cacheManager.set(cacheKey, processedGames);

    return NextResponse.json(processedGames);
  } catch (error: any) {
    console.error("Error processing similar games request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch similar games" },
      { status: 500 }
    );
  }
}
