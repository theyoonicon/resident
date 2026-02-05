"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface Props {
  caseId: string;
}

export function AISummaryButton({ caseId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/summarize`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("AI 요약 실패");

      toast.success("AI 요약이 완료되었습니다");
      router.refresh();
    } catch {
      toast.error("AI 요약 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-dashed">
      <CardContent className="flex items-center justify-center py-6">
        <Button variant="outline" onClick={handleSummarize} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          AI로 요약하기
        </Button>
      </CardContent>
    </Card>
  );
}
