import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DEPARTMENTS } from "@/templates";
import { NextRequest, NextResponse } from "next/server";

const validKeys: string[] = DEPARTMENTS.map((d) => d.key);

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    const enabledTemplates = userSettings
      ? (userSettings.enabledTemplates as string[]) || validKeys.slice(0, 5)
      : validKeys.slice(0, 5);

    // Return template objects with enabled status for TemplateManagerModal
    const templates = DEPARTMENTS.map((dept) => ({
      key: dept.key,
      name: dept.name,
      nameEn: dept.nameEn,
      enabled: enabledTemplates.includes(dept.key),
    }));

    return NextResponse.json({
      enabledTemplates,
      availableTemplates: validKeys,
      templates,
    });
  } catch (error) {
    console.error("Error fetching template settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch template settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { enabledTemplates } = body;

    if (!Array.isArray(enabledTemplates)) {
      return NextResponse.json(
        { error: "enabledTemplates must be an array" },
        { status: 400 }
      );
    }

    const allValid = enabledTemplates.every((t: string) => validKeys.includes(t));
    if (!allValid) {
      return NextResponse.json(
        { error: "Invalid template key provided" },
        { status: 400 }
      );
    }

    const userSettings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: {
        enabledTemplates,
      },
      create: {
        userId: session.user.id,
        enabledTemplates,
      },
    });

    return NextResponse.json(userSettings);
  } catch (error) {
    console.error("Error updating template settings:", error);
    return NextResponse.json(
      { error: "Failed to update template settings" },
      { status: 500 }
    );
  }
}
