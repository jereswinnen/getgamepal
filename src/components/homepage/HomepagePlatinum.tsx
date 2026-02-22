import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconBrandApple } from "@tabler/icons-react";
import { platinum } from "@/data/homepage";

export default function HomepagePlatinum() {
  return (
    <section className="col-span-full grid grid-cols-subgrid gap-y-6 py-24">
      <header className="col-span-full md:col-span-3 flex flex-col gap-4">
        <h2 className="text-4xl font-black tracking-tight">
          {platinum.title}
        </h2>
        <p className="text-xl text-muted-foreground leading-relaxed">
          {platinum.description}
        </p>
      </header>

      <div className="col-span-full md:col-span-3 flex flex-col gap-6">
        <ul className="flex flex-col gap-3">
          {platinum.benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        <div>
          <Button asChild>
            <Link
              href={platinum.cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <IconBrandApple size={16} />
              {platinum.cta.label}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
