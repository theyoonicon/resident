"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Props {
  caseId: string;
  asMenuItem?: boolean;
}

export function DeleteCaseButton({ caseId, asMenuItem }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("삭제 실패");

      toast.success("케이스가 삭제되었습니다");
      router.push("/cases");
      router.refresh();
    } catch {
      toast.error("삭제 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const TriggerComponent = asMenuItem ? (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault();
        setOpen(true);
      }}
      className="text-destructive focus:text-destructive"
    >
      <Trash2 className="h-4 w-4 mr-2" />
      삭제
    </DropdownMenuItem>
  ) : (
    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
      <Trash2 className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {TriggerComponent}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>케이스 삭제</DialogTitle>
          <DialogDescription>
            정말로 이 케이스를 삭제하시겠습니까?
            <br />
            이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
