"use client";

import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface RawContentToggleProps {
  content: string;
}

export function RawContentToggle({ content }: RawContentToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="space-y-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <FileText className="h-4 w-4" />
        <span>차트 원본 보기</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="p-3 bg-muted/50 rounded-lg">
          <pre className="text-xs whitespace-pre-wrap font-mono">{content}</pre>
        </div>
      )}
    </section>
  );
}
