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

    console.log(`Fetching franchise games for game ID: ${gameId}`);

    // Create a cache key for this specific request
    const cacheKey = `game-franchise-games-${gameId}`;

    // Check if we have a cached response
    const cachedData = await cacheManager.get(cacheKey);
    if (cachedData) {
      console.log(`Returning cached franchise games for game ID: ${gameId}`);
      return NextResponse.json(cachedData);
    }

    // First, check if the game exists and get its franchise fields
    console.log(`Fetching game data with franchise info for ID: ${gameId}`);
    const query = `
      fields franchise.name, franchise.id, franchise.games, franchises.name, franchises.id, franchises.games, name;
      where id = ${gameId};
      limit 1;
    `;

    const gameResult = await queryIGDB("games", query);

    if (!gameResult || gameResult.length === 0) {
      console.log(`Game not found with ID: ${gameId}`);
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const game = gameResult[0];
    let franchiseId = null;
    let franchiseName = null;
    let franchiseGames = [];

    // Try to get franchise information from the main franchise or franchises array
    if (game.franchise) {
      franchiseId = game.franchise.id;
      franchiseName = game.franchise.name;
      console.log(
        `Game is part of franchise: ${franchiseName} (ID: ${franchiseId})`
      );

      // Get the games in the franchise if available directly
      if (game.franchise.games && game.franchise.games.length > 0) {
        franchiseGames = game.franchise.games.filter(
          (id: number) => id !== Number(gameId)
        );
      }
    } else if (game.franchises && game.franchises.length > 0) {
      franchiseId = game.franchises[0].id;
      franchiseName = game.franchises[0].name;
      console.log(
        `Game is part of franchise (from franchises array): ${franchiseName} (ID: ${franchiseId})`
      );

      // Get the games in the franchise if available directly
      if (game.franchises[0].games && game.franchises[0].games.length > 0) {
        franchiseGames = game.franchises[0].games.filter(
          (id: number) => id !== Number(gameId)
        );
      }
    } else {
      console.log(`Game does not belong to any franchise`);
      return NextResponse.json({ franchise: null, games: [] });
    }

    // If we didn't get the games list from the game object, fetch franchise details
    if (franchiseGames.length === 0 && franchiseId) {
      console.log(`Fetching franchise details for ID: ${franchiseId}`);
      const franchiseQuery = `
        fields name, games;
        where id = ${franchiseId};
        limit 1;
      `;

      const franchiseResult = await queryIGDB("franchises", franchiseQuery);

      if (franchiseResult && franchiseResult.length > 0) {
        const franchise = franchiseResult[0];
        if (franchise.games && franchise.games.length > 0) {
          franchiseGames = franchise.games.filter(
            (id: number) => id !== Number(gameId)
          );
          console.log(
            `Found ${franchiseGames.length} other games in the franchise`
          );
        }
      }
    }

    // If we have no other games in the franchise
    if (franchiseGames.length === 0) {
      console.log(`No other games found in franchise for game ID: ${gameId}`);
      const emptyResponse = {
        franchise: franchiseId
          ? {
              id: franchiseId,
              name: franchiseName,
            }
          : null,
        games: [],
      };
      await cacheManager.set(cacheKey, emptyResponse);
      return NextResponse.json(emptyResponse);
    }

    // Get details for the franchise games (limit to 6)
    const gameIdsToFetch = franchiseGames.slice(0, 6);
    console.log(
      `Fetching details for ${gameIdsToFetch.length} franchise games`
    );

    const franchiseGamesQuery = `
      fields name, cover.url, first_release_date, total_rating, slug;
      where id = (${gameIdsToFetch.join(",")}) & cover != null;
      sort first_release_date asc;
      limit 6;
    `;

    const franchiseGamesData = await queryIGDB("games", franchiseGamesQuery);
    console.log(
      `Found ${franchiseGamesData.length} franchise games with details`
    );

    // Process the results to format URLs
    const processedGames = franchiseGamesData.map((franchiseGame: any) => ({
      ...franchiseGame,
      cover: franchiseGame.cover
        ? {
            ...franchiseGame.cover,
            url: franchiseGame.cover.url,
          }
        : null,
    }));

    const response = {
      franchise: {
        id: franchiseId,
        name: franchiseName,
      },
      games: processedGames,
    };

    // Cache the results
    await cacheManager.set(cacheKey, response);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error processing franchise games request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch franchise games" },
      { status: 500 }
    );
  }
}
