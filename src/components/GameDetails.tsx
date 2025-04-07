"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconExternalLink } from "@tabler/icons-react";

interface Company {
  id: number;
  name: string;
}

interface Platform {
  id: number;
  name: string;
}

interface Genre {
  id: number;
  name: string;
}

interface GameMode {
  id: number;
  name: string;
}

interface GameDetailsProps {
  platforms?: Platform[];
  developers?: Company[];
  publishers?: Company[];
  genres?: Genre[];
  gameModes?: GameMode[];
  igdbId: number;
  url?: string;
  totalRating?: number;
  ratingCount?: number;
}

// Rating component
function RatingDisplay({ rating, count }: { rating?: number; count?: number }) {
  if (!rating) return null;

  const ratingValue = Math.round(rating);

  return (
    <div className="mb-6">
      <div className="flex items-baseline gap-2">
        <span
          className={`text-2xl font-bold ${
            ratingValue < 50
              ? "text-red-600 dark:text-red-400"
              : ratingValue < 75
              ? "text-yellow-600 dark:text-yellow-400"
              : "text-green-600 dark:text-green-400"
          }`}
        >
          {ratingValue}%
        </span>
        {count && count > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            from {count} {count === 1 ? "rating" : "ratings"}
          </span>
        )}
      </div>
      <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full mt-2">
        <div
          className={`h-2 rounded-full ${
            ratingValue < 50
              ? "bg-red-600 dark:bg-red-400"
              : ratingValue < 75
              ? "bg-yellow-600 dark:bg-yellow-400"
              : "bg-green-600 dark:bg-green-400"
          }`}
          style={{ width: `${ratingValue}%` }}
        ></div>
      </div>
    </div>
  );
}

export default function GameDetails({
  platforms,
  developers,
  publishers,
  genres,
  gameModes,
  igdbId,
  url,
  totalRating,
  ratingCount,
}: GameDetailsProps) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <RatingDisplay rating={totalRating} count={ratingCount} />

      {platforms && platforms.length > 0 && (
        <div className="text-sm flex flex-col gap-1">
          <h3 className="text-gray-500 dark:text-gray-400">Platforms</h3>
          <p>{platforms.map((p) => p.name).join(", ")}</p>
        </div>
      )}

      {genres && genres.length > 0 && (
        <div className="text-sm flex flex-col gap-1">
          <h3 className="text-gray-500 dark:text-gray-400">Genres</h3>
          <p>{genres.map((g) => g.name).join(", ")}</p>
        </div>
      )}

      {developers && developers.length > 0 && (
        <div className="text-sm flex flex-col gap-1">
          <h3 className="text-gray-500 dark:text-gray-400">Developer</h3>
          <p>{developers.map((d) => d.name).join(", ")}</p>
        </div>
      )}

      {publishers && publishers.length > 0 && (
        <div className="text-sm flex flex-col gap-1">
          <h3 className="text-gray-500 dark:text-gray-400">Publisher</h3>
          <p>{publishers.map((p) => p.name).join(", ")}</p>
        </div>
      )}

      {gameModes && gameModes.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Game Modes
          </h3>
          <p>{gameModes.map((m) => m.name).join(", ")}</p>
        </div>
      )}

      {/* <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
        <Button variant="outline" asChild>
          <Link href={url || ""} target="_blank" rel="noopener noreferrer">
            View on IGDB
            <IconExternalLink />
          </Link>
        </Button>
      </div> */}
    </div>
  );
}
