"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Stethoscope, Mail, Lock, Eye, EyeOff, User, ArrowLeft, Loader2 } from "lucide-react";

type LoginMode = "email" | "legacy";
type EmailStep = "input" | "code";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>("email");
  const [emailStep, setEmailStep] = useState<EmailStep>("input");

  // Email OTP
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSending, setCodeSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Legacy
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingAccount, setExistingAccount] = useState<{ name: string | null; username: string | null } | null>(null);

  // 인증코드 발송
  const handleSendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) return;
    setError("");
    setCodeSending(true);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "인증코드 발송에 실패했습니다.");
        setCodeSending(false);
        return;
      }

      setExistingAccount(data.existingAccount || null);
      setEmailStep("code");
      setCode("");

      // 60초 쿨다운
      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError("인증코드 발송에 실패했습니다.");
    } finally {
      setCodeSending(false);
    }
  };

  // OTP 로그인
  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError("");
    setLoading(true);

    const result = await signIn("email-code", {
      email: email.trim(),
      code: code.trim(),
      redirect: false,
    });

    if (result?.error) {
      setError("인증코드가 올바르지 않거나 만료되었습니다.");
      setLoading(false);
    } else {
      router.push("/files");
      router.refresh();
    }
  };

  // Legacy 로그인
  const handleLegacyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      login: login.trim(),
      password,
      redirect: false,
    });

    if (result?.error) {
      // 이메일 인증 완료된 계정인지 확인
      const check = await fetch("/api/auth/check-email-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: login.trim() }),
      }).then(r => r.json()).catch(() => ({ emailVerified: false }));

      if (check.emailVerified) {
        setError("이메일 인증이 완료된 계정입니다. 이메일 로그인을 이용해주세요.");
        setMode("email");
      } else {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      }
      setLoading(false);
    } else {
      router.push("/files");
      router.refresh();
    }
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/verify-resident" });
  };

  const resetToEmailInput = () => {
    setEmailStep("input");
    setCode("");
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Logo */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-sm bg-primary text-primary-foreground">
          <Stethoscope className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold">Resident</h1>
        <p className="text-muted-foreground text-sm">
          서울아산병원 전공의 클라우드
        </p>
      </div>

      {/* Card */}
      <div className="bg-card rounded-sm shadow-sm border border-border p-6 space-y-5">
        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-border rounded-sm hover:bg-accent transition-colors text-sm font-medium"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google로 로그인
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">또는</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 rounded-sm bg-red-50 text-red-600 text-sm dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Email OTP Mode */}
        {mode === "email" && (
          <>
            {emailStep === "input" ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">이메일</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={codeSending}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {codeSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      발송 중...
                    </>
                  ) : (
                    "인증코드 받기"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCodeLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">이메일</label>
                    <button
                      type="button"
                      onClick={resetToEmailInput}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      다른 이메일
                    </button>
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full pl-10 pr-4 py-2.5 border border-border rounded-sm text-sm bg-muted text-muted-foreground"
                    />
                  </div>
                </div>

                {existingAccount && (
                  <div className="p-3 rounded-sm bg-blue-50 text-blue-700 text-sm dark:bg-blue-950/30 dark:text-blue-300 space-y-1">
                    <p className="font-medium">기존 계정이 확인되었습니다.</p>
                    <p className="text-xs">
                      {existingAccount.name && <>이름: {existingAccount.name}</>}
                      {existingAccount.name && existingAccount.username && <> · </>}
                      {existingAccount.username && <>아이디: {existingAccount.username}</>}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      본인이 맞다면 인증코드를 입력해주세요. 인증 후에는 이메일로만 로그인 가능합니다.
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">인증코드</label>
                    <button
                      type="button"
                      onClick={() => handleSendCode()}
                      disabled={cooldown > 0 || codeSending}
                      className="text-xs text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                    >
                      {cooldown > 0 ? `다시 보내기 (${cooldown}s)` : "다시 보내기"}
                    </button>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="6자리 숫자 입력"
                    required
                    autoFocus
                    className="w-full px-4 py-2.5 border border-border rounded-sm text-sm text-center tracking-[0.5em] font-mono text-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="w-full py-2.5 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      로그인 중...
                    </>
                  ) : (
                    "로그인"
                  )}
                </button>
              </form>
            )}
          </>
        )}

        {/* Legacy Mode */}
        {mode === "legacy" && (
          <form onSubmit={handleLegacyLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">아이디</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="아이디 입력"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 border border-border rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </button>
          </form>
        )}

        {/* Mode Switch */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "email" ? "legacy" : "email");
              setError("");
              setEmailStep("input");
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {mode === "email"
              ? "아이디/비밀번호로 로그인"
              : "이메일로 로그인"}
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        계정이 없으신가요?{" "}
        <Link href="/register" className="text-primary font-medium hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
