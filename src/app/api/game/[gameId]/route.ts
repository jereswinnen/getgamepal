import { NextRequest, NextResponse } from "next/server";
import { cacheManager } from "@/lib/cache";
import { getGameById } from "@/lib/games";

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

    const processedGame = await getGameById(gameId);

    if (!processedGame) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Pre-fetch and cache related data asynchronously (cache-warming for subsequent client requests)
    const franchiseGamesCacheKey = `game-franchise-games-${gameId}`;
    const similarGamesCacheKey = `similar-games-${gameId}`;

    setTimeout(async () => {
      try {
        const hasFranchiseCache = await cacheManager.get(
          franchiseGamesCacheKey
        );
        if (
          !hasFranchiseCache &&
          ((processedGame as any).franchise ||
            ((processedGame as any).franchises &&
              (processedGame as any).franchises.length > 0))
        ) {
          console.log(
            `Pre-fetching franchise games for game ID: ${gameId}`
          );
          await fetch(
            `${request.nextUrl.origin}/api/game/${gameId}/franchise-games`
          );
        }

        const hasSimilarCache = await cacheManager.get(similarGamesCacheKey);
        if (!hasSimilarCache) {
          console.log(
            `Pre-fetching similar games for game ID: ${gameId}`
          );
          await fetch(
            `${request.nextUrl.origin}/api/game/${gameId}/similar-games`
          );
        }
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
