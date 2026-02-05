"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Verification {
  id: string;
  name: string | null;
  email: string;
  department: string | null;
  year: string | null;
  verificationImage: string | null;
  createdAt: string;
}

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const fetchVerifications = () => {
    fetch("/api/admin/verifications")
      .then((r) => r.json())
      .then(setVerifications);
  };

  useEffect(() => {
    fetchVerifications();
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject", note?: string) => {
    await fetch(`/api/admin/verifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    setRejectingId(null);
    setRejectNote("");
    fetchVerifications();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">인증 대기 목록</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          {verifications.length}건 대기 중
        </div>
      </div>

      {verifications.length === 0 ? (
        <div className="bg-card rounded-sm border border-border p-12 text-center text-muted-foreground">
          대기 중인 인증 요청이 없습니다.
        </div>
      ) : (
        <div className="grid gap-4">
          {verifications.map((v) => (
            <div
              key={v.id}
              className="bg-card rounded-sm border border-border p-5 flex items-start gap-4"
            >
              {/* Image */}
              <button
                onClick={() => setSelectedImage(v.verificationImage)}
                className="flex-shrink-0 w-24 h-24 rounded-sm border border-border overflow-hidden bg-muted hover:opacity-80 transition-opacity"
              >
                {v.verificationImage ? (
                  <img
                    src={v.verificationImage}
                    alt="인증 사진"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Eye className="w-6 h-6" />
                  </div>
                )}
              </button>

              {/* Info */}
              <div className="flex-1 space-y-1">
                <p className="font-medium">{v.name || "이름 없음"}</p>
                <p className="text-sm text-muted-foreground">{v.email}</p>
                <div className="flex gap-2 text-sm">
                  {v.department && (
                    <span className="px-2 py-0.5 bg-muted rounded text-muted-foreground">
                      {v.department}
                    </span>
                  )}
                  {v.year && (
                    <span className="px-2 py-0.5 bg-muted rounded text-muted-foreground">
                      {v.year}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(v.createdAt)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {rejectingId === v.id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      placeholder="거부 사유"
                      className="px-3 py-1.5 border border-border rounded-sm text-sm w-48"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(v.id, "reject", rejectNote)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-sm text-xs"
                      >
                        거부 확인
                      </button>
                      <button
                        onClick={() => setRejectingId(null)}
                        className="px-3 py-1.5 bg-muted rounded-sm text-xs"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleAction(v.id, "approve")}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm hover:opacity-90"
                    >
                      <CheckCircle className="w-4 h-4" />
                      승인
                    </button>
                    <button
                      onClick={() => setRejectingId(v.id)}
                      className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-sm text-sm hover:bg-accent"
                    >
                      <XCircle className="w-4 h-4" />
                      거부
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="인증 사진"
            className="max-w-2xl max-h-[80vh] rounded-sm object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
