import { DEPARTMENTS } from "@/templates";
import { getTemplate, DepartmentKey } from "@/templates";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface CaseData {
  id: string;
  title: string;
  department: string;
  date: Date | null;
  ageGroup: string | null;
  gender: string | null;
  chiefComplaint: string | null;
  history: string | null;
  examination: string | null;
  diagnosis: string | null;
  treatment: string | null;
  outcome: string | null;
  learningPoints: string | null;
  rawContent: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  departmentData: any;
  templateVersion: string | null;
  tags: { tag: { name: string } }[];
  images: { url: string; caption: string | null }[];
  createdAt: Date;
}

export function generateMarkdown(caseData: CaseData): string {
  const lines: string[] = [];
  const departmentInfo = DEPARTMENTS.find((d) => d.key === caseData.department);

  lines.push(`# ${caseData.title}`);
  lines.push("");

  const meta: string[] = [];
  if (departmentInfo) meta.push(`**진료과:** ${departmentInfo.name}`);
  if (caseData.date) {
    meta.push(
      `**날짜:** ${format(caseData.date, "yyyy년 MM월 dd일", { locale: ko })}`
    );
  }
  if (caseData.ageGroup) meta.push(`**연령대:** ${caseData.ageGroup}`);
  if (caseData.gender)
    meta.push(`**성별:** ${caseData.gender === "M" ? "남" : "여"}`);

  if (meta.length > 0) {
    lines.push(meta.join(" | "));
    lines.push("");
  }

  if (caseData.tags.length > 0) {
    lines.push(
      `**태그:** ${caseData.tags.map((t) => `#${t.tag.name}`).join(" ")}`
    );
    lines.push("");
  }

  lines.push("---");
  lines.push("");

  if (
    caseData.departmentData &&
    Object.keys(caseData.departmentData).length > 0
  ) {
    try {
      const template = getTemplate(caseData.department as DepartmentKey);
      const sortedSections = [...template.sections].sort(
        (a, b) => a.order - b.order
      );

      for (const section of sortedSections) {
        const sectionFields = template.fields
          .filter((f) => f.section === section.key)
          .sort((a, b) => a.order - b.order);

        const fieldsWithData = sectionFields.filter((f) => {
          const value = caseData.departmentData?.[f.key];
          return value !== null && value !== undefined && value !== "";
        });

        if (fieldsWithData.length === 0) continue;

        lines.push(`## ${section.title}`);
        lines.push("");

        for (const field of fieldsWithData) {
          const value = caseData.departmentData?.[field.key];
          lines.push(`### ${field.label}`);
          lines.push("");

          if (Array.isArray(value)) {
            lines.push(value.join(", "));
          } else {
            lines.push(String(value));
          }
          lines.push("");
        }
      }
    } catch {
      addLegacyFields(lines, caseData);
    }
  } else {
    addLegacyFields(lines, caseData);
  }

  if (caseData.images.length > 0) {
    lines.push("## 이미지");
    lines.push("");
    for (const img of caseData.images) {
      lines.push(`![${img.caption || "Case Image"}](${img.url})`);
      if (img.caption) lines.push(`*${img.caption}*`);
      lines.push("");
    }
  }

  if (caseData.rawContent) {
    lines.push("## 원본 차트");
    lines.push("");
    lines.push("```");
    lines.push(caseData.rawContent);
    lines.push("```");
    lines.push("");
  }

  lines.push("---");
  lines.push(
    `*생성일: ${format(caseData.createdAt, "yyyy년 MM월 dd일", { locale: ko })}*`
  );

  return lines.join("\n");
}

function addLegacyFields(lines: string[], caseData: CaseData) {
  if (caseData.chiefComplaint) {
    lines.push("## 주호소 (C.C)");
    lines.push("");
    lines.push(caseData.chiefComplaint);
    lines.push("");
  }

  if (caseData.history) {
    lines.push("## 병력 (Hx)");
    lines.push("");
    lines.push(caseData.history);
    lines.push("");
  }

  if (caseData.examination) {
    lines.push("## 검사 소견");
    lines.push("");
    lines.push(caseData.examination);
    lines.push("");
  }

  if (caseData.diagnosis) {
    lines.push("## 진단 (Dx)");
    lines.push("");
    lines.push(caseData.diagnosis);
    lines.push("");
  }

  if (caseData.treatment) {
    lines.push("## 치료 (Tx)");
    lines.push("");
    lines.push(caseData.treatment);
    lines.push("");
  }

  if (caseData.outcome) {
    lines.push("## 결과");
    lines.push("");
    lines.push(caseData.outcome);
    lines.push("");
  }

  if (caseData.learningPoints) {
    lines.push("## Learning Points");
    lines.push("");
    lines.push(caseData.learningPoints);
    lines.push("");
  }
}

export function generatePublicId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
