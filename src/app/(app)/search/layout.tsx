import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Games",
  description: "Search for your favorite games in the GamePal database",
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
