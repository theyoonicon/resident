import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";

// POST: Restore item from trash
export async function POST(
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
    const { type } = body;

    if (type === "folder") {
      await prisma.caseFolder.update({
        where: { id, userId: session.user.id },
        data: { deletedAt: null },
      });
    } else if (type === "case") {
      await prisma.case.update({
        where: { id, userId: session.user.id },
        data: { deletedAt: null },
      });
    } else if (type === "file") {
      await prisma.file.update({
        where: { id, userId: session.user.id },
        data: { deletedAt: null },
      });
    } else if (type === "fileFolder") {
      // 폴더 복원 시 하위 파일도 함께 복원
      await prisma.$transaction([
        prisma.folder.update({
          where: { id, userId: session.user.id },
          data: { deletedAt: null },
        }),
        prisma.file.updateMany({
          where: { folderId: id, userId: session.user.id, deletedAt: { not: null } },
          data: { deletedAt: null },
        }),
      ]);
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error restoring item:", error);
    return NextResponse.json(
      { error: "Failed to restore item" },
      { status: 500 }
    );
  }
}

// DELETE: Permanently delete item
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
    const type = request.nextUrl.searchParams.get("type");

    if (type === "folder") {
      // CaseFolder: Delete cases in the folder first
      const casesInFolder = await prisma.case.findMany({
        where: { caseFolderId: id, userId: session.user.id },
        select: { id: true },
      });

      if (casesInFolder.length > 0) {
        await prisma.caseTagRelation.deleteMany({
          where: { caseId: { in: casesInFolder.map((c) => c.id) } },
        });
        await prisma.caseImage.deleteMany({
          where: { caseId: { in: casesInFolder.map((c) => c.id) } },
        });
        await prisma.case.deleteMany({
          where: { caseFolderId: id, userId: session.user.id },
        });
      }

      await prisma.caseFolder.delete({
        where: { id, userId: session.user.id },
      });
    } else if (type === "case") {
      // Delete relations first
      await prisma.caseTagRelation.deleteMany({
        where: { caseId: id },
      });
      await prisma.caseImage.deleteMany({
        where: { caseId: id },
      });
      await prisma.case.delete({
        where: { id, userId: session.user.id },
      });
    } else if (type === "file") {
      // 파일: 디스크에서도 삭제
      const file = await prisma.file.findFirst({
        where: { id, userId: session.user.id },
        select: { path: true },
      });
      if (file) {
        try {
          await unlink(path.join(process.cwd(), file.path));
        } catch { /* file may not exist on disk */ }
      }
      await prisma.fileTag.deleteMany({ where: { fileId: id } });
      await prisma.fileVersion.deleteMany({ where: { fileId: id } });
      await prisma.starredItem.deleteMany({ where: { fileId: id } });
      await prisma.file.delete({ where: { id } });
    } else if (type === "fileFolder") {
      // 파일 폴더: 하위 파일도 디스크에서 삭제
      const filesInFolder = await prisma.file.findMany({
        where: { folderId: id, userId: session.user.id },
        select: { id: true, path: true },
      });

      for (const file of filesInFolder) {
        try {
          await unlink(path.join(process.cwd(), file.path));
        } catch { /* file may not exist on disk */ }
      }

      if (filesInFolder.length > 0) {
        const fileIds = filesInFolder.map((f) => f.id);
        await prisma.fileTag.deleteMany({ where: { fileId: { in: fileIds } } });
        await prisma.fileVersion.deleteMany({ where: { fileId: { in: fileIds } } });
        await prisma.starredItem.deleteMany({ where: { fileId: { in: fileIds } } });
        await prisma.file.deleteMany({ where: { folderId: id, userId: session.user.id } });
      }

      await prisma.starredItem.deleteMany({ where: { folderId: id } });
      await prisma.folder.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
