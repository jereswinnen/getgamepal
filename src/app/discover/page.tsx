import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getAllSectionsMeta, getSectionGames } from "@/lib/igdb/discover";
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

// Format platform list
function formatPlatforms(
  platforms?: { name?: string; abbreviation?: string }[]
): string {
  if (!platforms || platforms.length === 0) return "Unknown platform";
  return platforms
    .slice(0, 3)
    .map((p) => p.abbreviation || p.name)
    .filter(Boolean)
    .join(", ");
}

// Format rating
function formatRating(rating?: number): string {
  if (!rating) return "";
  return `${Math.round(rating)}%`;
}

// Component to display a game card
function GameCard({ game }: { game: GameResult }) {
  const coverUrl = game.cover?.url
    ? game.cover.url.replace("t_thumb", "t_cover_big")
    : null;

  const platforms = formatPlatforms(game.platforms);
  const rating = formatRating(game.total_rating);

  return (
    <Link href={`/games/${game.id}`} className="block group">
      <div className="bg-black/[.03] dark:bg-white/[.03] rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full">
        <div className="relative aspect-[3/4] overflow-hidden bg-black/10 dark:bg-white/10">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={game.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
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
          {rating && (
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-md text-sm font-medium">
              {rating}
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg truncate">{game.name}</h3>
          <div className="text-sm opacity-80 flex justify-between mt-1">
            <div className="truncate max-w-[60%]">{platforms}</div>
            <div className="shrink-0">
              {formatDate(game.first_release_date)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Section header component
function SectionHeader({
  title,
  description,
  count = 0,
}: {
  title: string;
  description?: string;
  count?: number;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <span className="text-sm opacity-60">{count} games</span>
      </div>
      {description && <p className="text-foreground/70 mt-1">{description}</p>}
    </div>
  );
}

// Games grid component that displays either all games or a limited number
function GamesGrid({ games }: { games: GameResult[] }) {
  // Show all games, not limiting to 5
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}

// Discovery section component
function DiscoverySection({
  title,
  description,
  games,
  count = 0,
}: {
  title: string;
  description?: string;
  games: GameResult[];
  count?: number;
}) {
  return (
    <section className="mb-16">
      <SectionHeader title={title} description={description} count={count} />
      <GamesGrid games={games} />
    </section>
  );
}

// Main discovery page component
export default async function DiscoverPage() {
  // Get all section metadata
  const sections = await getAllSectionsMeta();

  // Fetch data for each section
  const sectionsData = await Promise.all(
    sections.map((section) => getSectionGames(section.id))
  );

  // Filter out sections with no games
  const validSectionsData = sectionsData.filter(
    (sectionData): sectionData is DiscoveryResponse =>
      !!sectionData && sectionData.games.length > 0
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

      {validSectionsData.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl">
            We're currently refreshing our game data. Please check back shortly.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="px-6 py-3 bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      ) : (
        validSectionsData.map((sectionData) => (
          <DiscoverySection
            key={sectionData.section.id}
            title={sectionData.section.name}
            description={sectionData.section.description}
            count={sectionData.section.count}
            games={sectionData.games}
          />
        ))
      )}
    </div>
  );
}
