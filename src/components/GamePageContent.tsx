"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import GameCover from "@/components/GameCover";
import GameScreenshots from "@/components/GameScreenshots";
import GameVideos from "@/components/GameVideos";
import GameDetails from "@/components/GameDetails";
import SimilarGames from "@/components/SimilarGames";
import FranchiseGames from "@/components/FranchiseGames";
import GameReleaseDate from "@/components/GameReleaseDate";
import SectionDivider from "@/components/SectionDivider";
import { useAuth } from "@/providers/AuthProvider";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Game } from "@/types/game";

interface GamePageContentProps {
  initialGame: Game | null;
  igdbId: string;
}

interface Company {
  id: number;
  company: {
    id: number;
    name: string;
  };
  developer: boolean;
  publisher: boolean;
}

export default function GamePageContent({
  initialGame,
  igdbId,
}: GamePageContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [game, setGame] = useState<Game | null>(initialGame);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToLibrary = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!game) return;

    setIsLoading(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.from("games").insert({
        user_id: user.id,
        igdb_id: game.id,
        title: game.name,
        platforms: game.platforms
          ?.map((p: { name: string }) => p.name)
          .join(", "),
        status: "Not Started",
        ownership_type: "Not Owned",
        genres: game.genres?.map((g: { name: string }) => g.name),
        igdb_cover_id: game.cover?.id.toString(),
        first_release_date: game.first_release_date
          ? new Date(game.first_release_date * 1000).toISOString()
          : null,
      });

      if (error) {
        if (error.code === "23505") {
          // Unique violation
          toast.error("This game is already in your library");
        } else {
          toast.error("Failed to add game to library");
          console.error("Error adding game to library:", error);
        }
      } else {
        toast.success("Game added to your library");
      }
    } catch (error) {
      console.error("Error adding game to library:", error);
      toast.error("Failed to add game to library");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {game ? (
        <div className="o-grid--inner">
          <aside>
            <div className="flex flex-col gap-4">
              <GameCover
                coverUrl={game.cover?.url}
                gameName={game.name}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <Button
                onClick={handleAddToLibrary}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Adding..." : "Add to Library"}
              </Button>
            </div>
          </aside>

          <main className="md:col-start-2 md:col-end-7 flex flex-col gap-9">
            {game.screenshots && game.screenshots.length > 0 ? (
              <GameScreenshots
                screenshots={game.screenshots}
                gameName={game.name}
              />
            ) : null}

            <header className="flex flex-col gap-1.5">
              <GameReleaseDate
                timestamp={game.first_release_date}
                className="text-sm text-gray-600 dark:text-gray-400"
              />
              <h1 className="text-3xl font-bold tracking-tight">{game.name}</h1>
              {game.summary && (
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  {game.summary}
                </p>
              )}
            </header>

            <SectionDivider label="Information" />

            <GameDetails
              platforms={game.platforms}
              developers={getDevelopers(game)}
              publishers={getPublishers(game)}
              genres={game.genres}
              gameModes={game.game_modes}
              igdbId={game.id}
              url={game.url}
              totalRating={game.total_rating}
              ratingCount={game.rating_count}
            />

            {game.videos && game.videos.length > 0 ? (
              <>
                <SectionDivider label="Videos" />
                <GameVideos videos={game.videos} />
              </>
            ) : null}

            {game.franchises && game.franchises.length > 0 ? (
              <>
                <SectionDivider label="Series" />
                <FranchiseGames gameId={game.id} />
              </>
            ) : null}

            {game.similar_games && game.similar_games.length > 0 ? (
              <>
                <SectionDivider label="Similar Games" />
                <SimilarGames gameId={game.id} />
              </>
            ) : null}
          </main>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto text-center bg-white/90 dark:bg-gray-900/90 p-6 rounded-xl shadow-xl">
          <h1 className="text-3xl font-bold mb-4">Game Not Found</h1>
          <p className="mb-8">We couldn't find a game with the ID: {igdbId}</p>
          <Button asChild>
            <Link href="/games">Back to Games</Link>
          </Button>
        </div>
      )}
    </>
  );
}

// Helper function to extract developers from involved companies
function getDevelopers(game: Game) {
  if (!game.involved_companies) return undefined;

  return game.involved_companies
    .filter((company: Company) => company.developer)
    .map((company: Company) => ({
      id: company.company.id,
      name: company.company.name,
    }));
}

// Helper function to extract publishers from involved companies
function getPublishers(game: Game) {
  if (!game.involved_companies) return undefined;

  return game.involved_companies
    .filter((company: Company) => company.publisher)
    .map((company: Company) => ({
      id: company.company.id,
      name: company.company.name,
    }));
}
