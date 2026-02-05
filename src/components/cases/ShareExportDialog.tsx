"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Share2,
  Download,
  FileText,
  Globe,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Presentation,
} from "lucide-react";
import { DEPARTMENTS, getTemplate, DepartmentKey } from "@/templates";
import { DepartmentData } from "@/templates/types";
import { toast } from "sonner";

interface ShareExportDialogProps {
  caseId: string;
  caseTitle: string;
}

export function ShareExportDialog({ caseId, caseTitle }: ShareExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [publicId, setPublicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // 공개 상태 조회
  useEffect(() => {
    if (open) {
      fetchShareStatus();
    }
  }, [open, caseId]);

  const fetchShareStatus = async () => {
    try {
      const res = await fetch(`/api/cases/${caseId}/share`);
      if (res.ok) {
        const data = await res.json();
        setIsPublic(data.isPublic);
        setPublicId(data.publicId);
      }
    } catch (e) {
      console.error("Failed to fetch share status", e);
    }
  };

  const togglePublic = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/share`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setIsPublic(data.isPublic);
        setPublicId(data.publicId);
        toast.success(data.isPublic ? "공개 링크가 생성되었습니다" : "공개가 해제되었습니다");
      }
    } catch {
      toast.error("공개 설정 변경에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const publicUrl = publicId
    ? `${window.location.origin}/share/${publicId}`
    : "";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("링크가 복사되었습니다");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("복사에 실패했습니다");
    }
  };

  const downloadMarkdown = async () => {
    try {
      const res = await fetch(`/api/cases/${caseId}/export?format=markdown`);
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${caseTitle}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Markdown 파일이 다운로드되었습니다");
      }
    } catch {
      toast.error("다운로드에 실패했습니다");
    }
  };

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pptLoading, setPptLoading] = useState(false);

  const downloadPDF = async () => {
    // 현재 페이지 내용을 PDF로 변환
    const content = document.querySelector(".case-content");
    if (!content) {
      toast.error("PDF 생성에 실패했습니다: 콘텐츠를 찾을 수 없습니다");
      return;
    }

    setPdfLoading(true);
    toast.info("PDF 생성 중...");

    try {
      // html2pdf 동적 로드
      const html2pdfModule = await import("html2pdf.js");
      const html2pdf = html2pdfModule.default;

      const opt = {
        margin: 20,
        filename: `${caseTitle}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
        },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
      };

      await html2pdf().set(opt).from(content as HTMLElement).save();
      toast.success("PDF 파일이 다운로드되었습니다");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("PDF 생성에 실패했습니다");
    } finally {
      setPdfLoading(false);
    }
  };

  const downloadPPT = async () => {
    setPptLoading(true);
    toast.info("PPT 생성 중...");

    try {
      // 케이스 데이터 가져오기
      const res = await fetch(`/api/cases/${caseId}/export?format=json`);
      if (!res.ok) {
        throw new Error("Failed to fetch case data");
      }
      const caseData = await res.json();

      // pptxgenjs 동적 로드
      const pptxgen = (await import("pptxgenjs")).default;
      const pptx = new pptxgen();

      // 프레젠테이션 설정
      pptx.layout = "LAYOUT_16x9";
      pptx.title = caseData.title;
      pptx.author = "MediCase";

      // 마스터 슬라이드 정의 - 제목 슬라이드
      pptx.defineSlideMaster({
        title: "TITLE_SLIDE",
        background: { color: "FFFFFF" },
        objects: [
          { placeholder: { options: { name: "title", type: "title", x: 0.6, y: 2.2, w: 9, h: 1, fontSize: 44, bold: true, color: "1a1a1a" } } },
          { placeholder: { options: { name: "subtitle", type: "body", x: 0.6, y: 3.5, w: 9, h: 0.8, fontSize: 20, color: "666666" } } },
        ],
      });

      // 마스터 슬라이드 정의 - 제목+내용
      pptx.defineSlideMaster({
        title: "TITLE_CONTENT",
        background: { color: "FFFFFF" },
        objects: [
          { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 28, bold: true, color: "1a1a1a" } } },
          { line: { x: 0.5, y: 1.0, w: 9, h: 0, line: { color: "CCCCCC", width: 1 } } },
          { placeholder: { options: { name: "body", type: "body", x: 0.5, y: 1.2, w: 9, h: 4, fontSize: 18, color: "333333", valign: "top" } } },
        ],
      });

      // 마스터 슬라이드 정의 - 이미지용
      pptx.defineSlideMaster({
        title: "IMAGE_SLIDE",
        background: { color: "FFFFFF" },
        objects: [
          { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.4, w: 9, h: 0.6, fontSize: 28, bold: true, color: "1a1a1a" } } },
          { line: { x: 0.5, y: 1.0, w: 9, h: 0, line: { color: "CCCCCC", width: 1 } } },
        ],
      });

      // 과 정보
      const departmentInfo = DEPARTMENTS.find((d) => d.key === caseData.department);
      const departmentName = departmentInfo?.name || caseData.department;

      // 템플릿 가져오기
      let template = null;
      try {
        template = getTemplate(caseData.department as DepartmentKey);
      } catch {
        // 템플릿이 없으면 기본 처리
      }

      const departmentData = caseData.departmentData as DepartmentData | null;

      // 값 포맷팅 헬퍼
      const formatValue = (key: string, value: unknown): string => {
        if (value === null || value === undefined || value === "") return "";
        if (Array.isArray(value)) {
          if (template) {
            const field = template.fields.find(f => f.key === key);
            if (field?.options) {
              return value.map(v => {
                const opt = field.options?.find(o => o.value === v);
                return opt?.label || v;
              }).join(", ");
            }
          }
          return value.join(", ");
        }
        if (template) {
          const field = template.fields.find(f => f.key === key);
          if (field?.options) {
            const opt = field.options.find(o => o.value === value);
            if (opt) return opt.label;
          }
        }
        return String(value);
      };

      // 환자 기본 정보
      const basicInfo: string[] = [departmentName];
      if (caseData.ageGroup) basicInfo.push(caseData.ageGroup);
      if (caseData.gender) basicInfo.push(caseData.gender === "M" ? "남" : "여");
      if (caseData.caseDate) {
        basicInfo.push(new Date(caseData.caseDate).toLocaleDateString("ko-KR"));
      }

      // 1. 표지 슬라이드
      const titleSlide = pptx.addSlide({ masterName: "TITLE_SLIDE" });
      titleSlide.addText(caseData.title, { placeholder: "title" });
      titleSlide.addText(basicInfo.join("  |  "), { placeholder: "subtitle" });

      // 섹션별 슬라이드 생성
      if (template && departmentData && Object.keys(departmentData).length > 0) {
        const sortedSections = [...template.sections].sort((a, b) => a.order - b.order);

        for (const section of sortedSections) {
          const sectionFields = template.fields
            .filter(f => f.section === section.key)
            .sort((a, b) => a.order - b.order);

          const fieldsWithData = sectionFields.filter(f => {
            const value = departmentData[f.key];
            return value !== null && value !== undefined && value !== "" &&
                   !(Array.isArray(value) && value.length === 0);
          });

          if (fieldsWithData.length === 0) continue;

          // 내용 구성
          const contentLines: string[] = [];
          for (const field of fieldsWithData) {
            const value = departmentData[field.key];
            const formattedValue = formatValue(field.key, value);
            if (formattedValue) {
              contentLines.push(`• ${field.label}: ${formattedValue}`);
            }
          }

          const sectionSlide = pptx.addSlide({ masterName: "TITLE_CONTENT" });
          sectionSlide.addText(section.title, { placeholder: "title" });
          sectionSlide.addText(contentLines.join("\n"), { placeholder: "body" });
        }
      } else {
        // 기존 필드 사용
        if (caseData.chiefComplaint || caseData.keyHistory) {
          const contentLines: string[] = [];
          if (caseData.chiefComplaint) {
            contentLines.push(`• C.C (주소): ${caseData.chiefComplaint}`);
          }
          if (caseData.keyHistory) {
            contentLines.push(`• 병력: ${caseData.keyHistory}`);
          }

          const historySlide = pptx.addSlide({ masterName: "TITLE_CONTENT" });
          historySlide.addText("현병력", { placeholder: "title" });
          historySlide.addText(contentLines.join("\n"), { placeholder: "body" });
        }

        if (caseData.labFindings) {
          const labSlide = pptx.addSlide({ masterName: "TITLE_CONTENT" });
          labSlide.addText("검사 소견", { placeholder: "title" });
          labSlide.addText(caseData.labFindings, { placeholder: "body" });
        }
      }

      // 이미지 슬라이드
      if (caseData.images && caseData.images.length > 0) {
        const imageCount = caseData.images.length;

        if (imageCount <= 2) {
          const imgSlide = pptx.addSlide({ masterName: "IMAGE_SLIDE" });
          imgSlide.addText("영상 소견", { placeholder: "title" });

          if (imageCount === 1) {
            const image = caseData.images[0];
            try {
              imgSlide.addImage({
                path: image.url,
                x: 1.5,
                y: 1.2,
                w: 7,
                h: 4,
                sizing: { type: "contain", w: 7, h: 4 },
              });
              if (image.caption) {
                imgSlide.addText(image.caption, { x: 1.5, y: 5.3, w: 7, fontSize: 14, color: "666666", align: "center" });
              }
            } catch { /* skip */ }
          } else {
            for (let i = 0; i < 2; i++) {
              const image = caseData.images[i];
              try {
                imgSlide.addImage({
                  path: image.url,
                  x: i === 0 ? 0.5 : 5,
                  y: 1.2,
                  w: 4.3,
                  h: 3.5,
                  sizing: { type: "contain", w: 4.3, h: 3.5 },
                });
                if (image.caption) {
                  imgSlide.addText(image.caption, { x: i === 0 ? 0.5 : 5, y: 4.8, w: 4.3, fontSize: 12, color: "666666", align: "center" });
                }
              } catch { /* skip */ }
            }
          }
        } else {
          // 3개 이상 - 2x2 그리드
          const imgSlide = pptx.addSlide({ masterName: "IMAGE_SLIDE" });
          imgSlide.addText("영상 소견", { placeholder: "title" });

          const positions = [
            { x: 0.5, y: 1.2 }, { x: 5, y: 1.2 },
            { x: 0.5, y: 3.0 }, { x: 5, y: 3.0 },
          ];

          for (let i = 0; i < Math.min(4, imageCount); i++) {
            const image = caseData.images[i];
            try {
              imgSlide.addImage({
                path: image.url,
                x: positions[i].x,
                y: positions[i].y,
                w: 4.3,
                h: 1.7,
                sizing: { type: "contain", w: 4.3, h: 1.7 },
              });
            } catch { /* skip */ }
          }

          // 추가 이미지
          for (let i = 4; i < imageCount; i++) {
            const extraSlide = pptx.addSlide({ masterName: "IMAGE_SLIDE" });
            extraSlide.addText(`영상 소견 (${i + 1})`, { placeholder: "title" });
            const image = caseData.images[i];
            try {
              extraSlide.addImage({
                path: image.url,
                x: 1.5,
                y: 1.2,
                w: 7,
                h: 4,
                sizing: { type: "contain", w: 7, h: 4 },
              });
              if (image.caption) {
                extraSlide.addText(image.caption, { x: 1.5, y: 5.3, w: 7, fontSize: 14, color: "666666", align: "center" });
              }
            } catch { /* skip */ }
          }
        }
      }

      // Dx & Tx 슬라이드
      if (caseData.diagnosis || caseData.treatment || caseData.outcome) {
        const contentLines: string[] = [];
        if (caseData.diagnosis) {
          contentLines.push(`• Diagnosis: ${caseData.diagnosis}`);
        }
        if (caseData.treatment) {
          contentLines.push(`• Treatment: ${caseData.treatment}`);
        }
        if (caseData.outcome) {
          contentLines.push(`• Outcome: ${caseData.outcome}`);
        }

        const dxSlide = pptx.addSlide({ masterName: "TITLE_CONTENT" });
        dxSlide.addText("Dx & Tx", { placeholder: "title" });
        dxSlide.addText(contentLines.join("\n\n"), { placeholder: "body" });
      }

      // Learning Points 슬라이드
      if (caseData.learningPoints) {
        const lpSlide = pptx.addSlide({ masterName: "TITLE_CONTENT" });
        lpSlide.addText("Learning Points", { placeholder: "title" });
        lpSlide.addText(caseData.learningPoints, { placeholder: "body" });
      }

      // PPT 다운로드
      await pptx.writeFile({ fileName: `${caseTitle}.pptx` });
      toast.success("PPT 파일이 다운로드되었습니다");
    } catch (error) {
      console.error("PPT generation error:", error);
      toast.error("PPT 생성에 실패했습니다");
    } finally {
      setPptLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">내보내기</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>내보내기 및 공유</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 공개 공유 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  웹에 공개
                </Label>
                <p className="text-xs text-muted-foreground">
                  링크를 아는 누구나 볼 수 있습니다
                </p>
              </div>
              <Switch
                checked={isPublic}
                onCheckedChange={togglePublic}
                disabled={loading}
              />
            </div>

            {isPublic && publicId && (
              <div className="flex gap-2">
                <Input
                  value={publicUrl}
                  readOnly
                  className="text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(publicUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="border-t pt-4 space-y-3">
            <Label>파일로 내보내기</Label>

            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={downloadMarkdown}
              >
                <FileText className="h-6 w-6" />
                <span className="text-xs">Markdown</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={downloadPDF}
                disabled={pdfLoading}
              >
                {pdfLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Download className="h-6 w-6" />
                )}
                <span className="text-xs">{pdfLoading ? "생성 중..." : "PDF"}</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={downloadPPT}
                disabled={pptLoading}
              >
                {pptLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Presentation className="h-6 w-6" />
                )}
                <span className="text-xs">{pptLoading ? "생성 중..." : "PPT"}</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
