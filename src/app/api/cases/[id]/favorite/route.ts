import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: caseId } = await params;

    const existingCase = await prisma.case.findUnique({
      where: {
        id: caseId,
        userId: session.user.id,
        deletedAt: null,
      },
    });

    if (!existingCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        isFavorite: !existingCase.isFavorite,
      },
      select: {
        id: true,
        isFavorite: true,
      },
    });

    return NextResponse.json(updatedCase);
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { error: "Failed to toggle favorite" },
      { status: 500 }
    );
  }
}
