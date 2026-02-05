import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { summarizeCase } from "@/lib/gemini";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    const { id } = await params;
    const caseData = await prisma.case.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!caseData) {
      return NextResponse.json({ error: "케이스를 찾을 수 없습니다." }, { status: 404 });
    }

    const content = [
      `제목: ${caseData.title}`,
      `과: ${caseData.department}`,
      caseData.chiefComplaint && `주소: ${caseData.chiefComplaint}`,
      caseData.history && `병력: ${caseData.history}`,
      caseData.examination && `검사: ${caseData.examination}`,
      caseData.diagnosis && `진단: ${caseData.diagnosis}`,
      caseData.treatment && `치료: ${caseData.treatment}`,
      caseData.outcome && `경과: ${caseData.outcome}`,
    ]
      .filter(Boolean)
      .join("\n");

    const result = await summarizeCase(content);

    await prisma.case.update({
      where: { id },
      data: {
        summary: result.summary,
        learningPoints: result.keyPoints.join("\n"),
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Summarize error:", error);
    return NextResponse.json({ error: "AI 요약에 실패했습니다." }, { status: 500 });
  }
}
