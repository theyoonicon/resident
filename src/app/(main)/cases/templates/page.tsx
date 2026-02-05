"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Loader2,
  LayoutTemplate,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Section {
  key: string;
  title: string;
  titleEn?: string;
  order: number;
}

interface Field {
  key: string;
  label: string;
  labelEn?: string;
  type: "text" | "textarea" | "select" | "date" | "number" | "checkbox" | "multiselect";
  required: boolean;
  section: string;
  order: number;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface Template {
  id: string;
  key: string;
  name: string;
  nameEn?: string;
  sections: Section[];
  fields: Field[];
  isSystem: boolean;
  isActive?: boolean;
  sectionsCount?: number;
  fieldsCount?: number;
}

const FIELD_TYPES = [
  { value: "text", label: "텍스트 (한 줄)" },
  { value: "textarea", label: "텍스트 (여러 줄)" },
  { value: "select", label: "선택 (단일)" },
  { value: "multiselect", label: "선택 (다중)" },
  { value: "number", label: "숫자" },
  { value: "date", label: "날짜" },
  { value: "checkbox", label: "체크박스" },
];

// Sortable Section Component
function SortableSection({
  section,
  sectionFields,
  isExpanded,
  onToggle,
  onUpdate,
  onRemove,
  onAddField,
  onUpdateField,
  onRemoveField,
  onFieldDragEnd,
}: {
  section: Section;
  sectionFields: Field[];
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<Section>) => void;
  onRemove: () => void;
  onAddField: () => void;
  onUpdateField: (key: string, updates: Partial<Field>) => void;
  onRemoveField: (key: string) => void;
  onFieldDragEnd: (event: DragEndEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.key,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg">
      {/* Section Header */}
      <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button {...attributes} {...listeners} className="touch-none cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <Input
            value={section.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="h-8 w-24 sm:w-48 font-medium"
          />
          <Badge variant="secondary" className="hidden sm:inline-flex">{sectionFields.length}개</Badge>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onAddField}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <button onClick={onToggle} className="p-1">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Fields */}
      {isExpanded && (
        <div className="p-3 pt-0 space-y-2">
          <Separator />
          {sectionFields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              필드가 없습니다.{" "}
              <button className="text-primary hover:underline" onClick={onAddField}>
                필드 추가
              </button>
            </p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onFieldDragEnd}>
              <SortableContext items={sectionFields.map((f) => f.key)} strategy={verticalListSortingStrategy}>
                {sectionFields.map((field) => (
                  <SortableField
                    key={field.key}
                    field={field}
                    onUpdate={(updates) => onUpdateField(field.key, updates)}
                    onRemove={() => onRemoveField(field.key)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
}

// Sortable Field Component
function SortableField({
  field,
  onUpdate,
  onRemove,
}: {
  field: Field;
  onUpdate: (updates: Partial<Field>) => void;
  onRemove: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.key,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 옵션 추가 (select/multiselect용)
  const addOption = () => {
    const currentOptions = field.options || [];
    const newOption = { value: `option-${Date.now()}`, label: `옵션 ${currentOptions.length + 1}` };
    onUpdate({ options: [...currentOptions, newOption] });
  };

  // 옵션 수정
  const updateOption = (index: number, label: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = { ...newOptions[index], label, value: label.toLowerCase().replace(/\s+/g, "-") || newOptions[index].value };
    onUpdate({ options: newOptions });
  };

  // 옵션 삭제
  const removeOption = (index: number) => {
    const newOptions = (field.options || []).filter((_, i) => i !== index);
    onUpdate({ options: newOptions });
  };

  // 필드 타입 변경 시 옵션 초기화
  const handleTypeChange = (newType: Field["type"]) => {
    const updates: Partial<Field> = { type: newType };
    // select/multiselect로 변경 시 기본 옵션 추가
    if ((newType === "select" || newType === "multiselect") && (!field.options || field.options.length === 0)) {
      updates.options = [
        { value: "option-1", label: "옵션 1" },
        { value: "option-2", label: "옵션 2" },
      ];
      setIsExpanded(true);
    }
    onUpdate(updates);
  };

  const needsOptions = field.type === "select" || field.type === "multiselect";
  const needsExpand = needsOptions || field.type === "textarea" || field.type === "text";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded border bg-background"
    >
      {/* 기본 행 */}
      <div className="flex items-center gap-2 p-2">
        <button {...attributes} {...listeners} className="touch-none cursor-grab active:cursor-grabbing flex-shrink-0">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
        <Input
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="h-8 flex-1 min-w-0"
          placeholder="필드 이름"
        />
        <Select value={field.type} onValueChange={handleTypeChange}>
          <SelectTrigger className="h-8 w-20 sm:w-32 flex-shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FIELD_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {needsExpand && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive flex-shrink-0" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* 확장 영역 - 타입별 설정 */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t bg-muted/30 space-y-3">
          {/* placeholder (text, textarea) */}
          {(field.type === "text" || field.type === "textarea") && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Placeholder</Label>
              <Input
                value={field.placeholder || ""}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                placeholder="입력 힌트 텍스트"
                className="h-8"
              />
            </div>
          )}

          {/* 옵션 목록 (select, multiselect) */}
          {needsOptions && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                옵션 목록 {field.type === "multiselect" && "(다중 선택 가능)"}
              </Label>
              <div className="space-y-1">
                {(field.options || []).map((option, index) => (
                  <div key={option.value} className="flex items-center gap-2">
                    {field.type === "select" ? (
                      <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded border-2 border-muted-foreground/30 flex-shrink-0" />
                    )}
                    <Input
                      value={option.label}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="h-7 flex-1"
                      placeholder={`옵션 ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-7 text-xs"
                onClick={addOption}
              >
                <Plus className="h-3 w-3 mr-1" />
                옵션 추가
              </Button>
            </div>
          )}

          {/* 필수 여부 */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id={`required-${field.key}`}
              checked={field.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor={`required-${field.key}`} className="text-xs cursor-pointer">
              필수 입력 항목
            </Label>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TemplatesSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [systemTemplates, setSystemTemplates] = useState<Template[]>([]);
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);

  // Editor state
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formNameEn, setFormNameEn] = useState("");
  const [formKey, setFormKey] = useState("");
  const [formSections, setFormSections] = useState<Section[]>([]);
  const [formFields, setFormFields] = useState<Field[]>([]);

  // Section/Field editor
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/templates");
      if (res.ok) {
        const data = await res.json();
        setSystemTemplates(data.systemTemplates || []);
        setCustomTemplates(data.customTemplates || []);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      toast.error("템플릿 로드 실패");
    } finally {
      setLoading(false);
    }
  };

  const startCreate = () => {
    setFormName("");
    setFormNameEn("");
    setFormKey("");
    setFormSections([{ key: "main", title: "기본 정보", order: 0 }]);
    setFormFields([]);
    setExpandedSections(new Set(["main"]));
    setIsCreating(true);
    setEditingTemplate(null);
  };

  const startEdit = async (template: Template) => {
    if (template.isSystem) {
      // Load full system template to copy
      try {
        const res = await fetch(`/api/templates/${template.id}`);
        if (res.ok) {
          const data = await res.json();
          setFormName(data.name + " (복사본)");
          setFormNameEn(data.nameEn ? data.nameEn + " (Copy)" : "");
          setFormKey(data.key + "-copy-" + Date.now().toString(36));
          setFormSections(data.sections || []);
          setFormFields(data.fields || []);
          setExpandedSections(new Set(data.sections?.map((s: Section) => s.key) || []));
          setIsCreating(true);
          setEditingTemplate(null);
          toast.info("시스템 템플릿을 복사하여 새 템플릿을 만듭니다");
        }
      } catch (error) {
        console.error("Failed to load template:", error);
        toast.error("템플릿 로드 실패");
      }
      return;
    }

    try {
      const res = await fetch(`/api/templates/${template.id}`);
      if (res.ok) {
        const data = await res.json();
        setFormName(data.name);
        setFormNameEn(data.nameEn || "");
        setFormKey(data.key);
        setFormSections(data.sections || []);
        setFormFields(data.fields || []);
        setExpandedSections(new Set(data.sections?.map((s: Section) => s.key) || []));
        setEditingTemplate(data);
        setIsCreating(false);
      }
    } catch (error) {
      console.error("Failed to load template:", error);
      toast.error("템플릿 로드 실패");
    }
  };

  const handleSave = async () => {
    if (!formName.trim() || !formKey.trim()) {
      toast.error("이름과 키는 필수입니다");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        key: formKey.trim().toLowerCase().replace(/\s+/g, "-"),
        name: formName.trim(),
        nameEn: formNameEn.trim() || undefined,
        sections: formSections,
        fields: formFields,
      };

      let res;
      if (editingTemplate) {
        res = await fetch(`/api/templates/${editingTemplate.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        toast.success(editingTemplate ? "템플릿이 수정되었습니다" : "템플릿이 생성되었습니다");
        setEditingTemplate(null);
        setIsCreating(false);
        fetchTemplates();
      } else {
        const data = await res.json();
        toast.error(data.error || "저장 실패");
      }
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error("저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/templates/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("템플릿이 삭제되었습니다");
        fetchTemplates();
      } else {
        toast.error("삭제 실패");
      }
    } catch (error) {
      console.error("Failed to delete template:", error);
      toast.error("삭제 실패");
    } finally {
      setDeleteTarget(null);
    }
  };

  // Section management
  const addSection = () => {
    const newKey = `section-${Date.now()}`;
    setFormSections([
      ...formSections,
      { key: newKey, title: "새 섹션", order: formSections.length },
    ]);
    setExpandedSections((prev) => new Set([...prev, newKey]));
  };

  const updateSection = (key: string, updates: Partial<Section>) => {
    setFormSections(formSections.map((s) => (s.key === key ? { ...s, ...updates } : s)));
  };

  const removeSection = (key: string) => {
    setFormSections(formSections.filter((s) => s.key !== key));
    setFormFields(formFields.filter((f) => f.section !== key));
  };

  // Field management
  const addField = (sectionKey: string) => {
    const sectionFields = formFields.filter((f) => f.section === sectionKey);
    const newField: Field = {
      key: `field-${Date.now()}`,
      label: "새 필드",
      type: "text",
      required: false,
      section: sectionKey,
      order: sectionFields.length,
    };
    setFormFields([...formFields, newField]);
  };

  const updateField = (key: string, updates: Partial<Field>) => {
    setFormFields(formFields.map((f) => (f.key === key ? { ...f, ...updates } : f)));
  };

  const removeField = (key: string) => {
    setFormFields(formFields.filter((f) => f.key !== key));
  };

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Handle section drag end
  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFormSections((items) => {
        const oldIndex = items.findIndex((item) => item.key === active.id);
        const newIndex = items.findIndex((item) => item.key === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update order values
        return newItems.map((item, index) => ({ ...item, order: index }));
      });
    }
  };

  // Handle field drag end within a section
  const handleFieldDragEnd = (sectionKey: string) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFormFields((items) => {
        const sectionFields = items.filter((f) => f.section === sectionKey);
        const otherFields = items.filter((f) => f.section !== sectionKey);

        const oldIndex = sectionFields.findIndex((item) => item.key === active.id);
        const newIndex = sectionFields.findIndex((item) => item.key === over.id);
        const newSectionFields = arrayMove(sectionFields, oldIndex, newIndex).map((item, index) => ({
          ...item,
          order: index,
        }));

        return [...otherFields, ...newSectionFields];
      });
    }
  };

  // Render template list
  const renderTemplateList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">나만의 케이스 템플릿을 만들어보세요</p>
        <Button onClick={startCreate}>
          <Plus className="h-4 w-4 mr-2" />
          새 템플릿
        </Button>
      </div>

      {/* Custom Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5" />
            내 템플릿
          </CardTitle>
          <CardDescription>직접 만든 커스텀 템플릿</CardDescription>
        </CardHeader>
        <CardContent>
          {customTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <LayoutTemplate className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>아직 만든 템플릿이 없습니다</p>
              <Button variant="link" onClick={startCreate}>
                첫 템플릿 만들기
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {customTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {template.sectionsCount}개 섹션 · {template.fieldsCount}개 필드
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(template)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setDeleteTarget(template)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Templates */}
      <Card>
        <CardHeader>
          <CardTitle>시스템 템플릿</CardTitle>
          <CardDescription>기본 제공 템플릿 (복사하여 수정 가능)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {systemTemplates.map((template) => (
              <div
                key={template.id}
                className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => startEdit(template)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{template.name}</span>
                  <Copy className="h-3 w-3 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {template.sectionsCount}개 섹션 · {template.fieldsCount}개 필드
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Render template editor
  const renderEditor = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setEditingTemplate(null);
            setIsCreating(false);
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          목록으로
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          저장
        </Button>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>템플릿 이름 *</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="예: 정형외과"
              />
            </div>
            <div className="space-y-2">
              <Label>영문 이름</Label>
              <Input
                value={formNameEn}
                onChange={(e) => setFormNameEn(e.target.value)}
                placeholder="예: Orthopedics"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>템플릿 키 *</Label>
            <Input
              value={formKey}
              onChange={(e) => setFormKey(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              placeholder="예: orthopedics"
              disabled={!!editingTemplate}
            />
            <p className="text-xs text-muted-foreground">
              영문 소문자와 하이픈만 사용 가능. 생성 후 변경 불가
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sections & Fields */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>섹션 및 필드</CardTitle>
            <CardDescription>케이스 작성 시 입력할 항목들</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={addSection}>
            <Plus className="h-4 w-4 mr-1" />
            섹션 추가
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
            <SortableContext
              items={formSections.sort((a, b) => a.order - b.order).map((s) => s.key)}
              strategy={verticalListSortingStrategy}
            >
              {formSections
                .sort((a, b) => a.order - b.order)
                .map((section) => {
                  const sectionFields = formFields
                    .filter((f) => f.section === section.key)
                    .sort((a, b) => a.order - b.order);
                  const isExpanded = expandedSections.has(section.key);

                  return (
                    <SortableSection
                      key={section.key}
                      section={section}
                      sectionFields={sectionFields}
                      isExpanded={isExpanded}
                      onToggle={() => toggleSection(section.key)}
                      onUpdate={(updates) => updateSection(section.key, updates)}
                      onRemove={() => removeSection(section.key)}
                      onAddField={() => addField(section.key)}
                      onUpdateField={updateField}
                      onRemoveField={removeField}
                      onFieldDragEnd={handleFieldDragEnd(section.key)}
                    />
                  );
                })}
            </SortableContext>
          </DndContext>

          {formSections.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>섹션을 추가하여 시작하세요</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      {editingTemplate || isCreating ? renderEditor() : renderTemplateList()}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>템플릿을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleteTarget?.name}&quot; 템플릿이 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <Button variant="destructive" onClick={handleDelete}>
              삭제
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
