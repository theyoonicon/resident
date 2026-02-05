"use client";

import { useState, useEffect } from "react";
import { History, X, Trash2, AlertTriangle } from "lucide-react";

const STORAGE_KEY = "chart-ai-history";
const MAX_HISTORY = 20;

export interface ChartHistory {
  id: string;
  chartText: string;
  patientInfo: { age: string; sex: string };
  ddxResult: unknown;
  planResult: unknown;
  questionsResult: unknown;
  createdAt: string;
}

export function saveHistory(entry: Omit<ChartHistory, "id" | "createdAt">) {
  try {
    const histories = getHistories();
    const newEntry: ChartHistory = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    histories.unshift(newEntry);
    if (histories.length > MAX_HISTORY) histories.length = MAX_HISTORY;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(histories));
  } catch {
    // localStorage full or unavailable
  }
}

export function getHistories(): ChartHistory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  }
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
}

function getFirstDiagnosis(ddxResult: unknown): string {
  try {
    const r = ddxResult as { admissionDiagnosis?: { diagnosis: string }[]; diagnoses?: { diagnosis: string }[] };
    if (r?.admissionDiagnosis?.[0]?.diagnosis) return r.admissionDiagnosis[0].diagnosis;
    if (r?.diagnoses?.[0]?.diagnosis) return r.diagnoses[0].diagnosis;
  } catch { /* */ }
  return "분석 결과";
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (history: ChartHistory) => void;
}

export default function HistoryPanel({ open, onClose, onSelect }: Props) {
  const [histories, setHistories] = useState<ChartHistory[]>([]);

  useEffect(() => {
    if (open) setHistories(getHistories());
  }, [open]);

  const handleDelete = (id: string) => {
    if (!confirm("이 기록을 삭제하시겠습니까?")) return;
    const updated = histories.filter((h) => h.id !== id);
    setHistories(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (!confirm("모든 기록을 삭제하시겠습니까?")) return;
    setHistories([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-sm w-full max-w-md max-h-[80vh] flex flex-col shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">분석 기록</h3>
            <span className="text-xs text-muted-foreground">({histories.length})</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {histories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">분석 기록이 없습니다</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {histories.map((h) => (
                <div
                  key={h.id}
                  className="group px-4 py-3 hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => { onSelect(h); onClose(); }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {getFirstDiagnosis(h.ddxResult)}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {h.chartText.slice(0, 100)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {h.patientInfo.age && `${h.patientInfo.age}세`}
                        {h.patientInfo.sex && ` ${h.patientInfo.sex === "male" ? "남" : "여"}`}
                        {" · "}
                        {formatDate(h.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(h.id); }}
                      className="md:opacity-0 md:group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {histories.length > 0 && (
          <div className="px-4 py-3 border-t border-border">
            <button
              onClick={handleClearAll}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-red-500 hover:bg-red-50 rounded-sm transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              전체 삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
