import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "이메일과 인증코드를 입력해주세요." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedCode = code.trim();

    // 인증코드 확인
    const token = await prisma.verificationToken.findFirst({
      where: {
        identifier: normalizedEmail,
        token: trimmedCode,
      },
    });

    if (!token) {
      return NextResponse.json(
        { error: "인증코드가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    // 만료 확인
    if (token.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: token.identifier,
            token: token.token,
          },
        },
      });
      return NextResponse.json(
        { error: "인증코드가 만료되었습니다. 다시 발송해주세요." },
        { status: 400 }
      );
    }

    // 토큰 삭제
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: token.identifier,
          token: token.token,
        },
      },
    });

    // 이메일 변경 시 중복 확인
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });

    if (currentUser?.email !== normalizedEmail) {
      const existing = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (existing) {
        return NextResponse.json(
          { error: "이미 사용 중인 이메일입니다." },
          { status: 400 }
        );
      }
    }

    // 이메일 업데이트 + emailVerified 설정
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        email: normalizedEmail,
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Confirm email error:", error);
    return NextResponse.json(
      { error: "이메일 인증에 실패했습니다." },
      { status: 500 }
    );
  }
}
