"use client";

import { Suspense, useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDropzone } from "react-dropzone";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  FolderOpen,
  FileText,
  Upload,
  FolderUp,
  Plus,
  Grid3X3,
  List,
  Trash2,
  ChevronRight,
  Home,
  X,
  Loader2,
  Download,
  GripVertical,
  Pencil,
  FolderInput,
  Info,
  MoreVertical,
  ArrowDownAZ,
  Clock,
  HardDrive,
  FileImage,
  FileVideo,
  FileArchive,
  FileSpreadsheet,
  FileCode,
  FileAudio,
  FileType,
  File,
  Star,
} from "lucide-react";
import { cn, formatFileSize, formatDate } from "@/lib/utils";
import { useStore, type SelectedItem } from "@/store/useStore";
import DetailPanel from "./DetailPanel";
import { useDraggable, useDroppable } from "@dnd-kit/core";

interface Folder {
  id: string;
  name: string;
  color: string;
  userId: string;
  _count: { files: number; children: number };
  user?: { id: string; name: string | null };
}

interface FileItem {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  updatedAt: string;
  userId: string;
  user?: { id: string; name: string | null; department: string | null };
}

interface FileBrowserProps {
  scope: "shared" | "personal";
}

// 디렉토리 reader에서 모든 항목을 읽음 (readEntries는 한번에 최대 100개만 반환)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function readAllEntries(reader: any): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => {
    const allEntries: FileSystemEntry[] = [];
    function readBatch() {
      reader.readEntries(
        (entries: FileSystemEntry[]) => {
          if (entries.length === 0) {
            resolve(allEntries);
          } else {
            allEntries.push(...entries);
            readBatch();
          }
        },
        reject
      );
    }
    readBatch();
  });
}

// DataTransferItem에서 재귀적으로 파일 추출
async function getFilesFromDataTransferItems(
  items: DataTransferItemList
): Promise<{ files: File[]; relativePaths: string[] } | null> {
  const files: File[] = [];
  const relativePaths: string[] = [];

  async function traverseEntry(
    entry: FileSystemEntry,
    pathPrefix: string
  ): Promise<void> {
    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry;
      const file = await new Promise<File>((resolve, reject) => {
        fileEntry.file(resolve, reject);
      });
      files.push(file);
      relativePaths.push(pathPrefix + file.name);
    } else if (entry.isDirectory) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dirEntry = entry as any;
      const reader = dirEntry.createReader?.() ?? dirEntry.createDirectoryReader?.();
      if (!reader) return;
      const childEntries = await readAllEntries(reader);
      for (const childEntry of childEntries) {
        await traverseEntry(childEntry, pathPrefix + entry.name + "/");
      }
    }
  }

  try {
    const entries: FileSystemEntry[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (typeof item.webkitGetAsEntry !== "function") return null;
      const entry = item.webkitGetAsEntry();
      if (entry) entries.push(entry);
    }

    for (const entry of entries) {
      await traverseEntry(entry, "");
    }

    return files.length > 0 ? { files, relativePaths } : null;
  } catch {
    return null;
  }
}

// ============ File Icon by Type ============

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/"))
    return { icon: FileImage, color: "text-red-500" };
  if (mimeType.startsWith("video/"))
    return { icon: FileVideo, color: "text-purple-500" };
  if (mimeType.startsWith("audio/"))
    return { icon: FileAudio, color: "text-pink-500" };
  if (mimeType === "application/pdf")
    return { icon: FileText, color: "text-red-600" };
  if (mimeType === "application/zip" || mimeType === "application/x-rar-compressed" || mimeType === "application/x-7z-compressed" || mimeType === "application/gzip")
    return { icon: FileArchive, color: "text-yellow-600" };
  if (mimeType === "application/vnd.ms-excel" || mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    return { icon: FileSpreadsheet, color: "text-green-600" };
  if (mimeType === "application/vnd.ms-powerpoint" || mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation")
    return { icon: FileType, color: "text-orange-500" };
  if (mimeType === "application/msword" || mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || mimeType === "application/haansofthwp" || mimeType === "application/x-hwp")
    return { icon: FileText, color: "text-blue-600" };
  if (mimeType.startsWith("text/") || mimeType === "application/json" || mimeType === "application/xml")
    return { icon: FileCode, color: "text-gray-600" };
  return { icon: File, color: "text-gray-400" };
}

// ============ Draggable Item Wrapper ============

function DraggableItem({
  id,
  type,
  children,
}: {
  id: string;
  type: "file" | "folder";
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `${type}-${id}`,
    data: { id, type },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <div {...listeners} className="contents">
        {children}
      </div>
    </div>
  );
}

// ============ Droppable Folder Wrapper ============

function DroppableFolder({
  id,
  children,
}: {
  id: string;
  children: (isOver: boolean) => React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-folder-${id}`,
    data: { folderId: id },
  });

  return <div ref={setNodeRef}>{children(isOver)}</div>;
}

// ============ Move Dialog ============

function MoveDialog({
  onMove,
  onClose,
  currentFolderId,
  scope,
}: {
  onMove: (targetFolderId: string | null) => void;
  onClose: () => void;
  currentFolderId: string | null;
  scope: "shared" | "personal";
}) {
  const [browseFolderId, setBrowseFolderId] = useState<string | null>(null);
  const [browseFolders, setBrowseFolders] = useState<
    { id: string; name: string; color: string; _count: { files: number; children: number } }[]
  >([]);
  const [browseBreadcrumbs, setBrowseBreadcrumbs] = useState<
    { id: string | null; name: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = browseFolderId ? `&parentId=${browseFolderId}` : "";
    fetch(`/api/folders?scope=${scope}${params}`)
      .then((r) => r.json())
      .then((data) => setBrowseFolders(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));

    if (browseFolderId) {
      fetch(`/api/folders/${browseFolderId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.breadcrumbs) setBrowseBreadcrumbs(data.breadcrumbs);
        })
        .catch(() => {});
    } else {
      setBrowseBreadcrumbs([]);
    }
  }, [browseFolderId, scope]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border border-border rounded-lg shadow-xl w-96 max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium">이동할 위치 선택</span>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* breadcrumbs */}
        <div className="flex items-center gap-1 px-4 py-2 text-xs border-b border-border bg-muted/30 min-h-[36px]">
          <button
            onClick={() => setBrowseFolderId(null)}
            className={cn(
              "hover:underline",
              !browseFolderId
                ? "font-semibold text-foreground"
                : "text-muted-foreground"
            )}
          >
            홈
          </button>
          {browseBreadcrumbs.map((bc, idx) => (
            <span key={bc.id} className="flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              {idx < browseBreadcrumbs.length - 1 ? (
                <button
                  onClick={() => setBrowseFolderId(bc.id)}
                  className="text-muted-foreground hover:underline"
                >
                  {bc.name}
                </button>
              ) : (
                <span className="font-semibold text-foreground">{bc.name}</span>
              )}
            </span>
          ))}
        </div>

        {/* folder list */}
        <div className="flex-1 overflow-y-auto p-2 min-h-[200px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : browseFolders.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              하위 폴더가 없습니다
            </div>
          ) : (
            browseFolders.map((f) => (
              <button
                key={f.id}
                onClick={() => setBrowseFolderId(f.id)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-sm hover:bg-accent text-left text-sm"
              >
                <FolderOpen
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: f.color }}
                />
                <span className="truncate">{f.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {f._count.files}개 파일
                </span>
              </button>
            ))
          )}
        </div>

        {/* actions */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {browseFolderId === currentFolderId
              ? "현재 위치"
              : browseFolderId
                ? "이 폴더로 이동"
                : "루트로 이동"}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm border border-border rounded-sm hover:bg-accent"
            >
              취소
            </button>
            <button
              onClick={() => {
                if (browseFolderId !== currentFolderId) {
                  onMove(browseFolderId);
                }
                onClose();
              }}
              disabled={browseFolderId === currentFolderId}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-sm hover:opacity-90 disabled:opacity-50"
            >
              여기로 이동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ Kebab Menu ============

function KebabMenu({
  actions,
}: {
  actions: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }[];
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
    <div ref={menuRef} className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className="p-1 rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent md:opacity-0 md:group-hover:opacity-100 transition-opacity"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-md py-1 min-w-[140px]">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                action.onClick();
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent text-left",
                action.danger && "text-red-500 hover:text-red-600"
              )}
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

// ============ Main Component ============

export default function FileBrowser({ scope }: FileBrowserProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <FileBrowserContent scope={scope} />
    </Suspense>
  );
}

function FileBrowserContent({ scope }: FileBrowserProps) {
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");
  const { data: session } = useSession();
  const folderInputRef = useRef<HTMLInputElement>(null);

  const {
    viewMode,
    setViewMode,
    selectedItems,
    toggleSelectItem,
    clearSelection,
    setSelectedItems,
    showDetailPanel,
    setShowDetailPanel,
  } = useStore();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<
    { id: string | null; name: string }[]
  >([]);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [renamingItem, setRenamingItem] = useState<{
    id: string;
    type: "file" | "folder";
    name: string;
  } | null>(null);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "date" | "size">("name");
  const [starredFileIds, setStarredFileIds] = useState<Set<string>>(new Set());
  const [starredFolderIds, setStarredFolderIds] = useState<Set<string>>(new Set());

  const isShared = scope === "shared";
  const basePath = isShared ? "/files/shared" : "/files/my";

  // 정렬된 폴더/파일
  const sortedFolders = useMemo(() => {
    const arr = [...folders];
    if (sortBy === "name") arr.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    else if (sortBy === "date") arr.sort((a, b) => b.id.localeCompare(a.id)); // id is cuid, roughly chronological
    return arr;
  }, [folders, sortBy]);

  const sortedFiles = useMemo(() => {
    const arr = [...files];
    if (sortBy === "name") arr.sort((a, b) => a.originalName.localeCompare(b.originalName, "ko"));
    else if (sortBy === "date") arr.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    else if (sortBy === "size") arr.sort((a, b) => b.size - a.size);
    return arr;
  }, [files, sortBy]);

  // allItems: 선택 영역용 (폴더 먼저, 파일 나중)
  const allItems: SelectedItem[] = useMemo(
    () => [
      ...folders.map((f) => ({ id: f.id, type: "folder" as const })),
      ...files.map((f) => ({ id: f.id, type: "file" as const })),
    ],
    [folders, files]
  );

  // 파일 크기 맵 (DetailPanel용)
  const fileSizes = useMemo(() => {
    const m = new Map<string, number>();
    for (const f of files) m.set(f.id, f.size);
    return m;
  }, [files]);

  // webkitdirectory 속성을 DOM에 직접 설정
  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute("webkitdirectory", "");
      folderInputRef.current.setAttribute("directory", "");
    }
  }, []);

  // folderId 변경 시 선택 초기화
  useEffect(() => {
    clearSelection();
  }, [folderId, clearSelection]);

  // Ctrl+A / Escape / F2 단축키
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "Escape") {
        if (renamingItem) {
          setRenamingItem(null);
        } else {
          clearSelection();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        setSelectedItems(allItems);
      }
      if (e.key === "F2" && selectedItems.length === 1) {
        e.preventDefault();
        const sel = selectedItems[0];
        const name =
          sel.type === "folder"
            ? folders.find((f) => f.id === sel.id)?.name || ""
            : files.find((f) => f.id === sel.id)?.originalName || "";
        setRenamingItem({ id: sel.id, type: sel.type, name });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [allItems, clearSelection, setSelectedItems, selectedItems, renamingItem, folders, files]);

  // DnD sensors: distance 8 to distinguish click from drag
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const canDelete = (resourceUserId: string) => {
    if (!session?.user) return false;
    if (session.user.id === resourceUserId) return true;
    if (session.user.role === "ADMIN") return true;
    return false;
  };

  const fetchContents = useCallback(() => {
    const params = folderId ? `&parentId=${folderId}` : "";
    fetch(`/api/folders?scope=${scope}${params}`)
      .then((r) => r.json())
      .then((data) => setFolders(Array.isArray(data) ? data : []))
      .catch(() => {});

    const fileParams = folderId ? `&folderId=${folderId}` : "&folderId=";
    fetch(`/api/files?scope=${scope}${fileParams}`)
      .then((r) => r.json())
      .then((data) => setFiles(data.files || []))
      .catch(() => {});

    if (folderId) {
      fetch(`/api/folders/${folderId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.breadcrumbs) setBreadcrumbs(data.breadcrumbs);
        })
        .catch(() => {});
    } else {
      setBreadcrumbs([]);
    }
  }, [folderId, scope]);

  useEffect(() => {
    fetchContents();
  }, [fetchContents]);

  // 즐겨찾기 상태 가져오기
  const fetchStarred = useCallback(() => {
    fetch("/api/starred")
      .then((r) => r.json())
      .then((data) => {
        if (data.starredFileIds) setStarredFileIds(new Set(data.starredFileIds));
        if (data.starredFolderIds) setStarredFolderIds(new Set(data.starredFolderIds));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchStarred();
  }, [fetchStarred]);

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
          if (data.starred) next.add(id);
          else next.delete(id);
          return next;
        });
      } else {
        setStarredFolderIds((prev) => {
          const next = new Set(prev);
          if (data.starred) next.add(id);
          else next.delete(id);
          return next;
        });
      }
    } catch { /* ignore */ }
  };

  const { addUploadTasks, updateUploadTask } = useStore();

  // XHR 참조를 저장해서 취소 가능하게
  const xhrMap = useRef<Map<string, XMLHttpRequest>>(new Map());

  const uploadFiles = useCallback(
    async (fileList: File[], relativePaths?: string[]) => {
      // 각 파일을 개별 태스크로 등록
      const tasks = fileList.map((file, i) => ({
        id: crypto.randomUUID(),
        fileName: relativePaths?.[i] || file.name,
        progress: 0,
        status: "pending" as const,
      }));

      addUploadTasks(tasks);

      // 순차 업로드
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const task = tasks[i];

        // 취소된 상태인지 확인
        const currentTask = useStore.getState().uploadTasks.find((t) => t.id === task.id);
        if (currentTask?.status === "cancelled") continue;

        updateUploadTask(task.id, { status: "uploading" });

        const formData = new FormData();
        formData.append("files", file);
        if (folderId) formData.append("folderId", folderId);
        formData.append("isShared", String(isShared));
        if (relativePaths && relativePaths[i]) {
          formData.append("relativePaths", JSON.stringify([relativePaths[i]]));
        }

        try {
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhrMap.current.set(task.id, xhr);
            xhr.open("POST", "/api/upload");

            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const pct = Math.round((e.loaded / e.total) * 100);
                updateUploadTask(task.id, { progress: pct });
              }
            };

            xhr.onload = () => {
              xhrMap.current.delete(task.id);
              if (xhr.status >= 200 && xhr.status < 300) {
                updateUploadTask(task.id, { progress: 100, status: "done" });
                resolve();
              } else {
                let msg = `업로드 실패 (${xhr.status})`;
                try {
                  const body = JSON.parse(xhr.responseText);
                  if (body.error) msg = body.error;
                } catch { /* ignore */ }
                updateUploadTask(task.id, { status: "error", errorMessage: msg });
                reject(new Error(msg));
              }
            };

            xhr.onerror = () => {
              xhrMap.current.delete(task.id);
              updateUploadTask(task.id, { status: "error", errorMessage: "네트워크 오류" });
              reject(new Error("네트워크 오류"));
            };

            xhr.onabort = () => {
              xhrMap.current.delete(task.id);
              updateUploadTask(task.id, { status: "cancelled" });
              resolve(); // don't reject, just skip
            };

            xhr.send(formData);
          });
        } catch {
          // error already handled in xhr callbacks, continue to next file
          continue;
        }
      }

      fetchContents();
    },
    [folderId, fetchContents, isShared, addUploadTasks, updateUploadTask]
  );

  // 개별 파일 업로드 취소
  const cancelUpload = useCallback((taskId: string) => {
    const xhr = xhrMap.current.get(taskId);
    if (xhr) {
      xhr.abort();
    } else {
      // pending 상태면 바로 취소 처리
      updateUploadTask(taskId, { status: "cancelled" });
    }
  }, [updateUploadTask]);

  // 파일 업로드 드래그앤드롭 핸들러
  const handleFileDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      if (!e.dataTransfer) return;

      if (e.dataTransfer.items?.length > 0) {
        let hasDirectory = false;
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          const entry = e.dataTransfer.items[i].webkitGetAsEntry?.();
          if (entry?.isDirectory) {
            hasDirectory = true;
            break;
          }
        }

        if (hasDirectory) {
          const result = await getFilesFromDataTransferItems(
            e.dataTransfer.items
          );
          if (result && result.files.length > 0) {
            await uploadFiles(result.files, result.relativePaths);
            return;
          }
        }
      }

      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.length > 0) {
        await uploadFiles(droppedFiles);
      }
    },
    [uploadFiles]
  );

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      await uploadFiles(acceptedFiles);
    },
    [uploadFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    noDrag: true,
  });

  const handleFolderSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList || fileList.length === 0) return;

      const fileArray: File[] = [];
      const rPaths: string[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        fileArray.push(file);
        rPaths.push(
          (file as File & { webkitRelativePath?: string }).webkitRelativePath ||
            file.name
        );
      }

      await uploadFiles(fileArray, rPaths);

      if (folderInputRef.current) {
        folderInputRef.current.value = "";
      }
    },
    [uploadFiles]
  );

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newFolderName,
        parentId: folderId,
        isShared,
      }),
    });
    setNewFolderName("");
    setShowNewFolder(false);
    fetchContents();
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm("이 파일을 삭제하시겠습니까?")) return;
    await fetch(`/api/files/${fileId}`, { method: "DELETE" });
    fetchContents();
  };

  const deleteFolder = async (id: string) => {
    if (!confirm("이 폴더와 내부 파일을 모두 삭제하시겠습니까?")) return;
    await fetch(`/api/folders/${id}`, { method: "DELETE" });
    fetchContents();
  };

  // 이름 변경
  const submitRename = async () => {
    if (!renamingItem || !renamingItem.name.trim()) {
      setRenamingItem(null);
      return;
    }
    const endpoint =
      renamingItem.type === "file"
        ? `/api/files/${renamingItem.id}`
        : `/api/folders/${renamingItem.id}`;
    const body =
      renamingItem.type === "file"
        ? { originalName: renamingItem.name.trim() }
        : { name: renamingItem.name.trim() };

    await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setRenamingItem(null);
    fetchContents();
  };

  const startRename = (id: string, type: "file" | "folder", name: string) => {
    setRenamingItem({ id, type, name });
  };

  // 선택 항목 일괄 삭제
  const deleteSelected = async () => {
    if (!confirm(`${selectedItems.length}개 항목을 삭제하시겠습니까?`)) return;

    const promises = selectedItems.map((item) =>
      item.type === "file"
        ? fetch(`/api/files/${item.id}`, { method: "DELETE" })
        : fetch(`/api/folders/${item.id}`, { method: "DELETE" })
    );
    await Promise.all(promises);
    clearSelection();
    fetchContents();
  };

  // 다운로드
  const downloadSelected = () => {
    const fileItems = selectedItems.filter((i) => i.type === "file");
    const folderItems = selectedItems.filter((i) => i.type === "folder");

    if (fileItems.length === 0 && folderItems.length === 0) return;

    // 파일 1개만 선택 + 폴더 없음 → 단일 다운로드
    if (fileItems.length === 1 && folderItems.length === 0) {
      window.open(`/api/files/${fileItems[0].id}/download`, "_blank");
      return;
    }

    // 그 외: zip 다운로드 (파일 + 폴더)
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

  // 선택 항목 이동
  const moveSelected = async (targetFolderId: string | null) => {
    const promises = selectedItems.map((item) => {
      if (item.type === "file") {
        return fetch(`/api/files/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId: targetFolderId }),
        });
      } else {
        return fetch(`/api/folders/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parentId: targetFolderId }),
        });
      }
    });
    await Promise.all(promises);
    clearSelection();
    fetchContents();
  };

  // 모바일 감지
  const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

  // 롱프레스 관련
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const handlePointerDown = (item: SelectedItem) => {
    if (!isMobile) return;
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      // 롱프레스: 선택 모드 진입/토글
      toggleSelectItem(item, true, false, allItems);
    }, 500);
  };

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePointerCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // 항목 클릭 핸들러
  const handleItemClick = (
    e: React.MouseEvent,
    item: SelectedItem
  ) => {
    e.stopPropagation();

    // 모바일: 롱프레스 후 클릭은 무시
    if (isMobile && longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }

    if (isMobile) {
      // 모바일 + 선택 모드: 탭으로 선택 토글
      if (hasSelection) {
        toggleSelectItem(item, true, false, allItems);
        return;
      }
      // 모바일 + 비선택 모드: 폴더→진입, 파일→다운로드
      if (item.type === "folder") {
        window.location.href = `${basePath}?folderId=${item.id}`;
      } else {
        window.open(`/api/files/${item.id}/download`, "_blank");
      }
      return;
    }

    // 데스크탑: 기존 동작 (클릭=선택)
    toggleSelectItem(item, e.ctrlKey || e.metaKey, e.shiftKey, allItems);
  };

  // 폴더 더블클릭 → 진입 (데스크탑만)
  const handleFolderDoubleClick = (fId: string) => {
    if (isMobile) return;
    window.location.href = `${basePath}?folderId=${fId}`;
  };

  // 빈 영역 클릭 시 선택 해제
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  };

  const isSelected = (id: string, type: "file" | "folder") =>
    selectedItems.some((s) => s.id === id && s.type === type);

  // ============ DnD Handlers ============
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;

    const overData = over.data.current as { folderId?: string | null } | undefined;
    if (!overData || overData.folderId === undefined) return;
    const targetFolderId = overData.folderId; // null = 루트

    const activeData = active.data.current as
      | { id: string; type: "file" | "folder" }
      | undefined;
    if (!activeData) return;

    // 선택된 항목이 드래그 대상을 포함하면 전체 이동, 아니면 단일 이동
    const itemsToMove = selectedItems.some(
      (s) => s.id === activeData.id && s.type === activeData.type
    )
      ? selectedItems
      : [activeData];

    // 자기 자신 폴더로는 이동 불가, 현재 폴더와 같으면 무시
    const filtered = itemsToMove.filter(
      (item) => !(item.type === "folder" && item.id === targetFolderId)
    );

    if (filtered.length === 0) return;

    const promises = filtered.map((item) => {
      if (item.type === "file") {
        return fetch(`/api/files/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folderId: targetFolderId }),
        });
      } else {
        return fetch(`/api/folders/${item.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ parentId: targetFolderId }),
        });
      }
    });

    await Promise.all(promises);
    clearSelection();
    fetchContents();
  };

  // 드래그 중 표시할 텍스트
  const dragItemCount = activeDragId
    ? selectedItems.length > 1 &&
      selectedItems.some((s) => {
        const [type, id] = activeDragId.split("-");
        return s.id === id && s.type === type;
      })
      ? selectedItems.length
      : 1
    : 0;

  const [dragOver, setDragOver] = useState(false);
  const hasSelection = selectedItems.length > 0;
  const selectedFileCount = selectedItems.filter(
    (i) => i.type === "file"
  ).length;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full">
        {/* Hidden file inputs */}
        <input {...getInputProps()} />
        <input
          ref={folderInputRef}
          type="file"
          className="hidden"
          onChange={handleFolderSelect}
        />

        {/* Upload drag overlay */}
        {(isDragActive || dragOver) && (
          <div className="fixed inset-0 z-50 bg-primary/10 border-2 border-dashed border-primary flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <Upload className="w-12 h-12 text-primary mx-auto mb-2" />
              <p className="text-lg font-medium text-primary">
                파일 또는 폴더를 여기에 놓으세요
              </p>
            </div>
          </div>
        )}

        {/* Row 1: Breadcrumbs + actions — always full width */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1.5 text-sm min-w-0">
            <a
              href={basePath}
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              <Home className="w-4 h-4" />
            </a>
            {breadcrumbs.map((bc, idx) => (
              <span key={bc.id} className="flex items-center gap-1.5 min-w-0">
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                {idx < breadcrumbs.length - 1 ? (
                  <a
                    href={`${basePath}?folderId=${bc.id}`}
                    className="text-muted-foreground hover:text-foreground truncate"
                  >
                    {bc.name}
                  </a>
                ) : (
                  <span className="font-medium truncate">{bc.name}</span>
                )}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setShowNewFolder(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title="새 폴더"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">새 폴더</span>
            </button>
            <button
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.multiple = true;
                input.onchange = (e) => {
                  const fileList = (e.target as HTMLInputElement).files;
                  if (fileList && fileList.length > 0) {
                    uploadFiles(Array.from(fileList));
                  }
                };
                input.click();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
              title="파일 업로드"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">업로드</span>
            </button>
            <div className="h-5 w-px bg-border mx-1" />
            <button
              onClick={() =>
                setViewMode(viewMode === "grid" ? "list" : "grid")
              }
              className="p-2 rounded-sm hover:bg-accent text-muted-foreground"
              title={viewMode === "grid" ? "목록 보기" : "그리드 보기"}
            >
              {viewMode === "grid" ? (
                <List className="w-4 h-4" />
              ) : (
                <Grid3X3 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setShowDetailPanel(!showDetailPanel)}
              className={cn(
                "p-2 rounded-sm hover:bg-accent",
                showDetailPanel
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground"
              )}
              title="세부정보 패널"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2: Filter bar OR Selection action bar — same height, swaps in place */}
        <div className="flex items-center flex-shrink-0 h-10 mt-2 mb-1">
          {hasSelection ? (
            <div className="flex items-center gap-0.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-full px-2 py-0.5 text-xs">
              <button
                onClick={clearSelection}
                className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 text-muted-foreground"
                title="선택 해제"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <span className="font-medium px-1">
                {selectedItems.length}개 선택됨
              </span>

              <div className="h-4 w-px bg-blue-200 dark:bg-blue-700 mx-0.5" />

              <button
                onClick={downloadSelected}
                className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 text-muted-foreground hover:text-foreground"
                title="다운로드"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowMoveDialog(true)}
                className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 text-muted-foreground hover:text-foreground"
                title="이동"
              >
                <FolderInput className="w-3.5 h-3.5" />
              </button>
              {selectedItems.length === 1 && (
                <button
                  onClick={() => {
                    const sel = selectedItems[0];
                    const name =
                      sel.type === "folder"
                        ? folders.find((f) => f.id === sel.id)?.name || ""
                        : files.find((f) => f.id === sel.id)?.originalName ||
                          "";
                    startRename(sel.id, sel.type, name);
                  }}
                  className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 text-muted-foreground hover:text-foreground"
                  title="이름 변경"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={deleteSelected}
                className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 text-muted-foreground hover:text-red-500"
                title="삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-sm">
              <button
                onClick={() => setSortBy("name")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  sortBy === "name"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                <ArrowDownAZ className="w-3.5 h-3.5" />
                이름순
              </button>
              <button
                onClick={() => setSortBy("date")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  sortBy === "date"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                날짜순
              </button>
              <button
                onClick={() => setSortBy("size")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                  sortBy === "size"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                <HardDrive className="w-3.5 h-3.5" />
                크기순
              </button>
            </div>
          )}
        </div>

        {/* Content area + Detail Panel */}
        <div className="flex flex-1 min-h-0">
          {/* Scrollable file/folder content */}
          <div
            {...getRootProps()}
            className="flex-1 min-w-0 overflow-y-auto space-y-4 pr-1"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragOver(false);
            }}
            onDrop={(e) => {
              setDragOver(false);
              handleFileDrop(e);
            }}
            onClick={handleBackgroundClick}
          >
            {/* New Folder Input */}
            {showNewFolder && (
              <div className="flex items-center gap-2 bg-card rounded-sm border border-border p-3">
                <FolderOpen className="w-5 h-5 text-primary" />
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createFolder()}
                  placeholder="폴더 이름"
                  autoFocus
                  className="flex-1 bg-transparent text-sm outline-none"
                />
                <button
                  onClick={createFolder}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs"
                >
                  만들기
                </button>
                <button
                  onClick={() => setShowNewFolder(false)}
                  className="p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Folders */}
            {sortedFolders.length > 0 && (
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid gap-3 p-0.5"
                    : "space-y-1 p-0.5"
                )}
                style={
                  viewMode === "grid"
                    ? {
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(220px, 1fr))",
                      }
                    : undefined
                }
                onClick={handleBackgroundClick}
              >
                {sortedFolders.map((folder) => (
                  <DroppableFolder key={folder.id} id={folder.id}>
                    {(isOver) => (
                      <DraggableItem id={folder.id} type="folder">
                        <div
                          onClick={(e) =>
                            handleItemClick(e, {
                              id: folder.id,
                              type: "folder",
                            })
                          }
                          onDoubleClick={() =>
                            handleFolderDoubleClick(folder.id)
                          }
                          onPointerDown={() => handlePointerDown({ id: folder.id, type: "folder" })}
                          onPointerUp={handlePointerUp}
                          onPointerCancel={handlePointerCancel}
                          className={cn(
                            "bg-card border border-border hover:shadow-md transition-all group cursor-pointer select-none relative",
                            viewMode === "grid"
                              ? "p-4"
                              : "p-3 flex items-center gap-3",
                            isSelected(folder.id, "folder") &&
                              "ring-2 ring-primary bg-primary/5",
                            isOver &&
                              "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950"
                          )}
                        >
                          <FolderOpen
                            className="w-8 h-8 flex-shrink-0"
                            style={{ color: folder.color }}
                          />
                          <div className={viewMode === "grid" ? "mt-2" : ""}>
                            {renamingItem?.id === folder.id &&
                            renamingItem?.type === "folder" ? (
                              <input
                                type="text"
                                value={renamingItem.name}
                                onChange={(e) =>
                                  setRenamingItem({
                                    ...renamingItem,
                                    name: e.target.value,
                                  })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") submitRename();
                                  if (e.key === "Escape")
                                    setRenamingItem(null);
                                  e.stopPropagation();
                                }}
                                onBlur={submitRename}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                                className="text-sm font-medium bg-transparent border-b border-primary outline-none w-full"
                              />
                            ) : (
                              <p className="text-sm font-medium truncate">
                                {folder.name}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground truncate">
                              {isShared && folder.user?.name && (
                                <span>{folder.user.name} · </span>
                              )}
                              {folder._count.files}개 파일
                            </p>
                          </div>
                          <div className={cn(
                            viewMode === "grid"
                              ? "absolute top-2 right-2"
                              : "ml-auto flex-shrink-0"
                          )}>
                            <KebabMenu
                              actions={[
                                {
                                  label: "상세정보",
                                  icon: <Info className="w-3.5 h-3.5" />,
                                  onClick: () => {
                                    setSelectedItems([{ id: folder.id, type: "folder" }]);
                                    setShowDetailPanel(true);
                                  },
                                },
                                {
                                  label: starredFolderIds.has(folder.id) ? "즐겨찾기 해제" : "즐겨찾기",
                                  icon: <Star className={cn("w-3.5 h-3.5", starredFolderIds.has(folder.id) && "fill-yellow-400 text-yellow-400")} />,
                                  onClick: () => toggleStar(folder.id, "folder"),
                                },
                                {
                                  label: "이름 변경",
                                  icon: <Pencil className="w-3.5 h-3.5" />,
                                  onClick: () => startRename(folder.id, "folder", folder.name),
                                },
                                {
                                  label: "이동",
                                  icon: <FolderInput className="w-3.5 h-3.5" />,
                                  onClick: () => {
                                    setSelectedItems([{ id: folder.id, type: "folder" }]);
                                    setShowMoveDialog(true);
                                  },
                                },
                                ...(canDelete(folder.userId)
                                  ? [
                                      {
                                        label: "삭제",
                                        icon: <Trash2 className="w-3.5 h-3.5" />,
                                        onClick: () => deleteFolder(folder.id),
                                        danger: true,
                                      },
                                    ]
                                  : []),
                              ]}
                            />
                          </div>
                        </div>
                      </DraggableItem>
                    )}
                  </DroppableFolder>
                ))}
              </div>
            )}

            {/* Files */}
            {sortedFiles.length > 0 && (
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid gap-3 p-0.5"
                    : "space-y-1 p-0.5"
                )}
                style={
                  viewMode === "grid"
                    ? {
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(220px, 1fr))",
                      }
                    : undefined
                }
                onClick={handleBackgroundClick}
              >
                {sortedFiles.map((file) => (
                  <DraggableItem key={file.id} id={file.id} type="file">
                    <div
                      onClick={(e) =>
                        handleItemClick(e, { id: file.id, type: "file" })
                      }
                      onPointerDown={() => handlePointerDown({ id: file.id, type: "file" })}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerCancel}
                      className={cn(
                        "bg-card border border-border hover:shadow-md transition-all group cursor-pointer select-none relative",
                        viewMode === "grid"
                          ? "p-4"
                          : "p-3 flex items-center gap-3",
                        isSelected(file.id, "file") &&
                          "ring-2 ring-primary bg-primary/5"
                      )}
                    >
                      {(() => {
                        const { icon: IconComp, color } = getFileIcon(file.mimeType);
                        return <IconComp className={cn("w-8 h-8 flex-shrink-0", color)} />;
                      })()}
                      <div
                        className={cn(
                          "flex-1 min-w-0",
                          viewMode === "grid" ? "mt-2" : ""
                        )}
                      >
                        {renamingItem?.id === file.id &&
                        renamingItem?.type === "file" ? (
                          <input
                            type="text"
                            value={renamingItem.name}
                            onChange={(e) =>
                              setRenamingItem({
                                ...renamingItem,
                                name: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") submitRename();
                              if (e.key === "Escape") setRenamingItem(null);
                              e.stopPropagation();
                            }}
                            onBlur={submitRename}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="text-sm font-medium bg-transparent border-b border-primary outline-none w-full"
                          />
                        ) : (
                          <p className="text-sm font-medium truncate">
                            {file.originalName}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground truncate">
                          {isShared && file.user?.name && (
                            <span>{file.user.name} · </span>
                          )}
                          {formatFileSize(file.size)}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {formatDate(file.updatedAt)}
                        </p>
                      </div>
                      <div className={cn(
                        viewMode === "grid"
                          ? "absolute top-2 right-2"
                          : "ml-auto flex-shrink-0"
                      )}>
                        <KebabMenu
                          actions={[
                            {
                              label: "상세정보",
                              icon: <Info className="w-3.5 h-3.5" />,
                              onClick: () => {
                                setSelectedItems([{ id: file.id, type: "file" }]);
                                setShowDetailPanel(true);
                              },
                            },
                            {
                              label: starredFileIds.has(file.id) ? "즐겨찾기 해제" : "즐겨찾기",
                              icon: <Star className={cn("w-3.5 h-3.5", starredFileIds.has(file.id) && "fill-yellow-400 text-yellow-400")} />,
                              onClick: () => toggleStar(file.id, "file"),
                            },
                            {
                              label: "다운로드",
                              icon: <Download className="w-3.5 h-3.5" />,
                              onClick: () =>
                                window.open(`/api/files/${file.id}/download`, "_blank"),
                            },
                            {
                              label: "이름 변경",
                              icon: <Pencil className="w-3.5 h-3.5" />,
                              onClick: () => startRename(file.id, "file", file.originalName),
                            },
                            {
                              label: "이동",
                              icon: <FolderInput className="w-3.5 h-3.5" />,
                              onClick: () => {
                                setSelectedItems([{ id: file.id, type: "file" }]);
                                setShowMoveDialog(true);
                              },
                            },
                            ...(canDelete(file.userId)
                              ? [
                                  {
                                    label: "삭제",
                                    icon: <Trash2 className="w-3.5 h-3.5" />,
                                    onClick: () => deleteFile(file.id),
                                    danger: true,
                                  },
                                ]
                              : []),
                          ]}
                        />
                      </div>
                    </div>
                  </DraggableItem>
                ))}
              </div>
            )}

            {folders.length === 0 && files.length === 0 && !showNewFolder && (
              <div className="bg-card rounded-sm border border-border p-16 text-center">
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {isShared
                    ? "아직 공유된 파일이 없습니다."
                    : "개인 파일이 없습니다."}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  파일 또는 폴더를 드래그하거나 업로드 버튼을 클릭하세요.
                </p>
              </div>
            )}
          </div>

          {/* Detail Panel - toggled by ℹ button */}
          {showDetailPanel && hasSelection && (
            <div className="flex-shrink-0">
              <DetailPanel
                selectedItems={selectedItems}
                onClose={() => setShowDetailPanel(false)}
                fileSizes={fileSizes}
              />
            </div>
          )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeDragId && (
            <div className="bg-card border border-primary shadow-lg rounded-sm px-4 py-2 text-sm font-medium flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              {dragItemCount > 1
                ? `${dragItemCount}개 항목 이동`
                : "항목 이동"}
            </div>
          )}
        </DragOverlay>
      </div>

      {/* Move Dialog */}
      {showMoveDialog && (
        <MoveDialog
          onMove={moveSelected}
          onClose={() => setShowMoveDialog(false)}
          currentFolderId={folderId}
          scope={scope}
        />
      )}
    </DndContext>
  );
}
