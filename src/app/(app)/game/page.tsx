import Link from "next/link";
import type { Metadata } from "next";
import GameCover from "@/components/GameCover";
import { getPopularGames } from "@/lib/games";

export const metadata: Metadata = {
  title: "Popular Games",
  description: "Explore the most popular games on GamePal",
};

// Define the Game type
interface Game {
  id: number;
  name: string;
  cover?: {
    id: number;
    url: string;
  };
}

export default async function GamesPage() {
  const games: Game[] = await getPopularGames();

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
                <GameCover coverUrl={game.cover?.url} gameName={game.name} />
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
