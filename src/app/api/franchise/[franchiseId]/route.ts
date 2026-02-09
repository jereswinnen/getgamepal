import { NextRequest, NextResponse } from "next/server";
import { getFranchiseById } from "@/lib/franchises";

// Main handler for the API route
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ franchiseId: string }> }
) {
  try {
    // Await params before using franchiseId
    const params = await context.params;
    const franchiseId = params.franchiseId;

    // Handle the case where franchiseId is not provided
    if (!franchiseId) {
      return NextResponse.json(
        { error: "Franchise ID is required" },
        { status: 400 }
      );
    }

    const franchiseData = await getFranchiseById(franchiseId);

    if (!franchiseData) {
      return NextResponse.json(
        { error: "Franchise not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(franchiseData);
  } catch (error: any) {
    console.error("Error processing franchise request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch franchise data" },
      { status: 500 }
    );
  }
}
