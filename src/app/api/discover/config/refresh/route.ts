import { NextRequest, NextResponse } from "next/server";
import { cacheManager } from "@/lib/cache";

const CACHE_KEY = "discover-config";

export async function POST(request: NextRequest) {
  try {
    await cacheManager.delete(CACHE_KEY);

    return NextResponse.json({
      status: "success",
      cleared: [CACHE_KEY],
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message ?? "Internal error" },
      { status: 500 },
    );
  }
}
