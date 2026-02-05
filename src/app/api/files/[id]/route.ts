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
    const file = await prisma.file.findFirst({
      where: {
        id,
        deletedAt: null,
        OR: [
          { isShared: true },
          { userId: session.user.id },
        ],
      },
      include: {
        folder: true,
        tags: { include: { tag: true } },
        user: { select: { id: true, name: true, department: true } },
      },
    });

    if (!file) {
      return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
    }

    await prisma.file.update({ where: { id }, data: { viewCount: { increment: 1 } } });

    return NextResponse.json(file);
  } catch (error) {
    console.error("File GET error:", error);
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

    const existing = await prisma.file.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
    }

    if (existing.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "수정 권한이 없습니다." }, { status: 403 });
    }

    const file = await prisma.file.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(file);
  } catch (error) {
    console.error("File PATCH error:", error);
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
    const file = await prisma.file.findUnique({ where: { id } });

    if (!file) {
      return NextResponse.json({ error: "파일을 찾을 수 없습니다." }, { status: 404 });
    }

    if (file.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 });
    }

    // 소프트 삭제 (휴지통으로 이동)
    await prisma.file.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("File DELETE error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
