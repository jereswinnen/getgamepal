import { NextRequest, NextResponse } from "next/server";
import { cacheManager } from "@/lib/cache";
import { getAllSectionsMeta } from "@/lib/igdb/discover";

export async function GET(request: NextRequest) {
  try {
    // Get all cache keys
    const keys = await cacheManager.keys();

    // Get section metadata
    const sections = await getAllSectionsMeta();

    // Get cache stats
    const cacheStats = cacheManager.getStats();

    return NextResponse.json({
      status: "success",
      cacheStats,
      cacheKeys: keys,
      sections,
    });
  } catch (error: any) {
    console.error("Error in debug endpoint:", error);

    return NextResponse.json(
      {
        status: "error",
        message: error.message || "An error occurred in debug endpoint",
      },
      { status: 500 }
    );
  }
}

// Endpoint to clear a specific cache key or all cache
export async function POST(request: NextRequest) {
  try {
    // Extract key from body
    const body = await request.json();
    const { key, clearAll = false } = body;

    if (clearAll) {
      await cacheManager.clear();
      return NextResponse.json({
        status: "success",
        message: "All cache cleared",
      });
    } else if (key) {
      await cacheManager.delete(key);
      return NextResponse.json({
        status: "success",
        message: `Cleared cache for key: ${key}`,
      });
    } else {
      return NextResponse.json(
        {
          status: "error",
          message: "Missing key parameter",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error clearing cache:", error);

    return NextResponse.json(
      {
        status: "error",
        message: error.message || "An error occurred while clearing cache",
      },
      { status: 500 }
    );
  }
}
