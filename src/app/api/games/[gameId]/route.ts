import { NextRequest, NextResponse } from "next/server";
import { cacheManager } from "@/lib/cache";

// IGDB API credentials
const CLIENT_ID = process.env.IGDB_CLIENT_ID;
const CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;

let accessToken: string | null = null;
let tokenExpiry = 0;

// Get access token for IGDB API
async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&grant_type=client_credentials`,
      {
        method: "POST",
      }
    );

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000;
    return accessToken;
  } catch (error: any) {
    console.error(
      "Error getting access token:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}

// Function to fetch game data from IGDB
async function fetchGameData(body: string) {
  try {
    const token = await getAccessToken();

    if (!token || !CLIENT_ID) {
      throw new Error("IGDB credentials not available");
    }

    console.log("Making IGDB API request with body:", body);

    // Make the request to IGDB
    const response = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": CLIENT_ID,
        Authorization: `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(
        `IGDB API error: ${response.status} ${response.statusText}`,
        errorText
      );
      throw new Error(
        `IGDB API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Error fetching data from IGDB:", error);
    throw new Error(`Failed to fetch from IGDB: ${error.message}`);
  }
}

// Main handler for the API route
export async function GET(
  request: NextRequest,
  { params }: { params: { gameId: string } }
) {
  try {
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

    // Check if we have a cached response
    const cachedData = await cacheManager.get(cacheKey);
    if (cachedData) {
      console.log(`Returning cached game data for ID: ${gameId}`);
      return NextResponse.json(cachedData);
    }

    // Define the fields to fetch from IGDB
    const gameResult = await fetchGameData(`
      fields name, cover.url, summary, screenshots.url, videos.*, platforms.name, 
      involved_companies.company.name, involved_companies.developer, involved_companies.publisher, 
      first_release_date, genres.name, game_modes.name, url, total_rating, rating_count, similar_games;
      where id = ${gameId};
      limit 1;
    `);

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
