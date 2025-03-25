import { NextRequest, NextResponse } from "next/server";
import { getSectionGames } from "@/lib/igdb/discover";

export async function GET(
  request: NextRequest,
  { params }: { params: { section: string } }
) {
  try {
    const sectionId = params.section;

    if (!sectionId) {
      return NextResponse.json(
        {
          status: "error",
          message: "Section ID is required",
        },
        { status: 400 }
      );
    }

    const sectionData = await getSectionGames(sectionId);

    if (!sectionData) {
      return NextResponse.json(
        {
          status: "error",
          message: `Section '${sectionId}' not found or no games available`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "success",
      ...sectionData,
    });
  } catch (error: any) {
    console.error(
      `Error in discovery section/${params.section} endpoint:`,
      error
    );

    return NextResponse.json(
      {
        status: "error",
        message:
          error.message || "An error occurred while fetching section data",
      },
      { status: 500 }
    );
  }
}
