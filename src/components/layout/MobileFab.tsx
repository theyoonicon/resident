"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function MobileFab() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // cases 섹션에서만 FAB 표시
  if (!pathname.startsWith("/cases")) return null;
  // 새 케이스/편집 페이지에서는 숨김
  if (pathname === "/cases/new" || pathname.includes("/edit")) return null;

  const folderId = searchParams.get("folder");
  const href = folderId ? `/cases/new?folder=${folderId}` : "/cases/new";

  return (
    <Link
      href={href}
      className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
    >
      <Plus className="w-6 h-6" />
    </Link>
  );
}
