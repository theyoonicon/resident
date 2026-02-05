import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const childInclude = {
      where: { deletedAt: null },
      orderBy: { order: "asc" as const },
      include: {
        _count: { select: { cases: true } },
        children: {
          where: { deletedAt: null },
          orderBy: { order: "asc" as const },
          include: {
            _count: { select: { cases: true } },
            children: {
              where: { deletedAt: null },
              orderBy: { order: "asc" as const },
              include: {
                _count: { select: { cases: true } },
              },
            },
          },
        },
      },
    };

    const folders = await prisma.caseFolder.findMany({
      where: {
        userId: session.user.id,
        parentId: null,
        deletedAt: null,
      },
      include: {
        children: childInclude,
        _count: {
          select: { cases: true },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error("Error fetching case folders:", error);
    return NextResponse.json(
      { error: "Failed to fetch case folders" },
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
    const { name, color, parentId } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Depth 제한 (최대 3단계)
    const MAX_DEPTH = 3;
    if (parentId) {
      let depth = 1;
      let currentParentId: string | null = parentId;
      while (currentParentId) {
        depth++;
        if (depth > MAX_DEPTH) {
          return NextResponse.json(
            { error: `폴더는 최대 ${MAX_DEPTH}단계까지만 만들 수 있습니다` },
            { status: 400 }
          );
        }
        const parent = await prisma.caseFolder.findUnique({
          where: { id: currentParentId },
          select: { parentId: true },
        });
        currentParentId = parent?.parentId || null;
      }
    }

    // Get the max order value for folders at this level
    const maxOrderFolder = await prisma.caseFolder.findFirst({
      where: {
        userId: session.user.id,
        parentId: parentId || null,
        deletedAt: null,
      },
      orderBy: {
        order: "desc",
      },
      select: {
        order: true,
      },
    });

    const newFolder = await prisma.caseFolder.create({
      data: {
        name,
        color: color || null,
        parentId: parentId || null,
        userId: session.user.id,
        order: (maxOrderFolder?.order || 0) + 1,
      },
      include: {
        _count: {
          select: { cases: true },
        },
      },
    });

    return NextResponse.json(newFolder, { status: 201 });
  } catch (error) {
    console.error("Error creating case folder:", error);
    return NextResponse.json(
      { error: "Failed to create case folder" },
      { status: 500 }
    );
  }
}
