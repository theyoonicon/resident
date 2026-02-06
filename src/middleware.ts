import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes — skip middleware (they have their own auth checks)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Public pages — always allow
  if (pathname === "/login" || pathname === "/register") {
    return NextResponse.next();
  }

  let token;
  try {
    token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
      secureCookie: true,
    });
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Not authenticated → login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Admin bypasses all verification
  if (token.role === "ADMIN") {
    return NextResponse.next();
  }

  const isVerifyResident = pathname === "/verify-resident";
  const isVerifyPending = pathname === "/verify-pending";
  const isConfirmEmail = pathname === "/confirm-email";

  // 비밀번호 있는 사용자가 이메일 인증 안 했으면 → 이메일 확인 페이지
  if (token.hasPassword && !token.emailVerified) {
    if (isConfirmEmail) return NextResponse.next();
    return NextResponse.redirect(new URL("/confirm-email", request.url));
  }

  // No department/year yet → must complete profile on verify-resident
  if (!token.department || !token.year) {
    if (isVerifyResident) return NextResponse.next();
    return NextResponse.redirect(new URL("/verify-resident", request.url));
  }

  // Verification rejected → re-submit on verify-resident
  if (token.verificationStatus === "REJECTED") {
    if (isVerifyResident) return NextResponse.next();
    return NextResponse.redirect(new URL("/verify-resident", request.url));
  }

  // Verification pending
  if (token.verificationStatus === "PENDING") {
    if (!token.hasVerificationImage) {
      // Haven't uploaded verification image yet → verify-resident
      if (isVerifyResident) return NextResponse.next();
      return NextResponse.redirect(new URL("/verify-resident", request.url));
    }
    // Submitted, waiting for admin approval → verify-pending
    if (isVerifyResident || isVerifyPending) return NextResponse.next();
    return NextResponse.redirect(new URL("/verify-pending", request.url));
  }

  // Approved user trying to visit verify pages → redirect to main
  if (token.verificationStatus === "APPROVED") {
    if (isVerifyResident || isVerifyPending) {
      return NextResponse.redirect(new URL("/files", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
