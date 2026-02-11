import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");
    const scope = searchParams.get("scope") || "shared";

    const where: Record<string, unknown> = {
      parentId: parentId || null,
      deletedAt: null,
    };

    if (scope === "personal") {
      where.userId = session.user.id;
      where.isShared = false;
    } else {
      where.isShared = true;
    }

    const folders = await prisma.folder.findMany({
      where,
      include: {
        _count: { select: { files: true, children: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });

    // 하위 폴더의 파일까지 재귀적으로 카운트
    if (folders.length > 0) {
      const folderIds = folders.map((f) => f.id);
      const counts = await prisma.$queryRaw<
        { root_id: string; file_count: bigint }[]
      >`
        WITH RECURSIVE descendant_folders AS (
          SELECT id, id as root_id FROM "Folder"
          WHERE id IN (${Prisma.join(folderIds)}) AND "deletedAt" IS NULL
          UNION ALL
          SELECT f.id, d.root_id FROM "Folder" f
          INNER JOIN descendant_folders d ON f."parentId" = d.id
          WHERE f."deletedAt" IS NULL
        )
        SELECT d.root_id, COUNT(fi.id)::bigint as file_count
        FROM descendant_folders d
        LEFT JOIN "File" fi ON fi."folderId" = d.id AND fi."deletedAt" IS NULL
        GROUP BY d.root_id
      `;

      const countMap = new Map(
        counts.map((c) => [c.root_id, Number(c.file_count)])
      );

      for (const folder of folders) {
        folder._count.files = countMap.get(folder.id) ?? 0;
      }
    }

    return NextResponse.json(folders);
  } catch (error) {
    console.error("Folders GET error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    const { name, parentId, color, isShared } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "폴더명을 입력해주세요." }, { status: 400 });
    }

    // 하위 폴더는 부모의 isShared 상속
    let shared = isShared !== undefined ? isShared : true;
    if (parentId) {
      const parent = await prisma.folder.findUnique({
        where: { id: parentId },
        select: { isShared: true },
      });
      if (parent) shared = parent.isShared;
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        parentId: parentId || null,
        color: color || "#10b981",
        userId: session.user.id,
        isShared: shared,
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error("Folders POST error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
