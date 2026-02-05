import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Edit, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { DeleteCaseButton } from "@/components/cases/DeleteCaseButton";
import { FavoriteButton } from "@/components/cases/FavoriteButton";
import { ImageLightbox } from "@/components/cases/ImageLightbox";
import { ShareExportDialog } from "@/components/cases/ShareExportDialog";

import { CaseDetailContent } from "@/components/cases/CaseDetailContent";
import { DepartmentDataView } from "@/components/templates";
import { DEPARTMENTS } from "@/templates";
import { DepartmentData, SectionDefinition, FieldDefinition } from "@/templates/types";
import { auth } from "@/auth";

interface Props {
  params: Promise<{ id: string }>;
}

interface CustomTemplateData {
  name: string;
  sections: SectionDefinition[];
  fields: FieldDefinition[];
}

async function getCase(id: string, userId?: string) {
  const caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      tags: {
        include: { tag: true },
      },
      images: {
        orderBy: { order: "asc" },
      },
      caseFolder: true,
    },
  });

  // 소유자 여부 확인
  const isOwner = userId ? caseData?.userId === userId : false;

  return { caseData, isOwner };
}

async function getCustomTemplate(templateKey: string): Promise<CustomTemplateData | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const template = await prisma.caseTemplate.findFirst({
    where: {
      key: templateKey,
      userId: session.user.id,
    },
  });

  if (!template) return null;

  return {
    name: template.name,
    sections: template.sections as unknown as SectionDefinition[],
    fields: template.fields as unknown as FieldDefinition[],
  };
}

export default async function CaseDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const { caseData, isOwner } = await getCase(id, session?.user?.id);

  if (!caseData) {
    notFound();
  }

  // 커스텀 템플릿 여부 확인 (templateVersion이 "custom:"으로 시작하면 커스텀)
  const isCustomTemplate = caseData.templateVersion?.startsWith("custom:");
  let customTemplate: CustomTemplateData | null = null;

  if (isCustomTemplate) {
    // templateVersion format: "custom:template-key:version"
    customTemplate = await getCustomTemplate(caseData.department);
  }

  // 과 정보 (시스템 템플릿 or 커스텀 템플릿)
  const departmentInfo = isCustomTemplate && customTemplate
    ? { key: caseData.department, name: customTemplate.name, nameEn: customTemplate.name }
    : DEPARTMENTS.find((d) => d.key === caseData.department);
  const hasDepartmentData = caseData.departmentData && Object.keys(caseData.departmentData as object).length > 0;
  const hasLegacyData = !!(caseData.chiefComplaint || caseData.history || caseData.examination || caseData.diagnosis || caseData.treatment || caseData.outcome || caseData.learningPoints);
  const hasTemplateContent = !!(hasDepartmentData || hasLegacyData);

  return (
    <div className="relative">
      {/* Top Bar - PC only */}
      <div className="hidden md:flex h-12 sticky top-0 z-20 bg-background/95 backdrop-blur-sm items-center justify-between">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/cases" className="hover:text-foreground transition-colors">
              전체 케이스
            </Link>
            {caseData.caseFolder && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link
                  href={`/cases?folder=${caseData.caseFolder.id}`}
                  className="hover:text-foreground transition-colors"
                >
                  {caseData.caseFolder.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {caseData.title}
            </span>
          </nav>

          {/* Actions - PC */}
          <div className="flex items-center gap-1">
            <FavoriteButton caseId={caseData.id} isFavorite={caseData.isFavorite} />
            <ShareExportDialog caseId={caseData.id} caseTitle={caseData.title} />
            {isOwner && (
              <>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/cases/${caseData.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <DeleteCaseButton caseId={caseData.id} />
              </>
            )}
          </div>
      </div>

      {/* Mobile Top Bar Background */}
      <div className="h-12 sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b md:hidden" />

      {/* Mobile Actions - Fixed position to align with hamburger */}
      <div className="fixed top-1.5 right-3 z-40 flex items-center gap-1 md:hidden">
        <FavoriteButton caseId={caseData.id} isFavorite={caseData.isFavorite} />
        <ShareExportDialog caseId={caseData.id} caseTitle={caseData.title} />
        {isOwner && (
          <>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/cases/${caseData.id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
            <DeleteCaseButton caseId={caseData.id} />
          </>
        )}
      </div>

      {/* Content */}
      <div className="case-content pt-4 pb-16">
        {/* Title & Meta */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-3">{caseData.title}</h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {departmentInfo && (
            <Badge variant="outline" className="text-xs">
              {departmentInfo.name}
            </Badge>
          )}
          {caseData.date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(caseData.date, "yyyy.MM.dd", { locale: ko })}
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
              {ct.tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* 이미지 */}
      {caseData.images && caseData.images.length > 0 && (
        <section className="space-y-4 mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground border-b pb-2">Images</h2>
          <ImageLightbox images={caseData.images} />
        </section>
      )}

      {/* 차트 + 템플릿 영역 */}
      <CaseDetailContent
        hasTemplate={hasTemplateContent}
        chartContent={
          caseData.rawContent ? (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground border-b pb-2">Chart 원본</h2>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{caseData.rawContent}</p>
              </div>
            </section>
          ) : (
            <div className="text-sm text-muted-foreground py-8 text-center">
              차트 원본이 없습니다
            </div>
          )
        }
        templateContent={
          <div className="space-y-8">
            {hasDepartmentData && (
              <DepartmentDataView
                department={caseData.department}
                departmentData={caseData.departmentData as DepartmentData}
                templateVersion={caseData.templateVersion}
                customTemplate={customTemplate}
              />
            )}

            {!hasDepartmentData && (
              <>
                {(caseData.chiefComplaint || caseData.history || caseData.examination) && (
                  <section className="space-y-4">
                    <h2 className="text-sm font-semibold text-muted-foreground border-b pb-2">환자 정보</h2>
                    {caseData.chiefComplaint && (
                      <div className="space-y-1">
                        <h3 className="text-xs font-medium text-muted-foreground">C.C</h3>
                        <p className="text-sm">{caseData.chiefComplaint}</p>
                      </div>
                    )}
                    {caseData.history && (
                      <div className="space-y-1">
                        <h3 className="text-xs font-medium text-muted-foreground">Hx</h3>
                        <p className="text-sm whitespace-pre-wrap">{caseData.history}</p>
                      </div>
                    )}
                    {caseData.examination && (
                      <div className="space-y-1">
                        <h3 className="text-xs font-medium text-muted-foreground">Findings</h3>
                        <p className="text-sm whitespace-pre-wrap">{caseData.examination}</p>
                      </div>
                    )}
                  </section>
                )}

                {(caseData.diagnosis || caseData.treatment || caseData.outcome) && (
                  <section className="space-y-4">
                    <h2 className="text-sm font-semibold text-muted-foreground border-b pb-2">Dx & Tx</h2>
                    {caseData.diagnosis && (
                      <div className="space-y-1">
                        <h3 className="text-xs font-medium text-muted-foreground">Dx</h3>
                        <p className="text-sm font-medium">{caseData.diagnosis}</p>
                      </div>
                    )}
                    {caseData.treatment && (
                      <div className="space-y-1">
                        <h3 className="text-xs font-medium text-muted-foreground">Tx</h3>
                        <p className="text-sm whitespace-pre-wrap">{caseData.treatment}</p>
                      </div>
                    )}
                    {caseData.outcome && (
                      <div className="space-y-1">
                        <h3 className="text-xs font-medium text-muted-foreground">Outcome</h3>
                        <p className="text-sm whitespace-pre-wrap">{caseData.outcome}</p>
                      </div>
                    )}
                  </section>
                )}

                {caseData.learningPoints && (
                  <section className="space-y-4">
                    <h2 className="text-sm font-semibold text-muted-foreground border-b pb-2">Learning Points</h2>
                    <p className="text-sm whitespace-pre-wrap">{caseData.learningPoints}</p>
                  </section>
                )}
              </>
            )}
          </div>
        }
      />
      </div>
    </div>
  );
}
