import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    const starred = await prisma.starredItem.findMany({
      where: { userId: session.user.id },
      include: {
        file: {
          include: {
            user: { select: { id: true, name: true, department: true } },
          },
        },
        folder: {
          include: {
            user: { select: { id: true, name: true } },
            _count: { select: { files: true, children: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const files = starred
      .filter((s) => s.file)
      .map((s) => s.file!);

    const folders = starred
      .filter((s) => s.folder)
      .map((s) => ({
        ...s.folder!,
        _count: (s.folder as typeof s.folder & { _count: { files: number; children: number } })!._count,
      }));

    // 현재 유저의 전체 starred ID 목록도 반환
    const starredFileIds = starred.filter((s) => s.fileId).map((s) => s.fileId!);
    const starredFolderIds = starred.filter((s) => s.folderId).map((s) => s.folderId!);

    return NextResponse.json({ files, folders, starredFileIds, starredFolderIds });
  } catch (error) {
    console.error("Starred GET error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    const body = await request.json();
    const { fileId, folderId } = body as { fileId?: string; folderId?: string };

    if (!fileId && !folderId) {
      return NextResponse.json({ error: "fileId 또는 folderId 필요" }, { status: 400 });
    }

    // 토글: 이미 있으면 삭제, 없으면 생성
    if (fileId) {
      const existing = await prisma.starredItem.findUnique({
        where: { userId_fileId: { userId: session.user.id, fileId } },
      });

      if (existing) {
        await prisma.starredItem.delete({ where: { id: existing.id } });
        return NextResponse.json({ starred: false });
      } else {
        await prisma.starredItem.create({
          data: { userId: session.user.id, fileId },
        });
        return NextResponse.json({ starred: true });
      }
    }

    if (folderId) {
      const existing = await prisma.starredItem.findUnique({
        where: { userId_folderId: { userId: session.user.id, folderId } },
      });

      if (existing) {
        await prisma.starredItem.delete({ where: { id: existing.id } });
        return NextResponse.json({ starred: false });
      } else {
        await prisma.starredItem.create({
          data: { userId: session.user.id, folderId },
        });
        return NextResponse.json({ starred: true });
      }
    }

    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  } catch (error) {
    console.error("Starred POST error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
