import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import GameCover from "@/components/GameCover";
import GameScreenshots from "@/components/GameScreenshots";
import GameVideos from "@/components/GameVideos";
import GameDetails from "@/components/GameDetails";
import SimilarGames from "@/components/SimilarGames";
import FranchiseGames from "@/components/FranchiseGames";
import GameReleaseDate from "@/components/GameReleaseDate";
import SectionDivider from "@/components/SectionDivider";

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
  franchise?: {
    id: number;
    name: string;
  };
  franchises?: {
    id: number;
    name: string;
  }[];
}

// Generate metadata for the page dynamically
export async function generateMetadata({
  params,
}: {
  params: { igdbId: string };
}): Promise<Metadata> {
  // Await params before using igdbId
  const resolvedParams = await params;

  // Fetch game data
  const game = await getGameData(resolvedParams.igdbId);

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
        <div className="o-grid--inner">
          <aside>
            <GameCover
              coverUrl={game.cover?.url}
              gameName={game.name}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </aside>

          <main className="md:col-start-2 md:col-end-7 flex flex-col gap-9">
            {game.screenshots && game.screenshots.length > 0 ? (
              <GameScreenshots
                screenshots={game.screenshots}
                gameName={game.name}
              />
            ) : null}

            <header className="flex flex-col gap-1.5">
              <GameReleaseDate
                timestamp={game.first_release_date}
                className="text-sm text-gray-600 dark:text-gray-400"
              />
              <h1 className="text-3xl font-bold tracking-tight">{game.name}</h1>
              {game.summary && (
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {game.summary}
                </p>
              )}
            </header>

            <SectionDivider label="Information" />

            <GameDetails
              platforms={game.platforms}
              developers={getDevelopers(game)}
              publishers={getPublishers(game)}
              genres={game.genres}
              gameModes={game.game_modes}
              igdbId={game.id}
              url={game.url}
              totalRating={game.total_rating}
              ratingCount={game.rating_count}
            />

            {game.videos && game.videos.length > 0 ? (
              <>
                <SectionDivider label="Videos" />
                <GameVideos videos={game.videos} />
              </>
            ) : null}

            {game.franchises && game.franchises.length > 0 ? (
              <>
                <SectionDivider label="Series" />
                <FranchiseGames gameId={game.id} />
              </>
            ) : null}

            {game.similar_games && game.similar_games.length > 0 ? (
              <>
                <SectionDivider label="Similar Games" />
                <SimilarGames gameId={game.id} />
              </>
            ) : null}
          </main>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto text-center bg-white/90 dark:bg-gray-900/90 p-6 rounded-xl shadow-xl">
          <h1 className="text-3xl font-bold mb-4">Game Not Found</h1>
          <p className="mb-8">We couldn't find a game with the ID: {igdbId}</p>
          <Button asChild>
            <Link href="/games">Back to Games</Link>
          </Button>
        </div>
      )}
    </>
  );
}
