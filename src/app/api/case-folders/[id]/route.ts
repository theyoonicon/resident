import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const folder = await prisma.caseFolder.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { cases: true },
        },
      },
    });

    if (!folder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Error fetching case folder:", error);
    return NextResponse.json(
      { error: "Failed to fetch case folder" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if folder exists and belongs to user
    const existingFolder = await prisma.caseFolder.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingFolder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }

    // Handle restore operation
    if (body.restore === true) {
      const getAllDescendantIds = async (folderId: string): Promise<string[]> => {
        const children = await prisma.caseFolder.findMany({
          where: { parentId: folderId },
          select: { id: true },
        });

        const childIds = children.map(c => c.id);
        const descendantIds = await Promise.all(
          childIds.map(cId => getAllDescendantIds(cId))
        );

        return [...childIds, ...descendantIds.flat()];
      };

      const descendantIds = await getAllDescendantIds(id);
      const allFolderIds = [id, ...descendantIds];

      await prisma.$transaction([
        prisma.caseFolder.updateMany({
          where: { id: { in: allFolderIds } },
          data: { deletedAt: null },
        }),
        prisma.case.updateMany({
          where: { caseFolderId: { in: allFolderIds } },
          data: { deletedAt: null },
        }),
      ]);

      const updatedFolder = await prisma.caseFolder.findUnique({
        where: { id },
        include: {
          _count: {
            select: { cases: true },
          },
        },
      });

      return NextResponse.json(updatedFolder);
    }

    // Regular update operation
    const { name, color, parentId, order } = body;
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (color !== undefined) updateData.color = color;
    if (parentId !== undefined) updateData.parentId = parentId;
    if (order !== undefined) updateData.order = order;

    const updatedFolder = await prisma.caseFolder.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { cases: true },
        },
      },
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error("Error updating case folder:", error);
    return NextResponse.json(
      { error: "Failed to update case folder" },
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

    const { id } = await params;

    const existingFolder = await prisma.caseFolder.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingFolder) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }

    const getAllDescendantIds = async (folderId: string): Promise<string[]> => {
      const children = await prisma.caseFolder.findMany({
        where: { parentId: folderId },
        select: { id: true },
      });

      const childIds = children.map(c => c.id);
      const descendantIds = await Promise.all(
        childIds.map(cId => getAllDescendantIds(cId))
      );

      return [...childIds, ...descendantIds.flat()];
    };

    const descendantIds = await getAllDescendantIds(id);
    const allFolderIds = [id, ...descendantIds];

    const now = new Date();

    await prisma.$transaction([
      prisma.caseFolder.updateMany({
        where: { id: { in: allFolderIds } },
        data: { deletedAt: now },
      }),
      prisma.case.updateMany({
        where: { caseFolderId: { in: allFolderIds } },
        data: { deletedAt: now },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting case folder:", error);
    return NextResponse.json(
      { error: "Failed to delete case folder" },
      { status: 500 }
    );
  }
}
