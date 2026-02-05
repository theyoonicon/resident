"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Home,
  FolderOpen,
  Star,
  User,
  Bot,
  BookOpen,
  Settings,
  LogOut,
  Shield,
  Stethoscope,
  HardDrive,
  History,
  PanelLeftClose,
  PanelLeft,
  HelpCircle,
  LayoutDashboard,
  LayoutTemplate,
  Globe,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/useStore";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import HistoryPanel, { type ChartHistory } from "@/components/chart-ai/HistoryPanel";
import HelpModal from "@/components/chart-ai/HelpModal";

// 왼쪽 좁은 아이콘 사이드바 (앱 전환)
const appNav = [
  { href: "/files", icon: FolderOpen, label: "자료실" },
  // { href: "/chart-ai", icon: Bot, label: "Chart AI" }, // 추후 도입
  { href: "/cases", icon: BookOpen, label: "Cases" },
];

// 자료실 내비게이션 (넓은 사이드바)
const fileNav = [
  { href: "/files", label: "Home", icon: Home },
  { href: "/files/shared", label: "공유 자료실", icon: FolderOpen },
  { href: "/files/starred", label: "즐겨찾기", icon: Star },
  { href: "/files/my", label: "내 파일", icon: User },
  { href: "/files/trash", label: "휴지통", icon: Trash2 },
];

// 설정 내비게이션 (넓은 사이드바)
const settingsNav = [
  { href: "/settings", label: "프로필", icon: User },
  { href: "/settings/account", label: "계정", icon: Settings },
];

// 케이스 내비게이션 (넓은 사이드바)
const caseNav = [
  { href: "/cases", label: "내 케이스", icon: BookOpen },
  { href: "/cases/browse", label: "둘러보기", icon: Globe },
  { href: "/cases?favorite=true", label: "즐겨찾기", icon: Star },
  { href: "/cases/templates", label: "템플릿 관리", icon: LayoutTemplate },
  { href: "/cases/trash", label: "휴지통", icon: Trash2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [chartSidebarOpen, setChartSidebarOpen] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [storage, setStorage] = useState<{ used: number; limit: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  useEffect(() => {
    fetch("/api/user/storage")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => data && setStorage(data))
      .catch(() => {});
  }, []);

  // 현재 어떤 앱 섹션에 있는지 판별
  const currentApp = (() => {
    if (pathname.startsWith("/settings")) return "settings";
    if (pathname.startsWith("/chart-ai")) return "chart-ai";
    if (pathname.startsWith("/cases")) return "cases";
    if (pathname.startsWith("/files")) return "files";
    return "files";
  })();

  const isFileSection = currentApp === "files";
  const isCaseSection = currentApp === "cases";
  const isChartAISection = currentApp === "chart-ai";
  const isSettingsSection = currentApp === "settings";

  return (
    <>
    {/* === 데스크탑 사이드바 (md 이상) === */}
    <div className="hidden md:flex h-screen flex-shrink-0">
      {/* === 좁은 아이콘 사이드바 === */}
      <div className="w-[60px] bg-[#2c3782] flex flex-col py-4">
        {/* 로고 */}
        <div className="flex justify-center mb-4">
          <Link
            href="/files"
            className="w-10 h-10 rounded-sm bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Stethoscope className="w-5 h-5" />
          </Link>
        </div>

        {/* 앱 네비게이션 */}
        <div className="flex-1 flex flex-col gap-1">
          {appNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  "relative h-10 flex items-center justify-center transition-colors",
                  isActive
                    ? "text-white"
                    : "text-white/60 hover:text-white"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-white rounded-r-full" />
                )}
                <item.icon className="w-5 h-5" />
              </Link>
            );
          })}
        </div>

        {/* 하단: 관리자, 설정, 로그아웃 */}
        <div className="flex flex-col gap-1">
          {mounted && session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              title="관리자"
              className={cn(
                "relative h-10 flex items-center justify-center transition-colors",
                pathname.startsWith("/admin")
                  ? "text-white"
                  : "text-white/60 hover:text-white"
              )}
            >
              {pathname.startsWith("/admin") && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-white rounded-r-full" />
              )}
              <Shield className="w-5 h-5" />
            </Link>
          )}
          <Link
            href="/settings"
            title="설정"
            className={cn(
              "relative h-10 flex items-center justify-center transition-colors",
              pathname.startsWith("/settings")
                ? "text-white"
                : "text-white/60 hover:text-white"
            )}
          >
            {pathname.startsWith("/settings") && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-white rounded-r-full" />
            )}
            <Settings className="w-5 h-5" />
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="로그아웃"
            className="h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>

          {/* 유저 아바타 */}
          {mounted && session?.user && (
            <div className="flex justify-center mt-2">
              <div className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center text-sm font-semibold">
                {(session.user.name || session.user.email)?.[0]?.toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* === 넓은 네비게이션 사이드바 (자료실 섹션일 때만) === */}
      {isFileSection && (
        <div className="w-52 bg-card border-r border-border flex flex-col">
          {/* 헤더 */}
          <div className="h-14 px-4 border-b border-border flex flex-col justify-center">
            <p className="text-[11px] text-muted-foreground leading-tight">Apps</p>
            <h2 className="text-sm font-bold leading-tight">File Manager</h2>
          </div>

          {/* 네비게이션 */}
          <nav className="flex-1 p-3 space-y-1">
            {fileNav.map((item) => {
              const isActive =
                item.href === "/files"
                  ? pathname === "/files"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2  text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* 스토리지 (내 파일 탭에서만) */}
          {pathname.startsWith("/files/my") && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">My Storage</span>
            </div>
            {storage ? (() => {
              const percent = storage.limit > 0 ? Math.min((storage.used / storage.limit) * 100, 100) : 0;
              return (
                <>
                  <div className="w-full bg-muted rounded-full h-1.5 mb-1.5">
                    <div
                      className={cn("h-1.5 rounded-full", percent > 90 ? "bg-destructive" : "bg-primary")}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(storage.used)} / {formatSize(storage.limit)}
                  </p>
                </>
              );
            })() : (
              <>
                <div className="w-full bg-muted rounded-full h-1.5 mb-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: "0%" }} />
                </div>
                <p className="text-xs text-muted-foreground">로딩 중...</p>
              </>
            )}
          </div>
          )}

          {/* 유저 정보 */}
          {mounted && session?.user && (
            <div className="px-4 py-3 border-t border-border flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                {(session.user.name || session.user.email)?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session.user.name || session.user.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.user.department || ""}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* === 케이스 네비게이션 사이드바 === */}
      {isCaseSection && (
        <div className="w-52 bg-card border-r border-border flex flex-col">
          {/* 헤더 */}
          <div className="h-14 px-4 border-b border-border flex flex-col justify-center">
            <p className="text-[11px] text-muted-foreground leading-tight">Apps</p>
            <h2 className="text-sm font-bold leading-tight">Cases</h2>
          </div>

          {/* 네비게이션 */}
          <nav className="flex-1 p-3 space-y-1">
            {caseNav.map((item) => {
              const isFavoriteLink = item.href === "/cases?favorite=true";
              const isFavoritePage = pathname === "/cases" && searchParams.get("favorite") === "true";
              const isActive = isFavoriteLink
                ? isFavoritePage
                : item.href === "/cases"
                  ? (pathname === "/cases" || pathname.startsWith("/cases/")) && !isFavoritePage && !pathname.startsWith("/cases/browse") && !pathname.startsWith("/cases/templates") && !pathname.startsWith("/cases/trash")
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* === 설정 사이드바 === */}
      {isSettingsSection && (
        <div className="w-52 bg-card border-r border-border flex flex-col">
          <div className="h-14 px-4 border-b border-border flex flex-col justify-center">
            <p className="text-[11px] text-muted-foreground leading-tight">Apps</p>
            <h2 className="text-sm font-bold leading-tight">설정</h2>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            {settingsNav.map((item) => {
              const isActive = item.href === "/settings"
                ? pathname === "/settings"
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* === Chart AI 도구 사이드바 === */}
      {isChartAISection && (
        <div
          className={cn(
            "bg-card border-r border-border flex flex-col transition-all duration-300",
            chartSidebarOpen ? "w-48" : "w-12"
          )}
        >
          {/* 사이드바 토글 */}
          <div className="h-14 border-b border-border flex items-center justify-center px-2">
            <button
              onClick={() => setChartSidebarOpen(!chartSidebarOpen)}
              className="w-full flex items-center justify-center gap-2 py-2 text-muted-foreground hover:text-foreground transition-colors"
              title={chartSidebarOpen ? "사이드바 접기" : "사이드바 펼치기"}
            >
              {chartSidebarOpen ? (
                <PanelLeftClose className="w-5 h-5 flex-shrink-0" />
              ) : (
                <PanelLeft className="w-5 h-5 flex-shrink-0" />
              )}
              {chartSidebarOpen && (
                <span className="text-xs font-medium truncate">접기</span>
              )}
            </button>
          </div>

          {/* 도구 메뉴 */}
          <nav className="flex-1 py-2 space-y-0.5 overflow-y-auto">
            {/* 기록 */}
            <button
              onClick={() => setShowHistory(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title="기록"
            >
              <History className="w-5 h-5 flex-shrink-0" />
              {chartSidebarOpen && <span>기록</span>}
            </button>

            <div className="border-t border-border my-2" />

            {/* 도움말 */}
            <button
              onClick={() => setShowHelp(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              title="도움말"
            >
              <HelpCircle className="w-5 h-5 flex-shrink-0" />
              {chartSidebarOpen && <span>도움말</span>}
            </button>
          </nav>
        </div>
      )}

      {/* Chart AI Modals */}
      <HistoryPanel
        open={showHistory}
        onClose={() => setShowHistory(false)}
        onSelect={(history: ChartHistory) => {
          window.dispatchEvent(
            new CustomEvent("chart-ai-restore", { detail: history })
          );
        }}
      />
      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />
    </div>

    {/* === 모바일 사이드바 (Sheet) === */}
    <MobileSidebar
      currentApp={currentApp}
      pathname={pathname}
      searchParams={searchParams}
      session={session}
      storage={storage}
    />
    </>
  );
}

/* ─── 모바일 사이드바 (Sheet 오버레이) ─── */
function MobileSidebar({
  currentApp,
  pathname,
  searchParams,
  session,
  storage,
}: {
  currentApp: string;
  pathname: string;
  searchParams: ReturnType<typeof useSearchParams>;
  session: ReturnType<typeof useSession>["data"];
  storage: { used: number; limit: number } | null;
}) {
  const { isMobileMenuOpen, setMobileMenuOpen } = useStore();

  const isFileSection = currentApp === "files";
  const isCaseSection = currentApp === "cases";

  const close = () => setMobileMenuOpen(false);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const isSettingsSection = currentApp === "settings";
  const sectionNav = isSettingsSection ? settingsNav : isFileSection ? fileNav : isCaseSection ? caseNav : [];
  const sectionTitle = isSettingsSection ? "설정" : isFileSection ? "File Manager" : isCaseSection ? "Cases" : "";

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetContent side="left" className="w-72 p-0 gap-0" aria-describedby={undefined}>
        <SheetTitle className="sr-only">메뉴</SheetTitle>
        {/* 헤더 */}
        <div className="h-14 px-4 border-b border-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-[#2c3782] text-white flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground leading-tight">Apps</p>
            <h2 className="text-sm font-bold leading-tight">{sectionTitle}</h2>
          </div>
        </div>

        {/* 앱 전환 */}
        <div className="px-3 py-2 flex gap-1">
          {appNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-sm text-sm transition-colors flex-1 justify-center",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-border" />

        {/* 섹션 네비게이션 */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sectionNav.map((item) => {
            const isFavoriteLink = item.href === "/cases?favorite=true";
            const isFavoritePage = pathname === "/cases" && searchParams.get("favorite") === "true";
            let isActive: boolean;
            if (isFavoriteLink) {
              isActive = isFavoritePage;
            } else if (isFileSection && item.href === "/files") {
              isActive = pathname === "/files";
            } else if (isCaseSection && item.href === "/cases") {
              isActive = (pathname === "/cases" || pathname.startsWith("/cases/")) && !isFavoritePage && !pathname.startsWith("/cases/browse") && !pathname.startsWith("/cases/templates") && !pathname.startsWith("/cases/trash");
            } else {
              isActive = pathname.startsWith(item.href);
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 스토리지 (내 파일 탭에서만) */}
        {pathname.startsWith("/files/my") && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">My Storage</span>
            </div>
            {storage ? (() => {
              const percent = storage.limit > 0 ? Math.min((storage.used / storage.limit) * 100, 100) : 0;
              return (
                <>
                  <div className="w-full bg-muted rounded-full h-1.5 mb-1.5">
                    <div
                      className={cn("h-1.5 rounded-full", percent > 90 ? "bg-destructive" : "bg-primary")}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(storage.used)} / {formatSize(storage.limit)}
                  </p>
                </>
              );
            })() : (
              <p className="text-xs text-muted-foreground">로딩 중...</p>
            )}
          </div>
        )}

        {/* 하단: 설정, 관리자, 로그아웃 */}
        <div className="border-t border-border p-3 space-y-1">
          {session?.user?.role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={close}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Shield className="w-4 h-4" />
              <span>관리자</span>
            </Link>
          )}
          <Link
            href="/settings"
            onClick={close}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm transition-colors",
              pathname.startsWith("/settings")
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Settings className="w-4 h-4" />
            <span>설정</span>
          </Link>
          <button
            onClick={() => { close(); signOut({ callbackUrl: "/login" }); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>로그아웃</span>
          </button>
        </div>

        {/* 유저 정보 */}
        {session?.user && (
          <div className="px-4 py-3 border-t border-border flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
              {(session.user.name || session.user.email)?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session.user.name || session.user.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session.user.department || ""}
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
