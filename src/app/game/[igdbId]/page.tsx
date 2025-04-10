import { Metadata } from "next";
import GamePageContent from "@/components/GamePageContent";
import { Game } from "@/types/game";

// Generate metadata for the page dynamically
export async function generateMetadata({
  params,
}: {
  params: { igdbId: string };
}): Promise<Metadata> {
  // Fetch game data
  const game = await getGameData(params.igdbId);

  // Return title and description
  return {
    title: game?.name || "Game Not Found",
    description: game?.summary || "View game details on GamePal",
  };
}

// Function to get the game data from IGDB
async function getGameData(igdbId: string): Promise<Game | null> {
  try {
    // Get the base URL for the API request
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const host = process.env.VERCEL_URL || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    // Use our dedicated cached game endpoint
    const response = await fetch(`${baseUrl}/api/game/${igdbId}`, {
      next: { revalidate: 3600 }, // Revalidate every hour at most
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch game data: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();

    // Return the game or null if no game was found
    return data.error ? null : data;
  } catch (error) {
    console.error("Error fetching game data:", error);
    return null;
  }
}

export default async function GamePage({
  params,
}: {
  params: { igdbId: string };
}) {
  const game = await getGameData(params.igdbId);

  return <GamePageContent initialGame={game} igdbId={params.igdbId} />;
}
