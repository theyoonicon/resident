import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar, ExternalLink } from "lucide-react";
import { DEPARTMENTS } from "@/templates";
import { DepartmentDataView } from "@/components/templates";
import { DepartmentData } from "@/templates/types";

interface Props {
  params: Promise<{ publicId: string }>;
}

async function getPublicCase(publicId: string) {
  const caseData = await prisma.case.findUnique({
    where: { publicId },
    include: {
      tags: {
        include: { tag: true },
      },
      images: {
        orderBy: { order: "asc" },
      },
    },
  });

  // 공개되지 않은 케이스는 접근 불가
  if (!caseData || !caseData.isPublic) {
    return null;
  }

  return caseData;
}

export default async function PublicCasePage({ params }: Props) {
  const { publicId } = await params;
  const caseData = await getPublicCase(publicId);

  if (!caseData) {
    notFound();
  }

  const departmentInfo = DEPARTMENTS.find((d) => d.key === caseData.department);
  const hasDepartmentData = caseData.departmentData && Object.keys(caseData.departmentData as object).length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/files" className="font-bold text-xl">
            Resident
          </Link>
          <Badge variant="secondary" className="text-xs">
            <ExternalLink className="h-3 w-3 mr-1" />
            공개 페이지
          </Badge>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title & Meta */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{caseData.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            {departmentInfo && (
              <Badge variant="outline">
                {departmentInfo.name}
              </Badge>
            )}
            {caseData.date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(caseData.date, "yyyy년 MM월 dd일", { locale: ko })}
              </span>
            )}
            {caseData.ageGroup && (
              <>
                <span>·</span>
                <span>{caseData.ageGroup}</span>
              </>
            )}
            {caseData.gender && (
              <>
                <span>·</span>
                <span>{caseData.gender === "M" ? "남" : "여"}</span>
              </>
            )}
          </div>
        </div>

        {/* Tags */}
        {caseData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {caseData.tags.map((ct) => (
              <Badge key={ct.tagId} variant="secondary">
                #{ct.tag.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="space-y-8">
          {/* 과별 템플릿 데이터 */}
          {hasDepartmentData && (
            <DepartmentDataView
              department={caseData.department}
              departmentData={caseData.departmentData as DepartmentData}
              templateVersion={caseData.templateVersion}
            />
          )}

          {/* 기존 필드 (하위 호환성) */}
          {!hasDepartmentData && (
            <>
              {caseData.chiefComplaint && (
                <section className="space-y-2">
                  <h2 className="text-lg font-semibold border-b pb-2">주호소 (C.C)</h2>
                  <p className="text-muted-foreground">{caseData.chiefComplaint}</p>
                </section>
              )}

              {caseData.history && (
                <section className="space-y-2">
                  <h2 className="text-lg font-semibold border-b pb-2">병력</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{caseData.history}</p>
                </section>
              )}

              {caseData.examination && (
                <section className="space-y-2">
                  <h2 className="text-lg font-semibold border-b pb-2">검사 소견</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{caseData.examination}</p>
                </section>
              )}

              {caseData.diagnosis && (
                <section className="space-y-2">
                  <h2 className="text-lg font-semibold border-b pb-2">진단</h2>
                  <p className="font-medium">{caseData.diagnosis}</p>
                </section>
              )}

              {caseData.treatment && (
                <section className="space-y-2">
                  <h2 className="text-lg font-semibold border-b pb-2">치료</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{caseData.treatment}</p>
                </section>
              )}

              {caseData.outcome && (
                <section className="space-y-2">
                  <h2 className="text-lg font-semibold border-b pb-2">결과</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{caseData.outcome}</p>
                </section>
              )}

              {caseData.learningPoints && (
                <section className="space-y-2">
                  <h2 className="text-lg font-semibold border-b pb-2">Learning Points</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">{caseData.learningPoints}</p>
                </section>
              )}
            </>
          )}

          {/* 이미지 */}
          {caseData.images.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">이미지</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {caseData.images.map((img) => (
                  <div key={img.id}>
                    <img
                      src={img.url}
                      alt={img.caption || "Case image"}
                      className="w-full aspect-square object-cover rounded-lg border"
                    />
                    {img.caption && (
                      <p className="text-xs text-muted-foreground mt-1">{img.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>이 페이지는 Resident에서 공개된 의료 케이스입니다.</p>
          <p className="mt-1">
            <Link href="/files" className="text-primary hover:underline">
              Resident 바로가기 →
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
