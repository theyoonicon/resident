import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get("department");
    const favorite = searchParams.get("favorite");
    const search = searchParams.get("search");
    const folderId = searchParams.get("folderId");
    const tags = searchParams.get("tags");
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {
      userId: session.user.id,
      deletedAt: null,
    };

    if (department) {
      where.department = department;
    }

    if (favorite === "true") {
      where.isFavorite = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { chiefComplaint: { contains: search, mode: "insensitive" } },
        { diagnosis: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
      ];
    }

    if (folderId) {
      where.caseFolderId = folderId === "none" ? null : folderId;
    }

    if (tags) {
      const tagNames = tags.split(",");
      where.tags = {
        some: {
          tag: {
            name: { in: tagNames },
          },
        },
      };
    }

    const cases = await prisma.case.findMany({
      where,
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
      orderBy: { date: "desc" },
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

    const hasMore = cases.length > limit;
    const casesToReturn = hasMore ? cases.slice(0, -1) : cases;
    const nextCursor = hasMore ? casesToReturn[casesToReturn.length - 1].id : null;

    return NextResponse.json({
      cases: casesToReturn,
      nextCursor,
      hasMore,
    });
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json(
      { error: "Failed to fetch cases" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
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
      images,
    } = body;

    // Create the case with nested tags and images
    const newCase = await prisma.case.create({
      data: {
        title,
        department,
        caseType,
        date: date ? new Date(date) : new Date(),
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
        caseFolderId: caseFolderId || null,
        userId: session.user.id,
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

    // Handle tags
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        // Upsert tag (create if doesn't exist, find if exists)
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
            caseId: newCase.id,
            tagId: tag.id,
          },
        });
      }
    }

    // Handle images
    if (images && Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        await prisma.caseImage.create({
          data: {
            caseId: newCase.id,
            url: image.url,
            caption: image.caption || null,
            order: image.order ?? i,
          },
        });
      }
    }

    // Fetch the complete case with all relations
    const completeCase = await prisma.case.findUnique({
      where: { id: newCase.id },
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

    return NextResponse.json(completeCase, { status: 201 });
  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json(
      { error: "Failed to create case" },
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
