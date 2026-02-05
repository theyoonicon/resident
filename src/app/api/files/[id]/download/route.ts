import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import path from "path";

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
        OR: [{ isShared: true }, { userId: session.user.id }],
      },
    });

    if (!file) {
      return NextResponse.json(
        { error: "파일을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const filePath = path.join(process.cwd(), file.path);

    // 파일 존재 확인
    try {
      await stat(filePath);
    } catch {
      return NextResponse.json(
        { error: "파일이 디스크에 없습니다." },
        { status: 404 }
      );
    }

    // 다운로드 카운트 증가
    await prisma.file.update({
      where: { id },
      data: { downloadCount: { increment: 1 } },
    });

    // 파일 스트리밍
    const fileStream = createReadStream(filePath);
    const readableStream = new ReadableStream({
      start(controller) {
        fileStream.on("data", (chunk) => {
          controller.enqueue(chunk);
        });
        fileStream.on("end", () => {
          controller.close();
        });
        fileStream.on("error", (err) => {
          controller.error(err);
        });
      },
    });

    const encodedName = encodeURIComponent(file.originalName);

    return new Response(readableStream, {
      headers: {
        "Content-Type": file.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodedName}`,
        "Content-Length": String(file.size),
      },
    });
  } catch (error) {
    console.error("File download error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
