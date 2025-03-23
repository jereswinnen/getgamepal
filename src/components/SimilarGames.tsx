"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface Game {
  id: number;
  name: string;
  cover?: {
    url: string;
  };
  first_release_date?: number;
}

interface SimilarGamesProps {
  gameId: number;
}

function formatDate(timestamp?: number): string {
  if (!timestamp) return "TBA";
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

export default function SimilarGames({ gameId }: SimilarGamesProps) {
  const [similarGames, setSimilarGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarGames = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/v4/games", {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
          },
          body: `fields name, cover.url, first_release_date;
            where similar_games = ${gameId} & cover != null;
            limit 6;`,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch similar games");
        }

        const data = await response.json();
        setSimilarGames(data);
      } catch (err) {
        console.error("Error fetching similar games:", err);
        setError("Unable to load similar games");
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchSimilarGames();
    }
  }, [gameId]);

  if (loading) {
    return <SimilarGamesSkeleton />;
  }

  if (error || !similarGames.length) {
    return null; // Don't show anything if there are no similar games
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-6">Similar Games</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {similarGames.map((game) => (
          <Link key={game.id} href={`/games/${game.id}`} className="group">
            <div className="bg-black/[.03] dark:bg-white/[.03] rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full">
              <div className="relative aspect-[3/4] overflow-hidden bg-black/10 dark:bg-white/10">
                {game.cover?.url ? (
                  <Image
                    src={game.cover.url.replace("t_thumb", "t_cover_big")}
                    alt={game.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-foreground/50">
                    <span>No image</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm truncate">{game.name}</h3>
                <div className="text-xs opacity-70 mt-1">
                  {formatDate(game.first_release_date)}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SimilarGamesSkeleton() {
  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold mb-6">Similar Games</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-black/[.03] dark:bg-white/[.03] rounded-lg overflow-hidden h-full animate-pulse"
          >
            <div className="relative aspect-[3/4] bg-gray-200 dark:bg-gray-700"></div>
            <div className="p-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
