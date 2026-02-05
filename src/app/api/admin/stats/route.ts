import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const [totalUsers, pendingVerifications, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { verificationStatus: "PENDING", verificationImage: { not: null } } }),
      prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } }),
    ]);

    return NextResponse.json({ totalUsers, pendingVerifications, recentUsers });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
