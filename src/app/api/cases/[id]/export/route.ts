import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateMarkdown } from "@/lib/export";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: caseId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get("format") || "markdown";

    const caseData = await prisma.case.findUnique({
      where: {
        id: caseId,
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        images: {
          orderBy: { order: "asc" },
        },
        caseFolder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    if (format === "json") {
      return NextResponse.json(caseData, {
        headers: {
          "Content-Disposition": `attachment; filename="case-${caseId}.json"`,
          "Content-Type": "application/json",
        },
      });
    } else if (format === "markdown") {
      const markdown = generateMarkdown(caseData);

      return new NextResponse(markdown, {
        headers: {
          "Content-Disposition": `attachment; filename="case-${caseId}.md"`,
          "Content-Type": "text/markdown",
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid format. Use 'json' or 'markdown'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error exporting case:", error);
    return NextResponse.json(
      { error: "Failed to export case" },
      { status: 500 }
    );
  }
}
