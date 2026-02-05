"use client";

import { useEffect, useState } from "react";
import {
  X,
  FileText,
  FolderOpen,
  Download,
  File,
  Loader2,
  User,
} from "lucide-react";
import { cn, formatFileSize, formatDate } from "@/lib/utils";
import type { SelectedItem } from "@/store/useStore";

interface FileDetail {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string | null; department: string | null };
  folder?: { name: string } | null;
}

interface FolderDetail {
  id: string;
  name: string;
  color: string;
  _count: { files: number; children: number };
  user?: { id: string; name: string | null };
  createdAt: string;
}

interface DetailPanelProps {
  selectedItems: SelectedItem[];
  onClose: () => void;
  fileSizes?: Map<string, number>;
}

export default function DetailPanel({
  selectedItems,
  onClose,
  fileSizes,
}: DetailPanelProps) {
  const [fileDetail, setFileDetail] = useState<FileDetail | null>(null);
  const [folderDetail, setFolderDetail] = useState<FolderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"details" | "activity">("details");

  useEffect(() => {
    setFileDetail(null);
    setFolderDetail(null);
    setTab("details");

    if (selectedItems.length === 1) {
      const item = selectedItems[0];
      setLoading(true);

      if (item.type === "file") {
        fetch(`/api/files/${item.id}`)
          .then((r) => r.json())
          .then((data) => {
            if (!data.error) setFileDetail(data);
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      } else {
        fetch(`/api/folders/${item.id}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.folder) setFolderDetail(data.folder);
          })
          .catch(() => {})
          .finally(() => setLoading(false));
      }
    }
  }, [selectedItems]);

  const handleDownload = () => {
    const fileItems = selectedItems.filter((i) => i.type === "file");
    const folderItems = selectedItems.filter((i) => i.type === "folder");

    if (fileItems.length === 0 && folderItems.length === 0) return;

    // 파일 1개만 + 폴더 없음 → 단일 다운로드
    if (fileItems.length === 1 && folderItems.length === 0) {
      window.open(`/api/files/${fileItems[0].id}/download`, "_blank");
      return;
    }

    // 그 외: zip (파일 + 폴더)
    fetch("/api/files/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileIds: fileItems.map((i) => i.id),
        folderIds: folderItems.map((i) => i.id),
      }),
    })
      .then((r) => r.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "files.zip";
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch(() => {});
  };

  const fileCount = selectedItems.filter((i) => i.type === "file").length;
  const folderCount = selectedItems.filter((i) => i.type === "folder").length;

  // Shell wrapper - desktop: side panel, mobile: bottom sheet overlay
  const Shell = ({ children, title }: { children: React.ReactNode; title: string }) => (
    <>
      {/* Mobile: backdrop + bottom sheet */}
      <div
        className="md:hidden fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />
      <div className={cn(
        // Desktop: side panel
        "hidden md:flex md:w-80 md:border-l md:border-border md:bg-card md:flex-col md:h-full",
      )}>
        <PanelContent title={title} tab={tab} setTab={setTab} onClose={onClose} selectedItems={selectedItems}>
          {children}
        </PanelContent>
      </div>
      {/* Mobile: bottom sheet */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-xl max-h-[70vh] flex flex-col shadow-xl animate-in slide-in-from-bottom duration-200">
        <PanelContent title={title} tab={tab} setTab={setTab} onClose={onClose} selectedItems={selectedItems}>
          {children}
        </PanelContent>
      </div>
    </>
  );

  // Loading
  if (loading && selectedItems.length === 1) {
    return (
      <Shell title="로딩 중...">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </Shell>
    );
  }

  // 다중 선택
  if (selectedItems.length > 1) {
    let totalSize = 0;
    if (fileSizes) {
      for (const item of selectedItems) {
        if (item.type === "file") {
          totalSize += fileSizes.get(item.id) || 0;
        }
      }
    }

    return (
      <Shell title={`${selectedItems.length}개 선택됨`}>
        {tab === "details" ? (
          <div className="p-5">
            {/* Preview area */}
            <div className="bg-muted rounded-lg flex items-center justify-center py-10 mb-6">
              <File className="w-14 h-14 text-muted-foreground/50" />
            </div>

            {/* Summary */}
            <div className="space-y-1 mb-6">
              <p className="text-sm">
                {fileCount > 0 && `파일 ${fileCount}개`}
                {fileCount > 0 && folderCount > 0 && ", "}
                {folderCount > 0 && `폴더 ${folderCount}개`}
              </p>
              {totalSize > 0 && (
                <p className="text-sm text-muted-foreground">
                  총 크기: {formatFileSize(totalSize)}
                </p>
              )}
            </div>

            {fileCount > 0 && (
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors"
              >
                <Download className="w-4 h-4" />
                {fileCount > 1 ? "ZIP 다운로드" : "다운로드"}
              </button>
            )}
          </div>
        ) : (
          <div className="p-5 text-sm text-muted-foreground text-center py-16">
            활동 내역이 없습니다.
          </div>
        )}
      </Shell>
    );
  }

  // 단일 파일 선택
  if (selectedItems.length === 1 && selectedItems[0].type === "file" && fileDetail) {
    const isImage = fileDetail.mimeType.startsWith("image/");

    return (
      <Shell title={fileDetail.originalName}>
        {tab === "details" ? (
          <div className="p-5 space-y-6">
            {/* Preview */}
            <div className="bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              {isImage ? (
                <img
                  src={fileDetail.path}
                  alt={fileDetail.originalName}
                  className="w-full max-h-48 object-contain"
                />
              ) : (
                <div className="py-10">
                  <FileText className="w-14 h-14 text-muted-foreground/50" />
                </div>
              )}
            </div>

            {/* 업로더 */}
            {fileDetail.user?.name && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">업로더</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                    {fileDetail.user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm">{fileDetail.user.name}</p>
                    {fileDetail.user.department && (
                      <p className="text-xs text-muted-foreground">
                        {fileDetail.user.department}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 파일 세부정보 */}
            <div>
              <p className="text-sm font-medium mb-3">파일 세부정보</p>
              <div className="space-y-2.5">
                <DetailRow label="유형" value={fileDetail.mimeType} />
                <DetailRow
                  label="크기"
                  value={formatFileSize(fileDetail.size)}
                />
                {fileDetail.folder && (
                  <DetailRow label="위치" value={fileDetail.folder.name} />
                )}
                <DetailRow
                  label="생성일"
                  value={formatDate(fileDetail.createdAt)}
                />
                <DetailRow
                  label="수정일"
                  value={formatDate(fileDetail.updatedAt)}
                />
                <DetailRow
                  label="조회수"
                  value={String(fileDetail.viewCount)}
                />
                <DetailRow
                  label="다운로드"
                  value={`${fileDetail.downloadCount}회`}
                />
              </div>
            </div>

            {/* 다운로드 버튼 */}
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors"
            >
              <Download className="w-4 h-4" />
              다운로드
            </button>
          </div>
        ) : (
          <div className="p-5 text-sm text-muted-foreground text-center py-16">
            활동 내역이 없습니다.
          </div>
        )}
      </Shell>
    );
  }

  // 단일 폴더 선택
  if (selectedItems.length === 1 && selectedItems[0].type === "folder" && folderDetail) {
    return (
      <Shell title={folderDetail.name}>
        {tab === "details" ? (
          <div className="p-5 space-y-6">
            {/* Preview */}
            <div className="bg-muted rounded-lg flex items-center justify-center py-10">
              <FolderOpen
                className="w-14 h-14"
                style={{ color: folderDetail.color }}
              />
            </div>

            {/* 생성자 */}
            {folderDetail.user?.name && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">생성자</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                    {folderDetail.user.name.charAt(0)}
                  </div>
                  <p className="text-sm">{folderDetail.user.name}</p>
                </div>
              </div>
            )}

            {/* 폴더 세부정보 */}
            <div>
              <p className="text-sm font-medium mb-3">폴더 세부정보</p>
              <div className="space-y-2.5">
                <DetailRow
                  label="파일 수"
                  value={`${folderDetail._count.files}개`}
                />
                <DetailRow
                  label="하위 폴더"
                  value={`${folderDetail._count.children}개`}
                />
                <DetailRow
                  label="생성일"
                  value={formatDate(folderDetail.createdAt)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 text-sm text-muted-foreground text-center py-16">
            활동 내역이 없습니다.
          </div>
        )}
      </Shell>
    );
  }

  // Nothing loaded yet
  if (selectedItems.length === 1) {
    return (
      <Shell title="">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </Shell>
    );
  }

  return null;
}

function PanelContent({
  children,
  title,
  tab,
  setTab,
  onClose,
  selectedItems,
}: {
  children: React.ReactNode;
  title: string;
  tab: "details" | "activity";
  setTab: (t: "details" | "activity") => void;
  onClose: () => void;
  selectedItems: SelectedItem[];
}) {
  return (
    <>
      {/* Drag handle (mobile) */}
      <div className="md:hidden flex justify-center pt-2 pb-1">
        <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
      </div>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border min-h-[52px]">
        {selectedItems.length === 1 && selectedItems[0].type === "file" ? (
          <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
        ) : selectedItems.length === 1 && selectedItems[0].type === "folder" ? (
          <FolderOpen className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <File className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        )}
        <span className="text-sm font-medium truncate flex-1">{title}</span>
        <button
          onClick={onClose}
          className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-border px-4">
        <button
          onClick={() => setTab("details")}
          className={cn(
            "px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
            tab === "details"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          세부정보
        </button>
        <button
          onClick={() => setTab("activity")}
          className={cn(
            "px-3 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
            tab === "activity"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          활동
        </button>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <p className="text-xs text-muted-foreground flex-shrink-0">{label}</p>
      <p className="text-xs text-right break-all">{value}</p>
    </div>
  );
}
