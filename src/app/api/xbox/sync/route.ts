import { NextRequest, NextResponse } from "next/server";

const OPENXBL_API_KEY = process.env.OPENXBL_API_KEY;

interface OpenXBLTitle {
  titleId: string;
  name: string;
  displayImage?: string;
  devices?: string[];
  titleHistory?: {
    lastTimePlayed?: string;
  };
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

  const openxblHeaders = {
    "X-Authorization": OPENXBL_API_KEY,
    Accept: "application/json",
    "Accept-Language": "en-US",
  };

  try {
    // 1. Look up XUID by gamertag
    const searchResponse = await fetch(
      `https://xbl.io/api/v2/search/${encodeURIComponent(gamertag.trim())}`,
      { headers: openxblHeaders }
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
      { headers: openxblHeaders }
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

    // 3. Return Xbox game list (no IGDB matching — iOS app handles that)
    const games = titles.map((title) => ({
      name: title.name,
      xboxTitleId: title.titleId,
      imageUrl: title.displayImage,
      devices: title.devices,
      lastPlayed: title.titleHistory?.lastTimePlayed,
    }));

    return NextResponse.json({
      gamertag,
      xuid,
      games,
      total: games.length,
    });
  } catch (error) {
    console.error("Xbox sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync Xbox library" },
      { status: 500 }
    );
  }
}
