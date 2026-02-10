import { Metadata } from "next";
import { queryIGDB } from "@/lib/igdb/client";

interface EventResult {
  id: number;
  name: string;
  description?: string;
  event_logo?: { id: number; url: string };
  start_time?: number;
}

function formatImageUrl(url: string): string {
  return url
    .replace("//images", "https://images")
    .replace("t_thumb", "t_1080p");
}

async function getEventData(id: string): Promise<EventResult | null> {
  try {
    const results = await queryIGDB<EventResult[]>(
      "events",
      `fields name, description, event_logo.url, start_time;
       where id = ${id};
       limit 1;`,
      `sharing-event-meta-${id}`
    );
    return results?.[0] ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventData(id);

  const title = event?.name ?? "Event on GamePal";
  const description =
    event?.description ?? "Check out this gaming event on GamePal";
  const image = event?.event_logo?.url
    ? formatImageUrl(event.event_logo.url)
    : undefined;

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

export default async function EventSharingPage({
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
