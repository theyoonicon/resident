"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FieldDefinition } from "@/templates";

interface CheckboxFieldProps {
  field: FieldDefinition;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function CheckboxField({
  field,
  value,
  onChange,
  disabled,
}: CheckboxFieldProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={field.key}
        checked={value || false}
        onCheckedChange={(checked) => onChange(checked === true)}
        disabled={disabled}
      />
      <Label htmlFor={field.key} className="cursor-pointer">
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
    </div>
  );
}
