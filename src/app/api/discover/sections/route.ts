import { NextRequest, NextResponse } from "next/server";
import { getAllSectionsMeta } from "@/lib/igdb/discover";
import { cacheManager } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    // Get sections metadata
    const sections = await getAllSectionsMeta();

    // Get cache statistics
    const cacheStats = cacheManager.getStats();

    return NextResponse.json({
      status: "success",
      sections,
      cache: cacheStats,
    });
  } catch (error: any) {
    console.error("Error in discovery sections endpoint:", error);

    return NextResponse.json(
      {
        status: "error",
        message:
          error.message ||
          "An error occurred while fetching discovery sections",
      },
      { status: 500 }
    );
  }
}
