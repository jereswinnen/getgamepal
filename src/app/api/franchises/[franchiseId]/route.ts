import { NextRequest, NextResponse } from "next/server";
import { cacheManager } from "@/lib/cache";
import { queryIGDB } from "@/lib/igdb/client";

// Main handler for the API route
export async function GET(
  request: NextRequest,
  { params }: { params: { franchiseId: string } }
) {
  try {
    // Await params before using franchiseId
    const resolvedParams = await params;
    const franchiseId = resolvedParams.franchiseId;

    // Handle the case where franchiseId is not provided
    if (!franchiseId) {
      return NextResponse.json(
        { error: "Franchise ID is required" },
        { status: 400 }
      );
    }

    console.log(`Fetching franchise data for ID: ${franchiseId}`);

    // Create a cache key for this specific franchise
    const cacheKey = `franchise-games-${franchiseId}`;

    // Check if we have a cached response
    const cachedData = await cacheManager.get(cacheKey);
    if (cachedData) {
      console.log(`Returning cached franchise data for ID: ${franchiseId}`);
      return NextResponse.json(cachedData);
    }

    // First, get the franchise details to get the name
    const franchiseQuery = `
      fields name, slug, games, url;
      where id = ${franchiseId};
      limit 1;
    `;

    const franchiseResult = await queryIGDB("franchises", franchiseQuery);

    if (!franchiseResult || franchiseResult.length === 0) {
      console.log(`Franchise not found with ID: ${franchiseId}`);
      return NextResponse.json(
        { error: "Franchise not found" },
        { status: 404 }
      );
    }

    const franchise = franchiseResult[0];
    console.log(
      `Found franchise: ${franchise.name}, games: ${
        franchise.games?.length || 0
      }`
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
      return NextResponse.json(emptyResponse);
    }

    // Get the games in the franchise
    const gamesQuery = `
      fields name, cover.url, first_release_date, genres.name, total_rating, slug;
      where id = (${franchise.games.join(",")}) & cover != null;
      sort first_release_date asc;
      limit 25;
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

    // Final response
    const response = {
      franchise: {
        id: Number(franchiseId),
        name: franchise.name,
        slug: franchise.slug,
        url: franchise.url,
      },
      games: processedGames,
    };

    // Cache the results
    await cacheManager.set(cacheKey, response);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error processing franchise request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch franchise data" },
      { status: 500 }
    );
  }
}
