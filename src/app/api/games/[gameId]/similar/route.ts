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
    const gameResult = await fetchGameData(`
      fields similar_games, name, genres.name;
      where id = ${gameId};
      limit 1;
    `);

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

        similarGames = await fetchGameData(`
          fields name, cover.url, first_release_date, genres.name, total_rating;
          where genres = (${genreIds}) & id != ${gameId} & cover != null;
          sort total_rating desc;
          limit 6;
        `);
      } else {
        // If no genres, just get popular games
        console.log(`No genres found for ${game.name}, finding popular games`);
        similarGames = await fetchGameData(`
          fields name, cover.url, first_release_date, total_rating;
          where total_rating > 75 & cover != null & id != ${gameId};
          sort total_rating desc;
          limit 6;
        `);
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

    const similarGamesData = await fetchGameData(`
      fields name, cover.url, first_release_date, genres.name, total_rating;
      where id = (${similarGameIds.join(",")}) & cover != null;
      limit 6;
    `);

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
