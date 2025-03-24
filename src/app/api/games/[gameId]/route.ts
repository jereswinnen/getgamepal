import { NextRequest, NextResponse } from "next/server";
import { cacheManager } from "@/lib/cache";
import { queryIGDB } from "@/lib/igdb/client";

// Main handler for the API route
export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
    // Await params before using gameId
    const resolvedParams = await params;
    const gameId = resolvedParams.gameId;

    // Handle the case where gameId is not provided
    if (!gameId) {
      return NextResponse.json(
        { error: "Game ID is required" },
        { status: 400 }
      );
    }

    console.log(`Fetching game data for ID: ${gameId}`);

    // Create a cache key for this specific game
    const cacheKey = `game-detail-${gameId}`;

    // Check if we have a cached response
    const cachedData = await cacheManager.get(cacheKey);
    if (cachedData) {
      console.log(`Returning cached game data for ID: ${gameId}`);
      return NextResponse.json(cachedData);
    }

    // Define the query for IGDB API
    const query = `
      fields name, cover.url, summary, screenshots.url, videos.*, platforms.name, 
      involved_companies.company.name, involved_companies.developer, involved_companies.publisher, 
      first_release_date, genres.name, game_modes.name, url, total_rating, rating_count, similar_games;
      where id = ${gameId};
      limit 1;
    `;

    // Use the IGDB client to fetch data
    const gameResult = await queryIGDB("games", query, cacheKey);

    if (!gameResult || gameResult.length === 0) {
      console.log(`Game not found with ID: ${gameId}`);
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const game = gameResult[0];
    console.log(`Found game: ${game.name}`);

    // Process the game data if needed (e.g., fix URL formats)
    const processedGame = {
      ...game,
      // Ensure cover URL has proper format
      cover: game.cover
        ? {
            ...game.cover,
            url: game.cover.url,
          }
        : null,
      // Process screenshots if they exist
      screenshots: game.screenshots
        ? game.screenshots.map((screenshot: any) => ({
            ...screenshot,
            url: screenshot.url,
          }))
        : [],
    };

    // Cache the processed game data
    await cacheManager.set(cacheKey, processedGame);

    return NextResponse.json(processedGame);
  } catch (error: any) {
    console.error("Error processing game detail request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch game details" },
      { status: 500 }
    );
  }
}
