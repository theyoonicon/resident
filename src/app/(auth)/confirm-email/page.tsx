"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { Mail, CheckCircle } from "lucide-react";

export default function ConfirmEmailPage() {
  const { data: session } = useSession();
  const emailInitialized = useRef(false);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code" | "done">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  // 기본 이메일 설정 (최초 1회만)
  useEffect(() => {
    if (!emailInitialized.current && session?.user?.email) {
      setEmail(session.user.email);
      emailInitialized.current = true;
    }
  }, [session]);

  // 카운트다운
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email.trim()) {
      setError("이메일을 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "인증코드 발송 실패");
      }

      setStep("code");
      setCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setError("인증코드를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/confirm-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "인증 실패");
      }

      // 이메일 확인 완료 → 로그아웃 후 이메일 로그인으로 전환
      setStep("done");
      setTimeout(async () => {
        await signOut({ redirectTo: "/login" });
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-sm bg-primary text-primary-foreground">
          <Mail className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold">이메일 확인</h1>
        <p className="text-muted-foreground text-sm">
          앞으로 이메일 인증코드로 로그인합니다.
          <br />
          사용할 이메일을 확인하고 인증해주세요.
        </p>
      </div>

      <div className="bg-card rounded-sm shadow-sm border border-border p-6">
        <div className="space-y-4">
          {error && (
            <div className="p-3 rounded-sm bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={step === "code"}
              placeholder="이메일 주소 입력"
              className="w-full px-4 py-2.5 border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background disabled:bg-muted"
            />
            {step === "email" && session?.user?.email && (
              <p className="text-xs text-muted-foreground">
                현재 등록된 이메일입니다. 변경할 수 있습니다.
              </p>
            )}
          </div>

          {step === "done" && (
            <div className="text-center space-y-3 py-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <p className="font-medium">이메일 인증이 완료되었습니다.</p>
              <p className="text-sm text-muted-foreground">
                앞으로 <strong>{email}</strong>으로 로그인해주세요.
                <br />
                잠시 후 로그인 페이지로 이동합니다...
              </p>
            </div>
          )}

          {step === "email" && (
            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "발송 중..." : "인증코드 발송"}
            </button>
          )}

          {step === "code" && (
            <>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">인증코드</label>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0}
                    className="text-xs text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                  >
                    {countdown > 0 ? `다시 보내기 (${countdown}s)` : "다시 보내기"}
                  </button>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="6자리 숫자 입력"
                  autoFocus
                  className="w-full px-4 py-2.5 border border-border rounded-sm text-center tracking-[0.5em] font-mono text-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                />
              </div>

              <button
                onClick={handleVerify}
                disabled={loading || code.length !== 6}
                className="w-full py-2.5 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "확인 중..." : "확인"}
              </button>

              <div className="text-sm">
                <button
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setError("");
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  다른 이메일로 변경
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
