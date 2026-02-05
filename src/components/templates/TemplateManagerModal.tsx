"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Loader2, LayoutTemplate, Star, ExternalLink } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface TemplateItem {
  key: string;
  name: string;
  nameEn?: string;
  enabled: boolean;
  isCustom?: boolean;
  sectionsCount?: number;
  fieldsCount?: number;
}

interface TemplateManagerModalProps {
  trigger?: React.ReactNode;
  onTemplatesChange?: () => void;
}

export function TemplateManagerModal({ trigger, onTemplatesChange }: TemplateManagerModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [systemTemplates, setSystemTemplates] = useState<TemplateItem[]>([]);
  const [customTemplates, setCustomTemplates] = useState<TemplateItem[]>([]);

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings/templates");
      if (res.ok) {
        const data = await res.json();
        setSystemTemplates(data.templates || []);
      }

      // Fetch custom templates separately
      const customRes = await fetch("/api/templates");
      if (customRes.ok) {
        const customData = await customRes.json();
        setCustomTemplates(
          (customData.customTemplates || []).map((t: TemplateItem) => ({
            ...t,
            enabled: true, // custom templates are always enabled
            isCustom: true,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string) => {
    const updatedTemplates = systemTemplates.map((t) =>
      t.key === key ? { ...t, enabled: !t.enabled } : t
    );

    // Check at least one enabled
    const enabledCount = updatedTemplates.filter((t) => t.enabled).length;
    if (enabledCount === 0) {
      toast.error("최소 1개 이상의 템플릿을 선택해야 합니다");
      return;
    }

    setSystemTemplates(updatedTemplates);

    // Save immediately
    setSaving(true);
    try {
      const enabledTemplates = updatedTemplates
        .filter((t) => t.enabled)
        .map((t) => t.key);

      const res = await fetch("/api/settings/templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabledTemplates }),
      });

      if (!res.ok) throw new Error("Failed to save");
      toast.success("저장되었습니다");
      onTemplatesChange?.();
    } catch {
      // Revert on error
      setSystemTemplates(systemTemplates);
      toast.error("저장에 실패했습니다");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <Settings className="h-3 w-3" />
            템플릿 관리
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5" />
            템플릿 관리
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {/* Custom Templates */}
            {customTemplates.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Star className="h-4 w-4" />
                  내 템플릿
                </div>
                <div className="space-y-1">
                  {customTemplates.map((template) => (
                    <div
                      key={template.key}
                      className="flex items-center justify-between p-2 rounded-md border bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">커스텀</Badge>
                        <span className="text-sm font-medium">{template.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">항상 활성</span>
                    </div>
                  ))}
                </div>
                <Separator />
              </div>
            )}

            {/* System Templates */}
            <div className="space-y-2">
              <div className="text-sm font-medium">시스템 템플릿</div>
              <div className="grid grid-cols-2 gap-2">
                {systemTemplates.map((template) => (
                  <label
                    key={template.key}
                    className="flex items-center gap-2 p-2 rounded-md border hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <Checkbox
                      checked={template.enabled}
                      onCheckedChange={() => handleToggle(template.key)}
                      disabled={saving}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{template.name}</span>
                      {template.nameEn && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({template.nameEn})
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                선택한 템플릿만 새 케이스 작성 시 표시됩니다
              </p>
            </div>

            <Separator />

            {/* Link to full settings */}
            <Link
              href="/settings/templates"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div>
                <h4 className="text-sm font-medium">커스텀 템플릿 편집</h4>
                <p className="text-xs text-muted-foreground">
                  나만의 템플릿 생성, 수정, 삭제
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
