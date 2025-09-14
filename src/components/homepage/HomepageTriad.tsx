import { Button } from "@/components/ui/button";
import { IconDeviceGamepad, IconTrophy, IconStar } from "@tabler/icons-react";

interface TriadFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  cta?: {
    text: string;
    href: string;
  };
}

const features: TriadFeature[] = [
  {
    icon: <IconDeviceGamepad size={48} stroke={1.5} />,
    title: "Track Your Library",
    description:
      "Build and manage your perfect game collection. Mark games as played, completed, or wishlist items to keep track of your gaming journey.",
    cta: {
      text: "Start Building",
      href: "/discover",
    },
  },
  {
    icon: <IconTrophy size={48} stroke={1.5} />,
    title: "Platinum Hunting",
    description:
      "Chase those platinum trophies and 100% completions. Track your progress and celebrate your achievements with fellow gamers.",
    cta: {
      text: "View Achievements",
      href: "#platinum",
    },
  },
  {
    icon: <IconStar size={48} stroke={1.5} />,
    title: "Discover & Rate",
    description:
      "Find your next favorite game with our discovery features. Rate games you've played and get personalized recommendations.",
    cta: {
      text: "Explore Games",
      href: "/discover",
    },
  },
];

export default function HomepageTriad() {
  return (
    <section className="col-span-full py-24 bg-muted/30" id="features">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Everything you need for your{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              gaming journey
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            GamePal provides all the tools you need to track, discover, and
            celebrate your gaming experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-background rounded-2xl p-8 shadow-lg border hover:shadow-xl transition-all duration-300 hover:border-primary/20"
            >
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {feature.cta && (
                  <Button
                    variant="outline"
                    className="rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    asChild
                  >
                    <a href={feature.cta.href}>{feature.cta.text}</a>
                  </Button>
                )}
              </div>

              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
