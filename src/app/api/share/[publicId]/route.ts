import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;

    const caseData = await prisma.case.findUnique({
      where: {
        publicId,
        isPublic: true,
        deletedAt: null,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        images: {
          orderBy: { order: "asc" },
        },
        user: {
          select: {
            name: true,
            department: true,
          },
        },
      },
    });

    if (!caseData) {
      return NextResponse.json(
        { error: "케이스를 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    return NextResponse.json(caseData);
  } catch (error) {
    console.error("Error fetching shared case:", error);
    return NextResponse.json(
      { error: "공유 케이스를 불러오는 데 실패했습니다" },
      { status: 500 }
    );
  }
}
