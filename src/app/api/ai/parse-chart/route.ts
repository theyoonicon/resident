import { NextRequest, NextResponse } from "next/server";
import { geminiFlash, validateMedicalContent } from "@/lib/gemini";
import {
  getAiPrompt,
  DepartmentKey,
  getTemplate,
  FieldDefinition,
} from "@/templates";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const { content, department, isCustomTemplate } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "내용이 필요합니다" },
        { status: 400 }
      );
    }

    if (!department) {
      return NextResponse.json(
        { error: "진료과를 선택해주세요" },
        { status: 400 }
      );
    }

    // 1. 먼저 의료 내용인지 검증
    const validation = await validateMedicalContent(content);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "의료 관련 내용이 아닌 것 같습니다",
          reason: validation.reason,
        },
        { status: 400 }
      );
    }

    // 과별 템플릿의 AI 프롬프트와 필드 가져오기
    let aiPrompt: string;
    let templateFields: FieldDefinition[];

    if (isCustomTemplate) {
      // 커스텀 템플릿: DB에서 가져오기
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: "인증이 필요합니다" },
          { status: 401 }
        );
      }

      const customTemplate = await prisma.caseTemplate.findFirst({
        where: {
          key: department,
          userId: session.user.id,
          isActive: true,
        },
      });

      if (!customTemplate) {
        return NextResponse.json(
          { error: "템플릿을 찾을 수 없습니다" },
          { status: 404 }
        );
      }

      // DB에서 가져온 aiPrompt와 fields 사용
      aiPrompt = customTemplate.aiPrompt || "";
      templateFields =
        (customTemplate.fields as unknown as FieldDefinition[]) || [];

      // aiPrompt가 없으면 자동 생성
      if (!aiPrompt) {
        const fieldDescriptions = templateFields
          .map((f) => `- ${f.key}: ${f.label}`)
          .join("\n");
        aiPrompt = `당신은 의료 전문가입니다. 다음 ${customTemplate.name} 기록을 분석하여 구조화된 JSON으로 추출해주세요.

추출할 필드:
${fieldDescriptions}

JSON 형식으로만 반환하세요.`;
      }
    } else {
      // 시스템 템플릿: 기존 방식
      try {
        aiPrompt = getAiPrompt(department as DepartmentKey);
        const template = getTemplate(department as DepartmentKey);
        templateFields = template.fields;
      } catch {
        return NextResponse.json(
          { error: "유효하지 않은 진료과입니다" },
          { status: 400 }
        );
      }
    }

    // 공통 언어 규칙 추가
    const languageRules = `
**언어 규칙:**
- 의학용어/약어는 영어: STEMI, HTN, DM, PCI, C.C, V/S, BP, HR, SpO2, ECG, Lab, Troponin 등
- 일반 단어/조사/서술어는 한글: ~으로 내원, 호전, 퇴원, 시행, 발생, 병력, 소견 등
- 예시: "HTN/DM 병력", "chest pain으로 ER 내원", "PCI 시행 후 호전"

`;

    const fullPrompt = `${aiPrompt}

${languageRules}

분석할 차트 내용:
${content}

추가로 다음 필드도 반환해주세요:
- title: 이 케이스를 대표하는 제목 (진단명 기반, 간결하게)

반드시 유효한 JSON만 반환하세요.`;

    const result = await geminiFlash.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    // JSON 추출
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("JSON 파싱 실패");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // title 추출
    const title = parsed.title || "";
    delete parsed.title;

    // 과별 필드에 맞게 데이터 정리
    const departmentData: Record<string, unknown> = {};
    const validFieldKeys = new Set(templateFields.map((f) => f.key));

    for (const [key, value] of Object.entries(parsed)) {
      if (validFieldKeys.has(key)) {
        const field = templateFields.find((f) => f.key === key);
        if (field?.type === "multiselect") {
          if (Array.isArray(value)) {
            departmentData[key] = value.map(String);
          } else if (typeof value === "string") {
            departmentData[key] = value
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean);
          }
        } else if (field?.type === "checkbox") {
          departmentData[key] = Boolean(value);
        } else if (field?.type === "number") {
          departmentData[key] = value === null ? null : Number(value);
        } else {
          departmentData[key] = value === null ? null : String(value || "");
        }
      }
    }

    return NextResponse.json({
      title,
      departmentData,
    });
  } catch (error) {
    console.error("AI parse-chart error:", error);
    return NextResponse.json(
      { error: "차트 분석 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
