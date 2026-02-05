"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Loader2, FileText, Grid3X3, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Tag {
  id: string;
  name: string;
  _count: { cases: number };
}

interface CaseItem {
  id: string;
  title: string;
  diagnosis: string | null;
  isFavorite: boolean;
  createdAt: string;
  tags: { tag: { id: string; name: string } }[];
  images: { id: string; url: string }[];
}

interface PaginatedResponse {
  cases: CaseItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

const PAGE_SIZE = 18;

export default function BrowsePage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Fetch all tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch("/api/tags");
        if (res.ok) {
          const data = await res.json();
          setTags(data);
        }
      } catch (error) {
        console.error("Failed to fetch tags:", error);
      }
    };
    fetchTags();
  }, []);

  // Fetch cases with pagination and tag filtering
  const fetchCases = useCallback(async (isInitial: boolean = false) => {
    if (isInitial) {
      setLoading(true);
      setCases([]);
      setCursor(null);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params = new URLSearchParams();
      params.set("limit", PAGE_SIZE.toString());

      if (!isInitial && cursor) {
        params.set("cursor", cursor);
      }

      if (selectedTags.length > 0) {
        params.set("tags", selectedTags.join(","));
      }

      const res = await fetch(`/api/cases?${params}`);
      if (!res.ok) {
        setCases([]);
        setHasMore(false);
        return;
      }
      const data: PaginatedResponse = await res.json();

      if (isInitial) {
        setCases(data.cases || []);
      } else {
        setCases((prev) => [...prev, ...(data.cases || [])]);
      }

      setCursor(data.nextCursor ?? null);
      setHasMore(data.hasMore ?? false);
    } catch (error) {
      console.error("Failed to fetch cases:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [cursor, selectedTags]);

  // Initial fetch and when tags change
  useEffect(() => {
    fetchCases(true);
  }, [selectedTags]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchCases(false);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, fetchCases]);

  // Toggle tag selection
  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  // Clear all selected tags
  const clearTags = () => {
    setSelectedTags([]);
  };

  return (
    <div className="space-y-6">
      {/* Tags filter info */}
      {selectedTags.length > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {selectedTags.length}개 태그 선택됨
          </Badge>
        </div>
      )}

      {/* Tags Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            태그 필터
          </h2>
          {selectedTags.length > 0 && (
            <button
              onClick={clearTags}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              초기화
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.name) ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all hover:scale-105",
                selectedTags.includes(tag.name)
                  ? "bg-primary hover:bg-primary/90"
                  : "hover:bg-accent"
              )}
              onClick={() => toggleTag(tag.name)}
            >
              {tag.name}
              <span className="ml-1 text-xs opacity-70">
                ({tag._count.cases})
              </span>
            </Badge>
          ))}
          {tags.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground">태그가 없습니다</p>
          )}
        </div>
      </div>

      {/* Cases Grid */}
      {loading ? (
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[...Array(15)].map((_, i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-muted" />
            </Card>
          ))}
        </div>
      ) : cases.length === 0 ? (
        <div className="text-center py-12">
          <Grid3X3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">
            {selectedTags.length > 0 ? "일치하는 케이스가 없습니다" : "케이스가 없습니다"}
          </h3>
          <p className="text-muted-foreground">
            {selectedTags.length > 0
              ? "다른 태그를 선택해 보세요"
              : "첫 케이스를 추가해 보세요"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {cases.map((c) => (
              <Link key={c.id} href={`/cases/${c.id}`}>
                <Card className="aspect-[4/3] overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative group">
                  {/* Image */}
                  {c.images && c.images.length > 0 ? (
                    <img
                      src={c.images[0].url}
                      alt={c.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                      <FileText className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                  )}

                  {/* Tags overlay - top */}
                  {c.tags && c.tags.length > 0 && (
                    <div className="absolute top-1 left-1 right-1 flex flex-wrap gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      {c.tags.slice(0, 2).map((t) => (
                        <Badge
                          key={t.tag.id}
                          variant="secondary"
                          className="text-[8px] px-1 py-0 bg-black/50 text-white border-0"
                        >
                          {t.tag.name}
                        </Badge>
                      ))}
                      {c.tags.length > 2 && (
                        <Badge
                          variant="secondary"
                          className="text-[8px] px-1 py-0 bg-black/50 text-white border-0"
                        >
                          +{c.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Title bar - bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-1">
                    <h3 className="font-medium text-[10px] text-white line-clamp-1">
                      {c.title}
                    </h3>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Infinite scroll loader */}
          <div ref={loaderRef} className="py-4 flex justify-center">
            {loadingMore && (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            )}
            {!hasMore && cases.length > 0 && (
              <p className="text-sm text-muted-foreground">
                모든 케이스를 불러왔습니다
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
