import { NextRequest, NextResponse } from "next/server";
import { readDiscoverConfig } from "@/lib/discover-config";

export async function GET(request: NextRequest) {
  try {
    const config = await readDiscoverConfig();

    return NextResponse.json({
      status: "success",
      config,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message ?? "Internal error" },
      { status: 500 },
    );
  }
}
