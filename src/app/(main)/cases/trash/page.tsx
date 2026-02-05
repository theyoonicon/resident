"use client";

import { useEffect, useState } from "react";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Loader2,
  Folder,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface CaseItem {
  id: string;
  title: string;
  diagnosis: string | null;
  deletedAt: string;
  tags: { tag: { id: string; name: string } }[];
}

interface CaseFolderItem {
  id: string;
  name: string;
  deletedAt: string;
}

export default function TrashCasesPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [caseFolders, setCaseFolders] = useState<CaseFolderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const totalItems = cases.length + caseFolders.length;

  useEffect(() => {
    fetchTrash();
  }, []);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trash?type=cases");
      const data = await res.json();
      setCases(data.cases || []);
      setCaseFolders(data.caseFolders || []);
    } catch (e) {
      console.error("Failed to fetch trash", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string, type: "case" | "folder") => {
    try {
      const res = await fetch(`/api/trash/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        toast.success("복원되었습니다");
        if (type === "case") setCases((prev) => prev.filter((c) => c.id !== id));
        if (type === "folder") setCaseFolders((prev) => prev.filter((f) => f.id !== id));
      }
    } catch {
      toast.error("복원에 실패했습니다");
    }
  };

  const handleDelete = async (id: string, type: "case" | "folder") => {
    try {
      const res = await fetch(`/api/trash/${id}?type=${type}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("영구 삭제되었습니다");
        if (type === "case") setCases((prev) => prev.filter((c) => c.id !== id));
        if (type === "folder") setCaseFolders((prev) => prev.filter((f) => f.id !== id));
      }
    } catch {
      toast.error("삭제에 실패했습니다");
    }
  };

  const handleEmptyTrash = async () => {
    try {
      const res = await fetch("/api/trash?type=cases", { method: "DELETE" });
      if (res.ok) {
        toast.success("휴지통이 비워졌습니다");
        setCases([]);
        setCaseFolders([]);
      }
    } catch {
      toast.error("휴지통 비우기에 실패했습니다");
    }
  };

  return (
    <div className="space-y-6">
      {totalItems > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {totalItems}개의 삭제된 케이스
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">휴지통 비우기</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>케이스 휴지통을 비우시겠습니까?</AlertDialogTitle>
                <AlertDialogDescription>
                  모든 삭제된 케이스가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleEmptyTrash}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  비우기
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : totalItems === 0 ? (
        <div className="text-center py-12">
          <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">비어 있음</h3>
          <p className="text-muted-foreground">삭제된 케이스가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {caseFolders.map((f) => (
            <TrashCard
              key={`caseFolder-${f.id}`}
              icon={
                <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              }
              title={f.name}
              badge="폴더"
              subtitle={null}
              deletedAt={f.deletedAt}
              onRestore={() => handleRestore(f.id, "folder")}
              onDelete={() => handleDelete(f.id, "folder")}
              deleteDescription="이 폴더와 포함된 모든 케이스가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다."
            />
          ))}

          {cases.map((c) => (
            <Card key={`case-${c.id}`} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{c.title}</h3>
                  {c.diagnosis && (
                    <p className="text-sm text-muted-foreground truncate">
                      {c.diagnosis}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">
                      삭제됨:{" "}
                      {formatDistanceToNow(new Date(c.deletedAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </span>
                    {c.tags?.length > 0 && (
                      <div className="flex gap-1">
                        {c.tags.slice(0, 2).map((ct) => (
                          <span
                            key={ct.tag.id}
                            className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full"
                          >
                            #{ct.tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <TrashActions
                  onRestore={() => handleRestore(c.id, "case")}
                  onDelete={() => handleDelete(c.id, "case")}
                  deleteDescription="이 케이스가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다."
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {totalItems > 0 && (
        <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>휴지통의 항목은 30일 후 자동으로 영구 삭제됩니다.</p>
        </div>
      )}
    </div>
  );
}

function TrashCard({
  icon,
  title,
  badge,
  subtitle,
  deletedAt,
  onRestore,
  onDelete,
  deleteDescription,
}: {
  icon: React.ReactNode;
  title: string;
  badge: string | null;
  subtitle: string | null;
  deletedAt: string;
  onRestore: () => void;
  onDelete: () => void;
  deleteDescription: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="font-semibold truncate">{title}</h3>
            {badge && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded flex-shrink-0">
                {badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">
              삭제됨:{" "}
              {formatDistanceToNow(new Date(deletedAt), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
            {subtitle && (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            )}
          </div>
        </div>
        <TrashActions
          onRestore={onRestore}
          onDelete={onDelete}
          deleteDescription={deleteDescription}
        />
      </div>
    </Card>
  );
}

function TrashActions({
  onRestore,
  onDelete,
  deleteDescription,
}: {
  onRestore: () => void;
  onDelete: () => void;
  deleteDescription: string;
}) {
  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" onClick={onRestore} title="복원">
        <RotateCcw className="h-4 w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            title="영구 삭제"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>영구 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>{deleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
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
