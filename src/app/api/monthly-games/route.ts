import { NextRequest, NextResponse } from "next/server";
import { getCurrentYearMonth, getMonthForProvider } from "@/lib/monthly";
import type { ProviderId } from "@/lib/monthly/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider") as ProviderId | null;
    const monthsBack = parseInt(searchParams.get("months") ?? "12", 10);

    const { year, month } = getCurrentYearMonth();

    // Build list of months to fetch
    const monthsToFetch: { year: number; month: number; period: string }[] = [];
    for (let i = 0; i < monthsBack; i++) {
      let targetMonth = month - i;
      let targetYear = year;

      while (targetMonth < 1) {
        targetMonth += 12;
        targetYear -= 1;
      }

      monthsToFetch.push({
        year: targetYear,
        month: targetMonth,
        period: `${targetYear}-${String(targetMonth).padStart(2, "0")}`,
      });
    }

    // Fetch all months in parallel
    const results = await Promise.all(
      monthsToFetch.map(async ({ year, month, period }) => {
        const data = await getMonthForProvider(
          year,
          month,
          provider ?? undefined,
        );
        return { period, entries: data?.entries ?? [] };
      }),
    );

    // Build response object with only non-empty months
    const months: Record<string, any[]> = {};
    for (const { period, entries } of results) {
      if (entries.length > 0) {
        months[period] = entries;
      }
    }

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
