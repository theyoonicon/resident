"use client";

import { useStore } from "@/store/useStore";
import {
  X,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
  Loader2,
  FileText,
  Ban,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function UploadPanel() {
  const {
    uploadTasks,
    showUploadPanel,
    setShowUploadPanel,
    removeUploadTask,
    clearFinishedUploads,
    cancelAllUploads,
  } = useStore();
  const [minimized, setMinimized] = useState(false);

  if (!showUploadPanel || uploadTasks.length === 0) return null;

  const activeCount = uploadTasks.filter(
    (t) => t.status === "uploading" || t.status === "pending"
  ).length;
  const doneCount = uploadTasks.filter((t) => t.status === "done").length;
  const errorCount = uploadTasks.filter((t) => t.status === "error").length;
  const cancelledCount = uploadTasks.filter(
    (t) => t.status === "cancelled"
  ).length;
  const totalCount = uploadTasks.length;

  const handleClose = () => {
    if (activeCount > 0) return;
    clearFinishedUploads();
    setShowUploadPanel(false);
  };

  let headerText: string;
  if (activeCount > 0) {
    headerText = `${totalCount}개 중 ${doneCount}개 완료 (${activeCount}개 업로드 중)`;
  } else if (errorCount > 0) {
    headerText = `${doneCount}개 완료, ${errorCount}개 실패`;
    if (cancelledCount > 0) headerText += `, ${cancelledCount}개 취소됨`;
  } else if (cancelledCount > 0) {
    headerText = `${doneCount}개 완료, ${cancelledCount}개 취소됨`;
  } else {
    headerText = `${doneCount}개 업로드 완료`;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-card border border-border rounded-lg shadow-2xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-card border-b border-border cursor-pointer"
        onClick={() => setMinimized(!minimized)}
      >
        <div className="flex items-center gap-2 min-w-0">
          {activeCount > 0 && (
            <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />
          )}
          {activeCount === 0 && errorCount === 0 && cancelledCount === 0 && (
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          )}
          {activeCount === 0 && errorCount > 0 && (
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          )}
          {activeCount === 0 && errorCount === 0 && cancelledCount > 0 && (
            <Ban className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )}
          <span className="text-sm font-medium truncate">{headerText}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {activeCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                cancelAllUploads();
              }}
              className="p-1 hover:bg-accent rounded-sm text-muted-foreground hover:text-red-500 text-xs"
              title="전체 취소"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMinimized(!minimized);
            }}
            className="p-1 hover:bg-accent rounded-sm text-muted-foreground"
          >
            {minimized ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className={cn(
              "p-1 rounded-sm text-muted-foreground",
              activeCount > 0
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-accent"
            )}
            disabled={activeCount > 0}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task List */}
      {!minimized && (
        <div className="max-h-60 overflow-y-auto">
          {uploadTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-b-0"
            >
              <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{task.fileName}</p>
                {(task.status === "uploading" || task.status === "pending") && (
                  <div className="mt-1 w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                )}
                {task.status === "error" && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {task.errorMessage || "업로드 실패"}
                  </p>
                )}
                {task.status === "cancelled" && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    취소됨
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 flex items-center gap-1">
                {task.status === "uploading" && (
                  <span className="text-xs text-muted-foreground">
                    {task.progress}%
                  </span>
                )}
                {task.status === "pending" && (
                  <span className="text-xs text-muted-foreground">대기</span>
                )}
                {task.status === "done" && (
                  <Check className="w-4 h-4 text-emerald-500" />
                )}
                {task.status === "error" && (
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                )}
                {task.status === "cancelled" && (
                  <Ban className="w-3.5 h-3.5 text-muted-foreground" />
                )}
                {/* 개별 취소/제거 버튼 */}
                {(task.status === "uploading" || task.status === "pending") && (
                  <button
                    onClick={() => {
                      // cancelUpload은 FileBrowser에서 호출해야 하지만
                      // 여기서는 store의 상태만 변경 (XHR abort는 store 구독으로 처리)
                      useStore.getState().updateUploadTask(task.id, { status: "cancelled" });
                    }}
                    className="p-0.5 hover:bg-accent rounded-sm text-muted-foreground hover:text-red-500"
                    title="취소"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                {(task.status === "error" || task.status === "cancelled" || task.status === "done") && (
                  <button
                    onClick={() => removeUploadTask(task.id)}
                    className="p-0.5 hover:bg-accent rounded-sm text-muted-foreground"
                    title="목록에서 제거"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
