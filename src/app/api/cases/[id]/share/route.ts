import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generatePublicId } from "@/lib/export";

export async function GET(
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
      select: {
        id: true,
        isPublic: true,
        publicId: true,
      },
    });

    if (!existingCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json({
      isPublic: existingCase.isPublic,
      publicId: existingCase.publicId,
    });
  } catch (error) {
    console.error("Error fetching share status:", error);
    return NextResponse.json(
      { error: "Failed to fetch share status" },
      { status: 500 }
    );
  }
}

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

    const newIsPublic = !existingCase.isPublic;
    const publicId = newIsPublic
      ? existingCase.publicId || generatePublicId()
      : existingCase.publicId;

    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        isPublic: newIsPublic,
        publicId,
      },
      select: {
        id: true,
        isPublic: true,
        publicId: true,
      },
    });

    return NextResponse.json(updatedCase);
  } catch (error) {
    console.error("Error toggling share status:", error);
    return NextResponse.json(
      { error: "Failed to toggle share status" },
      { status: 500 }
    );
  }
}
