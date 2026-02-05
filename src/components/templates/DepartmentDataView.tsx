"use client";

import { useMemo } from "react";
import { getTemplate, DepartmentKey, DepartmentData } from "@/templates";
import { Badge } from "@/components/ui/badge";
import { SectionDefinition, FieldDefinition } from "@/templates/types";

interface CustomTemplateData {
  name: string;
  sections: SectionDefinition[];
  fields: FieldDefinition[];
}

interface DepartmentDataViewProps {
  department: string;
  departmentData: DepartmentData | null;
  templateVersion?: string | null;
  customTemplate?: CustomTemplateData | null;
}

export function DepartmentDataView({
  department,
  departmentData,
  templateVersion,
  customTemplate,
}: DepartmentDataViewProps) {
  // 커스텀 템플릿이면 customTemplate 사용, 아니면 시스템 템플릿
  const template = useMemo(() => {
    if (customTemplate) {
      return {
        sections: customTemplate.sections,
        fields: customTemplate.fields,
      };
    }
    try {
      const sysTemplate = getTemplate(department as DepartmentKey);
      return {
        sections: sysTemplate.sections,
        fields: sysTemplate.fields,
      };
    } catch {
      return null;
    }
  }, [department, customTemplate]);

  if (!template || !departmentData) {
    return null;
  }

  const sortedSections = [...template.sections].sort((a, b) => a.order - b.order);

  const fieldsBySection = useMemo(() => {
    const grouped: Record<string, typeof template.fields> = {};
    for (const field of template.fields) {
      if (!grouped[field.section]) {
        grouped[field.section] = [];
      }
      grouped[field.section].push(field);
    }
    return grouped;
  }, [template.fields]);

  const renderFieldValue = (field: typeof template.fields[0], value: unknown) => {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    switch (field.type) {
      case "select": {
        const option = field.options?.find((opt) => opt.value === value);
        return <span>{option?.label || String(value)}</span>;
      }
      case "multiselect": {
        const values = Array.isArray(value) ? value : [];
        if (values.length === 0) return null;
        return (
          <div className="flex flex-wrap gap-1">
            {values.map((v) => {
              const option = field.options?.find((opt) => opt.value === v);
              return (
                <Badge key={v} variant="outline" className="text-xs">
                  {option?.label || v}
                </Badge>
              );
            })}
          </div>
        );
      }
      case "checkbox":
        return <span>{value ? "예" : "아니오"}</span>;
      case "date":
        return <span>{String(value)}</span>;
      default:
        return <span className="whitespace-pre-wrap">{String(value)}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 섹션별 데이터 */}
      {sortedSections.map((section) => {
        const sectionFields = fieldsBySection[section.key] || [];
        const fieldsWithData = sectionFields
          .filter((f) => {
            const value = departmentData[f.key];
            return value !== null && value !== undefined && value !== "";
          })
          .sort((a, b) => a.order - b.order);

        if (fieldsWithData.length === 0) return null;

        return (
          <section key={section.key} className="space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground border-b pb-2">
              {section.title}
            </h2>
            <div className="space-y-3">
              {fieldsWithData.map((field) => {
                const value = departmentData[field.key];
                const renderedValue = renderFieldValue(field, value);
                if (!renderedValue) return null;

                return (
                  <div key={field.key} className="space-y-1">
                    <h3 className="text-xs font-medium text-muted-foreground">
                      {field.label}
                    </h3>
                    <div className="text-sm">{renderedValue}</div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
