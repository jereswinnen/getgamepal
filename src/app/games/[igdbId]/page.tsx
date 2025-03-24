import Link from "next/link";
import GameCover from "@/components/GameCover";
import GameScreenshots from "@/components/GameScreenshots";
import GameVideos from "@/components/GameVideos";
import GameDetails from "@/components/GameDetails";
import GameCoverBackground from "@/components/GameCoverBackground";
import SimilarGames from "@/components/SimilarGames";

// Define the Game type
interface Game {
  id: number;
  name: string;
  cover?: {
    id: number;
    url: string;
  };
  summary?: string;
  screenshots?: {
    id: number;
    url: string;
  }[];
  videos?: {
    id: number;
    video_id: string;
    name?: string;
  }[];
  platforms?: {
    id: number;
    name: string;
  }[];
  involved_companies?: {
    id: number;
    company: {
      id: number;
      name: string;
    };
    developer: boolean;
    publisher: boolean;
  }[];
  first_release_date?: number;
  genres?: {
    id: number;
    name: string;
  }[];
  game_modes?: {
    id: number;
    name: string;
  }[];
  url?: string;
  total_rating?: number;
  rating_count?: number;
  similar_games?: {
    id: number;
    name: string;
  }[];
}

// Function to get the game data from IGDB
async function getGameData(igdbId: string): Promise<Game | null> {
  try {
    // Get the base URL for the API request
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const host = process.env.VERCEL_URL || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    // Use our dedicated cached game endpoint
    const response = await fetch(`${baseUrl}/api/games/${igdbId}`, {
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

// Helper function to extract developers from involved companies
function getDevelopers(game: Game) {
  if (!game.involved_companies) return undefined;

  return game.involved_companies
    .filter((company) => company.developer)
    .map((company) => ({
      id: company.company.id,
      name: company.company.name,
    }));
}

// Helper function to extract publishers from involved companies
function getPublishers(game: Game) {
  if (!game.involved_companies) return undefined;

  return game.involved_companies
    .filter((company) => company.publisher)
    .map((company) => ({
      id: company.company.id,
      name: company.company.name,
    }));
}

export default async function GamePage({
  params,
}: {
  params: { igdbId: string };
}) {
  // Await params before using igdbId
  const resolvedParams = await params;
  const igdbId = resolvedParams.igdbId;

  const game = await getGameData(igdbId);

  return (
    <>
      {game ? (
        <>
          <GameCoverBackground
            coverUrl={game.cover?.url}
            gameName={game.name}
          />

          <div className="relative z-10 mx-auto">
            <div className="flex flex-col md:flex-row gap-8 mb-8">
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

                <GameDetails
                  platforms={game.platforms}
                  developers={getDevelopers(game)}
                  publishers={getPublishers(game)}
                  releaseDate={game.first_release_date}
                  genres={game.genres}
                  gameModes={game.game_modes}
                  igdbId={game.id}
                  url={game.url}
                  totalRating={game.total_rating}
                  ratingCount={game.rating_count}
                />
              </div>
            </div>

            {(game.screenshots && game.screenshots.length > 0) ||
            (game.videos && game.videos.length > 0) ? (
              <div className="space-y-8 mb-8">
                {game.screenshots && game.screenshots.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Screenshots</h2>
                    <GameScreenshots
                      screenshots={game.screenshots}
                      gameName={game.name}
                    />
                  </div>
                )}

                {game.videos && game.videos.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Videos</h2>
                    <GameVideos videos={game.videos} />
                  </div>
                )}
              </div>
            ) : null}

            {/* Similar Games Section */}
            <SimilarGames gameId={game.id} />

            <div className="mt-8">
              <Link
                href="/discover"
                className="rounded-full bg-foreground text-background px-6 py-3 font-medium hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors inline-block mr-4"
              >
                Discover Games
              </Link>
              <Link
                href="/games"
                className="rounded-full bg-black/5 dark:bg-white/10 px-6 py-3 font-medium hover:bg-black/10 dark:hover:bg-white/20 transition-colors inline-block"
              >
                All Games
              </Link>
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-4xl mx-auto text-center bg-white/90 dark:bg-gray-900/90 p-6 rounded-xl shadow-xl">
          <h1 className="text-3xl font-bold mb-4">Game Not Found</h1>
          <p className="mb-8">We couldn't find a game with the ID: {igdbId}</p>
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
