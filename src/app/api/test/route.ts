import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { DEPARTMENTS } from "@/templates";

export async function GET() {
  const results: Record<string, unknown> = {};
  const session = await auth();
  const userId = session?.user?.id;

  // 1. case-folders query
  try {
    const folders = await prisma.caseFolder.findMany({
      where: { userId: userId!, parentId: null, deletedAt: null },
      take: 5,
    });
    results.caseFolders = `OK (${folders.length})`;
  } catch (e: unknown) {
    results.caseFolders = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  // 2. cases query
  try {
    const cases = await prisma.case.findMany({
      where: { userId: userId!, deletedAt: null },
      take: 5,
    });
    results.cases = `OK (${cases.length})`;
  } catch (e: unknown) {
    results.cases = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  // 3. settings/templates query
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: userId! },
    });
    results.userSettings = settings ? `OK` : `NULL (no settings row)`;
  } catch (e: unknown) {
    results.userSettings = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  // 4. templates (caseTemplate) query
  try {
    const templates = await prisma.caseTemplate.findMany({
      where: { userId: userId!, isActive: true },
      take: 5,
    });
    results.caseTemplates = `OK (${templates.length})`;
  } catch (e: unknown) {
    results.caseTemplates = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  // 5. tags
  try {
    const tags = await prisma.caseTag.findMany({ take: 5 });
    results.tags = `OK (${tags.length})`;
  } catch (e: unknown) {
    results.tags = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
  }

  // 6. DEPARTMENTS constant
  results.departments = `${DEPARTMENTS.length} departments loaded`;

  return NextResponse.json(results);
}
