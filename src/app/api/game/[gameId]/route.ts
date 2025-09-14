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

    console.log(`Fetching game data for ID: ${gameId}`);

    // Create a cache key for this specific game
    const cacheKey = `game-detail-${gameId}`;
    const franchiseGamesCacheKey = `game-franchise-games-${gameId}`;
    const similarGamesCacheKey = `similar-games-${gameId}`;

    // Check if we have a cached response
    const cachedData = await cacheManager.get(cacheKey);
    if (cachedData) {
      console.log(`Returning cached game data for ID: ${gameId}`);

      // Background refresh of related data if needed
      setTimeout(async () => {
        try {
          // Check if we need to refresh franchise games cache
          const hasFranchiseCache = await cacheManager.get(
            franchiseGamesCacheKey
          );
          if (
            !hasFranchiseCache &&
            ((cachedData as any).franchise ||
              ((cachedData as any).franchises &&
                (cachedData as any).franchises.length > 0))
          ) {
            console.log(
              `Background refresh of franchise games for game ID: ${gameId}`
            );
            await fetch(
              `${request.nextUrl.origin}/api/game/${gameId}/franchise-games`
            );
          }

          // Check if we need to refresh similar games cache
          const hasSimilarCache = await cacheManager.get(similarGamesCacheKey);
          if (!hasSimilarCache) {
            console.log(
              `Background refresh of similar games for game ID: ${gameId}`
            );
            await fetch(
              `${request.nextUrl.origin}/api/game/${gameId}/similar-games`
            );
          }
        } catch (err) {
          console.error("Error in background refresh:", err);
        }
      }, 0);

      return NextResponse.json(cachedData);
    }

    // Define the query for IGDB API
    const query = `
      fields name, cover.url, summary, screenshots.url, videos.*, platforms.name, 
      involved_companies.company.name, involved_companies.developer, involved_companies.publisher, 
      first_release_date, genres.name, game_modes.name, url, total_rating, rating_count, similar_games,
      franchise.name, franchise.id, franchises.name, franchises.id;
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

    // Log franchise data for debugging
    if (game.franchise) {
      console.log(
        `Game has main franchise: ${game.franchise.name} (ID: ${game.franchise.id})`
      );
    } else if (game.franchises && game.franchises.length > 0) {
      console.log(
        `Game has ${game.franchises.length} franchises: ${game.franchises
          .map((f: any) => f.name)
          .join(", ")}`
      );
    } else {
      console.log(`Game has no franchise information`);
    }

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
      // Ensure franchise data is properly structured
      franchise: game.franchise
        ? {
            id: game.franchise.id,
            name: game.franchise.name,
          }
        : null,
      // Ensure franchises data is properly structured
      franchises: game.franchises
        ? game.franchises.map((franchise: any) => ({
            id: franchise.id,
            name: franchise.name,
          }))
        : [],
    };

    // Cache the processed game data
    await cacheManager.set(cacheKey, processedGame);

    // Pre-fetch and cache related data asynchronously
    setTimeout(async () => {
      try {
        // Pre-fetch franchise games if applicable
        if (game.franchise || (game.franchises && game.franchises.length > 0)) {
          console.log(`Pre-fetching franchise games for game ID: ${gameId}`);
          await fetch(
            `${request.nextUrl.origin}/api/game/${gameId}/franchise-games`
          );
        }

        // Pre-fetch similar games
        console.log(`Pre-fetching similar games for game ID: ${gameId}`);
        await fetch(
          `${request.nextUrl.origin}/api/game/${gameId}/similar-games`
        );
      } catch (err) {
        console.error("Error pre-fetching related game data:", err);
      }
    }, 0);

    return NextResponse.json(processedGame);
  } catch (error: any) {
    console.error("Error processing game detail request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch game details" },
      { status: 500 }
    );
  }
}
