import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createSampleCaseForUser } from "@/lib/sample-case";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user settings
    let userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!userSettings) {
      userSettings = await prisma.userSettings.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    // Check if user has any cases
    const caseCount = await prisma.case.count({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
    });

    // Create sample case if user has no cases
    if (caseCount === 0) {
      await createSampleCaseForUser(session.user.id);
    }

    return NextResponse.json(userSettings);
  } catch (error) {
    console.error("Error initializing user:", error);
    return NextResponse.json(
      { error: "Failed to initialize user" },
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
    const { hasSeenOnboarding } = body;

    // Update user settings
    const userSettings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: {
        hasSeenOnboarding: hasSeenOnboarding !== undefined ? hasSeenOnboarding : undefined,
      },
      create: {
        userId: session.user.id,
        hasSeenOnboarding: hasSeenOnboarding || false,
      },
    });

    return NextResponse.json(userSettings);
  } catch (error) {
    console.error("Error updating user settings:", error);
    return NextResponse.json(
      { error: "Failed to update user settings" },
      { status: 500 }
    );
  }
}
