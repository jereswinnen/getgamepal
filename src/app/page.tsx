import Link from "next/link";

export default function Home() {
  return (
    <>
      <section className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-4xl font-bold mb-6">
          Your Ultimate Gaming Companion
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
            href="/games"
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] px-6 py-3 font-medium hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] transition-colors"
          >
            Browse Games
          </Link>
        </div>
      </section>

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
