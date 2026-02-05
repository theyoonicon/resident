import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folderId");
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "50");
    const sort = searchParams.get("sort") || "recent";
    const scope = searchParams.get("scope") || "shared";

    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (scope === "personal") {
      where.userId = session.user.id;
      where.isShared = false;
    } else {
      where.isShared = true;
    }

    if (folderId) {
      where.folderId = folderId;
    } else if (searchParams.has("folderId")) {
      where.folderId = null;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { originalName: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy = sort === "name"
      ? { name: "asc" as const }
      : { updatedAt: "desc" as const };

    const files = await prisma.file.findMany({
      where,
      include: {
        folder: { select: { name: true } },
        user: { select: { id: true, name: true, department: true } },
      },
      orderBy,
      take: limit,
    });

    return NextResponse.json({ files });
  } catch (error) {
    console.error("Files GET error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
