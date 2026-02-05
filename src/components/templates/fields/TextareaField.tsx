"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldDefinition } from "@/templates";

interface TextareaFieldProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TextareaField({
  field,
  value,
  onChange,
  disabled,
}: TextareaFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.key}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Textarea
        id={field.key}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        disabled={disabled}
        rows={2}
        className="resize-y min-h-[60px]"
      />
    </div>
  );
}
