import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IconBrandApple, IconBrandThreads } from "@tabler/icons-react";

export default function HomepageHero() {
  return (
    <section className="col-span-full grid grid-cols-subgrid py-12 md:py-0 md:min-h-screen gap-18 md:gap-12 items-center justify-center">
      <section className="col-span-full md:col-span-3 flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-6xl font-black tracking-tight">GamePal</h1>
          <p className="text-2xl text-muted-foreground">
            The perfect sidekick for your gaming adventures, designed to elevate
            your gaming experience and help you keep track of your ever-growing
            collection.
          </p>
        </header>
        <aside className="flex gap-2">
          <Button>
            <Link
              href="https://apple.co/4gUqHBR"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <IconBrandApple size={16} />
              Download the App
            </Link>
          </Button>
          <Button variant="outline">
            <Link
              href="https://www.threads.net/@gamepalapp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <IconBrandThreads size={16} />
              Follow on Threads
            </Link>
          </Button>
        </aside>
      </section>
      <section className="col-span-full md:col-span-3">
        <Image
          src="/GamePalHeroiPhone@2x.png"
          alt="GamePal"
          width={800}
          height={1125}
          quality={90}
          priority
        />
      </section>
    </section>
  );
}
