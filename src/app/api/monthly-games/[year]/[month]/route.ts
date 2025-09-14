import { NextRequest, NextResponse } from "next/server";
import { getMonthForProvider } from "@/lib/monthly";
import type { ProviderId } from "@/lib/monthly/types";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ year: string; month: string }> }
) {
  try {
    const resolved = await context.params;
    const year = parseInt(resolved.year, 10);
    const month = parseInt(resolved.month, 10);

    if (
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      month < 1 ||
      month > 12
    ) {
      return NextResponse.json(
        { status: "error", message: "Invalid year or month" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider") as ProviderId | null;

    const data = await getMonthForProvider(year, month, provider ?? undefined);
    if (!data) {
      return NextResponse.json(
        { status: "not_found", message: "No monthly games for given period" },
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
