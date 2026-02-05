"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SectionDefinition, FieldDefinition, DepartmentData } from "@/templates";
import {
  TextField,
  TextareaField,
  SelectField,
  DateField,
  NumberField,
  CheckboxField,
  MultiselectField,
} from "./fields";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  section: SectionDefinition;
  fields: FieldDefinition[];
  data: DepartmentData;
  onChange: (key: string, value: DepartmentData[string]) => void;
  disabled?: boolean;
}

export function FormSection({
  section,
  fields,
  data,
  onChange,
  disabled,
}: FormSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(
    section.defaultCollapsed ?? false
  );

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  const renderField = (field: FieldDefinition) => {
    const value = data[field.key];

    switch (field.type) {
      case "text":
        return (
          <TextField
            key={field.key}
            field={field}
            value={value as string}
            onChange={(v) => onChange(field.key, v)}
            disabled={disabled}
          />
        );
      case "textarea":
        return (
          <TextareaField
            key={field.key}
            field={field}
            value={value as string}
            onChange={(v) => onChange(field.key, v)}
            disabled={disabled}
          />
        );
      case "select":
        return (
          <SelectField
            key={field.key}
            field={field}
            value={value as string}
            onChange={(v) => onChange(field.key, v)}
            disabled={disabled}
          />
        );
      case "date":
        return (
          <DateField
            key={field.key}
            field={field}
            value={value as string}
            onChange={(v) => onChange(field.key, v)}
            disabled={disabled}
          />
        );
      case "number":
        return (
          <NumberField
            key={field.key}
            field={field}
            value={value as number}
            onChange={(v) => onChange(field.key, v)}
            disabled={disabled}
          />
        );
      case "checkbox":
        return (
          <CheckboxField
            key={field.key}
            field={field}
            value={value as boolean}
            onChange={(v) => onChange(field.key, v)}
            disabled={disabled}
          />
        );
      case "multiselect":
        return (
          <MultiselectField
            key={field.key}
            field={field}
            value={(value as string[]) || []}
            onChange={(v) => onChange(field.key, v)}
            disabled={disabled}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => section.collapsible && setIsCollapsed(!isCollapsed)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-2 mb-2 text-left bg-muted/50 rounded-md",
          section.collapsible && "cursor-pointer hover:bg-muted"
        )}
      >
        {section.collapsible && (
          <span className="text-muted-foreground">
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        )}
        <h3 className="font-medium text-sm text-muted-foreground">
          {section.title}
        </h3>
      </button>

      {!isCollapsed && (
        <div className="space-y-3 pb-4">
          {sortedFields.map((field) => renderField(field))}
        </div>
      )}
    </div>
  );
}
