import Link from "next/link";
import Image from "next/image";
import { getFeaturedGames } from "@/lib/igdb/discover";
import { GameResult } from "@/lib/igdb/types";

// Component to display a featured game
function FeaturedGame({ game }: { game: GameResult }) {
  const coverUrl = game.cover?.url
    ? game.cover.url.replace("t_thumb", "t_cover_big")
    : null;

  return (
    <Link href={`/games/${game.id}`} className="block group">
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-black/10 dark:bg-white/10">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={game.name}
            fill
            sizes="(max-width: 768px) 100vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground/50">
            <div className="text-center p-4">
              <span className="block text-4xl mb-2">🎮</span>
              <span>{game.name}</span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <h3 className="text-white font-semibold text-lg">{game.name}</h3>
        </div>
      </div>
    </Link>
  );
}

export default async function Home() {
  // Get featured games for preview
  const featured = await getFeaturedGames(5);

  // Get a random section to showcase
  const showcaseSection =
    featured?.sections && featured.sections.length > 0
      ? featured.sections[Math.floor(Math.random() * featured.sections.length)]
      : null;

  // Get games for the showcase section
  const showcaseGames =
    showcaseSection && featured?.featured[showcaseSection.id]
      ? featured.featured[showcaseSection.id].slice(0, 5)
      : [];

  return (
    <>
      <section className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-bold mb-6">
          Remember your gaming memories
        </h2>
        <p className="text-xl mb-8">
          GamePal helps you discover, track, and share your gaming experiences
          with a comprehensive database powered by IGDB.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="https://apps.apple.com/app/gamepal"
            className="rounded-full bg-foreground text-background px-6 py-3 font-medium hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors"
          >
            Download iOS App
          </Link>
          <Link
            href="/discover"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] px-6 py-3 font-medium hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors"
          >
            Discover Games
          </Link>
        </div>
      </section>

      {showcaseSection && showcaseGames.length > 0 && (
        <section className="mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{showcaseSection.name}</h2>
            <Link href="/discover" className="text-foreground hover:underline">
              View All Categories →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {showcaseGames.map((game) => (
              <FeaturedGame key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}

      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-black/[.03] dark:bg-white/[.03] p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Discover Games</h3>
          <p>
            Find new games based on your preferences and get personalized
            recommendations.
          </p>
        </div>
        <div className="bg-black/[.03] dark:bg-white/[.03] p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Track Your Collection</h3>
          <p>
            Keep track of games you own, want to play, or have completed across
            all platforms.
          </p>
        </div>
        <div className="bg-black/[.03] dark:bg-white/[.03] p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Connect with Gamers</h3>
          <p>
            Share your gaming activity and connect with friends who share your
            gaming interests.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Powered by IGDB</h2>
        <p className="text-center mb-8">
          GamePal uses the IGDB API to provide accurate and up-to-date
          information about thousands of games.
        </p>
      </section>
    </>
  );
}
