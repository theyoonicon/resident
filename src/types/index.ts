import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      verificationStatus: string;
      department?: string | null;
      year?: string | null;
    } & DefaultSession["user"];
  }

  interface JWT {
    id: string;
    role: string;
    verificationStatus: string;
    department?: string | null;
    year?: string | null;
    hasVerificationImage?: boolean;
  }
}

export const DEPARTMENTS = [
  "인턴",
  "가정의학과",
  "내과",
  "마취통증의학과",
  "방사선종양학과",
  "병리과",
  "비뇨의학과",
  "산부인과",
  "성형외과",
  "소아청소년과",
  "신경과",
  "신경외과",
  "안과",
  "영상의학과",
  "외과",
  "응급의학과",
  "이비인후과",
  "재활의학과",
  "정신건강의학과",
  "정형외과",
  "진단검사의학과",
  "피부과",
  "핵의학과",
  "흉부외과",
] as const;

export const YEARS = ["인턴", "R1", "R2", "R3", "R4"] as const;

export type Department = (typeof DEPARTMENTS)[number];
export type Year = (typeof YEARS)[number];
