"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import GameCover from "./GameCover";
import { format } from "date-fns";

interface Game {
  id: number;
  name: string;
  cover?: {
    url: string;
  };
  first_release_date?: number;
  total_rating?: number;
}

interface FranchiseGamesProps {
  gameId: number;
  franchiseId?: number; // Now optional since we'll get it from the API
}

// Function to format date
function formatDate(timestamp?: number) {
  if (!timestamp) return "TBA";
  return format(new Date(timestamp * 1000), "yyyy");
}

export default function FranchiseGames({ gameId }: FranchiseGamesProps) {
  const [franchiseGames, setFranchiseGames] = useState<Game[]>([]);
  const [franchiseName, setFranchiseName] = useState<string>("");
  const [franchiseId, setFranchiseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFranchiseGames = async () => {
      try {
        setLoading(true);
        console.log(`Fetching franchise games for game ID ${gameId}`);

        // Use the dedicated game-specific endpoint
        const response = await fetch(`/api/game/${gameId}/franchise-games`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Franchise games API error:", {
            status: response.status,
            statusText: response.statusText,
            data: errorData,
          });
          throw new Error(
            `Failed to fetch franchise games: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log(`Received franchise data:`, data);

        // Check if the API response has valid data
        if (!data || !data.franchise) {
          console.log("API response missing franchise data");
          setLoading(false);
          return;
        }

        // Set franchise information
        setFranchiseId(data.franchise.id);
        setFranchiseName(data.franchise.name || "");

        // Set games from the response
        if (data.games && data.games.length > 0) {
          console.log(`Setting ${data.games.length} franchise games`);
          setFranchiseGames(data.games);
        } else {
          console.log("No franchise games received");
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Error fetching franchise games:", err);
        setError(err.message || "Unable to load franchise games");
        setLoading(false);
      }
    };

    // Clear any existing data
    setFranchiseGames([]);
    setFranchiseName("");
    setFranchiseId(null);

    if (gameId) {
      fetchFranchiseGames();
    } else {
      console.log("No game ID provided");
      setLoading(false);
    }
  }, [gameId]);

  // Log state for debugging
  useEffect(() => {
    console.log("FranchiseGames component state:", {
      loading,
      error,
      franchiseId,
      gameId,
      franchiseGamesCount: franchiseGames.length,
      franchiseName,
    });
  }, [
    loading,
    error,
    franchiseId,
    gameId,
    franchiseGames.length,
    franchiseName,
  ]);

  if (loading) {
    return <FranchiseGamesSkeleton />;
  }

  if (error) {
    console.error("Franchise games error:", error);
    return null; // Don't show an error, just hide the section
  }

  if (!franchiseGames.length || !franchiseId) {
    console.log("No franchise games to display");
    return null; // Don't show anything if there are no franchise games
  }

  return (
    <div className="group grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {franchiseGames
        .sort((a, b) => {
          // If either game doesn't have a release date
          if (!a.first_release_date) return 1; // Place games without dates at the end
          if (!b.first_release_date) return -1;
          // Sort newest to oldest
          return b.first_release_date - a.first_release_date;
        })
        .slice(0, 6)
        .map((game) => (
          <Link
            key={game.id}
            href={`/game/${game.id}`}
            className="flex flex-col gap-2 transition-all duration-200 will-change-transform group-hover:opacity-70 hover:opacity-100 hover:scale-105"
          >
            <GameCover
              coverUrl={game.cover?.url}
              gameName={game.name}
              aspectRatio="3/4"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
              className="w-full"
            />
            <h3 className="font-medium text-sm truncate">{game.name}</h3>
          </Link>
        ))}
    </div>
  );
}

function FranchiseGamesSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-black/[.03] dark:bg-white/[.03] rounded-lg overflow-hidden h-full animate-pulse"
        >
          <div className="relative aspect-[3/4] bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-2"></div>
        </div>
      ))}
    </div>
  );
}
