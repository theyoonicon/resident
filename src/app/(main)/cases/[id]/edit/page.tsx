"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight,
  ChevronDown,
  Save,
  Loader2,
  ImagePlus,
  X,
  Sparkles,
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
import { format } from "date-fns";
import { DynamicForm } from "@/components/templates";
import {
  DepartmentKey,
  DepartmentData,
  DEPARTMENTS,
  getTemplateVersion,
} from "@/templates";

interface ExistingImage {
  id: string;
  url: string;
  caption: string | null;
}

interface NewMedia {
  id: string;
  file: File;
  url: string;
  type: "image" | "video";
}

export default function EditCasePage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newMedia, setNewMedia] = useState<NewMedia[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [folderTouched, setFolderTouched] = useState(false);

  // 과 선택 및 템플릿 데이터
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentKey | "">("");
  const [departmentData, setDepartmentData] = useState<DepartmentData>({});
  const [showTemplate, setShowTemplate] = useState(false);
  const [rawContent, setRawContent] = useState("");

  // 기본 폼 데이터
  const [formData, setFormData] = useState({
    title: "",
    caseFolderId: "",
    date: "",
  });
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    fetchCase();
    fetchFolders();
  }, [caseId]);

  const fetchFolders = async () => {
    try {
      const res = await fetch("/api/case-folders");
      if (res.ok) {
        const data = await res.json();
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
      }
    } catch (e) {
      console.error("Failed to fetch folders", e);
    }
  };

  const fetchCase = async () => {
    try {
      const res = await fetch(`/api/cases/${caseId}`);
      if (!res.ok) throw new Error("케이스를 찾을 수 없습니다");

      const data = await res.json();

      setFormData({
        title: data.title || "",
        caseFolderId: data.caseFolderId || "",
        date: data.date ? format(new Date(data.date), "yyyy-MM-dd") : "",
      });
      setTags(data.tags?.map((t: { tag: { name: string } }) => t.tag.name) || []);

      // 과 정보 로드 (key 또는 한글명으로 저장되어 있을 수 있음)
      if (data.department) {
        // 이미 key 형태인지 확인
        const isKey = DEPARTMENTS.some(d => d.key === data.department);
        if (isKey) {
          setSelectedDepartment(data.department as DepartmentKey);
        } else {
          // 한글명으로 저장된 경우 key로 변환
          const dept = DEPARTMENTS.find(d => d.name === data.department);
          if (dept) {
            setSelectedDepartment(dept.key);
          }
        }
      }

      // 과별 데이터 로드
      if (data.departmentData) {
        setDepartmentData(data.departmentData);
        setShowTemplate(true);
      }

      // 원본 차트 내용
      if (data.rawContent) {
        setRawContent(data.rawContent);
      }

      // 기존 이미지 로드
      if (data.images) {
        setExistingImages(data.images);
      }
    } catch {
      toast.error("케이스를 불러올 수 없습니다");
      router.push("/cases");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 현재 과 정보 가져오기
  const currentDepartmentInfo = DEPARTMENTS.find(d => d.key === selectedDepartment);

  // 파일 추가 공통 함수
  const addFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const mediaFiles = fileArray.filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );

    if (mediaFiles.length === 0) return;

    const newItems: NewMedia[] = mediaFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image",
    }));

    setNewMedia((prev) => [...prev, ...newItems]);
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

  const handleExistingImageRemove = (id: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
    setDeletedImageIds((prev) => [...prev, id]);
  };

  const handleNewMediaRemove = (id: string) => {
    setNewMedia((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleAIParse = async () => {
    if (!rawContent.trim()) {
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
          content: rawContent,
          department: selectedDepartment,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.reason || data.error || "AI 분석 실패";
        toast.error(errorMsg);
        return;
      }

      setDepartmentData(data.departmentData || {});

      if (data.title && !formData.title) {
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
      // 새 이미지 업로드
      let uploadedImages: { url: string }[] = [];
      const imageFiles = newMedia.filter((m) => m.type === "image");
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

      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          department: selectedDepartment || null,
          caseFolderId: folderTouched ? (formData.caseFolderId || null) : undefined,
          date: formData.date ? new Date(formData.date) : null,
          rawContent: rawContent,
          departmentData: departmentData,
          templateVersion: selectedDepartment ? getTemplateVersion(selectedDepartment) : null,
          // 하위 호환성
          chiefComplaint: departmentData.chiefComplaint as string || null,
          diagnosis: departmentData.diagnosis || departmentData.finalDiagnosis || departmentData.clinicalDiagnosis || departmentData.assessment as string || null,
          treatment: departmentData.treatment || departmentData.plan as string || null,
          tags: tags,
          deletedImageIds,
          newImages: uploadedImages,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      toast.success("수정되었습니다");
      router.push(`/cases/${caseId}`);
    } catch {
      toast.error("저장 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/cases" className="hover:text-foreground transition-colors">
            전체 케이스
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/cases/${caseId}`} className="hover:text-foreground transition-colors truncate max-w-[150px]">
            {formData.title || "케이스"}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">수정</span>
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
            value={formData.caseFolderId || "none"}
            onValueChange={(v) => { setFolderTouched(true); handleSelectChange("caseFolderId", v === "none" ? "" : v); }}
          >
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="폴더" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">폴더 없음</SelectItem>
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
          />
        </div>
      </div>

      {/* 이미지 - 드래그 & 드롭 영역 */}
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
        {existingImages.length === 0 && newMedia.length === 0 ? (
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
              {/* 기존 이미지 */}
              {existingImages.map((img) => (
                <div key={img.id} className="relative flex-shrink-0 w-24 h-24 group">
                  <img
                    src={img.url}
                    alt={img.caption || ""}
                    className="w-full h-full object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleExistingImageRemove(img.id); }}
                    className="absolute -top-1.5 -right-1.5 p-0.5 bg-destructive rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              {/* 새 미디어 */}
              {newMedia.map((item) => (
                <div key={item.id} className="relative flex-shrink-0 w-24 h-24 group">
                  {item.type === "video" ? (
                    <div className="w-full h-full bg-black rounded-lg flex items-center justify-center">
                      <Film className="h-6 w-6 text-white" />
                    </div>
                  ) : (
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-cover rounded-lg border border-primary"
                    />
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleNewMediaRemove(item.id); }}
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
          value={rawContent}
          onChange={(e) => setRawContent(e.target.value)}
          placeholder={"예시) 65세 남자 폐렴 증례\n\nC.C: Cough, fever for 5 days\nO/S: 5일 전부터 시작\nP.I: 5일 전부터 기침 시작..."}
          className="min-h-[200px] rounded-t-none border text-sm resize-y focus-visible:border-input focus-visible:ring-0"
        />
        {/* AI 분석 버튼 - 차트 영역 안 우측 하단 */}
        <button
          type="button"
          onClick={handleAIParse}
          disabled={aiLoading || !rawContent.trim() || !selectedDepartment || !showTemplate}
          className={cn(
            "absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border transition-all",
            aiLoading || !rawContent.trim() || !selectedDepartment || !showTemplate
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
          <span>진료과 / 템플릿{currentDepartmentInfo ? ` — ${currentDepartmentInfo.name}` : ""}</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", showTemplate && "rotate-180")} />
        </button>
        {showTemplate && (
          <div className="px-3 pb-3 space-y-3 border-t pt-3">
            {currentDepartmentInfo && (
              <div className="px-3 py-2 bg-muted rounded-md text-sm">
                {currentDepartmentInfo.name}
              </div>
            )}
            {selectedDepartment && (
              <DynamicForm
                department={selectedDepartment}
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
