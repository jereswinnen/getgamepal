import Link from "next/link";
import GameCover from "@/components/GameCover";

// Define the Game type
interface Game {
  id: number;
  name: string;
  cover?: {
    id: number;
    url: string;
  };
  summary?: string;
}

// Function to get the game data from IGDB
async function getGameData(igdbId: string): Promise<Game | null> {
  try {
    // Get the base URL for the API request
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const host = process.env.VERCEL_URL || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    // Make the request to our own API endpoint
    const response = await fetch(`${baseUrl}/api/v4/games`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: `fields name, cover.url, summary; where id = ${igdbId}; limit 1;`,
    });

    const data = await response.json();

    // Return the first game or null if no games were found
    return data[0] || null;
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

  return (
    <>
      {game ? (
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3">
              <GameCover
                coverUrl={game.cover?.url}
                gameName={game.name}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>

            <div className="w-full md:w-2/3">
              <h1 className="text-3xl font-bold mb-4">{game.name}</h1>

              {game.summary && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Summary</h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    {game.summary}
                  </p>
                </div>
              )}

              <div className="mt-8">
                <Link
                  href="/games"
                  className="rounded-full bg-foreground text-background px-6 py-3 font-medium hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors inline-block"
                >
                  Back to Games
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Game Not Found</h1>
          <p className="mb-8">
            We couldn't find a game with the ID: {params.igdbId}
          </p>
          <Link
            href="/games"
            className="rounded-full bg-foreground text-background px-6 py-3 font-medium hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors inline-block"
          >
            Back to Games
          </Link>
        </div>
      )}
    </>
  );
}
