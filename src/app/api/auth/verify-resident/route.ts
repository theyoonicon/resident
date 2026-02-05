import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { name, department, year, verificationImage } = await request.json();

    if (!verificationImage) {
      return NextResponse.json(
        { error: "인증 사진을 업로드해주세요." },
        { status: 400 }
      );
    }

    // Check if user already has department/year (credentials registration)
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { department: true, year: true },
    });

    const finalDepartment = department || existingUser?.department;
    const finalYear = year || existingUser?.year;

    if (!finalDepartment || !finalYear) {
      return NextResponse.json(
        { error: "소속과와 연차를 입력해주세요." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(name ? { name } : {}),
        department: finalDepartment,
        year: finalYear,
        verificationImage,
        verificationStatus: "PENDING",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify resident error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
