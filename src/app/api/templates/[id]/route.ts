import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { DEPARTMENTS, getTemplate } from "@/templates";

// GET: Fetch a single template (system or custom)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // System template
    if (id.startsWith("system-")) {
      const deptKey = id.replace("system-", "");
      const dept = DEPARTMENTS.find((d) => d.key === deptKey);
      if (!dept) {
        return NextResponse.json(
          { error: "Template not found" },
          { status: 404 }
        );
      }

      const template = getTemplate(deptKey as any);
      return NextResponse.json({
        id,
        key: dept.key,
        name: dept.name,
        nameEn: dept.nameEn,
        isSystem: true,
        sections: template.sections.map((s) => ({
          key: s.key,
          title: s.title,
          titleEn: s.titleEn,
          order: s.order,
        })),
        fields: template.fields.map((f) => ({
          key: f.key,
          label: f.label,
          labelEn: f.labelEn,
          type: f.type,
          required: f.required,
          section: f.section,
          order: f.order,
          options: f.options,
          placeholder: f.placeholder,
        })),
      });
    }

    // Custom template from DB
    const template = await prisma.caseTemplate.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: template.id,
      key: template.key,
      name: template.name,
      nameEn: null,
      isSystem: false,
      sections: template.sections || [],
      fields: template.fields || [],
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

// PATCH: Update a custom template
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (id.startsWith("system-")) {
      return NextResponse.json(
        { error: "Cannot modify system templates" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, nameEn, sections, fields, aiPrompt } = body;

    const template = await prisma.caseTemplate.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    const updated = await prisma.caseTemplate.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(sections !== undefined && { sections }),
        ...(fields !== undefined && { fields }),
        ...(aiPrompt !== undefined && { aiPrompt }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a custom template
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

    if (id.startsWith("system-")) {
      return NextResponse.json(
        { error: "Cannot delete system templates" },
        { status: 403 }
      );
    }

    const template = await prisma.caseTemplate.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    await prisma.caseTemplate.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}
