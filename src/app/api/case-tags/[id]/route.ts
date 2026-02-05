import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingTag = await prisma.caseTag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      return NextResponse.json(
        { error: "Tag not found" },
        { status: 404 }
      );
    }

    await prisma.caseTag.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting case tag:", error);
    return NextResponse.json(
      { error: "Failed to delete case tag" },
      { status: 500 }
    );
  }
}
