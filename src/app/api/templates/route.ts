import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { DEPARTMENTS, getTemplate } from "@/templates";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // System templates from registry
    const systemTemplates = DEPARTMENTS.map((dept) => {
      const template = getTemplate(dept.key);
      return {
        id: `system-${dept.key}`,
        key: dept.key,
        name: dept.name,
        isSystem: true,
        sectionsCount: template.sections.length,
        fieldsCount: template.fields.length,
      };
    });

    // Custom templates from DB
    const templates = await prisma.caseTemplate.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: { order: "asc" },
      select: {
        id: true,
        key: true,
        name: true,
        sections: true,
        fields: true,
        order: true,
      },
    });

    const customTemplates = templates.map((t) => ({
      id: t.id,
      key: t.key,
      name: t.name,
      isSystem: false,
      sectionsCount: Array.isArray(t.sections) ? t.sections.length : 0,
      fieldsCount: Array.isArray(t.fields) ? t.fields.length : 0,
    }));

    return NextResponse.json({ systemTemplates, customTemplates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
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
    const { name, key, sections, fields, aiPrompt } = body;

    if (!name || !key) {
      return NextResponse.json(
        { error: "Name and key are required" },
        { status: 400 }
      );
    }

    // Check for duplicate key
    const existing = await prisma.caseTemplate.findFirst({
      where: {
        userId: session.user.id,
        key,
        isActive: true,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A template with this key already exists" },
        { status: 409 }
      );
    }

    // Get max order
    const maxOrder = await prisma.caseTemplate.findFirst({
      where: { userId: session.user.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const template = await prisma.caseTemplate.create({
      data: {
        userId: session.user.id,
        name,
        key,
        sections: sections || [],
        fields: fields || [],
        aiPrompt: aiPrompt || null,
        order: (maxOrder?.order || 0) + 1,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}
