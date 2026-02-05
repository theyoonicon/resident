"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FolderOpen,
  Lock,
  Search,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface OnboardingGuideProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

const slides = [
  {
    icon: Sparkles,
    title: "Caset에 오신 것을 환영합니다!",
    description: "나만의 케이스 라이브러리를 시작해보세요.\n매일 마주하는 케이스들을 체계적으로 기록하고 나만의 자산으로 쌓아가세요.",
    image: "/images/male_doctor_1.png",
  },
  {
    icon: FolderOpen,
    title: "진료과별 맞춤 템플릿",
    description: "내과, 외과, 응급의학과 등 진료과별로 최적화된 템플릿을 제공합니다.\n필요한 항목만 빠르게 입력하고, 나중에 찾기 쉽게 정리하세요.",
    image: "/images/book_pen_2.png",
  },
  {
    icon: Lock,
    title: "완전한 프라이버시",
    description: "공개할 필요 없는 나만의 기록 공간.\nSNS처럼 누군가에게 보여주기 위한 것이 아닌, 오직 나의 성장을 위한 라이브러리입니다.",
    image: "/images/secret.png",
  },
  {
    icon: Search,
    title: "강력한 검색 기능",
    description: "진단명, 태그, 키워드로 쌓아둔 케이스를 바로 찾으세요.\n비슷한 케이스를 만났을 때, 과거의 경험이 자산이 됩니다.",
    image: "/images/search.png",
  },
];

export function OnboardingGuide({ forceOpen, onClose }: OnboardingGuideProps = {}) {
  const [open, setOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // forceOpen이 true면 바로 열기
    if (forceOpen) {
      setOpen(true);
      setCurrentSlide(0);
      setLoading(false);
      return;
    }

    // DB에서 온보딩 상태 확인 + 샘플 케이스 생성
    const initUser = async () => {
      try {
        const res = await fetch("/api/user/init");
        if (res.ok) {
          const data = await res.json();
          if (!data.hasSeenOnboarding) {
            setOpen(true);
          }
          // 샘플 케이스가 새로 생성되었으면 페이지 새로고침
          if (data.hasSampleCase === false) {
            router.refresh();
          }
        }
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
      } finally {
        setLoading(false);
      }
    };

    initUser();
  }, [forceOpen, router]);

  const handleClose = async () => {
    setOpen(false);
    onClose?.();

    // DB에 온보딩 완료 표시
    try {
      await fetch("/api/user/init", { method: "POST" });
    } catch (error) {
      console.error("Failed to mark onboarding complete:", error);
    }
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <div className="p-6 pb-4">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Icon className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-center mb-2">
            {slide.title}
          </h2>

          {/* Description */}
          <p className="text-muted-foreground text-center text-sm whitespace-pre-line">
            {slide.description}
          </p>
        </div>

        {/* Image */}
        <div className="relative h-48 bg-muted/30 flex items-center justify-center">
          <div className="relative w-40 h-40">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentSlide
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-2">
            {currentSlide > 0 ? (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="flex-1"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                이전
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={handleClose}
                className="flex-1 text-muted-foreground"
              >
                건너뛰기
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {currentSlide < slides.length - 1 ? (
                <>
                  다음
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                "시작하기"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
