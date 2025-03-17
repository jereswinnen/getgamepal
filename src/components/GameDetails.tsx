"use client";

import { format, isPast, formatDistanceToNow } from "date-fns";

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
}

export default function GameDetails({
  platforms,
  developers,
  publishers,
  releaseDate,
  genres,
  gameModes,
  igdbId,
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

  // Helper function to render a list of items with commas
  const renderList = (items?: { id: number; name: string }[]) => {
    if (!items || items.length === 0) return "Unknown";
    return items.map((item) => item.name).join(", ");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {platforms && platforms.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Platforms
            </h3>
            <p>{renderList(platforms)}</p>
          </div>
        )}

        {developers && developers.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Developer
            </h3>
            <p>{renderList(developers)}</p>
          </div>
        )}

        {publishers && publishers.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Publisher
            </h3>
            <p>{renderList(publishers)}</p>
          </div>
        )}

        {releaseDate && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Release Date
            </h3>
            <p className={!isReleased ? "font-medium text-primary" : ""}>
              {releaseDateDisplay}
            </p>
          </div>
        )}

        {genres && genres.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Genres
            </h3>
            <p>{renderList(genres)}</p>
          </div>
        )}

        {gameModes && gameModes.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Game Modes
            </h3>
            <p>{renderList(gameModes)}</p>
          </div>
        )}
      </div>

      <div>
        <a
          href={`https://www.igdb.com/games/${igdbId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline inline-flex items-center gap-1"
        >
          View on IGDB
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
