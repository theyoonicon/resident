"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Star, Folder, FolderOpen, FolderPlus, Loader2, MoreVertical, FileText, FolderInput, Pencil, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FloatingNewCaseButton } from "@/components/cases/FloatingNewCaseButton";
import { toast } from "sonner";

interface CaseItem {
  id: string;
  title: string;
  diagnosis: string | null;
  isFavorite: boolean;
  createdAt: string;
  tags: { tag: { id: string; name: string } }[];
  images: { id: string; url: string }[];
}

interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  children?: FolderItem[];
  _count?: { cases: number };
}

function CasesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [allFolders, setAllFolders] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(
    searchParams.get("folder") || null
  );
  const [showFavorites, setShowFavorites] = useState(
    searchParams.get("favorite") === "true"
  );

  // 폴더 수정/삭제 상태
  const [renameFolder, setRenameFolder] = useState<FolderItem | null>(null);
  const [renameName, setRenameName] = useState("");
  const [deleteFolder, setDeleteFolder] = useState<FolderItem | null>(null);

  // 폴더 생성 상태
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // 드래그 앤 드롭 상태
  const [draggedCaseId, setDraggedCaseId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    fetchCases();
  }, [currentFolderId, showFavorites]);

  // URL 파라미터 변경 감지
  useEffect(() => {
    const urlFolderId = searchParams.get("folder");
    if (urlFolderId !== currentFolderId) {
      setCurrentFolderId(urlFolderId);
    }
  }, [searchParams]);

  const fetchFolders = async () => {
    try {
      const res = await fetch("/api/case-folders");
      if (res.ok) {
        const data: FolderItem[] = await res.json();
        setAllFolders(data);
      }
    } catch (e) {
      console.error("Failed to fetch folders", e);
    }
  };

  const fetchCases = async () => {
    setLoading(true);
    const params = new URLSearchParams();

    if (showFavorites) {
      // 즐겨찾기는 전체 케이스에서 표시
      params.set("favorite", "true");
    } else if (currentFolderId) {
      // 폴더 안에 있으면 해당 폴더의 케이스만
      params.set("folderId", currentFolderId);
    } else {
      // 루트면 폴더에 속하지 않은 케이스만
      params.set("folderId", "none");
    }

    const res = await fetch(`/api/cases?${params}`);
    const data = await res.json();
    setCases(data.cases || []);
    setLoading(false);
  };

  // 폴더 찾기 헬퍼
  const findFolder = (folders: FolderItem[], id: string): FolderItem | null => {
    for (const folder of folders) {
      if (folder.id === id) return folder;
      if (folder.children) {
        const found = findFolder(folder.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // 폴더 depth 계산 (root = 1)
  const getFolderDepth = (folderId: string | null, depth = 0): number => {
    if (!folderId) return depth;
    const getPath = (folders: FolderItem[], targetId: string, current: number): number => {
      for (const folder of folders) {
        if (folder.id === targetId) return current + 1;
        if (folder.children) {
          const found = getPath(folder.children, targetId, current + 1);
          if (found > 0) return found;
        }
      }
      return 0;
    };
    return getPath(allFolders, folderId, 0);
  };

  // 현재 위치의 하위 폴더들 가져오기
  const getSubFolders = (): FolderItem[] => {
    if (!currentFolderId) {
      return allFolders;
    }
    const current = findFolder(allFolders, currentFolderId);
    return current?.children || [];
  };

  // 폴더 경로 (breadcrumb용)
  const getFolderPath = (): FolderItem[] => {
    if (!currentFolderId) return [];
    const path: FolderItem[] = [];
    const buildPath = (folders: FolderItem[], targetId: string): boolean => {
      for (const folder of folders) {
        if (folder.id === targetId) {
          path.push(folder);
          return true;
        }
        if (folder.children && buildPath(folder.children, targetId)) {
          path.unshift(folder);
          return true;
        }
      }
      return false;
    };
    buildPath(allFolders, currentFolderId);
    return path;
  };

  // 폴더 클릭 핸들러
  const handleFolderClick = (folderId: string) => {
    router.push(`/cases?folder=${folderId}`);
  };

  const filteredCases = cases.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.diagnosis?.toLowerCase().includes(search.toLowerCase())
  );

  const toggleFavorite = async (id: string, current: boolean) => {
    await fetch(`/api/cases/${id}/favorite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !current }),
    });
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !current } : c))
    );
  };

  // 케이스 삭제 (소프트 삭제)
  const deleteCase = async (caseId: string) => {
    try {
      const res = await fetch(`/api/cases/${caseId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("휴지통으로 이동했습니다");
      setCases((prev) => prev.filter((c) => c.id !== caseId));
    } catch {
      toast.error("삭제 중 오류가 발생했습니다");
    }
  };

  // 폴더 이동
  const moveToFolder = async (caseId: string, folderId: string | null) => {
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseFolderId: folderId }),
      });
      if (!res.ok) throw new Error("Move failed");
      toast.success(folderId ? "폴더로 이동했습니다" : "폴더에서 제거했습니다");
      fetchCases();
    } catch {
      toast.error("이동 중 오류가 발생했습니다");
    }
  };

  // 폴더 평탄화 (드롭다운용)
  const getFlatFolders = (): { id: string; name: string }[] => {
    const flat: { id: string; name: string }[] = [];
    const flatten = (folders: FolderItem[], prefix = "") => {
      folders.forEach((f) => {
        flat.push({ id: f.id, name: prefix ? `${prefix} / ${f.name}` : f.name });
        if (f.children) flatten(f.children, prefix ? `${prefix} / ${f.name}` : f.name);
      });
    };
    flatten(allFolders);
    return flat;
  };

  // 폴더 이름 변경
  const handleRenameFolder = async () => {
    if (!renameFolder || !renameName.trim()) return;
    try {
      const res = await fetch(`/api/case-folders/${renameFolder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: renameName.trim() }),
      });
      if (!res.ok) throw new Error("Rename failed");
      toast.success("폴더 이름이 변경되었습니다");
      fetchFolders();
      setRenameFolder(null);
    } catch {
      toast.error("이름 변경 중 오류가 발생했습니다");
    }
  };

  // 폴더 삭제
  const handleDeleteFolder = async () => {
    if (!deleteFolder) return;
    try {
      const res = await fetch(`/api/case-folders/${deleteFolder.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("폴더가 삭제되었습니다");
      fetchFolders();
      fetchCases();
      setDeleteFolder(null);
    } catch {
      toast.error("삭제 중 오류가 발생했습니다");
    }
  };

  // 폴더 생성
  const MAX_FOLDER_DEPTH = 3;
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    // depth 제한 체크
    const currentDepth = getFolderDepth(currentFolderId);
    if (currentDepth >= MAX_FOLDER_DEPTH) {
      toast.error(`폴더는 최대 ${MAX_FOLDER_DEPTH}단계까지만 만들 수 있습니다`);
      setShowNewFolder(false);
      setNewFolderName("");
      return;
    }

    try {
      const res = await fetch("/api/case-folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName.trim(),
          parentId: currentFolderId,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Create failed");
      }
      toast.success("폴더가 생성되었습니다");
      fetchFolders();
      setShowNewFolder(false);
      setNewFolderName("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "폴더 생성 중 오류가 발생했습니다");
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (e: React.DragEvent, caseId: string) => {
    setDraggedCaseId(caseId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", caseId);
  };

  const handleDragEnd = () => {
    setDraggedCaseId(null);
    setDragOverFolderId(null);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverFolderId(folderId);
  };

  const handleDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleDrop = async (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    const caseId = e.dataTransfer.getData("text/plain");
    if (caseId) {
      await moveToFolder(caseId, folderId);
    }
    setDraggedCaseId(null);
    setDragOverFolderId(null);
  };

  const subFolders = getSubFolders();
  const flatFolders = getFlatFolders();
  const folderPath = getFolderPath();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="케이스 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowNewFolder(true)}
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          새 폴더
        </Button>
        <Button
          variant={showFavorites ? "default" : "outline"}
          onClick={() => setShowFavorites(!showFavorites)}
        >
          <Star
            className={`h-4 w-4 mr-2 ${showFavorites ? "fill-current" : ""}`}
          />
          즐겨찾기
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-2">
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Breadcrumb */}
          {!showFavorites && currentFolderId && (
            <div className="flex items-center gap-1 text-sm flex-wrap">
              <button
                onClick={() => router.push("/cases")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                전체
              </button>
              {folderPath.map((f) => (
                <div key={f.id} className="flex items-center gap-1">
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  <button
                    onClick={() => handleFolderClick(f.id)}
                    className={f.id === currentFolderId ? "font-medium" : "text-muted-foreground hover:text-foreground transition-colors"}
                  >
                    {f.name}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Subfolders */}
          {subFolders.length > 0 && !showFavorites && (
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {subFolders.map((folder) => (
                <div
                  key={folder.id}
                  onClick={() => handleFolderClick(folder.id)}
                  onDragOver={(e) => handleDragOver(e, folder.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, folder.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border bg-card hover:bg-accent transition-all text-left group relative cursor-pointer ${
                    dragOverFolderId === folder.id
                      ? "ring-2 ring-primary border-primary bg-primary/10 scale-105"
                      : ""
                  }`}
                >
                  <Folder className={`h-4 w-4 flex-shrink-0 ${
                    dragOverFolderId === folder.id ? "text-primary" : "text-muted-foreground"
                  }`} />
                  <span className="font-medium text-xs truncate flex-1">{folder.name}</span>
                  {folder._count?.cases ? (
                    <span className="text-xs text-muted-foreground">{folder._count.cases}</span>
                  ) : null}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="flex-shrink-0 p-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setRenameFolder(folder);
                          setRenameName(folder.name);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        이름 바꾸기
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteFolder(folder)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}

          {/* Cases Section */}
          <div className="space-y-3">
            {filteredCases.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">케이스가 없습니다</h3>
                <p className="text-muted-foreground">
                  <span className="hidden md:inline">우측 상단의 &quot;새 케이스&quot; 버튼으로 케이스를 작성해보세요</span>
                  <span className="md:hidden">우측 하단의 + 버튼으로 케이스를 작성해보세요</span>
                </p>
              </div>
            ) : (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {filteredCases.map((c) => (
                  <div
                    key={c.id}
                    className={`relative group ${draggedCaseId === c.id ? "opacity-50" : ""}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, c.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <Link href={`/cases/${c.id}`} draggable={false}>
                      <Card className="aspect-square overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative">
                        {/* 이미지 */}
                        {c.images && c.images.length > 0 ? (
                          <img
                            src={c.images[0].url}
                            alt={c.title}
                            className="absolute inset-0 w-full h-full object-cover"
                            draggable={false}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                            <FileText className="h-10 w-10 text-muted-foreground/30" />
                          </div>
                        )}
                        {/* Title bar - 하단 고정 */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1.5">
                          <h3 className="font-medium text-xs text-white line-clamp-1">{c.title}</h3>
                        </div>
                      </Card>
                    </Link>
                    {/* 상단 그라데이션 + 버튼들 */}
                    {/* 즐겨찾기된 별은 항상 표시 */}
                    {c.isFavorite && (
                      <div className="absolute top-1.5 left-1.5 z-10 group-hover:hidden">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 drop-shadow-md" />
                      </div>
                    )}
                    {/* 호버 시 상단 그라데이션 + 버튼들 (모바일에서 항상 표시) */}
                    <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/40 via-black/20 to-transparent p-1.5 flex items-start justify-between md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.preventDefault(); toggleFavorite(c.id, c.isFavorite); }}
                        className="p-1 rounded-full hover:bg-black/30 transition-colors"
                      >
                        <Star
                          className={`h-4 w-4 drop-shadow-md ${
                            c.isFavorite
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-white"
                          }`}
                        />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-full hover:bg-black/30 transition-colors">
                            <MoreVertical className="h-4 w-4 text-white drop-shadow-md" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <FolderInput className="h-4 w-4 mr-2" />
                              폴더로 이동
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="max-h-60 overflow-y-auto">
                              <DropdownMenuItem onClick={() => moveToFolder(c.id, null)}>
                                <span className="text-muted-foreground">폴더 없음</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {flatFolders.map((folder) => (
                                <DropdownMenuItem
                                  key={folder.id}
                                  onClick={() => moveToFolder(c.id, folder.id)}
                                >
                                  <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
                                  {folder.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuItem onClick={() => toggleFavorite(c.id, c.isFavorite)}>
                            <Star className={`h-4 w-4 mr-2 ${c.isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
                            {c.isFavorite ? "즐겨찾기 해제" : "즐겨찾기"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/cases/${c.id}/edit`)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => deleteCase(c.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* 새 폴더 생성 다이얼로그 */}
      <Dialog open={showNewFolder} onOpenChange={setShowNewFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 폴더</DialogTitle>
          </DialogHeader>
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="폴더 이름"
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolder(false)}>
              취소
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              생성
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 폴더 이름 변경 다이얼로그 */}
      <Dialog open={!!renameFolder} onOpenChange={(open) => !open && setRenameFolder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>이름 바꾸기</DialogTitle>
          </DialogHeader>
          <Input
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            placeholder="새 폴더 이름"
            onKeyDown={(e) => e.key === "Enter" && handleRenameFolder()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameFolder(null)}>
              취소
            </Button>
            <Button onClick={handleRenameFolder}>변경</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 폴더 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteFolder} onOpenChange={(open) => !open && setDeleteFolder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>폴더를 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteFolder?._count?.cases && deleteFolder._count.cases > 0 ? (
                `이 폴더에는 ${deleteFolder._count.cases}개의 케이스가 있습니다. 폴더를 삭제하면 케이스들은 "폴더 없음" 상태가 됩니다.`
              ) : (
                "폴더가 삭제됩니다. 이 작업은 되돌릴 수 없습니다."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFolder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function CasesPage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <CasesContent />
      </Suspense>
      <Suspense>
        <FloatingNewCaseButton />
      </Suspense>
    </>
  );
}
