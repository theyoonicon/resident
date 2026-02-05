import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const verifications = await prisma.user.findMany({
      where: {
        verificationImage: { not: null },
        verificationStatus: "PENDING",
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        year: true,
        verificationImage: true,
        verificationStatus: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(verifications);
  } catch (error) {
    console.error("Admin verifications error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
