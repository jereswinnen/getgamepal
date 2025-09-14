import { NextRequest, NextResponse } from "next/server";
import { getCurrentYearMonth, getMonthForProvider } from "@/lib/monthly";
import type { ProviderId } from "@/lib/monthly/types";

export async function GET(request: NextRequest) {
  try {
    const { year, month } = getCurrentYearMonth();
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider") as ProviderId | null;

    const data = await getMonthForProvider(year, month, provider ?? undefined);

    if (!data) {
      return NextResponse.json(
        { status: "not_found", message: "No monthly games for current month" },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: "success", ...data });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
