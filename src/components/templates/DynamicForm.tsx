"use client";

import { useMemo, useEffect, useState } from "react";
import { getTemplate, DepartmentKey, DepartmentData, SectionDefinition, FieldDefinition } from "@/templates";
import { FormSection } from "./FormSection";
import { Loader2 } from "lucide-react";

interface CustomTemplate {
  sections: SectionDefinition[];
  fields: FieldDefinition[];
}

interface DynamicFormProps {
  department: string;
  isCustomTemplate?: boolean;
  data: DepartmentData;
  onChange: (data: DepartmentData) => void;
  disabled?: boolean;
}

export function DynamicForm({
  department,
  isCustomTemplate,
  data,
  onChange,
  disabled,
}: DynamicFormProps) {
  const [customTemplate, setCustomTemplate] = useState<CustomTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch custom template if needed
  useEffect(() => {
    if (isCustomTemplate && department) {
      setLoading(true);
      fetch(`/api/templates/by-key/${department}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) {
            setCustomTemplate({
              sections: data.sections || [],
              fields: data.fields || [],
            });
          }
        })
        .catch((err) => console.error("Failed to fetch custom template:", err))
        .finally(() => setLoading(false));
    } else {
      setCustomTemplate(null);
    }
  }, [department, isCustomTemplate]);

  // Get template (system or custom)
  const template = useMemo(() => {
    if (isCustomTemplate && customTemplate) {
      return customTemplate;
    }
    if (!isCustomTemplate && department) {
      return getTemplate(department as DepartmentKey);
    }
    return { sections: [], fields: [] };
  }, [department, isCustomTemplate, customTemplate]);

  const sortedSections = useMemo(
    () => [...(template.sections || [])].sort((a, b) => a.order - b.order),
    [template.sections]
  );

  const fieldsBySection = useMemo(() => {
    const grouped: Record<string, FieldDefinition[]> = {};
    for (const field of (template.fields || [])) {
      if (!grouped[field.section]) {
        grouped[field.section] = [];
      }
      grouped[field.section].push(field);
    }
    return grouped;
  }, [template.fields]);

  const handleFieldChange = (key: string, value: DepartmentData[string]) => {
    onChange({
      ...data,
      [key]: value,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!template.sections || template.sections.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        템플릿을 선택하세요
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedSections.map((section) => (
        <FormSection
          key={section.key}
          section={section}
          fields={fieldsBySection[section.key] || []}
          data={data}
          onChange={handleFieldChange}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
