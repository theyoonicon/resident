import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    const { id } = await params;
    const { action, note } = await request.json();

    if (action === "approve") {
      await prisma.user.update({
        where: { id },
        data: {
          role: "USER",
          verificationStatus: "APPROVED",
          verifiedAt: new Date(),
          verifiedBy: session.user.id,
          verificationNote: note || null,
        },
      });
    } else if (action === "reject") {
      await prisma.user.update({
        where: { id },
        data: {
          verificationStatus: "REJECTED",
          verificationNote: note || "인증이 거부되었습니다.",
          verifiedBy: session.user.id,
        },
      });
    } else {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin verification action error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
