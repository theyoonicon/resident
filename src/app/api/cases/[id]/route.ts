import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

    const caseData = await prisma.case.findUnique({
      where: {
        id: caseId,
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        images: {
          orderBy: { order: "asc" },
        },
        caseFolder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json(caseData);
  } catch (error) {
    console.error("Error fetching case:", error);
    return NextResponse.json(
      { error: "Failed to fetch case" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: caseId } = await params;
    const body = await request.json();

    // Verify case exists and belongs to user
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

    const {
      title,
      department,
      caseType,
      date,
      ageGroup,
      gender,
      chiefComplaint,
      history,
      examination,
      diagnosis,
      treatment,
      outcome,
      summary,
      learningPoints,
      references,
      personalNotes,
      rawContent,
      aiSummary,
      departmentData,
      templateVersion,
      caseFolderId,
      tags,
      deletedImageIds,
      newImages,
    } = body;

    // Update the case
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        title,
        department,
        caseType,
        date: date ? new Date(date) : undefined,
        ageGroup,
        gender,
        chiefComplaint,
        history,
        examination,
        diagnosis,
        treatment,
        outcome,
        summary,
        learningPoints,
        references,
        personalNotes,
        rawContent,
        aiSummary,
        departmentData,
        templateVersion,
        caseFolderId: caseFolderId === null ? null : caseFolderId || undefined,
      },
    });

    // Handle tags update
    if (tags !== undefined && Array.isArray(tags)) {
      // Delete existing tag relations
      await prisma.caseTagRelation.deleteMany({
        where: { caseId },
      });

      // Create new tag relations
      for (const tagName of tags) {
        // Upsert tag
        const tag = await prisma.caseTag.upsert({
          where: { name: tagName },
          update: {},
          create: {
            name: tagName,
            color: generateTagColor(),
          },
        });

        // Create tag relation
        await prisma.caseTagRelation.create({
          data: {
            caseId,
            tagId: tag.id,
          },
        });
      }
    }

    // Handle deleted images
    if (deletedImageIds && Array.isArray(deletedImageIds) && deletedImageIds.length > 0) {
      await prisma.caseImage.deleteMany({
        where: {
          id: { in: deletedImageIds },
          caseId,
        },
      });
    }

    // Handle new images
    if (newImages && Array.isArray(newImages) && newImages.length > 0) {
      // Get current max order
      const existingImages = await prisma.caseImage.findMany({
        where: { caseId },
        orderBy: { order: "desc" },
        take: 1,
      });

      const startOrder = existingImages.length > 0 ? existingImages[0].order + 1 : 0;

      for (let i = 0; i < newImages.length; i++) {
        const image = newImages[i];
        await prisma.caseImage.create({
          data: {
            caseId,
            url: image.url,
            caption: image.caption || null,
            order: image.order ?? (startOrder + i),
          },
        });
      }
    }

    // Fetch the complete updated case
    const completeCase = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        images: {
          orderBy: { order: "asc" },
        },
        caseFolder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json(completeCase);
  } catch (error) {
    console.error("Error updating case:", error);
    return NextResponse.json(
      { error: "Failed to update case" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: caseId } = await params;

    // Verify case exists and belongs to user
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

    // Soft delete by setting deletedAt
    await prisma.case.update({
      where: { id: caseId },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting case:", error);
    return NextResponse.json(
      { error: "Failed to delete case" },
      { status: 500 }
    );
  }
}

// Helper function to generate random tag colors
function generateTagColor(): string {
  const colors = [
    "#ef4444", // red
    "#f97316", // orange
    "#f59e0b", // amber
    "#eab308", // yellow
    "#84cc16", // lime
    "#22c55e", // green
    "#10b981", // emerald
    "#14b8a6", // teal
    "#06b6d4", // cyan
    "#0ea5e9", // sky
    "#3b82f6", // blue
    "#6366f1", // indigo
    "#8b5cf6", // violet
    "#a855f7", // purple
    "#d946ef", // fuchsia
    "#ec4899", // pink
    "#f43f5e", // rose
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
