import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { mkdir } from "fs/promises";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let step = "auth";
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    step = "formData";
    const formData = await request.formData();
    const files = formData.getAll("files") as globalThis.File[];
    const folderId = formData.get("folderId") as string | null;
    const isSharedParam = formData.get("isShared");
    const isShared = isSharedParam === null ? true : isSharedParam === "true";
    // 폴더 업로드 시 각 파일의 상대 경로 (JSON 배열)
    const relativePathsRaw = formData.get("relativePaths") as string | null;
    const relativePaths: string[] = relativePathsRaw
      ? JSON.parse(relativePathsRaw)
      : [];

    if (!files.length) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    // 폴더에 업로드 시 폴더의 isShared 상속
    let shared = isShared;
    if (folderId) {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId },
        select: { isShared: true },
      });
      if (folder) shared = folder.isShared;
    }

    // 개인 파일 용량 제한 체크 (공유자료실은 제한 없음)
    step = "quota";
    if (!shared) {
      const settings = await prisma.userSettings.findUnique({
        where: { userId: session.user.id },
        select: { storageLimit: true },
      });
      const storageLimit = settings?.storageLimit ?? BigInt(3221225472); // 3GB default

      const usage = await prisma.file.aggregate({
        where: { userId: session.user.id, isShared: false },
        _sum: { size: true },
      });
      const currentUsage = BigInt(usage._sum.size || 0);
      const uploadSize = BigInt(files.reduce((sum, f) => sum + f.size, 0));

      if (currentUsage + uploadSize > storageLimit) {
        const usedMB = Number(currentUsage) / (1024 * 1024);
        const limitMB = Number(storageLimit) / (1024 * 1024);
        return NextResponse.json(
          { error: `저장 용량 초과 (${usedMB.toFixed(0)}MB / ${limitMB.toFixed(0)}MB)` },
          { status: 413 }
        );
      }
    }

    // 폴더 구조 자동 생성 (폴더 업로드인 경우)
    // relativePaths 예시: ["MyFolder/sub/file.txt", "MyFolder/other.pdf"]
    const folderCache = new Map<string, string>(); // "MyFolder/sub" -> folderId
    const parentId = folderId || null;
    const currentUserId = session.user.id;

    async function getOrCreateFolder(folderPath: string): Promise<string> {
      if (folderCache.has(folderPath)) {
        return folderCache.get(folderPath)!;
      }

      const parts = folderPath.split("/");
      let currentParentId = parentId;

      for (let i = 0; i < parts.length; i++) {
        const partialPath = parts.slice(0, i + 1).join("/");

        if (folderCache.has(partialPath)) {
          currentParentId = folderCache.get(partialPath)!;
          continue;
        }

        const folderName = parts[i];

        // 같은 부모 아래 같은 이름의 폴더가 있는지 확인
        const existing = await prisma.folder.findFirst({
          where: {
            name: folderName,
            parentId: currentParentId,
            isShared: shared,
            deletedAt: null,
            ...(shared ? {} : { userId: currentUserId }),
          },
        });

        if (existing) {
          folderCache.set(partialPath, existing.id);
          currentParentId = existing.id;
        } else {
          const newFolder = await prisma.folder.create({
            data: {
              name: folderName,
              parentId: currentParentId,
              userId: currentUserId,
              isShared: shared,
            },
          });
          folderCache.set(partialPath, newFolder.id);
          currentParentId = newFolder.id;
        }
      }

      return currentParentId!;
    }

    step = "mkdir";
    const uploadDir = path.join(process.cwd(), "uploads", session.user.id);
    await mkdir(uploadDir, { recursive: true });

    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = path.extname(file.name);
      const uniqueName = `${crypto.randomUUID()}${ext}`;
      const filepath = path.join(uploadDir, uniqueName);

      // 스트리밍으로 파일 쓰기 (메모리 효율)
      step = `write[${i}]:${file.name}`;
      const webStream = file.stream();
      const nodeReadable = Readable.fromWeb(webStream as Parameters<typeof Readable.fromWeb>[0]);
      const writeStream = createWriteStream(filepath);
      await pipeline(nodeReadable, writeStream);

      // 파일이 속할 폴더 결정
      step = `folder[${i}]`;
      let fileFolderId = folderId || null;
      if (relativePaths[i]) {
        const relPath = relativePaths[i];
        const dirParts = relPath.split("/");
        // 마지막은 파일명이므로 제외, 폴더 경로만 추출
        if (dirParts.length > 1) {
          const folderPath = dirParts.slice(0, -1).join("/");
          fileFolderId = await getOrCreateFolder(folderPath);
        }
      }

      step = `db[${i}]:${file.name}`;
      const dbFile = await prisma.file.create({
        data: {
          name: uniqueName,
          originalName: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
          path: `/uploads/${session.user.id}/${uniqueName}`,
          folderId: fileFolderId,
          userId: session.user.id,
          isShared: shared,
        },
      });

      results.push(dbFile);
    }

    return NextResponse.json({ files: results });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Upload error [${step}]:`, message, error);
    return NextResponse.json(
      { error: `업로드 실패 (${step}): ${message}` },
      { status: 500 }
    );
  }
}
