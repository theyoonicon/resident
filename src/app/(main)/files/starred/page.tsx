"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Star,
  FolderOpen,
  FileText,
  FileImage,
  FileVideo,
  FileArchive,
  FileSpreadsheet,
  FileCode,
  FileAudio,
  FileType,
  File,
  Loader2,
  Download,
} from "lucide-react";
import { cn, formatFileSize, formatDate } from "@/lib/utils";

interface StarredFile {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  updatedAt: string;
  isShared: boolean;
  user?: { id: string; name: string | null; department: string | null };
}

interface StarredFolder {
  id: string;
  name: string;
  color: string;
  isShared: boolean;
  user?: { id: string; name: string | null };
  _count: { files: number; children: number };
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/"))
    return { icon: FileImage, color: "text-red-500" };
  if (mimeType.startsWith("video/"))
    return { icon: FileVideo, color: "text-purple-500" };
  if (mimeType.startsWith("audio/"))
    return { icon: FileAudio, color: "text-pink-500" };
  if (mimeType === "application/pdf")
    return { icon: FileText, color: "text-red-600" };
  if (
    mimeType === "application/zip" ||
    mimeType === "application/x-rar-compressed" ||
    mimeType === "application/x-7z-compressed" ||
    mimeType === "application/gzip"
  )
    return { icon: FileArchive, color: "text-yellow-600" };
  if (
    mimeType === "application/vnd.ms-excel" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  )
    return { icon: FileSpreadsheet, color: "text-green-600" };
  if (
    mimeType === "application/vnd.ms-powerpoint" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  )
    return { icon: FileType, color: "text-orange-500" };
  if (
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/haansofthwp" ||
    mimeType === "application/x-hwp"
  )
    return { icon: FileText, color: "text-blue-600" };
  if (
    mimeType.startsWith("text/") ||
    mimeType === "application/json" ||
    mimeType === "application/xml"
  )
    return { icon: FileCode, color: "text-gray-600" };
  return { icon: File, color: "text-gray-400" };
}

export default function StarredPage() {
  const [files, setFiles] = useState<StarredFile[]>([]);
  const [folders, setFolders] = useState<StarredFolder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStarred = useCallback(() => {
    setLoading(true);
    fetch("/api/starred")
      .then((r) => r.json())
      .then((data) => {
        setFiles(data.files || []);
        setFolders(data.folders || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStarred();
  }, [fetchStarred]);

  const toggleStar = async (id: string, type: "file" | "folder") => {
    const body = type === "file" ? { fileId: id } : { folderId: id };
    try {
      await fetch("/api/starred", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      // 즐겨찾기 해제 → 목록에서 제거
      if (type === "file") {
        setFiles((prev) => prev.filter((f) => f.id !== id));
      } else {
        setFolders((prev) => prev.filter((f) => f.id !== id));
      }
    } catch {
      /* ignore */
    }
  };

  const isEmpty = files.length === 0 && folders.length === 0;

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : isEmpty ? (
        <div className="bg-card rounded-sm border border-border p-12 text-center text-muted-foreground">
          <Star className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
          <p>즐겨찾기한 항목이 없습니다.</p>
          <p className="text-sm mt-1">
            파일이나 폴더의 ⋮ 메뉴에서 즐겨찾기를 추가하세요.
          </p>
        </div>
      ) : (
        <>
          {/* Folders */}
          {folders.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-2">
                폴더
              </h2>
              <div
                className="grid gap-3 p-0.5"
                style={{
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(220px, 1fr))",
                }}
              >
                {folders.map((folder) => (
                  <a
                    key={folder.id}
                    href={`${folder.isShared ? "/files/shared" : "/files/my"}?folderId=${folder.id}`}
                    className="bg-card border border-border hover:shadow-md transition-all p-4 group relative"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleStar(folder.id, "folder");
                      }}
                      className="absolute top-2 right-2 p-1 rounded-sm hover:bg-accent"
                    >
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </button>
                    <FolderOpen
                      className="w-8 h-8"
                      style={{ color: folder.color }}
                    />
                    <div className="mt-2">
                      <p className="text-sm font-medium truncate">
                        {folder.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {folder.user?.name && (
                          <span>{folder.user.name} · </span>
                        )}
                        {folder._count.files}개 파일
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {files.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-2">
                파일
              </h2>
              <div
                className="grid gap-3 p-0.5"
                style={{
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(220px, 1fr))",
                }}
              >
                {files.map((file) => {
                  const { icon: IconComp, color } = getFileIcon(file.mimeType);
                  return (
                    <div
                      key={file.id}
                      className="bg-card border border-border hover:shadow-md transition-all p-4 group relative cursor-pointer"
                    >
                      <div className="absolute top-2 right-2 flex items-center gap-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(file.id, "file");
                          }}
                          className="p-1 rounded-sm hover:bg-accent"
                        >
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              `/api/files/${file.id}/download`,
                              "_blank"
                            );
                          }}
                          className="p-1 rounded-sm hover:bg-accent text-muted-foreground md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                      <IconComp className={cn("w-8 h-8", color)} />
                      <div className="mt-2">
                        <p className="text-sm font-medium truncate">
                          {file.originalName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {file.user?.name && (
                            <span>{file.user.name} · </span>
                          )}
                          {formatFileSize(file.size)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {formatDate(file.updatedAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
