"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Plus,
  Upload,
  Bot,
  BookOpen,
  FolderOpen,
  Star,
  User,
  Settings,
  Shield,
  Globe,
  Trash2,
  Menu,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useStore } from "@/store/useStore";

type SectionConfig = {
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  showSearch?: boolean;
  searchPlaceholder?: string;
  actions?: Array<{
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    variant: "outline" | "primary";
    onClick?: () => void;
    href?: string;
  }>;
};

function getSectionConfig(pathname: string, folderId?: string | null): SectionConfig {
  if (pathname.startsWith("/chart-ai")) {
    return {
      title: "Chart AI",
      icon: Bot,
      showSearch: false,
    };
  }
  if (pathname.startsWith("/cases/browse")) {
    return {
      title: "둘러보기",
      icon: Globe,
      showSearch: false,
    };
  }
  if (pathname.startsWith("/cases/templates")) {
    return {
      title: "템플릿 관리",
      icon: BookOpen,
      showSearch: false,
    };
  }
  if (pathname.startsWith("/cases/trash")) {
    return {
      title: "휴지통",
      icon: Trash2,
      showSearch: false,
    };
  }
  if (pathname.startsWith("/cases")) {
    return {
      title: "Cases",
      icon: BookOpen,
      showSearch: false,
      actions: [
        { label: "새 케이스", icon: Plus, variant: "primary" as const, href: folderId ? `/cases/new?folder=${folderId}` : "/cases/new" },
      ],
    };
  }
  if (pathname.startsWith("/files/trash")) {
    return {
      title: "휴지통",
      icon: Trash2,
      showSearch: false,
    };
  }
  if (pathname.startsWith("/settings")) {
    return {
      title: "설정",
      icon: Settings,
      showSearch: false,
    };
  }
  if (pathname.startsWith("/admin")) {
    return {
      title: "관리자",
      icon: Shield,
      showSearch: false,
    };
  }
  if (pathname.startsWith("/files/starred")) {
    return {
      title: "즐겨찾기",
      icon: Star,
      showSearch: true,
      searchPlaceholder: "즐겨찾기 검색...",
    };
  }
  if (pathname.startsWith("/files/my")) {
    return {
      title: "내 파일",
      icon: User,
      showSearch: true,
      searchPlaceholder: "내 파일 검색...",
    };
  }
  if (pathname.startsWith("/files/shared")) {
    return {
      title: "공유 자료실",
      icon: FolderOpen,
      showSearch: true,
      searchPlaceholder: "공유 파일, 폴더 검색...",
    };
  }
  // Home (/files)
  return {
    title: "Home",
    icon: FolderOpen,
    showSearch: true,
    searchPlaceholder: "파일, 폴더 검색...",
  };
}

export default function TopBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { searchQuery, setSearchQuery, setMobileMenuOpen } = useStore();
  const config = getSectionConfig(pathname, searchParams.get("folder"));
  const SectionIcon = config.icon;

  return (
    <div className="bg-card border-b border-border">
      <div className="h-14 px-3 md:px-6 flex items-center justify-between gap-2 md:gap-4">
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          {/* 모바일 햄버거 */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-1.5 -ml-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <SectionIcon className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-baseline gap-2">
              <h1 className="text-sm font-semibold">{config.title}</h1>
              {config.description && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {config.description}
                </span>
              )}
            </div>
          </div>

          {/* 데스크탑: 검색바 인라인 */}
          {config.showSearch && (
            <div className="relative flex-1 max-w-md hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={config.searchPlaceholder || "검색..."}
                className="w-full pl-10 pr-4 py-1.5 border border-border rounded-sm text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
        </div>

        {/* 우측 액션 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {config.actions?.map((action) => {
            const className =
              action.variant === "primary"
                ? "hidden md:flex items-center gap-2 px-4 py-1.5 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:opacity-90 transition-opacity"
                : "hidden md:flex items-center gap-2 px-4 py-1.5 border border-border rounded-sm text-sm font-medium hover:bg-accent transition-colors";
            const content = (
              <>
                <action.icon className="w-4 h-4" />
                <span>{action.label}</span>
              </>
            );

            return action.href ? (
              <Link key={action.label} href={action.href} className={className}>
                {content}
              </Link>
            ) : (
              <button key={action.label} onClick={action.onClick} className={className}>
                {content}
              </button>
            );
          })}

          {/* 유저 (데스크탑만) */}
          {session?.user && (
            <div className="ml-2 hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                {(session.user.name || session.user.email)?.[0]?.toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 모바일: 검색바 아래 줄 */}
      {config.showSearch && (
        <div className="px-3 pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={config.searchPlaceholder || "검색..."}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-sm text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      )}
    </div>
  );
}
