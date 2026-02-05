import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import archiver from "archiver";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";
import { PassThrough } from "stream";

// 폴더 내 모든 파일을 재귀적으로 수집 (폴더 경로 포함)
async function collectFilesFromFolder(
  folderId: string,
  userId: string,
  pathPrefix: string
): Promise<{ file: { id: string; path: string; originalName: string }; archivePath: string }[]> {
  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      deletedAt: null,
      OR: [{ isShared: true }, { userId }],
    },
    include: {
      files: {
        where: {
          deletedAt: null,
          OR: [{ isShared: true }, { userId }],
        },
        select: { id: true, path: true, originalName: true },
      },
      children: {
        where: {
          deletedAt: null,
          OR: [{ isShared: true }, { userId }],
        },
        select: { id: true, name: true },
      },
    },
  });

  if (!folder) return [];

  const results: { file: { id: string; path: string; originalName: string }; archivePath: string }[] = [];

  // 이 폴더의 파일들
  for (const file of folder.files) {
    results.push({ file, archivePath: pathPrefix + file.originalName });
  }

  // 하위 폴더 재귀
  for (const child of folder.children) {
    const childResults = await collectFilesFromFolder(
      child.id,
      userId,
      pathPrefix + child.name + "/"
    );
    results.push(...childResults);
  }

  return results;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    const body = await request.json();
    const fileIds: string[] = body.fileIds || [];
    const folderIds: string[] = body.folderIds || [];

    if (fileIds.length === 0 && folderIds.length === 0) {
      return NextResponse.json(
        { error: "파일 또는 폴더 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 1) 직접 선택된 파일 조회
    const directFiles = fileIds.length > 0
      ? await prisma.file.findMany({
          where: {
            id: { in: fileIds },
            deletedAt: null,
            OR: [{ isShared: true }, { userId: session.user.id }],
          },
        })
      : [];

    // 2) 폴더에서 재귀적으로 파일 수집
    const folderFileEntries: { file: { id: string; path: string; originalName: string }; archivePath: string }[] = [];

    for (const folderId of folderIds) {
      // 폴더 이름 조회
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          deletedAt: null,
          OR: [{ isShared: true }, { userId: session.user.id }],
        },
        select: { name: true },
      });
      if (!folder) continue;

      const collected = await collectFilesFromFolder(
        folderId,
        session.user.id,
        folder.name + "/"
      );
      folderFileEntries.push(...collected);
    }

    // 직접 선택 파일 + 폴더 파일 합치기
    const allFileIds = new Set<string>();
    const archiveEntries: { filePath: string; archiveName: string }[] = [];

    // 동일 파일명 충돌 처리 (루트 레벨 직접 파일)
    const nameCount = new Map<string, number>();

    for (const file of directFiles) {
      if (allFileIds.has(file.id)) continue;
      allFileIds.add(file.id);

      const count = nameCount.get(file.originalName) || 0;
      nameCount.set(file.originalName, count + 1);

      let archiveName = file.originalName;
      if (count > 0) {
        const ext = path.extname(file.originalName);
        const base = file.originalName.slice(0, -ext.length || undefined);
        archiveName = `${base} (${count})${ext}`;
      }
      archiveEntries.push({
        filePath: path.join(process.cwd(), file.path),
        archiveName,
      });
    }

    // 폴더 내 파일 (경로 포함 - 중복 체크)
    const pathCount = new Map<string, number>();
    for (const { file, archivePath } of folderFileEntries) {
      if (allFileIds.has(file.id)) continue;
      allFileIds.add(file.id);

      const count = pathCount.get(archivePath) || 0;
      pathCount.set(archivePath, count + 1);

      let finalPath = archivePath;
      if (count > 0) {
        const ext = path.extname(archivePath);
        const base = archivePath.slice(0, -ext.length || undefined);
        finalPath = `${base} (${count})${ext}`;
      }
      archiveEntries.push({
        filePath: path.join(process.cwd(), file.path),
        archiveName: finalPath,
      });
    }

    if (archiveEntries.length === 0) {
      return NextResponse.json(
        { error: "다운로드할 파일이 없습니다." },
        { status: 404 }
      );
    }

    // 다운로드 카운트 증가
    await prisma.file.updateMany({
      where: { id: { in: Array.from(allFileIds) } },
      data: { downloadCount: { increment: 1 } },
    });

    // archiver → PassThrough → ReadableStream
    const passThrough = new PassThrough();
    const archive = archiver("zip", { zlib: { level: 5 } });

    archive.on("error", (err) => {
      passThrough.destroy(err);
    });

    archive.pipe(passThrough);

    for (const { filePath, archiveName } of archiveEntries) {
      try {
        await stat(filePath);
        archive.append(createReadStream(filePath), { name: archiveName });
      } catch {
        // 디스크에 없는 파일은 건너뜀
      }
    }

    archive.finalize();

    const readableStream = new ReadableStream({
      start(controller) {
        passThrough.on("data", (chunk) => {
          controller.enqueue(chunk);
        });
        passThrough.on("end", () => {
          controller.close();
        });
        passThrough.on("error", (err) => {
          controller.error(err);
        });
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent("files.zip")}`,
      },
    });
  } catch (error) {
    console.error("Multi-file download error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
