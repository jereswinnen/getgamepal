import { NextRequest, NextResponse } from "next/server";
import { cacheManager } from "@/lib/cache";
import { getCurrentYearMonth } from "@/lib/monthly";

const CACHE_KEY_PREFIX = "monthly-games";

function toPeriod(year: number, month: number): string {
  const m = String(month).padStart(2, "0");
  return `${year}-${m}`;
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const periodParam = url.searchParams.get("period");
    const yearParam = url.searchParams.get("year");
    const monthParam = url.searchParams.get("month");

    let period: string | null = null;

    if (periodParam) {
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(periodParam)) {
        return NextResponse.json(
          { status: "error", message: "Invalid period. Use YYYY-MM." },
          { status: 400 }
        );
      }
      period = periodParam;
    } else if (yearParam && monthParam) {
      const year = parseInt(yearParam, 10);
      const month = parseInt(monthParam, 10);
      if (
        !Number.isFinite(year) ||
        !Number.isFinite(month) ||
        month < 1 ||
        month > 12
      ) {
        return NextResponse.json(
          { status: "error", message: "Invalid year or month." },
          { status: 400 }
        );
      }
      period = toPeriod(year, month);
    } else {
      const { year, month } = getCurrentYearMonth();
      period = toPeriod(year, month);
    }

    const periodMapKey = `${CACHE_KEY_PREFIX}-period-map`;
    const monthKey = `${CACHE_KEY_PREFIX}-${period}`;

    await cacheManager.delete(periodMapKey);
    await cacheManager.delete(monthKey);

    return NextResponse.json({
      status: "success",
      cleared: [periodMapKey, monthKey],
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message ?? "Internal error" },
      { status: 500 }
    );
  }
}
