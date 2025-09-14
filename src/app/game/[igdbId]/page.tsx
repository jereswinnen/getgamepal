import { Metadata } from "next";
import GamePageContent from "@/components/GamePageContent";
import { Game } from "@/types/game";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

// Generate metadata for the page dynamically
export async function generateMetadata({
  params,
}: {
  params: Promise<{ igdbId: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  // Fetch game data
  const game = await getGameData(resolvedParams.igdbId);

  // Return title and description
  return {
    title: game?.name || "Game Not Found",
    description: game?.summary || "View game details on GamePal",
  };
}

// Function to check if the game is in the user's library
async function checkLibraryStatus(igdbId: string): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const supabase = createClient();

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if the game is in the user's library
    const { data, error } = await supabase
      .from("games")
      .select()
      .eq("user_id", user.id)
      .eq("igdb_id", parseInt(igdbId))
      .single();

    if (error) {
      console.error("Error checking library status:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking library status:", error);
    return false;
  }
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
  params: Promise<{ igdbId: string }>;
}) {
  const resolvedParams = await params;
  const [game, isInLibrary] = await Promise.all([
    getGameData(resolvedParams.igdbId),
    checkLibraryStatus(resolvedParams.igdbId),
  ]);

  return (
    <GamePageContent
      initialGame={game}
      igdbId={resolvedParams.igdbId}
      initialLibraryStatus={isInLibrary}
    />
  );
}
