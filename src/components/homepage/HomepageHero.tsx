import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IconBrandApple } from "@tabler/icons-react";

export default function HomepageHero() {
  return (
    <section className="col-span-full relative min-h-screen flex items-center justify-center overflow-hidden">
      <Image
        src="/GamePalHeroiPhone@2x.png"
        alt="GamePal"
        width={1500}
        height={1125}
        className="max-w-8xl"
        quality={90}
        priority
      />
    </section>
  );
}
