"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldDefinition } from "@/templates";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiselectFieldProps {
  field: FieldDefinition;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function MultiselectField({
  field,
  value = [],
  onChange,
  disabled,
}: MultiselectFieldProps) {
  const selectedLabels = field.options
    ?.filter((opt) => value.includes(opt.value))
    .map((opt) => opt.label);

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemove = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal",
              !value.length && "text-muted-foreground"
            )}
          >
            {value.length > 0 ? `${value.length}개 선택됨` : "선택하세요"}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2" align="start">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {field.options?.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded cursor-pointer"
                onClick={() => handleToggle(option.value)}
              >
                <Checkbox
                  checked={value.includes(option.value)}
                  onCheckedChange={() => handleToggle(option.value)}
                />
                <span className="text-sm">{option.label}</span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {field.options
            ?.filter((opt) => value.includes(opt.value))
            .map((opt) => (
              <Badge
                key={opt.value}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => !disabled && handleRemove(opt.value)}
              >
                {opt.label}
                {!disabled && <X className="ml-1 h-3 w-3" />}
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
}
