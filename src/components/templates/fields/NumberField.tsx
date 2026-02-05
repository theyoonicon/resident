"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldDefinition } from "@/templates";

interface NumberFieldProps {
  field: FieldDefinition;
  value: number | string;
  onChange: (value: number | null) => void;
  disabled?: boolean;
}

export function NumberField({
  field,
  value,
  onChange,
  disabled,
}: NumberFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      onChange(null);
    } else {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        onChange(num);
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.key}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={field.key}
        type="number"
        value={value ?? ""}
        onChange={handleChange}
        placeholder={field.placeholder}
        disabled={disabled}
        min={field.validation?.min}
        max={field.validation?.max}
      />
    </div>
  );
}
