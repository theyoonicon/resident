import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, department, year } = await request.json();

    if (!email || !password || !department || !year) {
      return NextResponse.json(
        { error: "모든 필수 항목을 입력해주세요." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "이미 등록된 이메일입니다." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        department,
        year,
        role: "PENDING",
        verificationStatus: "PENDING",
      },
    });

    return NextResponse.json({ id: user.id, email: user.email });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
