"use client";

import { HelpCircle, X, Stethoscope, ClipboardList, AlertTriangle, Keyboard } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function HelpModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card border border-border rounded-sm w-full max-w-lg max-h-[80vh] flex flex-col shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">도움말</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
          {/* 소개 */}
          <section>
            <h4 className="font-semibold mb-2">Chart AI 소개</h4>
            <p className="text-muted-foreground leading-relaxed">
              외래/입원 환자의 차트를 입력하면 AI가 감별진단, 검사 및 치료 계획을 제안합니다.
              전공의 수련 과정에서 임상 추론 연습에 활용할 수 있습니다.
            </p>
          </section>

          {/* 사용법 */}
          <section>
            <h4 className="font-semibold mb-2">기본 사용법</h4>
            <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
              <li>환자 정보 (나이, 성별) 를 입력합니다</li>
              <li>차트 내용을 C.C, P.I, P.Hx 등 형식으로 입력합니다</li>
              <li>필요시 검사 결과 사진을 첨부합니다 (최대 3장)</li>
              <li><strong>전체 분석</strong> 버튼을 누르면 DDx, Plan, 추가 질문이 생성됩니다</li>
            </ol>
          </section>

          {/* AI 분석 기능 */}
          <section>
            <h4 className="font-semibold mb-2">AI 분석 기능</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Stethoscope className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">감별진단 (DDx)</p>
                  <p className="text-muted-foreground text-xs">Problem List, 진단별 확률, 감별진단, 반드시 배제할 진단</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ClipboardList className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">진료 계획 (Plan)</p>
                  <p className="text-muted-foreground text-xs">진단별 검사(Labs), 영상(Imaging), 치료(Treatment) 계획</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">추가 질문</p>
                  <p className="text-muted-foreground text-xs">감별진단을 좁히기 위한 OPQRST 기반 추가 질문 제안</p>
                </div>
              </div>
            </div>
          </section>

          {/* 이미지 */}
          <section>
            <h4 className="font-semibold mb-2">이미지 첨부</h4>
            <p className="text-muted-foreground leading-relaxed">
              검사 결과, X-ray, CT 등의 사진을 최대 3장까지 첨부할 수 있습니다.
              이미지당 최대 10MB이며, AI가 이미지 내용을 함께 분석합니다.
            </p>
          </section>

          {/* 단축키 */}
          <section>
            <h4 className="font-semibold mb-2 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4" />
              단축키
            </h4>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <div className="flex justify-between px-2 py-1.5 bg-muted rounded-sm">
                <span>전체 분석</span>
                <kbd className="px-1.5 py-0.5 bg-background rounded text-[10px] border border-border">Ctrl + Enter</kbd>
              </div>
            </div>
          </section>

          {/* 팁 */}
          <section>
            <h4 className="font-semibold mb-2">팁</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>영어/한국어 모두 지원됩니다</li>
              <li>차트 내용이 상세할수록 정확한 분석이 가능합니다</li>
              <li>분석 기록은 브라우저에 저장되며, 기록 메뉴에서 다시 불러올 수 있습니다</li>
            </ul>
          </section>

          {/* 면책 */}
          <section className="bg-amber-50 rounded-sm p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-1">면책 조항</h4>
                <ul className="list-disc list-inside space-y-0.5 text-xs text-amber-700">
                  <li>본 서비스는 의료기기가 아니며, 참고 용도로만 사용하세요</li>
                  <li>AI 분석 결과의 정확성은 보장되지 않습니다</li>
                  <li>최종 의료 판단은 반드시 담당 의사가 내려야 합니다</li>
                  <li>개인정보가 포함된 차트는 입력하지 마세요</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
