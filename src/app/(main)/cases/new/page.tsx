"use client";

import { Suspense, useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  ChevronDown,
  Save,
  Sparkles,
  Loader2,
  ImagePlus,
  X,
  Film,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DepartmentSelector, DynamicForm } from "@/components/templates";
import {
  DepartmentKey,
  DepartmentData,
  getTemplate,
  getTemplateVersion,
} from "@/templates";

interface MediaPreview {
  id: string;
  file: File;
  url: string;
  type: "image" | "video";
}

export default function NewCasePageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}>
      <NewCasePage />
    </Suspense>
  );
}

function NewCasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [media, setMedia] = useState<MediaPreview[]>([]);
  const [chartContent, setChartContent] = useState("");
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // 과 선택 및 템플릿 데이터
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [isCustomTemplate, setIsCustomTemplate] = useState(false);
  const [departmentData, setDepartmentData] = useState<DepartmentData>({});
  const [showTemplate, setShowTemplate] = useState(false);

  // 기본 폼 데이터 (제목, 폴더 등 공통)
  const [formData, setFormData] = useState({
    title: "",
    caseFolderId: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/case-folders")
      .then((res) => {
        if (!res.ok) return [];
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) return;
        const flat: { id: string; name: string }[] = [];
        const flatten = (folders: { id: string; name: string; children?: { id: string; name: string; children?: unknown[] }[] }[], prefix = "") => {
          folders.forEach((f) => {
            const name = prefix ? `${prefix} / ${f.name}` : f.name;
            flat.push({ id: f.id, name });
            if (f.children) flatten(f.children as typeof folders, name);
          });
        };
        flatten(data);
        setFolders(flat);

        // URL의 folder 파라미터로 기본 폴더 설정
        const defaultFolder = searchParams.get("folder");
        if (defaultFolder && flat.some((f) => f.id === defaultFolder)) {
          setFormData((prev) => ({ ...prev, caseFolderId: defaultFolder }));
        }
      })
      .catch(console.error);
  }, [searchParams]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (dept: string, isCustom?: boolean) => {
    setSelectedDepartment(dept);
    setIsCustomTemplate(!!isCustom);
    setDepartmentData({}); // 과 변경 시 데이터 초기화
  };

  // 파일 추가 공통 함수
  const addFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const mediaFiles = fileArray.filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );

    if (mediaFiles.length === 0) return;

    const newMedia: MediaPreview[] = mediaFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));

    setMedia((prev) => [...prev, ...newMedia]);
  }, []);

  const handleMediaAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    addFiles(files);
  };

  // 드래그 & 드롭 핸들러
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 자식 요소로 이동할 때는 무시
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      addFiles(files);
    }
  }, [addFiles]);

  // 클립보드 붙여넣기 핸들러
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/") || item.type.startsWith("video/")) {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        e.preventDefault();
        addFiles(files);
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [addFiles]);

  const handleMediaRemove = (id: string) => {
    setMedia((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleAISummary = async () => {
    if (!chartContent.trim()) {
      toast.error("차트 내용을 먼저 입력해주세요");
      return;
    }

    if (!selectedDepartment) {
      toast.error("진료과를 선택해주세요");
      return;
    }

    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/parse-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: chartContent,
          department: selectedDepartment,
          isCustomTemplate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.reason || data.error || "AI 분석 실패";
        toast.error(errorMsg);
        return;
      }

      // AI가 반환한 데이터로 departmentData 업데이트
      setDepartmentData(data.departmentData || {});

      // 제목이 있으면 업데이트
      if (data.title) {
        setFormData((prev) => ({ ...prev, title: data.title }));
      }

      setShowTemplate(true);
      toast.success("AI 분석 완료!");
    } catch {
      toast.error("AI 분석 중 오류가 발생했습니다");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 이미지 업로드
      let uploadedImages: { url: string; caption?: string }[] = [];
      if (media.length > 0) {
        const imageFiles = media.filter((m) => m.type === "image");
        if (imageFiles.length > 0) {
          const uploadFormData = new FormData();
          imageFiles.forEach((m) => uploadFormData.append("files", m.file));

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: uploadFormData,
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            uploadedImages = uploadData.files.map((f: { path: string }) => ({
              url: f.path,
            }));
          }
        }
      }

      // 템플릿 버전 결정 (템플릿 미선택 시 null)
      const templateVersion = selectedDepartment
        ? isCustomTemplate
          ? `custom:${selectedDepartment}:1.0.0`
          : getTemplateVersion(selectedDepartment as DepartmentKey)
        : null;

      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          department: selectedDepartment || "general",
          caseFolderId: formData.caseFolderId || null,
          date: formData.date ? new Date(formData.date) : null,
          rawContent: chartContent,
          departmentData: departmentData,
          templateVersion,
          // 하위 호환성: 일부 공통 필드는 기존 필드에도 저장
          chiefComplaint: departmentData.chiefComplaint as string || null,
          diagnosis: departmentData.diagnosis || departmentData.finalDiagnosis || departmentData.clinicalDiagnosis || departmentData.assessment as string || null,
          treatment: departmentData.treatment || departmentData.plan as string || null,
          tags: tags,
          images: uploadedImages,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Save failed (${res.status})`);
      }

      const data = await res.json();
      toast.success("저장되었습니다");
      router.push(`/cases/${data.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "저장 중 오류가 발생했습니다";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/cases" className="hover:text-foreground transition-colors">
            전체 케이스
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">새 케이스</span>
        </nav>
        <Button size="sm" disabled={loading} onClick={handleSubmit}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="ml-1">저장</span>
        </Button>
      </div>

      {/* 기본 정보 */}
      <div className="space-y-2">
        <Input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="케이스 제목"
          className="font-medium"
        />
        <div className="grid grid-cols-3 gap-2">
          <Input
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            className="h-8 text-sm"
          />
          <Select
            value={formData.caseFolderId}
            onValueChange={(v) => handleSelectChange("caseFolderId", v)}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="폴더" />
            </SelectTrigger>
            <SelectContent>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  {folder.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TagInput
            value={tags}
            onChange={setTags}
            maxTags={5}
            placeholder="태그 (최대 5개)"
            className="col-span-1"
          />
        </div>
      </div>

      {/* 이미지 업로드 */}
      <div
        ref={dropZoneRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "transition-colors",
          isDragging && "bg-primary/10"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleMediaAdd}
        />
        {media.length === 0 ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-colors",
              isDragging ? "border-primary bg-primary/5" : "hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            <Upload className="h-6 w-6 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              클릭, 드래그 또는 Ctrl+V로 이미지 추가
            </span>
          </button>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-full border-2 border-dashed rounded-lg p-3 pt-4 cursor-pointer transition-colors",
              isDragging ? "border-primary bg-primary/5" : "hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-3 overflow-x-auto">
              {media.map((item) => (
                <div key={item.id} className="relative flex-shrink-0 w-24 h-24 group">
                  {item.type === "video" ? (
                    <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                      <Film className="h-6 w-6 text-white" />
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-cover rounded-lg border"
                    />
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleMediaRemove(item.id); }}
                    className="absolute -top-1.5 -right-1.5 p-0.5 bg-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              <div className="flex-shrink-0 w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground">
                <ImagePlus className="h-5 w-5" />
                <span className="text-xs">추가</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 차트 입력 */}
      <div className="relative">
        <div className="px-3 py-1.5 bg-muted/50 rounded-t-lg border border-b-0">
          <h2 className="font-medium text-xs text-muted-foreground">Chart</h2>
        </div>
        <Textarea
          value={chartContent}
          onChange={(e) => setChartContent(e.target.value)}
          placeholder={"차트 내용을 입력하세요...\n\nC.C: Chief Complaint\nP.I: Present Illness\nP.Hx: Past History\nV/S: Vital Signs\nP/E: Physical Examination\nLab / Image\nA: Assessment\nP: Plan"}
          className="min-h-[200px] rounded-t-none border text-sm resize-y focus-visible:border-input focus-visible:ring-0"
        />
        {/* AI 분석 버튼 - 차트 영역 안 우측 하단 */}
        <button
          type="button"
          onClick={handleAISummary}
          disabled={aiLoading || !chartContent.trim() || !selectedDepartment || !showTemplate}
          className={cn(
            "absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border transition-all",
            aiLoading || !chartContent.trim() || !selectedDepartment || !showTemplate
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-background hover:bg-accent text-foreground hover:shadow-md"
          )}
        >
          {aiLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          AI 분석
        </button>
      </div>

      {/* 진료과 + 템플릿 토글 */}
      <div className="border rounded-lg">
        <button
          type="button"
          onClick={() => setShowTemplate(!showTemplate)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>진료과 / 템플릿</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", showTemplate && "rotate-180")} />
        </button>
        {showTemplate && (
          <div className="px-3 pb-3 space-y-3 border-t pt-3">
            <DepartmentSelector
              value={selectedDepartment}
              onChange={handleDepartmentChange}
            />
            {selectedDepartment && (
              <DynamicForm
                department={selectedDepartment}
                isCustomTemplate={isCustomTemplate}
                data={departmentData}
                onChange={setDepartmentData}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
