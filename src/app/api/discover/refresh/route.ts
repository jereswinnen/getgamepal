import { NextRequest, NextResponse } from "next/server";
import { refreshAllSections, getLastRefreshTime } from "@/lib/igdb/discover";
import { cacheManager } from "@/lib/cache";

export async function POST(request: NextRequest) {
  try {
    // Check if API key is provided for security
    const apiKey = request.headers.get("x-api-key");
    const expectedApiKey = process.env.DISCOVERY_API_KEY;

    if (!apiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        {
          status: "error",
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // Refresh all sections
    const success = await refreshAllSections();

    if (!success) {
      return NextResponse.json(
        {
          status: "error",
          message: "Failed to refresh discovery sections",
        },
        { status: 500 }
      );
    }

    const lastRefresh = await getLastRefreshTime();
    const cacheStats = cacheManager.getStats();

    return NextResponse.json({
      status: "success",
      message: "Discovery sections refreshed successfully",
      lastRefresh,
      cacheStats,
    });
  } catch (error: any) {
    console.error("Error refreshing discovery sections:", error);

    return NextResponse.json(
      {
        status: "error",
        message:
          error.message ||
          "An error occurred while refreshing discovery sections",
      },
      { status: 500 }
    );
  }
}

// Also allow GET requests for checking last refresh time
export async function GET(request: NextRequest) {
  try {
    const lastRefresh = await getLastRefreshTime();
    const cacheStats = cacheManager.getStats();

    return NextResponse.json({
      status: "success",
      lastRefresh,
      cacheStats,
    });
  } catch (error: any) {
    console.error("Error getting refresh status:", error);

    return NextResponse.json(
      {
        status: "error",
        message:
          error.message || "An error occurred while getting refresh status",
      },
      { status: 500 }
    );
  }
}
