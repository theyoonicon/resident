import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((request) => {
  const { pathname } = request.nextUrl;

  // API routes — skip middleware (they have their own auth checks)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Public pages — always allow
  if (pathname === "/login" || pathname === "/register") {
    return NextResponse.next();
  }

  const session = request.auth as any;

  // Not authenticated → login
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const user = session.user;

  // Admin bypasses all verification
  if (user?.role === "ADMIN") {
    return NextResponse.next();
  }

  const isVerifyResident = pathname === "/verify-resident";
  const isVerifyPending = pathname === "/verify-pending";
  const isConfirmEmail = pathname === "/confirm-email";

  // 비밀번호 있는 사용자가 이메일 인증 안 했으면 → 이메일 확인 페이지
  if (session.hasPassword && !session.emailVerified) {
    if (isConfirmEmail) return NextResponse.next();
    return NextResponse.redirect(new URL("/confirm-email", request.url));
  }

  // No department/year yet → must complete profile on verify-resident
  if (!user?.department || !user?.year) {
    if (isVerifyResident) return NextResponse.next();
    return NextResponse.redirect(new URL("/verify-resident", request.url));
  }

  // Verification rejected → re-submit on verify-resident
  if (user?.verificationStatus === "REJECTED") {
    if (isVerifyResident) return NextResponse.next();
    return NextResponse.redirect(new URL("/verify-resident", request.url));
  }

  // Verification pending
  if (user?.verificationStatus === "PENDING") {
    if (!session.hasVerificationImage) {
      // Haven't uploaded verification image yet → verify-resident
      if (isVerifyResident) return NextResponse.next();
      return NextResponse.redirect(new URL("/verify-resident", request.url));
    }
    // Submitted, waiting for admin approval → verify-pending
    if (isVerifyResident || isVerifyPending) return NextResponse.next();
    return NextResponse.redirect(new URL("/verify-pending", request.url));
  }

  // Approved user trying to visit verify pages → redirect to main
  if (user?.verificationStatus === "APPROVED") {
    if (isVerifyResident || isVerifyPending) {
      return NextResponse.redirect(new URL("/files", request.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
