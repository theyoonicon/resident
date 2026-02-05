"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface CaseDetailContentProps {
  chartContent: React.ReactNode;
  templateContent: React.ReactNode;
  hasTemplate: boolean;
}

export function CaseDetailContent({
  chartContent,
  templateContent,
  hasTemplate,
}: CaseDetailContentProps) {
  const [activeTab, setActiveTab] = useState<"chart" | "template">("chart");

  // 템플릿 데이터가 없으면 차트만 단일 컬럼으로 표시
  if (!hasTemplate) {
    return <div>{chartContent}</div>;
  }

  return (
    <div>
      {/* 모바일 탭 */}
      <div className="border-b md:hidden mb-4">
        <div className="flex">
          <button
            onClick={() => setActiveTab("chart")}
            className={cn(
              "flex-1 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "chart"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            )}
          >
            차트 원본
          </button>
          <button
            onClick={() => setActiveTab("template")}
            className={cn(
              "flex-1 py-2 text-sm font-medium border-b-2 transition-colors",
              activeTab === "template"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            )}
          >
            AI 요약
          </button>
        </div>
      </div>

      {/* PC: 2단 레이아웃 */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-6">
        <div>{chartContent}</div>
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground border-b pb-2 mb-4">AI 요약 / 템플릿</h2>
          {templateContent}
        </div>
      </div>

      {/* 모바일: 탭 전환 */}
      <div className="md:hidden">
        <div className={activeTab === "chart" ? "block" : "hidden"}>
          {chartContent}
        </div>
        <div className={activeTab === "template" ? "block" : "hidden"}>
          {templateContent}
        </div>
      </div>
    </div>
  );
}
