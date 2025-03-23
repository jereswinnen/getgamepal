import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getAllSectionsMeta, getSectionGames } from "@/lib/igdb/discovery";
import { GameResult, DiscoveryResponse } from "@/lib/igdb/types";

// Format a Unix timestamp to a readable date
function formatDate(timestamp?: number): string {
  if (!timestamp) return "TBA";
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Component to display a game card
function GameCard({ game }: { game: GameResult }) {
  const coverUrl = game.cover?.url
    ? game.cover.url.replace("t_thumb", "t_cover_big")
    : null;

  const platforms = game.platforms
    ?.slice(0, 3)
    .map((p) => p.abbreviation || p.name)
    .join(", ");

  return (
    <Link href={`/games/${game.id}`} className="block group">
      <div className="bg-black/[.03] dark:bg-white/[.03] rounded-lg overflow-hidden hover:shadow-md transition-shadow">
        <div className="relative aspect-[3/4] overflow-hidden bg-black/10 dark:bg-white/10">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={game.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-foreground/50">
              <div className="text-center p-4">
                <span className="block text-4xl mb-2">🎮</span>
                <span>No image</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg truncate">{game.name}</h3>
          <div className="text-sm opacity-80 flex justify-between">
            <span>{platforms || "Unknown platform"}</span>
            <span>{formatDate(game.first_release_date)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Component to display a section of games
function DiscoverySection({
  title,
  description,
  games,
}: {
  title: string;
  description?: string;
  games: GameResult[];
}) {
  return (
    <section className="mb-16">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        {description && <p className="text-foreground/70">{description}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}

// Main discovery page component
export default async function DiscoverPage() {
  // Get all section metadata
  const sections = await getAllSectionsMeta();

  // Fetch data for each section
  const sectionsData: (DiscoveryResponse | null)[] = await Promise.all(
    sections.map((section) => getSectionGames(section.id))
  );

  return (
    <div>
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-bold mb-6">Discover Games</h1>
        <p className="text-xl max-w-2xl mx-auto">
          Explore curated collections of games from different categories and
          find your next gaming adventure.
        </p>
      </div>

      {sectionsData.map((sectionData, index) => {
        if (!sectionData || !sectionData.games.length) return null;
        return (
          <DiscoverySection
            key={sectionData.section.id}
            title={sectionData.section.name}
            description={sectionData.section.description}
            games={sectionData.games.slice(0, 10)} // Limit to 10 games per section
          />
        );
      })}
    </div>
  );
}
