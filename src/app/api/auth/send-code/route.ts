import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationCode } from "@/lib/email";
import crypto from "crypto";

function maskName(name: string | null): string | null {
  if (!name || name.length <= 1) return name;
  if (name.length === 2) return name[0] + "*";
  return name[0] + "*".repeat(name.length - 2) + name[name.length - 1];
}

function maskUsername(username: string | null): string | null {
  if (!username || username.length <= 2) return username;
  if (username.length <= 4) return username[0] + "*".repeat(username.length - 1);
  const show = Math.min(2, Math.floor(username.length / 3));
  return username.slice(0, show) + "*".repeat(username.length - show * 2) + username.slice(-show);
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "이메일을 입력해주세요." },
        { status: 400 }
      );
    }

    // 6자리 숫자 코드
    const code = crypto.randomInt(100000, 999999).toString();

    // 기존 토큰 삭제 + 새 토큰 생성
    await prisma.verificationToken.deleteMany({
      where: { identifier: email.toLowerCase().trim() },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase().trim(),
        token: code,
        expires: new Date(Date.now() + 5 * 60 * 1000), // 5분
      },
    });

    await sendVerificationCode(email.toLowerCase().trim(), code);

    // 기존 계정(비밀번호 있는) 확인 → 마스킹된 정보 반환
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { name: true, username: true, password: true },
    });

    if (existingUser?.password) {
      return NextResponse.json({
        success: true,
        existingAccount: {
          name: maskName(existingUser.name),
          username: maskUsername(existingUser.username),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Send code error:", error);
    return NextResponse.json(
      { error: "인증코드 발송에 실패했습니다." },
      { status: 500 }
    );
  }
}
