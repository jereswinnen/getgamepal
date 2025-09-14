import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import GameCover from "@/components/GameCover";
import { format } from "date-fns";

// Define the Game type
interface Game {
  id: number;
  name: string;
  cover?: {
    url: string;
  };
  first_release_date?: number;
  genres?: {
    id: number;
    name: string;
  }[];
  total_rating?: number;
  slug?: string;
}

interface Franchise {
  id: number;
  name: string;
  slug: string;
  url?: string;
}

interface FranchiseData {
  franchise: Franchise;
  games: Game[];
}

// Function to format date
function formatDate(timestamp?: number) {
  if (!timestamp) return "TBA";
  return format(new Date(timestamp * 1000), "yyyy");
}

// Function to get the franchise data
async function getFranchiseData(
  franchiseId: string
): Promise<FranchiseData | null> {
  try {
    // Get the base URL for the API request
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
    const host = process.env.VERCEL_URL || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    // Use our dedicated franchise endpoint
    const response = await fetch(`${baseUrl}/api/franchise/${franchiseId}`, {
      next: { revalidate: 3600 }, // Revalidate every hour at most
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch franchise data: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();

    // Return the franchise or null if no franchise was found
    return data.error ? null : data;
  } catch (error) {
    console.error("Error fetching franchise data:", error);
    return null;
  }
}

// Generate metadata for the page dynamically
export async function generateMetadata({
  params,
}: {
  params: Promise<{ franchiseId: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  // Fetch franchise data
  const franchiseData = await getFranchiseData(resolvedParams.franchiseId);

  // Return title and description
  return {
    title: franchiseData
      ? `${franchiseData.franchise.name} Franchise`
      : "Franchise Not Found",
    description: franchiseData
      ? `Explore the ${franchiseData.franchise.name} franchise and its ${franchiseData.games.length} games`
      : "View franchise details on GamePal",
  };
}

export default async function FranchisePage({
  params,
}: {
  params: Promise<{ franchiseId: string }>;
}) {
  const resolvedParams = await params;
  const franchiseId = resolvedParams.franchiseId;

  const franchiseData = await getFranchiseData(franchiseId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {franchiseData ? (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {franchiseData.franchise.name} Franchise
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {franchiseData.games.length}{" "}
              {franchiseData.games.length === 1 ? "game" : "games"} in this
              franchise
            </p>
            {franchiseData.franchise.url && (
              <Button variant="outline" asChild>
                <a
                  href={franchiseData.franchise.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <span>View Franchise on IGDB</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>
              </Button>
            )}
          </div>

          {franchiseData.games.length === 0 ? (
            <div className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-xl shadow-sm text-center">
              <p>No games found in this franchise.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {franchiseData.games
                .sort((a, b) => {
                  // If either game doesn't have a release date
                  if (!a.first_release_date) return 1; // Place games without dates at the end
                  if (!b.first_release_date) return -1;
                  // Sort newest to oldest
                  return b.first_release_date - a.first_release_date;
                })
                .map((game) => (
                  <Link
                    key={game.id}
                    href={`/game/${game.id}`}
                    className="group"
                  >
                    <div className="bg-black/[.03] dark:bg-white/[.03] rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full">
                      <GameCover
                        coverUrl={game.cover?.url}
                        gameName={game.name}
                        aspectRatio="3/4"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                        className="w-full"
                      />
                      <div className="p-3">
                        <h3 className="font-medium text-sm truncate">
                          {game.name}
                        </h3>
                        <div className="flex justify-between items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>{formatDate(game.first_release_date)}</span>
                          {game.total_rating && (
                            <Badge
                              variant={
                                game.total_rating >= 75
                                  ? "default"
                                  : game.total_rating >= 50
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {Math.round(game.total_rating)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>
          )}

          <div className="mt-12">
            <Button variant="outline" asChild>
              <Link href="/games">Back to Games</Link>
            </Button>
          </div>
        </>
      ) : (
        <div className="max-w-4xl mx-auto text-center bg-white/90 dark:bg-gray-900/90 p-6 rounded-xl shadow-xl">
          <h1 className="text-3xl font-bold mb-4">Franchise Not Found</h1>
          <p className="mb-8">
            We couldn't find a franchise with the ID: {franchiseId}
          </p>
          <Button asChild>
            <Link href="/games">Back to Games</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
