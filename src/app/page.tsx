import HomepageHero from "@/components/homepage/HomepageHero";
import HomepageTriad from "@/components/homepage/HomepageTriad";
import HomepageFeatureSection from "@/components/homepage/HomepageFeatureSection";
import Header from "@/components/Header";

export default function Home() {
  return (
    <>
      <HomepageHero />

      <HomepageTriad />

      <HomepageFeatureSection
        id="platinum"
        title="Chase Every Trophy"
        description="Turn your gaming passion into achievement hunting. Track your progress towards platinum trophies, 100% completions, and rare achievements across all your favorite games."
        features={[
          "Track platinum trophy progress for PlayStation games",
          "Monitor achievement completion rates",
          "Set completion goals and deadlines",
          "Share your trophy showcase with friends",
        ]}
        imageUrl="/api/placeholder/600/400"
        imageAlt="Trophy hunting interface showing achievement progress"
        cta={{
          text: "Start Trophy Hunting",
          href: "/discover",
        }}
      />

      <HomepageFeatureSection
        id="support"
        title="Get Help When You Need It"
        description="Our support team and community are here to help you make the most of GamePal. From technical issues to feature requests, we've got you covered."
        features={[
          "24/7 community support forum",
          "Comprehensive help documentation",
          "Direct email support for premium users",
          "Regular feature updates based on feedback",
        ]}
        imageUrl="/api/placeholder/600/400"
        imageAlt="Support center with help documentation and community forum"
        reverse
        cta={{
          text: "Contact Support",
          href: "mailto:support@gamepal.app",
          variant: "outline",
        }}
      />

      <section className="col-span-full py-24 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Powered by IGDB
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            GamePal uses the Internet Game Database (IGDB) API to provide
            accurate and up-to-date information about thousands of games,
            ensuring you have access to the most comprehensive gaming database
            available.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.igdb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-background text-foreground border hover:bg-muted transition-colors"
            >
              Learn about IGDB
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
