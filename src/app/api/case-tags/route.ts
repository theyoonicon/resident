import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tags = await prisma.caseTag.findMany({
      include: {
        _count: {
          select: { cases: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching case tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch case tags" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, color } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const newTag = await prisma.caseTag.create({
      data: {
        name,
        color: color || null,
      },
      include: {
        _count: {
          select: { cases: true },
        },
      },
    });

    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error("Error creating case tag:", error);
    return NextResponse.json(
      { error: "Failed to create case tag" },
      { status: 500 }
    );
  }
}
