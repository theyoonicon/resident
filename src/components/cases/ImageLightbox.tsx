"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Image {
  id: string;
  url: string;
  caption: string | null;
}

interface ImageLightboxProps {
  images: Image[];
}

export function ImageLightbox({ images }: ImageLightboxProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const goNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  };

  const goPrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
  };

  return (
    <>
      {/* 이미지 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((img, index) => (
          <div key={img.id}>
            <button
              onClick={() => openLightbox(index)}
              className="w-full focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
            >
              <img
                src={img.url}
                alt={img.caption || "Case image"}
                className="w-full aspect-square object-cover rounded-lg border hover:opacity-90 transition-opacity cursor-zoom-in"
              />
            </button>
            {img.caption && (
              <p className="text-xs text-muted-foreground mt-1">{img.caption}</p>
            )}
          </div>
        ))}
      </div>

      {/* 라이트박스 모달 */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
        >
          {/* 닫기 버튼 */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
            aria-label="닫기"
          >
            <X className="h-8 w-8" />
          </button>

          {/* 이전 버튼 */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 p-2 text-white/80 hover:text-white transition-colors"
              aria-label="이전 이미지"
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
          )}

          {/* 이미지 */}
          <div
            className="max-w-[90vw] max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedIndex].url}
              alt={images[selectedIndex].caption || "Case image"}
              className="max-w-full max-h-[85vh] object-contain"
            />
            {images[selectedIndex].caption && (
              <p className="text-white/80 text-sm mt-3 text-center">
                {images[selectedIndex].caption}
              </p>
            )}
            <p className="text-white/50 text-xs mt-2">
              {selectedIndex + 1} / {images.length}
            </p>
          </div>

          {/* 다음 버튼 */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 p-2 text-white/80 hover:text-white transition-colors"
              aria-label="다음 이미지"
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
