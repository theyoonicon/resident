import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { login } = await req.json();
    if (!login) {
      return NextResponse.json({ emailVerified: false });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: login.trim() },
          { username: login.trim() },
        ],
      },
      select: { emailVerified: true },
    });

    return NextResponse.json({
      emailVerified: !!user?.emailVerified,
    });
  } catch {
    return NextResponse.json({ emailVerified: false });
  }
}
