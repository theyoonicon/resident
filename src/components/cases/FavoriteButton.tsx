"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  caseId: string;
  isFavorite: boolean;
}

export function FavoriteButton({ caseId, isFavorite: initialFavorite }: Props) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/favorite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      });

      if (!res.ok) throw new Error("실패");

      setIsFavorite(!isFavorite);
      toast.success(
        !isFavorite ? "즐겨찾기에 추가되었습니다" : "즐겨찾기에서 제거되었습니다"
      );
      router.refresh();
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      disabled={loading}
    >
      <Star
        className={`h-4 w-4 ${
          isFavorite ? "text-yellow-500 fill-yellow-500" : ""
        }`}
      />
    </Button>
  );
}
