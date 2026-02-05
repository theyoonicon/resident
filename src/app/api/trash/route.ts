import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const type = req.nextUrl.searchParams.get("type"); // "files" | "cases" | null

    const fetchCases = !type || type === "cases";
    const fetchFiles = !type || type === "files";

    const [deletedCases, deletedCaseFolders, deletedFiles, deletedFolders] =
      await Promise.all([
        fetchCases
          ? prisma.case.findMany({
              where: {
                userId: session.user.id,
                deletedAt: { not: null },
              },
              include: {
                caseFolder: {
                  select: { id: true, name: true, color: true },
                },
              },
              orderBy: { deletedAt: "desc" },
            })
          : Promise.resolve([]),
        fetchCases
          ? prisma.caseFolder.findMany({
              where: {
                userId: session.user.id,
                deletedAt: { not: null },
              },
              include: {
                _count: { select: { cases: true } },
              },
              orderBy: { deletedAt: "desc" },
            })
          : Promise.resolve([]),
        fetchFiles
          ? prisma.file.findMany({
              where: {
                userId: session.user.id,
                deletedAt: { not: null },
              },
              select: {
                id: true,
                originalName: true,
                mimeType: true,
                size: true,
                path: true,
                deletedAt: true,
                folder: { select: { name: true } },
              },
              orderBy: { deletedAt: "desc" },
            })
          : Promise.resolve([]),
        fetchFiles
          ? prisma.folder.findMany({
              where: {
                userId: session.user.id,
                deletedAt: { not: null },
              },
              include: {
                _count: { select: { files: true, children: true } },
              },
              orderBy: { deletedAt: "desc" },
            })
          : Promise.resolve([]),
      ]);

    return NextResponse.json({
      cases: deletedCases,
      caseFolders: deletedCaseFolders,
      files: deletedFiles,
      folders: deletedFolders,
    });
  } catch (error) {
    console.error("Error fetching trash:", error);
    return NextResponse.json(
      { error: "Failed to fetch trash" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const type = req.nextUrl.searchParams.get("type"); // "files" | "cases" | null
    const deleteCases = !type || type === "cases";
    const deleteFiles = !type || type === "files";

    // 파일 시스템에서 삭제된 파일의 실제 파일도 제거
    if (deleteFiles) {
      const deletedFiles = await prisma.file.findMany({
        where: {
          userId: session.user.id,
          deletedAt: { not: null },
        },
        select: { path: true },
      });

      for (const file of deletedFiles) {
        try {
          await unlink(path.join(process.cwd(), file.path));
        } catch {
          /* file may not exist on disk */
        }
      }
    }

    const operations = [];

    if (deleteCases) {
      operations.push(
        prisma.caseTagRelation.deleteMany({
          where: {
            case: {
              userId: session.user.id,
              deletedAt: { not: null },
            },
          },
        }),
        prisma.case.deleteMany({
          where: {
            userId: session.user.id,
            deletedAt: { not: null },
          },
        }),
        prisma.caseFolder.deleteMany({
          where: {
            userId: session.user.id,
            deletedAt: { not: null },
          },
        }),
      );
    }

    if (deleteFiles) {
      operations.push(
        prisma.fileTag.deleteMany({
          where: {
            file: {
              userId: session.user.id,
              deletedAt: { not: null },
            },
          },
        }),
        prisma.fileVersion.deleteMany({
          where: {
            file: {
              userId: session.user.id,
              deletedAt: { not: null },
            },
          },
        }),
        prisma.starredItem.deleteMany({
          where: {
            userId: session.user.id,
            file: { deletedAt: { not: null } },
          },
        }),
        prisma.starredItem.deleteMany({
          where: {
            userId: session.user.id,
            folder: { deletedAt: { not: null } },
          },
        }),
        prisma.file.deleteMany({
          where: {
            userId: session.user.id,
            deletedAt: { not: null },
          },
        }),
        prisma.folder.deleteMany({
          where: {
            userId: session.user.id,
            deletedAt: { not: null },
          },
        }),
      );
    }

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error emptying trash:", error);
    return NextResponse.json(
      { error: "Failed to empty trash" },
      { status: 500 }
    );
  }
}
