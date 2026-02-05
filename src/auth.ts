import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

class EmailVerifiedError extends CredentialsSignin {
  code = "EMAIL_VERIFIED";
}
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Flask/Werkzeug 비밀번호 검증 (pbkdf2, scrypt 지원)
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // bcrypt 해시
  if (hash.startsWith("$2a$") || hash.startsWith("$2b$")) {
    return bcrypt.compare(password, hash);
  }

  // pbkdf2:sha256:iterations$salt$hash
  if (hash.startsWith("pbkdf2:")) {
    const parts = hash.split("$");
    if (parts.length !== 3) return false;

    const [method, salt, storedHash] = parts;
    const [, algo, iterStr] = method.split(":");
    const iterations = parseInt(iterStr, 10);

    return new Promise((resolve) => {
      crypto.pbkdf2(password, salt, iterations, 32, algo, (err, derivedKey) => {
        if (err) return resolve(false);
        resolve(derivedKey.toString("hex") === storedHash);
      });
    });
  }

  // scrypt:n:r:p$salt$hash
  if (hash.startsWith("scrypt:")) {
    const parts = hash.split("$");
    if (parts.length !== 3) return false;

    const [method, salt, storedHash] = parts;
    const [, n, r, p] = method.split(":");

    return new Promise((resolve) => {
      const N = parseInt(n), R = parseInt(r), P = parseInt(p);
      crypto.scrypt(password, salt, 64, { N, r: R, p: P, maxmem: 128 * N * R * 2 }, (err, derivedKey) => {
        if (err) return resolve(false);
        resolve(derivedKey.toString("hex") === storedHash);
      });
    });
  }

  return false;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Legacy 아이디/비밀번호 로그인
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        login: {},
        password: {},
      },
      async authorize(credentials) {
        try {
          if (!credentials?.login || !credentials?.password) return null;

          const login = (credentials.login as string).trim();
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: login },
                { username: login },
              ],
            },
          });

          if (!user || !user.password) return null;

          // 이메일 인증 완료된 사용자는 이메일 로그인만 허용
          if (user.emailVerified) {
            throw new EmailVerifiedError();
          }

          const isValid = await verifyPassword(
            credentials.password as string,
            user.password
          );

          if (!isValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (e) {
          console.error("[credentials] error:", e);
          return null;
        }
      },
    }),
    // 이메일 OTP 로그인
    Credentials({
      id: "email-code",
      name: "email-code",
      credentials: {
        email: {},
        code: {},
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.code) {
            console.log("[email-code] Missing credentials");
            return null;
          }

          const email = (credentials.email as string).toLowerCase().trim();
          const code = (credentials.code as string).trim();
          console.log("[email-code] Attempting login for:", email, "with code:", code);

          const token = await prisma.verificationToken.findFirst({
            where: {
              identifier: email,
              token: code,
            },
          });

          if (!token) {
            console.log("[email-code] Token not found");
            return null;
          }

          // 만료 확인
          if (token.expires < new Date()) {
            console.log("[email-code] Token expired");
            await prisma.verificationToken.delete({
              where: {
                identifier_token: {
                  identifier: token.identifier,
                  token: token.token,
                },
              },
            });
            return null;
          }

          // 토큰 사용 후 삭제
          await prisma.verificationToken.delete({
            where: {
              identifier_token: {
                identifier: token.identifier,
                token: token.token,
              },
            },
          });

          // 사용자 조회, 없으면 생성
          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            console.log("[email-code] Creating new user for:", email);
            // 새 사용자 생성 (PENDING 상태로)
            user = await prisma.user.create({
              data: {
                email,
                role: "PENDING",
                verificationStatus: "PENDING",
              },
            });
          } else if (user.password && !user.emailVerified) {
            // 기존 계정(비밀번호 있는)이 이메일로 로그인 → emailVerified 자동 설정
            await prisma.user.update({
              where: { id: user.id },
              data: { emailVerified: new Date() },
            });
          }

          console.log("[email-code] Login success for user:", user.id);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (e) {
          console.error("[email-code] Error:", e);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token }) {
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true, verificationStatus: true, department: true, year: true, verificationImage: true, emailVerified: true, password: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.verificationStatus = dbUser.verificationStatus;
          token.department = dbUser.department;
          token.year = dbUser.year;
          token.hasVerificationImage = !!dbUser.verificationImage;
          token.emailVerified = !!dbUser.emailVerified;
          token.hasPassword = !!dbUser.password;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.verificationStatus = token.verificationStatus as string;
        session.user.department = token.department as string;
        session.user.year = token.year as string;
      }
      return session;
    },
  },
});
