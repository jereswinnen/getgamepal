import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HomepageFeatureSectionProps {
  title: string;
  description: string;
  features?: string[];
  imageUrl: string;
  imageAlt: string;
  reverse?: boolean;
  cta?: {
    text: string;
    href: string;
    variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  };
  id?: string;
}

export default function HomepageFeatureSection({
  title,
  description,
  features,
  imageUrl,
  imageAlt,
  reverse = false,
  cta,
  id,
}: HomepageFeatureSectionProps) {
  return (
    <section className="col-span-full py-24" id={id}>
      <div className="container mx-auto px-6">
        <div
          className={cn(
            "grid lg:grid-cols-2 gap-16 items-center",
            reverse && "lg:grid-cols-2"
          )}
        >
          <div className={cn("space-y-8", reverse && "lg:order-2")}>
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
                {title}
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>

            {features && features.length > 0 && (
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            )}

            {cta && (
              <div className="pt-4">
                <Button
                  size="lg"
                  variant={cta.variant || "default"}
                  className="rounded-full px-8"
                  asChild
                >
                  <a href={cta.href}>{cta.text}</a>
                </Button>
              </div>
            )}
          </div>

          <div className={cn("relative", reverse && "lg:order-1")}>
            <div className="relative aspect-square lg:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10" />
              <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>

            <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-2xl opacity-20 blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-accent to-primary rounded-3xl opacity-10 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
