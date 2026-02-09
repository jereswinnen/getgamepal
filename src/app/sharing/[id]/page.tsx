import { Metadata } from "next";
import { queryIGDB } from "@/lib/igdb/client";
import { GameResult } from "@/lib/igdb/types";

function formatImageUrl(url: string): string {
  return url
    .replace("//images", "https://images")
    .replace("t_thumb", "t_1080p");
}

async function getGameData(id: string): Promise<GameResult | null> {
  try {
    const results = await queryIGDB<GameResult[]>(
      "games",
      `fields name, summary, artworks.url, screenshots.url, cover.url;
       where id = ${id};
       limit 1;`,
      `sharing-meta-${id}`
    );
    return results?.[0] ?? null;
  } catch {
    return null;
  }
}

function getImageUrl(game: GameResult): string | undefined {
  const raw =
    game.artworks?.[0]?.url ??
    game.screenshots?.[0]?.url ??
    game.cover?.url;
  return raw ? formatImageUrl(raw) : undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const game = await getGameData(id);

  const title = game?.name ?? "Game on GamePal";
  const description =
    game?.summary ?? "Check out this game on GamePal";
  const image = game ? getImageUrl(game) : undefined;

  return {
    title,
    description,
    openGraph: {
      siteName: "GamePal",
      title,
      description,
      ...(image && { images: [{ url: image }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

const APP_STORE_URL = "https://apps.apple.com/us/app/gamepal/id6563138879";

export default async function SharingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Render a real page so crawlers see the OG meta tags. Facebook's crawler
  // follows both server-side redirects AND meta refresh, but does not execute
  // JavaScript — so a JS redirect is the only way to keep crawlers on this page.
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.location.replace("${APP_STORE_URL}")`,
      }}
    />
  );
}
