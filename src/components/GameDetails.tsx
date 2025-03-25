"use client";

import { format, isPast, formatDistanceToNow } from "date-fns";
import Link from "next/link";

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

// Badge component for visual elements like platforms and genres
function Badge({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-block bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full text-sm mr-2 mb-2 ${className}`}
    >
      {children}
    </span>
  );
}

// Rating component
function RatingDisplay({ rating, count }: { rating?: number; count?: number }) {
  if (!rating) return null;

  const ratingValue = Math.round(rating);

  // Determine color based on rating
  let colorClass = "text-green-600 dark:text-green-400";
  if (ratingValue < 50) {
    colorClass = "text-red-600 dark:text-red-400";
  } else if (ratingValue < 75) {
    colorClass = "text-yellow-600 dark:text-yellow-400";
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        <div className={`text-3xl font-bold ${colorClass}`}>{ratingValue}%</div>
        {count && count > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            from {count} {count === 1 ? "rating" : "ratings"}
          </span>
        )}
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
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
  // Format release date and check if it's in the future
  const formattedReleaseDate = releaseDate
    ? new Date(releaseDate * 1000)
    : undefined;

  const isReleased = formattedReleaseDate
    ? isPast(formattedReleaseDate)
    : false;

  const releaseDateDisplay = formattedReleaseDate
    ? isReleased
      ? format(formattedReleaseDate, "MMMM d, yyyy")
      : `${format(formattedReleaseDate, "MMMM d, yyyy")} (${formatDistanceToNow(
          formattedReleaseDate
        )} from now)`
    : "Unknown";

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
          <div className="flex flex-wrap">
            {platforms.map((platform) => (
              <Badge key={platform.id}>{platform.name}</Badge>
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
          <div className="flex flex-wrap">
            {genres.map((genre) => (
              <Badge key={genre.id}>{genre.name}</Badge>
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
                href={`/franchises/${franchise.id}`}
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
                    href={`/franchises/${f.id}`}
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

        {releaseDate && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Release Date
            </h3>
            <p
              className={
                !isReleased
                  ? "font-medium text-blue-600 dark:text-blue-400"
                  : ""
              }
            >
              {releaseDateDisplay}
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
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
        >
          <span>View on IGDB</span>
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
      </div>
    </div>
  );
}
