import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
      select: { storageLimit: true },
    });

    const storageLimit = Number(settings?.storageLimit ?? BigInt(3221225472)); // 3GB

    const usage = await prisma.file.aggregate({
      where: { userId: session.user.id, isShared: false },
      _sum: { size: true },
    });

    const used = Number(usage._sum.size || 0);

    return NextResponse.json({ used, limit: storageLimit });
  } catch (error) {
    console.error("Error fetching storage:", error);
    return NextResponse.json(
      { error: "Failed to fetch storage info" },
      { status: 500 }
    );
  }
}
