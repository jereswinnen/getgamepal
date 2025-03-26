"use client";

import Link from "next/link";
import GameCover from "@/components/GameCover";

interface Game {
  id: number;
  name: string;
  cover?: {
    id: number;
    url: string;
  };
  platforms?: {
    id: number;
    name: string;
  }[];
  first_release_date?: number;
}

interface GameSearchResultProps {
  game: Game;
}

export default function GameSearchResult({ game }: GameSearchResultProps) {
  // Format release date
  const releaseYear = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : null;

  // Format platforms
  const platformNames = game.platforms
    ? game.platforms
        .slice(0, 3)
        .map((p) => p.name)
        .join(", ") + (game.platforms.length > 3 ? "..." : "")
    : null;

  return (
    <Link
      href={`/game/${game.id}`}
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <div className="h-16 w-12 flex-shrink-0">
        <GameCover
          coverUrl={game.cover?.url}
          gameName={game.name}
          aspectRatio="3/4"
          sizes="48px"
          className="!rounded-lg"
        />
      </div>
      <div className="flex-grow min-w-0">
        <h3 className="font-medium text-sm md:text-base truncate">
          {game.name}
        </h3>
        <div className="flex flex-col sm:flex-row sm:gap-2 text-xs text-gray-500 dark:text-gray-400">
          {releaseYear && <span>{releaseYear}</span>}
          {platformNames && <span className="truncate">{platformNames}</span>}
        </div>
      </div>
    </Link>
  );
}
