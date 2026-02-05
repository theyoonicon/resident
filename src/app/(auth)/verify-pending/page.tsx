"use client";

import { Stethoscope, Clock, LogOut, RefreshCw } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function VerifyPendingPage() {
  return (
    <div className="space-y-6 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-sm bg-primary text-primary-foreground">
        <Stethoscope className="w-7 h-7" />
      </div>

      <div className="bg-card rounded-sm shadow-sm border border-border p-8 space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-50">
          <Clock className="w-8 h-8 text-amber-500" />
        </div>

        <h1 className="text-xl font-bold">인증 대기 중</h1>

        <p className="text-muted-foreground text-sm leading-relaxed">
          전공의 인증 요청이 접수되었습니다.
          <br />
          관리자 승인 후 서비스를 이용하실 수 있습니다.
          <br />
          보통 1~2일 내에 처리됩니다.
        </p>

        <div className="pt-4 flex flex-col items-center gap-2">
          <Link
            href="/verify-resident"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-sm hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" />
            사진 다시 올리기
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
