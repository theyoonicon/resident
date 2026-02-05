import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { geminiFlash } from "@/lib/gemini";
import { DDX_PROMPT, PLAN_PROMPT, QUESTIONS_PROMPT } from "@/lib/chart-ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "인증 필요" }, { status: 401 });
    }

    const { chartText, patientInfo, analysisType, images } = await request.json();

    if (!chartText || chartText.trim().length < 10) {
      return NextResponse.json({ error: "차트 내용을 10자 이상 입력해주세요." }, { status: 400 });
    }

    const promptMap: Record<string, string> = {
      ddx: DDX_PROMPT,
      plan: PLAN_PROMPT,
      questions: QUESTIONS_PROMPT,
    };

    const systemPrompt = promptMap[analysisType] || DDX_PROMPT;

    const userContent = `환자 정보: ${patientInfo?.age || "미상"}세 ${patientInfo?.sex === "male" ? "남" : patientInfo?.sex === "female" ? "여" : "미상"}

차트 내용:
${chartText}`;

    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: systemPrompt + "\n\n" + userContent },
    ];

    // Add images if provided
    if (images && images.length > 0) {
      for (const img of images.slice(0, 3)) {
        if (img.base64 && img.mimeType) {
          parts.push({
            inlineData: {
              mimeType: img.mimeType,
              data: img.base64,
            },
          });
        }
      }
    }

    const result = await geminiFlash.generateContent(parts);
    const text = result.response.text();

    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ success: true, data: parsed, raw: text });
      } catch {
        return NextResponse.json({ success: true, data: null, raw: text });
      }
    }

    return NextResponse.json({ success: true, data: null, raw: text });
  } catch (error) {
    console.error("Chart AI error:", error);
    return NextResponse.json({ error: "AI 분석에 실패했습니다." }, { status: 500 });
  }
}
