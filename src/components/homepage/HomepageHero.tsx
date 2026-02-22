import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IconBrandApple, IconBrandThreads } from "@tabler/icons-react";
import { hero } from "@/data/homepage";

export default function HomepageHero() {
  return (
    <section className="col-span-full flex flex-col items-center text-center gap-8 py-16 md:py-24">
      <div className="flex flex-col items-center gap-4">
        <Image
          src={hero.appIconPath}
          alt="GamePal app icon"
          width={80}
          height={80}
        />
        <h1 className="text-6xl md:text-8xl font-black tracking-tight">
          {hero.title}
        </h1>
        <p className="text-2xl md:text-3xl text-muted-foreground">
          {hero.subtitle}
        </p>
      </div>

      <aside className="flex gap-2">
        <Button asChild>
          <Link
            href={hero.cta.appStore.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            <IconBrandApple size={16} />
            {hero.cta.appStore.label}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link
            href={hero.cta.threads.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            <IconBrandThreads size={16} />
            {hero.cta.threads.label}
          </Link>
        </Button>
      </aside>

      <Image
        src={hero.heroImagePath}
        alt="GamePal app screenshots"
        width={1200}
        height={800}
        quality={90}
        priority
        className="w-full max-w-5xl"
      />
    </section>
  );
}
