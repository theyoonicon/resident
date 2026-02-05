"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Send,
  Loader2,
  Stethoscope,
  ClipboardList,
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  X,
  FlaskConical,
  MonitorDot,
  Pill,
  FileWarning,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { saveHistory } from "@/components/chart-ai/HistoryPanel";

// ─── Types ───

interface AdmissionDiagnosis {
  diagnosis: string;
  probability: number;
  differentials: { name: string; probability: number }[];
}

interface DDxResult {
  isValid: boolean;
  problemList?: string[];
  admissionDiagnosis?: AdmissionDiagnosis[];
  mustRuleOut?: string[];
  note?: { reasoning: string; cautions: string[] };
  // legacy fallback
  diagnoses?: { diagnosis: string; probability: number; reasoning: string }[];
}

interface WorkupItem {
  diagnosis: string;
  labs: string[];
  imaging: string[];
  treatment: string[];
}

interface PlanResult {
  workupPlan?: WorkupItem[];
  disposition?: string;
  followUp?: string;
  precautions?: string[];
  // legacy fallback
  labs?: { name: string; reason: string; priority: string }[];
  imaging?: { name: string; reason: string; priority: string }[];
  medications?: { name: string; dose: string; route: string; reason: string }[];
}

interface QuestionsResult {
  questions: { question: string; purpose: string; category: string }[];
}

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  base64: string;
  mimeType: string;
}

// ─── Component ───

export default function ChartAIPage() {
  const [chartText, setChartText] = useState("");
  const [patientInfo, setPatientInfo] = useState({ age: "", sex: "" });
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [ddxResult, setDdxResult] = useState<DDxResult | null>(null);
  const [planResult, setPlanResult] = useState<PlanResult | null>(null);
  const [questionsResult, setQuestionsResult] = useState<QuestionsResult | null>(null);
  const [error, setError] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    ddx: true,
    plan: true,
    questions: true,
  });
  const [images, setImages] = useState<UploadedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ─── Image handling ───

  const processFile = useCallback(async (file: File) => {
    if (images.length >= 3) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("이미지 크기는 10MB 이하여야 합니다.");
      return;
    }
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      setImages((prev) => {
        if (prev.length >= 3) return prev;
        return [
          ...prev,
          {
            id: Date.now().toString() + Math.random(),
            file,
            preview: dataUrl,
            base64,
            mimeType: file.type,
          },
        ];
      });
    };
    reader.readAsDataURL(file);
  }, [images.length]);

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      files.forEach(processFile);
    },
    [processFile]
  );

  // ─── Analysis ───

  const analyze = async (type: "ddx" | "plan" | "questions") => {
    setLoading((prev) => ({ ...prev, [type]: true }));
    setError("");

    try {
      const imagePayload = images.map((img) => ({
        base64: img.base64,
        mimeType: img.mimeType,
      }));

      const res = await fetch("/api/chart-ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chartText,
          patientInfo,
          analysisType: type,
          images: imagePayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (type === "ddx") setDdxResult(data.data);
      else if (type === "plan") setPlanResult(data.data);
      else if (type === "questions") setQuestionsResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "분석에 실패했습니다.");
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  // ─── History restore via custom event ───

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setChartText(detail.chartText || "");
        setPatientInfo(detail.patientInfo || { age: "", sex: "" });
        setDdxResult(detail.ddxResult as DDxResult);
        setPlanResult(detail.planResult as PlanResult);
        setQuestionsResult(detail.questionsResult as QuestionsResult);
      }
    };
    window.addEventListener("chart-ai-restore", handler);
    return () => window.removeEventListener("chart-ai-restore", handler);
  }, []);

  // ─── Save to history when all analyses complete ───

  const prevLoadingRef = useRef(loading);
  useEffect(() => {
    const wasLoading = Object.values(prevLoadingRef.current).some(Boolean);
    const nowLoading = Object.values(loading).some(Boolean);
    prevLoadingRef.current = loading;

    if (wasLoading && !nowLoading && (ddxResult || planResult || questionsResult)) {
      saveHistory({
        chartText,
        patientInfo,
        ddxResult,
        planResult,
        questionsResult,
      });
    }
  }, [loading, ddxResult, planResult, questionsResult, chartText, patientInfo]);

  const handleAnalyzeAll = () => {
    analyze("ddx");
    analyze("plan");
    analyze("questions");
  };

  // keyboard shortcut
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      handleAnalyzeAll();
    }
  };

  const isLoading = Object.values(loading).some(Boolean);
  const age = parseInt(patientInfo.age);
  const isChildbearingAge = patientInfo.sex === "female" && age >= 15 && age <= 50;

  // ─── Quick age buttons ───
  const quickAges = ["20", "30", "40", "50", "60", "70", "80"];

  const probColor = (p: number) => {
    if (p >= 50) return "bg-red-500";
    if (p >= 30) return "bg-orange-500";
    if (p >= 15) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <div className="space-y-6" onKeyDown={handleKeyDown}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ═══ Input ═══ */}
        <div className="space-y-4">
          {/* 환자 정보 */}
          <div className="bg-card rounded-sm border border-border p-5 space-y-4">
            <h3 className="font-medium text-sm">환자 정보</h3>
            <div className="space-y-3">
              {/* 나이 */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">나이</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={patientInfo.age}
                    onChange={(e) =>
                      setPatientInfo((p) => ({ ...p, age: e.target.value }))
                    }
                    placeholder="나이"
                    max={120}
                    className="w-20 px-3 py-2 border border-border rounded-sm text-sm bg-background text-center"
                  />
                  <span className="text-xs text-muted-foreground">세</span>
                  <div className="flex gap-1 ml-2">
                    {quickAges.map((a) => (
                      <button
                        key={a}
                        onClick={() =>
                          setPatientInfo((p) => ({ ...p, age: a }))
                        }
                        className={cn(
                          "px-2 py-1 text-xs rounded-sm border transition-colors",
                          patientInfo.age === a
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:bg-accent"
                        )}
                      >
                        {a}대
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 성별 */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">성별</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setPatientInfo((p) => ({ ...p, sex: "male" }))
                    }
                    className={cn(
                      "px-4 py-2 text-sm rounded-sm border font-medium transition-colors",
                      patientInfo.sex === "male"
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-border text-muted-foreground hover:bg-accent"
                    )}
                  >
                    M
                  </button>
                  <button
                    onClick={() =>
                      setPatientInfo((p) => ({ ...p, sex: "female" }))
                    }
                    className={cn(
                      "px-4 py-2 text-sm rounded-sm border font-medium transition-colors",
                      patientInfo.sex === "female"
                        ? "bg-pink-500 text-white border-pink-500"
                        : "border-border text-muted-foreground hover:bg-accent"
                    )}
                  >
                    F
                  </button>
                  {isChildbearingAge && (
                    <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-sm">
                      <AlertTriangle className="w-3 h-3" />
                      가임기
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 차트 입력 */}
          <div className="bg-card rounded-sm border border-border p-5 space-y-3">
            <h3 className="font-medium text-sm">차트 입력</h3>
            <textarea
              value={chartText}
              onChange={(e) => setChartText(e.target.value)}
              placeholder={`예시:
C.C: 3일 전부터 발생한 두통
P.I: 두통 NRS 6/10, 후두부 위주, 오심 동반
P.Hx: HTN 10년, DM 5년
Medication: Amlodipine 5mg, Metformin 500mg
P.E: BP 160/100, HR 88, BT 36.8
Neck stiffness (-), Kernig sign (-)`}
              rows={10}
              className="w-full px-4 py-3 border border-border rounded-sm text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />

            {/* 이미지 업로드 */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border border-dashed border-border rounded-sm p-3"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={images.length >= 3}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-sm hover:bg-accent disabled:opacity-50 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  사진 첨부
                </button>
                <span className="text-xs text-muted-foreground">
                  {images.length}/3 · 드래그 앤 드롭 가능 · 최대 10MB
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    Array.from(e.target.files || []).forEach(processFile);
                    e.target.value = "";
                  }}
                />
              </div>

              {/* 이미지 프리뷰 */}
              {images.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {images.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.preview}
                        alt=""
                        className="w-16 h-16 object-cover rounded-sm border border-border"
                      />
                      <button
                        onClick={() => removeImage(img.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {images.length > 0 && (
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  개인정보가 포함된 이미지는 첨부하지 마세요
                </p>
              )}
            </div>

            {/* 분석 버튼 */}
            <button
              onClick={handleAnalyzeAll}
              disabled={!chartText.trim() || isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              전체 분석
            </button>
          </div>
        </div>

        {/* ═══ Results ═══ */}
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-sm bg-red-50 text-red-600 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* ── DDx ── */}
          <div className="bg-card rounded-sm border border-border overflow-hidden">
            <button
              onClick={() => toggleSection("ddx")}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">감별진단 (DDx)</span>
                {loading.ddx && <Loader2 className="w-3 h-3 animate-spin" />}
              </div>
              {expandedSections.ddx ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {expandedSections.ddx && ddxResult && (
              <div className="px-4 pb-4 space-y-4">
                {/* Problem List */}
                {ddxResult.problemList && ddxResult.problemList.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                      Problem List
                    </p>
                    <div className="space-y-1">
                      {ddxResult.problemList.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium flex-shrink-0">
                            {i + 1}
                          </span>
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admission Diagnosis */}
                {ddxResult.admissionDiagnosis &&
                  ddxResult.admissionDiagnosis.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                        Admission Diagnosis
                      </p>
                      <div className="space-y-3">
                        {ddxResult.admissionDiagnosis.map((dx, i) => (
                          <div
                            key={i}
                            className="border border-border rounded-sm p-3 space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                #{i + 1}. {dx.diagnosis}
                              </span>
                              <span className="text-xs font-bold text-primary">
                                {dx.probability}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  probColor(dx.probability)
                                )}
                                style={{ width: `${dx.probability}%` }}
                              />
                            </div>
                            {dx.differentials &&
                              dx.differentials.length > 0 && (
                                <div className="pl-3 border-l-2 border-muted space-y-1">
                                  <p className="text-[10px] font-medium text-muted-foreground uppercase">
                                    R/O
                                  </p>
                                  {dx.differentials.map((d, j) => (
                                    <div
                                      key={j}
                                      className="flex items-center justify-between text-xs text-muted-foreground"
                                    >
                                      <span>{d.name}</span>
                                      <span>{d.probability}%</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Legacy diagnoses fallback */}
                {!ddxResult.admissionDiagnosis &&
                  ddxResult.diagnoses &&
                  ddxResult.diagnoses.length > 0 && (
                    <div className="space-y-3">
                      {ddxResult.diagnoses.map((dx, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {dx.diagnosis}
                            </span>
                            <span className="text-xs font-medium text-primary">
                              {dx.probability}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${dx.probability}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {dx.reasoning}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                {/* Must Rule Out */}
                {ddxResult.mustRuleOut && ddxResult.mustRuleOut.length > 0 && (
                  <div className="p-3 bg-red-50 rounded-sm">
                    <p className="text-xs font-medium text-red-700 mb-1 flex items-center gap-1">
                      <FileWarning className="w-3.5 h-3.5" />
                      반드시 배제
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {ddxResult.mustRuleOut.map((dx, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs"
                        >
                          {dx}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Note */}
                {ddxResult.note && (
                  <div className="p-3 bg-muted rounded-sm space-y-2">
                    {ddxResult.note.reasoning && (
                      <p className="text-xs text-muted-foreground">
                        {ddxResult.note.reasoning}
                      </p>
                    )}
                    {ddxResult.note.cautions &&
                      ddxResult.note.cautions.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-amber-700 mb-0.5">
                            주의사항
                          </p>
                          <ul className="list-disc list-inside text-xs text-amber-700 space-y-0.5">
                            {ddxResult.note.cautions.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Plan ── */}
          <div className="bg-card rounded-sm border border-border overflow-hidden">
            <button
              onClick={() => toggleSection("plan")}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm">진료 계획</span>
                {loading.plan && <Loader2 className="w-3 h-3 animate-spin" />}
              </div>
              {expandedSections.plan ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {expandedSections.plan && planResult && (
              <div className="px-4 pb-4 space-y-4">
                {/* New workupPlan format */}
                {planResult.workupPlan &&
                  planResult.workupPlan.length > 0 &&
                  planResult.workupPlan.map((wp, i) => (
                    <div
                      key={i}
                      className="border border-border rounded-sm p-3 space-y-2.5"
                    >
                      <p className="text-sm font-medium">
                        #{i + 1}. {wp.diagnosis}
                      </p>

                      {wp.labs.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-1">
                            <FlaskConical className="w-3 h-3" />
                            Labs
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {wp.labs.map((lab, j) => (
                              <span
                                key={j}
                                className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                              >
                                {lab}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {wp.imaging.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-1">
                            <MonitorDot className="w-3 h-3" />
                            Imaging
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {wp.imaging.map((img, j) => (
                              <span
                                key={j}
                                className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs"
                              >
                                {img}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {wp.treatment.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1 mb-1">
                            <Pill className="w-3 h-3" />
                            Treatment
                          </p>
                          <div className="space-y-0.5">
                            {wp.treatment.map((tx, j) => (
                              <p
                                key={j}
                                className="text-xs text-foreground pl-2 border-l-2 border-green-300"
                              >
                                {tx}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                {/* Legacy plan format fallback */}
                {!planResult.workupPlan && (
                  <>
                    {planResult.labs && planResult.labs.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          검사
                        </p>
                        <div className="space-y-1.5">
                          {planResult.labs.map((lab, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 text-sm"
                            >
                              <span className="font-medium">{lab.name}</span>
                              <span className="text-muted-foreground">
                                - {lab.reason}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {planResult.medications &&
                      planResult.medications.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            약물
                          </p>
                          <div className="space-y-1.5">
                            {planResult.medications.map((med, i) => (
                              <div key={i} className="text-sm">
                                <span className="font-medium">{med.name}</span>
                                <span className="text-muted-foreground">
                                  {" "}
                                  {med.dose} ({med.route}) - {med.reason}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </>
                )}

                {/* Disposition / Follow-up / Precautions */}
                {planResult.disposition && (
                  <div className="p-3 bg-muted rounded-sm text-sm">
                    <span className="font-medium">Disposition:</span>{" "}
                    {planResult.disposition}
                  </div>
                )}
                {planResult.followUp && (
                  <div className="p-3 bg-muted rounded-sm text-sm">
                    <span className="font-medium">F/U:</span>{" "}
                    {planResult.followUp}
                  </div>
                )}
                {planResult.precautions &&
                  planResult.precautions.length > 0 && (
                    <div className="p-3 bg-amber-50 rounded-sm">
                      <p className="text-xs font-medium text-amber-700 mb-1">
                        주의사항
                      </p>
                      <ul className="list-disc list-inside text-xs text-amber-700 space-y-0.5">
                        {planResult.precautions.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* ── Questions ── */}
          <div className="bg-card rounded-sm border border-border overflow-hidden">
            <button
              onClick={() => toggleSection("questions")}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-sm">추가 질문</span>
                {loading.questions && (
                  <Loader2 className="w-3 h-3 animate-spin" />
                )}
              </div>
              {expandedSections.questions ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {expandedSections.questions && questionsResult && (
              <div className="px-4 pb-4">
                <div className="space-y-2">
                  {questionsResult.questions?.map((q, i) => (
                    <div key={i} className="p-3 bg-muted rounded-sm">
                      <p className="text-sm font-medium">{q.question}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {q.purpose}
                      </p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                        {q.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
