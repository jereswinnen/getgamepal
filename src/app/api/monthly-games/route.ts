import { NextRequest, NextResponse } from "next/server";
import { readPeriodMap } from "@/lib/monthly";

export async function GET(request: NextRequest) {
  try {
    const months = await readPeriodMap();

    return NextResponse.json({
      status: "success",
      months,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message ?? "Internal error" },
      { status: 500 },
    );
  }
}
