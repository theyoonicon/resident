import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const geminiFlash = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export async function summarizeCase(content: string) {
  const prompt = `당신은 의학 교육 전문가입니다. 아래 임상 케이스를 분석하고 다음 형식의 JSON으로 응답해주세요:
{
  "summary": "케이스 요약 (3-5문장)",
  "keyPoints": ["핵심 학습 포인트 1", "핵심 학습 포인트 2", ...],
  "suggestedTags": ["태그1", "태그2", ...]
}

케이스:
${content}`;

  const result = await geminiFlash.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI 응답을 파싱할 수 없습니다");

  return JSON.parse(jsonMatch[0]) as {
    summary: string;
    keyPoints: string[];
    suggestedTags: string[];
  };
}

export async function validateMedicalContent(
  content: string
): Promise<{ isValid: boolean; reason?: string }> {
  const validationPrompt = `다음 텍스트가 의료/의학 관련 내용(환자 차트, 의무기록, 진료 기록, 검사 결과 등)인지 판단해주세요.

텍스트:
${content.slice(0, 1000)}

다음 JSON 형식으로만 응답하세요:
{
  "isValid": true 또는 false,
  "reason": "판단 이유 (한 문장)"
}

판단 기준:
- 환자 정보, 증상, 진단, 치료, 검사 결과 등 의료 관련 내용이 포함되어 있으면 true
- 의료와 무관한 일반 텍스트, 코드, 의미없는 문자열 등은 false
- 의학 용어나 약어(예: HTN, DM, BP, ECG 등)가 포함되어 있으면 true 가능성 높음

JSON만 반환하세요.`;

  try {
    const result = await geminiFlash.generateContent(validationPrompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        isValid: Boolean(parsed.isValid),
        reason: parsed.reason || undefined,
      };
    }
  } catch (error) {
    console.error("Validation error:", error);
  }

  return { isValid: true };
}
