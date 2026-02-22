export const hero = {
  title: "GamePal",
  subtitle: "Track Your Gaming.",
  appIconPath: "/branding.png",
  heroImagePath: "/GamePalHeroiPhone@2x.png",
  cta: {
    appStore: {
      label: "Download the App",
      href: "https://apple.co/4gUqHBR",
    },
    threads: {
      label: "Follow on Threads",
      href: "https://www.threads.net/@gamepalapp",
    },
  },
};

export interface Feature {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export const features: Feature[] = [
  {
    id: "collect",
    title: "Collect your games",
    description:
      "Build and manage your perfect game collection. Mark games as played, completed, or add them to your wishlist to keep track of your gaming journey.",
    imageUrl: "",
  },
  {
    id: "journal",
    title: "Journal",
    description:
      "Record your thoughts, memories, and experiences as you play. Keep a personal gaming diary that captures every memorable moment.",
    imageUrl: "",
  },
  {
    id: "live-activities",
    title: "Live Activities",
    description:
      "Stay updated on your gaming sessions with real-time Live Activities on your Lock Screen and Dynamic Island.",
    imageUrl: "",
  },
  {
    id: "widgets",
    title: "Widgets",
    description:
      "Glance at your gaming stats, recently played games, and upcoming releases right from your Home Screen.",
    imageUrl: "",
  },
  {
    id: "events",
    title: "Events",
    description:
      "Never miss a gaming event again. Track conferences, showcases, and community events all in one place.",
    imageUrl: "",
  },
  {
    id: "upcoming-releases",
    title: "Upcoming releases",
    description:
      "Keep an eye on the games you're looking forward to. Get notified when new titles are about to drop.",
    imageUrl: "",
  },
  {
    id: "shortcuts",
    title: "Shortcuts",
    description:
      "Automate your gaming workflow with Siri Shortcuts integration. Quick actions to log games, check stats, and more.",
    imageUrl: "",
  },
  {
    id: "tasks",
    title: "Tasks",
    description:
      "Set goals and track your progress with gaming tasks. Whether it's finishing a backlog or completing a challenge, stay on top of it all.",
    imageUrl: "",
  },
  {
    id: "discover",
    title: "Discover",
    description:
      "Find your next favourite game with personalised recommendations, curated lists, and trending titles across all platforms.",
    imageUrl: "",
  },
  {
    id: "monthly-games",
    title: "Monthly Games",
    description:
      "See which games are available this month on PlayStation Plus, Xbox Game Pass, and other subscription services.",
    imageUrl: "",
  },
];

export const platinum = {
  title: "GamePal Platinum",
  description:
    "Unlock the full GamePal experience with Platinum. Get access to premium features designed for the most dedicated gamers.",
  benefits: [
    "Unlimited game collections",
    "Advanced journal entries with media",
    "Widgets and Live Activities",
    "Priority access to new features",
    "Monthly Games calendar",
    "Shortcut actions",
  ],
  cta: {
    label: "Learn more in the app",
    href: "https://apple.co/4gUqHBR",
  },
};
