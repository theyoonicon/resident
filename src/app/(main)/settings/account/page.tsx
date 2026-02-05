"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Lock, Trash2, Loader2, AlertTriangle } from "lucide-react";

export default function SettingsAccountPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (passwords.new.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });
      if (res.ok) {
        setMessage("비밀번호가 변경되었습니다.");
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        const data = await res.json();
        setError(data.error || "변경에 실패했습니다.");
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    }
    setLoading(false);
  };

  const deleteAccount = async () => {
    if (!confirm("정말로 계정을 삭제하시겠습니까? 모든 데이터가 삭제되며 복구할 수 없습니다.")) return;
    if (!confirm("마지막 확인입니다. 계속 진행하시겠습니까?")) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user/delete", { method: "DELETE" });
      if (res.ok) {
        signOut({ callbackUrl: "/login" });
      } else {
        const data = await res.json();
        setError(data.error || "계정 삭제에 실패했습니다.");
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">계정</h1>

      {message && (
        <div className="p-3 rounded-sm bg-indigo-50 text-indigo-700 text-sm">{message}</div>
      )}
      {error && (
        <div className="p-3 rounded-sm bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      <div className="bg-card rounded-sm border border-border p-6 space-y-4">
        <h3 className="font-medium">비밀번호 변경</h3>
        <div className="space-y-3">
          <input
            type="password"
            value={passwords.current}
            onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
            placeholder="현재 비밀번호"
            className="w-full px-4 py-2.5 border border-border rounded-sm text-sm bg-background"
          />
          <input
            type="password"
            value={passwords.new}
            onChange={(e) => setPasswords((p) => ({ ...p, new: e.target.value }))}
            placeholder="새 비밀번호 (6자 이상)"
            className="w-full px-4 py-2.5 border border-border rounded-sm text-sm bg-background"
          />
          <input
            type="password"
            value={passwords.confirm}
            onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
            placeholder="새 비밀번호 확인"
            className="w-full px-4 py-2.5 border border-border rounded-sm text-sm bg-background"
          />
          <button
            onClick={changePassword}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            비밀번호 변경
          </button>
        </div>
      </div>

      <div className="bg-card rounded-sm border border-red-200 p-6 space-y-4">
        <h3 className="font-medium text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          위험 영역
        </h3>
        <p className="text-sm text-muted-foreground">
          계정을 삭제하면 모든 파일, 케이스, 설정이 영구적으로 삭제됩니다.
        </p>
        <button
          onClick={deleteAccount}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-sm text-sm hover:bg-red-600"
        >
          <Trash2 className="w-4 h-4" />
          계정 삭제
        </button>
      </div>
    </div>
  );
}
