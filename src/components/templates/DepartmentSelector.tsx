"use client";

import { useEffect, useState } from "react";
import { DEPARTMENTS, DepartmentKey } from "@/templates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";
import { TemplateManagerModal } from "./TemplateManagerModal";

interface CustomTemplate {
  id: string;
  key: string;
  name: string;
  nameEn?: string;
}

interface DepartmentSelectorProps {
  value: string;
  onChange: (value: string, isCustom?: boolean) => void;
  disabled?: boolean;
}

// 기본 활성화 템플릿
const DEFAULT_TEMPLATES: DepartmentKey[] = [
  "internal-medicine",
  "surgery",
  "emergency",
  "radiology",
  "pathology",
];

export function DepartmentSelector({
  value,
  onChange,
  disabled,
}: DepartmentSelectorProps) {
  const [enabledTemplates, setEnabledTemplates] = useState<DepartmentKey[]>(DEFAULT_TEMPLATES);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // Fetch enabled system templates
        const settingsRes = await fetch("/api/settings/templates");
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setEnabledTemplates(data.enabledTemplates || DEFAULT_TEMPLATES);
        }

        // Fetch custom templates
        const templatesRes = await fetch("/api/templates");
        if (templatesRes.ok) {
          const data = await templatesRes.json();
          setCustomTemplates(data.customTemplates || []);
        }
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  // Filter departments based on enabled templates
  const filteredDepartments = DEPARTMENTS.filter((dept) =>
    enabledTemplates.includes(dept.key)
  );

  const handleChange = (selectedValue: string) => {
    // Check if it's a custom template (prefixed with "custom:")
    if (selectedValue.startsWith("custom:")) {
      onChange(selectedValue.replace("custom:", ""), true);
    } else {
      onChange(selectedValue, false);
    }
  };

  // Determine the display value
  const displayValue = customTemplates.find((ct) => ct.key === value)
    ? `custom:${value}`
    : value;

  const refreshTemplates = () => {
    // Refetch templates when modal changes settings
    const fetchData = async () => {
      try {
        const settingsRes = await fetch("/api/settings/templates");
        if (settingsRes.ok) {
          const data = await settingsRes.json();
          setEnabledTemplates(data.enabledTemplates || DEFAULT_TEMPLATES);
        }
        const templatesRes = await fetch("/api/templates");
        if (templatesRes.ok) {
          const data = await templatesRes.json();
          setCustomTemplates(data.customTemplates || []);
        }
      } catch (error) {
        console.error("Failed to refresh templates:", error);
      }
    };
    fetchData();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="department">진료과 선택</Label>
        <TemplateManagerModal onTemplatesChange={refreshTemplates} />
      </div>
      <Select
        value={displayValue}
        onValueChange={handleChange}
        disabled={disabled || loading}
      >
        <SelectTrigger id="department" className="w-full">
          <SelectValue placeholder={loading ? "로딩 중..." : "진료과를 선택하세요"} />
        </SelectTrigger>
        <SelectContent>
          {/* Custom templates first */}
          {customTemplates.length > 0 && (
            <>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Star className="h-3 w-3" />
                내 템플릿
              </div>
              {customTemplates.map((template) => (
                <SelectItem key={template.id} value={`custom:${template.key}`}>
                  {template.name}
                </SelectItem>
              ))}
              <Separator className="my-1" />
            </>
          )}

          {/* System templates */}
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            시스템 템플릿
          </div>
          {filteredDepartments.map((dept) => (
            <SelectItem key={dept.key} value={dept.key}>
              {dept.name}
            </SelectItem>
          ))}

          {filteredDepartments.length === 0 && customTemplates.length === 0 && (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              활성화된 템플릿이 없습니다
            </div>
          )}
        </SelectContent>
      </Select>
      {filteredDepartments.length < DEPARTMENTS.length && (
        <p className="text-xs text-muted-foreground">
          더 많은 템플릿을 활성화하려면 템플릿 관리를 이용하세요
        </p>
      )}
    </div>
  );
}
