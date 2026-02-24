import Image from "next/image";
import { features } from "@/data/homepage";

export default function HomepageFeaturesGrid() {
  return (
    <section className="col-span-full py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <div
            key={feature.id}
            className="flex flex-col gap-3 rounded-3xl bg-muted/50 p-8"
          >
            <h3 className="text-xl tracking-tight text-muted-foreground">
              <b className="text-primary font-bold">{feature.title}. </b>
              {feature.description}
            </h3>
            {feature.imageUrl && (
              <div className="relative mt-4 aspect-video overflow-hidden rounded-2xl">
                <Image
                  src={feature.imageUrl}
                  alt={feature.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
