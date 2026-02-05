"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  FolderOpen,
  FileText,
  MoreHorizontal,
  ChevronDown,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  File,
  Presentation,
  Download,
  Star,
} from "lucide-react";
import { formatDate, formatFileSize } from "@/lib/utils";

interface RecentFile {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  updatedAt: string;
  folder?: { name: string } | null;
  user?: { id: string; name: string | null; department: string | null } | null;
}

interface FolderItem {
  id: string;
  name: string;
  color: string | null;
  _count?: { files: number };
  updatedAt: string;
  user?: { id: string; name: string | null } | null;
}

function getFileIcon(mimeType: string) {
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
    return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
  if (mimeType.includes("image"))
    return <FileImage className="w-5 h-5 text-rose-500" />;
  if (mimeType.includes("zip") || mimeType.includes("archive"))
    return <FileArchive className="w-5 h-5 text-amber-600" />;
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return <Presentation className="w-5 h-5 text-orange-500" />;
  if (mimeType.includes("pdf"))
    return <FileText className="w-5 h-5 text-red-500" />;
  if (mimeType.includes("word") || mimeType.includes("document"))
    return <FileText className="w-5 h-5 text-blue-600" />;
  return <File className="w-5 h-5 text-muted-foreground" />;
}

// ============ Dropdown Menu ============
function DropdownMenu({
  actions,
  children,
}: {
  actions: { label: string; icon: React.ReactNode; onClick: () => void }[];
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={menuRef} className="relative flex-shrink-0">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        className="text-muted-foreground hover:text-foreground p-0.5 rounded-sm hover:bg-accent transition-colors"
      >
        {children}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-md py-1 min-w-[140px]">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
                action.onClick();
              }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent text-left"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [starredFileIds, setStarredFileIds] = useState<Set<string>>(new Set());
  const [starredFolderIds, setStarredFolderIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/files?scope=shared&limit=10&sort=recent")
      .then((r) => r.json())
      .then((data) => setRecentFiles(data.files || []))
      .catch(() => {});

    fetch("/api/folders?scope=shared")
      .then((r) => r.json())
      .then((data) => setFolders(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch("/api/starred")
      .then((r) => r.json())
      .then((data) => {
        if (data.starredFileIds) setStarredFileIds(new Set(data.starredFileIds));
        if (data.starredFolderIds) setStarredFolderIds(new Set(data.starredFolderIds));
      })
      .catch(() => {});
  }, []);

  const toggleStar = async (id: string, type: "file" | "folder") => {
    const body = type === "file" ? { fileId: id } : { folderId: id };
    try {
      const res = await fetch("/api/starred", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (type === "file") {
        setStarredFileIds((prev) => {
          const next = new Set(prev);
          if (data.starred) next.add(id); else next.delete(id);
          return next;
        });
      } else {
        setStarredFolderIds((prev) => {
          const next = new Set(prev);
          if (data.starred) next.add(id); else next.delete(id);
          return next;
        });
      }
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-8">
      {/* Quick Access */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Quick Access</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {folders.length > 0 ? (
            folders.slice(0, 5).map((folder) => (
              <Link
                key={folder.id}
                href={`/files/shared?folderId=${folder.id}`}
                className="bg-card rounded-sm border border-border p-5 hover:shadow-md transition-shadow flex flex-col items-center gap-3 text-center"
              >
                <FolderOpen
                  className="w-12 h-12"
                  style={{ color: folder.color || "#60a5fa" }}
                />
                <span className="text-sm font-medium truncate w-full">
                  {folder.name}
                </span>
              </Link>
            ))
          ) : null}
        </div>
      </section>

      {/* Recent Files */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Recent Files</h2>
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            Last Opened <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Folders 그리드 */}
        {folders.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Folder
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {folders.slice(0, 4).map((folder) => (
                <div
                  key={folder.id}
                  className="bg-card rounded-sm border border-border px-4 py-3 hover:shadow-md transition-shadow flex items-center justify-between"
                >
                  <Link
                    href={`/files/shared?folderId=${folder.id}`}
                    className="flex items-center gap-3 min-w-0 flex-1"
                  >
                    <FolderOpen
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: folder.color || "#60a5fa" }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {folder.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {folder.user?.name && (
                          <span>{folder.user.name} · </span>
                        )}
                        {formatDate(folder.updatedAt)}
                      </p>
                    </div>
                  </Link>
                  <DropdownMenu
                    actions={[
                      {
                        label: "폴더 열기",
                        icon: <FolderOpen className="w-3.5 h-3.5" />,
                        onClick: () => { window.location.href = `/files/shared?folderId=${folder.id}`; },
                      },
                      {
                        label: starredFolderIds.has(folder.id) ? "즐겨찾기 해제" : "즐겨찾기",
                        icon: <Star className={`w-3.5 h-3.5 ${starredFolderIds.has(folder.id) ? "fill-yellow-400 text-yellow-400" : ""}`} />,
                        onClick: () => toggleStar(folder.id, "folder"),
                      },
                    ]}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files 그리드 */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Files
          </p>
          {recentFiles.length === 0 ? (
            <div className="bg-card rounded-sm border border-border p-12 text-center">
              <p className="text-muted-foreground text-sm">
                아직 공유된 파일이 없습니다.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {recentFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-card rounded-sm border border-border px-4 py-3 hover:shadow-md transition-shadow flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {getFileIcon(file.mimeType)}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {file.user?.name && (
                          <span>{file.user.name} · </span>
                        )}
                        {formatDate(file.updatedAt)} ·{" "}
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu
                    actions={[
                      {
                        label: "다운로드",
                        icon: <Download className="w-3.5 h-3.5" />,
                        onClick: () => window.open(`/api/files/${file.id}/download`, "_blank"),
                      },
                      {
                        label: starredFileIds.has(file.id) ? "즐겨찾기 해제" : "즐겨찾기",
                        icon: <Star className={`w-3.5 h-3.5 ${starredFileIds.has(file.id) ? "fill-yellow-400 text-yellow-400" : ""}`} />,
                        onClick: () => toggleStar(file.id, "file"),
                      },
                    ]}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
