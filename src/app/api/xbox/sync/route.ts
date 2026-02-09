import { NextRequest, NextResponse } from "next/server";
import { queryIGDB } from "@/lib/igdb/client";
import type { GameResult } from "@/lib/igdb/types";

const OPENXBL_API_KEY = process.env.OPENXBL_API_KEY;

interface OpenXBLTitle {
  titleId: string;
  name: string;
  displayImage?: string;
  devices?: string[];
  titleHistory?: {
    lastTimePlayed?: string;
  };
  achievement?: {
    currentAchievements?: number;
    totalAchievements?: number;
    currentGamerscore?: number;
    totalGamerscore?: number;
    progressPercentage?: number;
  };
}

interface XboxSyncResult {
  xboxName: string;
  igdbMatch: GameResult | null;
}

export async function POST(request: NextRequest) {
  if (!OPENXBL_API_KEY) {
    return NextResponse.json(
      { error: "Xbox sync is not configured" },
      { status: 500 }
    );
  }

  const { gamertag } = await request.json();

  if (!gamertag || typeof gamertag !== "string") {
    return NextResponse.json(
      { error: "Gamertag is required" },
      { status: 400 }
    );
  }

  try {
    // 1. Look up XUID by gamertag
    const searchResponse = await fetch(
      `https://xbl.io/api/v2/search/${encodeURIComponent(gamertag.trim())}`,
      {
        headers: {
          "X-Authorization": OPENXBL_API_KEY,
          Accept: "application/json",
        },
      }
    );

    if (!searchResponse.ok) {
      const status = searchResponse.status;
      if (status === 404) {
        return NextResponse.json(
          { error: "Gamertag not found" },
          { status: 404 }
        );
      }
      if (status === 429) {
        return NextResponse.json(
          { error: "Rate limited. Please try again later." },
          { status: 429 }
        );
      }
      throw new Error(`OpenXBL search failed: ${status}`);
    }

    const searchData = await searchResponse.json();
    const xuid = searchData.people?.[0]?.xuid;

    if (!xuid) {
      return NextResponse.json(
        { error: "Gamertag not found" },
        { status: 404 }
      );
    }

    // 2. Fetch title history
    const titlesResponse = await fetch(
      `https://xbl.io/api/v2/player/titleHistory/${xuid}`,
      {
        headers: {
          "X-Authorization": OPENXBL_API_KEY,
          Accept: "application/json",
        },
      }
    );

    if (!titlesResponse.ok) {
      const errorBody = await titlesResponse.text();
      console.error(
        `OpenXBL title history failed: ${titlesResponse.status}`,
        errorBody
      );
      throw new Error(
        `OpenXBL title history failed: ${titlesResponse.status} - ${errorBody}`
      );
    }

    const titlesData = await titlesResponse.json();
    const titles: OpenXBLTitle[] = titlesData.titles ?? [];

    if (titles.length === 0) {
      return NextResponse.json({
        gamertag,
        games: [],
        matched: 0,
        total: 0,
      });
    }

    // 3. Match each Xbox title with IGDB
    // Xbox platform IDs in IGDB: 49 = Xbox One, 169 = Xbox Series X|S, 12 = Xbox 360
    const xboxPlatformIds = [12, 49, 169];
    const results: XboxSyncResult[] = [];

    // Process in batches to respect IGDB rate limits (4 req/sec)
    const BATCH_SIZE = 4;
    for (let i = 0; i < titles.length; i += BATCH_SIZE) {
      const batch = titles.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async (title) => {
          try {
            // Search IGDB by name, filtered to Xbox platforms
            const query = `search "${title.name.replace(/"/g, '\\"')}";
fields id,name,cover.url,platforms.name,platforms.id,first_release_date,release_dates.date,release_dates.platform.name,genres.name,genres.slug;
where platforms = (${xboxPlatformIds.join(",")});
limit 1;`;

            const matches = await queryIGDB<GameResult[]>("games", query);
            return {
              xboxName: title.name,
              igdbMatch: matches.length > 0 ? matches[0] : null,
            };
          } catch (error) {
            console.error(`IGDB match failed for "${title.name}":`, error);
            return {
              xboxName: title.name,
              igdbMatch: null,
            };
          }
        })
      );

      results.push(...batchResults);

      // Wait 1 second between batches to respect rate limit
      if (i + BATCH_SIZE < titles.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // 4. Return only matched games (with IGDB data)
    const matched = results.filter((r) => r.igdbMatch !== null);

    return NextResponse.json({
      gamertag,
      games: matched.map((r) => r.igdbMatch),
      matched: matched.length,
      total: titles.length,
      unmatched: results
        .filter((r) => r.igdbMatch === null)
        .map((r) => r.xboxName),
    });
  } catch (error) {
    console.error("Xbox sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync Xbox library" },
      { status: 500 }
    );
  }
}
