"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FloatingNewCaseButton() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folder");
  const href = folderId ? `/cases/new?folder=${folderId}` : "/cases/new";

  return (
    <Button
      size="lg"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-40 md:hidden"
      onClick={() => router.push(href)}
    >
      <Plus className="h-6 w-6" />
      <span className="sr-only">새 케이스</span>
    </Button>
  );
}
