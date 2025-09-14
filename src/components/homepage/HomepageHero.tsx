import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IconBrandApple } from "@tabler/icons-react";

export default function HomepageHero() {
  return (
    <section className="col-span-full relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-accent/10">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />

      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left space-y-8">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Remember your{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                gaming memories
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
              GamePal helps you discover, track, and share your gaming
              experiences with a comprehensive database powered by IGDB.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                className="text-lg px-8 py-6 rounded-full"
                asChild
              >
                <Link
                  href="https://apps.apple.com/app/gamepal"
                  className="flex items-center gap-3"
                >
                  <IconBrandApple size={24} />
                  Download iOS App
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 rounded-full"
                asChild
              >
                <Link href="/discover">Discover Games</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-full blur-3xl" />
              <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-2xl">
                      🎮
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        Track Your Games
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Build your perfect library
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center text-2xl">
                      🏆
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        Achieve Platinum
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Unlock every trophy
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-2xl">
                      🌟
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Discover More</h3>
                      <p className="text-muted-foreground text-sm">
                        Find your next favorite
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
