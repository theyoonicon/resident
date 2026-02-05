"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDropzone } from "react-dropzone";
import {
  Stethoscope,
  Upload,
  Camera,
  CheckCircle,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { DEPARTMENTS, YEARS } from "@/types";

export default function VerifyResidentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Google OAuth 사용자는 department/year가 없으므로 여기서 입력
  const needsDepartmentYear =
    !session?.user?.department || !session?.user?.year;
  const isRejected = session?.user?.verificationStatus === "REJECTED";
  const needsName = !session?.user?.name;

  const [form, setForm] = useState({
    name: "",
    department: "",
    year: "",
  });

  // 인턴 선택시 연차 자동 설정
  const isIntern = form.department === "인턴";
  useEffect(() => {
    if (isIntern) {
      setForm((prev) => ({ ...prev, year: "인턴" }));
    } else if (form.year === "인턴") {
      setForm((prev) => ({ ...prev, year: "" }));
    }
  }, [form.department]);

  // 인턴이 아닌 경우 연차에서 "인턴" 제외
  const availableYears = isIntern
    ? YEARS.filter((y) => y === "인턴")
    : YEARS.filter((y) => y !== "인턴");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (needsName && !form.name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }

    if (needsDepartmentYear && (!form.department || !form.year)) {
      setError("소속과와 연차를 선택해주세요.");
      return;
    }

    if (!image) {
      setError("인증 사진을 업로드해주세요.");
      return;
    }

    setLoading(true);

    try {
      // Upload image
      const formData = new FormData();
      formData.append("file", image);
      formData.append("type", "verification");

      const uploadRes = await fetch("/api/upload/verification", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("이미지 업로드 실패");

      const { path } = await uploadRes.json();

      // Submit verification
      const res = await fetch("/api/auth/verify-resident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(needsName ? { name: form.name.trim() } : {}),
          ...(needsDepartmentYear
            ? { department: form.department, year: form.year }
            : {}),
          verificationImage: path,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "인증 제출 실패");
      }

      // Force session update so middleware sees the new verificationImage
      await fetch("/api/auth/session");
      window.location.href = "/verify-pending";
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-sm bg-primary text-primary-foreground">
          <Stethoscope className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold">전공의 인증</h1>
        <p className="text-muted-foreground text-sm">
          {needsDepartmentYear
            ? "소속 정보를 입력하고 인증 사진을 업로드해주세요."
            : "사원증 또는 신분증 사진을 업로드해주세요."}
        </p>
      </div>

      <div className="bg-card rounded-sm shadow-sm border border-border p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-sm bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          {isRejected && (
            <div className="flex items-start gap-2 p-3 rounded-sm bg-amber-50 border border-amber-200 text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>이전 인증이 반려되었습니다. 사진을 다시 업로드해주세요.</p>
            </div>
          )}

          {/* 이름 입력 */}
          {needsName && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">이름</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="실명을 입력해주세요"
                required
                className="w-full px-4 py-2.5 border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              />
            </div>
          )}

          {/* Google OAuth 사용자: 전공과/연차 입력 필요 */}
          {needsDepartmentYear && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">소속과</label>
                <select
                  value={form.department}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-4 py-2.5 border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                >
                  <option value="">선택</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">연차</label>
                <select
                  value={form.year}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, year: e.target.value }))
                  }
                  required
                  disabled={!form.department || isIntern}
                  className="w-full px-4 py-2.5 border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background disabled:bg-muted disabled:cursor-not-allowed"
                >
                  <option value="">{isIntern ? "인턴" : "선택"}</option>
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              인증 사진 (사원증/신분증)
            </label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="인증 사진"
                  className="w-full h-48 object-cover rounded-sm border border-border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-primary/90 text-primary-foreground rounded-sm text-xs">
                  <CheckCircle className="w-3 h-3" />
                  사진 첨부됨
                </div>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? "border-primary bg-primary-light"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  {isDragActive ? (
                    <Upload className="w-8 h-8 text-primary" />
                  ) : (
                    <Camera className="w-8 h-8" />
                  )}
                  <p className="text-sm">
                    {isDragActive
                      ? "여기에 놓으세요"
                      : "클릭하거나 사진을 드래그하세요"}
                  </p>
                  <p className="text-xs">PNG, JPG, WEBP (최대 10MB)</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-sm p-3 text-sm text-amber-800">
            사원증 또는 신분증의 이름과 소속이 보이도록 촬영해주세요. 개인정보는
            인증 목적으로만 사용됩니다.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "제출 중..." : "인증 요청"}
          </button>
        </form>
      </div>
    </div>
  );
}
