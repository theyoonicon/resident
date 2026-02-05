"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Save, Loader2 } from "lucide-react";
import { DEPARTMENTS, YEARS } from "@/types";

export default function SettingsProfilePage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    department: "",
    year: "",
  });

  useEffect(() => {
    if (session?.user) {
      setProfile({
        name: session.user.name || "",
        department: session.user.department || "",
        year: session.user.year || "",
      });
    }
  }, [session]);

  const saveProfile = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setMessage("프로필이 업데이트되었습니다.");
        update();
      } else {
        setError("업데이트에 실패했습니다.");
      }
    } catch {
      setError("서버 오류가 발생했습니다.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">프로필</h1>

      {message && (
        <div className="p-3 rounded-sm bg-indigo-50 text-indigo-700 text-sm">{message}</div>
      )}
      {error && (
        <div className="p-3 rounded-sm bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      <div className="bg-card rounded-sm border border-border p-6 space-y-4">
        <h3 className="font-medium">프로필 정보</h3>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">이름</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              className="w-full px-4 py-2.5 border border-border rounded-sm text-sm bg-background"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">소속과</label>
              <select
                value={profile.department}
                onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))}
                className="w-full px-4 py-2.5 border border-border rounded-sm text-sm bg-background"
              >
                <option value="">선택</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">연차</label>
              <select
                value={profile.year}
                onChange={(e) => setProfile((p) => ({ ...p, year: e.target.value }))}
                className="w-full px-4 py-2.5 border border-border rounded-sm text-sm bg-background"
              >
                <option value="">선택</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={saveProfile}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
