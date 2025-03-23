import { NextRequest, NextResponse } from "next/server";
import { getFeaturedGames } from "@/lib/igdb/discovery";

export async function GET(request: NextRequest) {
  try {
    // Get the limit from query parameters (default to 3)
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 3;

    // Get featured games
    const featured = await getFeaturedGames(limit);

    if (!featured) {
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to fetch featured games",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "success",
      ...featured,
    });
  } catch (error: any) {
    console.error("Error in discovery featured endpoint:", error);

    return NextResponse.json(
      {
        status: "error",
        message:
          error.message || "An error occurred while fetching featured games",
      },
      { status: 500 }
    );
  }
}
