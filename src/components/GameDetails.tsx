"use client";

import { format, isPast, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  releaseDate?: number; // Unix timestamp
  genres?: Genre[];
  gameModes?: GameMode[];
  igdbId: number;
  url?: string;
  totalRating?: number;
  ratingCount?: number;
  franchise?: {
    id: number;
    name: string;
  };
  franchises?: {
    id: number;
    name: string;
  }[];
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
  releaseDate,
  genres,
  gameModes,
  igdbId,
  url,
  totalRating,
  ratingCount,
  franchise,
  franchises,
}: GameDetailsProps) {
  return (
    <div>
      {/* Rating display if available */}
      <RatingDisplay rating={totalRating} count={ratingCount} />

      {/* Platforms with badges */}
      {platforms && platforms.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Platforms
          </h3>
          <div className="flex flex-wrap gap-2">
            {platforms.map((platform) => (
              <Badge key={platform.id} variant="secondary">
                {platform.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Genres with badges */}
      {genres && genres.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Genres
          </h3>
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Badge key={genre.id} variant="secondary">
                {genre.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {developers && developers.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Developer
            </h3>
            <p>{developers.map((d) => d.name).join(", ")}</p>
          </div>
        )}

        {publishers && publishers.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Publisher
            </h3>
            <p>{publishers.map((p) => p.name).join(", ")}</p>
          </div>
        )}

        {franchise && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Franchise
            </h3>
            <p className="font-medium">
              <Link
                href={`/franchise/${franchise.id}`}
                className="hover:underline text-blue-600 dark:text-blue-400"
              >
                {franchise.name}
              </Link>
            </p>
          </div>
        )}

        {!franchise && franchises && franchises.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Franchises
            </h3>
            <p>
              {franchises.map((f, index) => (
                <span key={f.id}>
                  <Link
                    href={`/franchise/${f.id}`}
                    className="hover:underline text-blue-600 dark:text-blue-400"
                  >
                    {f.name}
                  </Link>
                  {index < franchises.length - 1 ? ", " : ""}
                </span>
              ))}
            </p>
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
      </div>

      <div className="mt-4 border-t pt-4 border-gray-200 dark:border-gray-700">
        <Button variant="outline" asChild>
          <Link href={url || ""} target="_blank" rel="noopener noreferrer">
            View on IGDB
            <IconExternalLink />
          </Link>
        </Button>
      </div>
    </div>
  );
}
