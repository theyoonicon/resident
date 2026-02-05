import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    const department = typeof body.department === "string" ? body.department.trim() : undefined;
    const year = typeof body.year === "string" ? body.year.trim() : undefined;

    if (name !== undefined && name.length > 50) {
      return NextResponse.json({ error: "이름은 50자 이하여야 합니다." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(department !== undefined && { department: department || null }),
        ...(year !== undefined && { year: year || null }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
