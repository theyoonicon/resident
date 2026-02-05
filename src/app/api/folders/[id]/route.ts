import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    const { id } = await params;

    // 폴더 상세 정보 (DetailPanel용)
    const folder = await prisma.folder.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
        _count: { select: { files: true, children: true } },
      },
    });

    // 현재 폴더부터 루트까지의 경로(breadcrumb) 조회
    const breadcrumbs: { id: string; name: string }[] = [];
    let currentId: string | null = id;

    while (currentId) {
      const f: { id: string; name: string; parentId: string | null } | null =
        await prisma.folder.findUnique({
          where: { id: currentId },
          select: { id: true, name: true, parentId: true },
        });
      if (!f) break;
      breadcrumbs.unshift({ id: f.id, name: f.name });
      currentId = f.parentId;
    }

    return NextResponse.json({ breadcrumbs, folder });
  } catch (error) {
    console.error("Folder GET error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.folder.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "폴더를 찾을 수 없습니다." }, { status: 404 });
    }

    if (existing.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "수정 권한이 없습니다." }, { status: 403 });
    }

    // 순환 참조 방지: parentId 변경 시 상위 체인 검증
    if (body.parentId !== undefined && body.parentId !== null) {
      let checkId: string | null = body.parentId;
      while (checkId) {
        if (checkId === id) {
          return NextResponse.json(
            { error: "순환 참조: 자신의 하위 폴더로 이동할 수 없습니다." },
            { status: 400 }
          );
        }
        const parent: { parentId: string | null } | null =
          await prisma.folder.findUnique({
            where: { id: checkId },
            select: { parentId: true },
          });
        checkId = parent?.parentId ?? null;
      }
    }

    const folder = await prisma.folder.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Folder PATCH error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.folder.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: "폴더를 찾을 수 없습니다." }, { status: 404 });
    }

    if (existing.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
    }

    // 소프트 삭제: 폴더와 하위 파일 모두 deletedAt 설정
    const now = new Date();
    await prisma.$transaction([
      prisma.folder.update({
        where: { id },
        data: { deletedAt: now },
      }),
      prisma.file.updateMany({
        where: { folderId: id, deletedAt: null },
        data: { deletedAt: now },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Folder DELETE error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
