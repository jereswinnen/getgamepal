import Link from "next/link";
import Image from "next/image";

// Define the Game type
interface Game {
  id: number;
  name: string;
  cover?: {
    id: number;
    url: string;
  };
}

// Function to get popular games from IGDB
async function getPopularGames(): Promise<Game[]> {
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
      body: `fields name, cover.url;
       where rating > 80 & cover != null;
       sort rating desc;
       limit 12;`,
    });

    const data = await response.json();

    return data || [];
  } catch (error) {
    console.error("Error fetching popular games:", error);
    return [];
  }
}

export default async function GamesPage() {
  const games = await getPopularGames();

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Popular Games</h1>

      {games.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.id}`}
              className="block group"
            >
              <div className="bg-black/[.03] dark:bg-white/[.03] rounded-lg overflow-hidden shadow-md transition-transform group-hover:scale-105">
                {game.cover && (
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src={`https:${game.cover.url.replace(
                        "t_thumb",
                        "t_cover_big"
                      )}`}
                      alt={`${game.name} cover`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="font-semibold text-center truncate">
                    {game.name}
                  </h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl">No games found. Please try again later.</p>
        </div>
      )}
    </div>
  );
}
