import { DepartmentTemplate } from '../types';

export const cosmeticDermatologyTemplate: DepartmentTemplate = {
  departmentKey: 'cosmetic-dermatology',
  departmentName: '미용/피부시술',
  departmentNameEn: 'Cosmetic Dermatology',
  version: '1.0.0',

  sections: [
    { key: 'consultation', title: '상담', titleEn: 'Consultation', order: 1 },
    { key: 'assessment', title: '피부 평가', titleEn: 'Skin Assessment', order: 2 },
    { key: 'procedure', title: '시술', titleEn: 'Procedure', order: 3 },
    { key: 'followup', title: '경과 및 관리', titleEn: 'Follow-up & Care', order: 4 },
  ],

  fields: [
    // Consultation
    {
      key: 'chiefConcern',
      label: '주 관심사',
      labelEn: 'Chief Concern',
      type: 'text',
      required: true,
      section: 'consultation',
      order: 1,
      placeholder: '예: 기미, 주름, 여드름 흉터',
      placeholderEn: 'e.g., Melasma, wrinkles, acne scars',
    },
    {
      key: 'concernAreas',
      label: '관심 부위',
      labelEn: 'Areas of Concern',
      type: 'multiselect',
      required: true,
      section: 'consultation',
      order: 2,
      options: [
        { value: 'forehead', label: '이마', labelEn: 'Forehead' },
        { value: 'glabella', label: '미간', labelEn: 'Glabella' },
        { value: 'periorbital', label: '눈가', labelEn: 'Periorbital' },
        { value: 'cheek', label: '볼', labelEn: 'Cheek' },
        { value: 'nose', label: '코', labelEn: 'Nose' },
        { value: 'nasolabial', label: '팔자주름', labelEn: 'Nasolabial Folds' },
        { value: 'lip', label: '입술', labelEn: 'Lips' },
        { value: 'chin', label: '턱', labelEn: 'Chin' },
        { value: 'jawline', label: '턱선', labelEn: 'Jawline' },
        { value: 'neck', label: '목', labelEn: 'Neck' },
        { value: 'fullFace', label: '전체 얼굴', labelEn: 'Full Face' },
        { value: 'body', label: '바디', labelEn: 'Body' },
      ],
    },
    {
      key: 'skinConcerns',
      label: '피부 고민',
      labelEn: 'Skin Concerns',
      type: 'multiselect',
      required: false,
      section: 'consultation',
      order: 3,
      options: [
        { value: 'wrinkles', label: '주름', labelEn: 'Wrinkles' },
        { value: 'finelines', label: '잔주름', labelEn: 'Fine Lines' },
        { value: 'sagging', label: '처짐', labelEn: 'Sagging' },
        { value: 'pigmentation', label: '색소침착/기미', labelEn: 'Pigmentation/Melasma' },
        { value: 'acneScars', label: '여드름 흉터', labelEn: 'Acne Scars' },
        { value: 'pores', label: '모공', labelEn: 'Pores' },
        { value: 'redness', label: '홍조', labelEn: 'Redness' },
        { value: 'dullness', label: '칙칙함', labelEn: 'Dullness' },
        { value: 'dehydration', label: '건조함', labelEn: 'Dehydration' },
        { value: 'volumeLoss', label: '볼륨 감소', labelEn: 'Volume Loss' },
        { value: 'contour', label: '윤곽', labelEn: 'Contour' },
        { value: 'skinTexture', label: '피부결', labelEn: 'Skin Texture' },
      ],
    },
    {
      key: 'previousProcedures',
      label: '이전 시술 이력',
      labelEn: 'Previous Procedures',
      type: 'textarea',
      required: false,
      section: 'consultation',
      order: 4,
      placeholder: '이전에 받은 시술, 시기, 만족도',
      placeholderEn: 'Previous procedures, timing, satisfaction',
    },
    {
      key: 'allergies',
      label: '알레르기/부작용 이력',
      labelEn: 'Allergies/Adverse Reactions',
      type: 'textarea',
      required: false,
      section: 'consultation',
      order: 5,
      placeholder: '마취제, 필러, 약물 등',
      placeholderEn: 'Anesthetics, fillers, medications, etc.',
    },
    {
      key: 'medications',
      label: '복용 약물',
      labelEn: 'Current Medications',
      type: 'textarea',
      required: false,
      section: 'consultation',
      order: 6,
      placeholder: '레티노이드, 항응고제 등',
      placeholderEn: 'Retinoids, anticoagulants, etc.',
    },
    {
      key: 'expectations',
      label: '기대 사항',
      labelEn: 'Patient Expectations',
      type: 'textarea',
      required: false,
      section: 'consultation',
      order: 7,
    },

    // Skin Assessment
    {
      key: 'fitzpatrickType',
      label: 'Fitzpatrick 피부 타입',
      labelEn: 'Fitzpatrick Skin Type',
      type: 'select',
      required: false,
      section: 'assessment',
      order: 1,
      options: [
        { value: 'I', label: 'Type I (매우 흰 피부)', labelEn: 'Type I (Very Fair)' },
        { value: 'II', label: 'Type II (흰 피부)', labelEn: 'Type II (Fair)' },
        { value: 'III', label: 'Type III (밝은 피부)', labelEn: 'Type III (Light)' },
        { value: 'IV', label: 'Type IV (올리브 피부)', labelEn: 'Type IV (Olive)' },
        { value: 'V', label: 'Type V (갈색 피부)', labelEn: 'Type V (Brown)' },
        { value: 'VI', label: 'Type VI (어두운 피부)', labelEn: 'Type VI (Dark)' },
      ],
    },
    {
      key: 'skinType',
      label: '피부 타입',
      labelEn: 'Skin Type',
      type: 'select',
      required: false,
      section: 'assessment',
      order: 2,
      options: [
        { value: 'dry', label: '건성', labelEn: 'Dry' },
        { value: 'oily', label: '지성', labelEn: 'Oily' },
        { value: 'combination', label: '복합성', labelEn: 'Combination' },
        { value: 'sensitive', label: '민감성', labelEn: 'Sensitive' },
        { value: 'normal', label: '정상', labelEn: 'Normal' },
      ],
    },
    {
      key: 'glogauScale',
      label: 'Glogau 노화 등급',
      labelEn: 'Glogau Scale',
      type: 'select',
      required: false,
      section: 'assessment',
      order: 3,
      options: [
        { value: 'I', label: 'Type I (경미한 노화)', labelEn: 'Type I (Mild)' },
        { value: 'II', label: 'Type II (중등도 노화)', labelEn: 'Type II (Moderate)' },
        { value: 'III', label: 'Type III (진행된 노화)', labelEn: 'Type III (Advanced)' },
        { value: 'IV', label: 'Type IV (심한 노화)', labelEn: 'Type IV (Severe)' },
      ],
    },
    {
      key: 'skinCondition',
      label: '피부 상태',
      labelEn: 'Skin Condition',
      type: 'textarea',
      required: false,
      section: 'assessment',
      order: 4,
      placeholder: '탄력, 수분도, 색소침착 정도 등',
      placeholderEn: 'Elasticity, hydration, pigmentation level, etc.',
    },
    {
      key: 'facialAnalysis',
      label: '안면 분석',
      labelEn: 'Facial Analysis',
      type: 'textarea',
      required: false,
      section: 'assessment',
      order: 5,
      placeholder: '볼륨 분포, 대칭성, 윤곽선 등',
      placeholderEn: 'Volume distribution, symmetry, contour, etc.',
    },

    // Procedure
    {
      key: 'procedureType',
      label: '시술 종류',
      labelEn: 'Procedure Type',
      type: 'multiselect',
      required: true,
      section: 'procedure',
      order: 1,
      options: [
        { value: 'botox', label: '보톡스', labelEn: 'Botox' },
        { value: 'filler', label: '필러', labelEn: 'Filler' },
        { value: 'skinBooster', label: '스킨부스터', labelEn: 'Skin Booster' },
        { value: 'threadLift', label: '실리프팅', labelEn: 'Thread Lift' },
        { value: 'laser', label: '레이저', labelEn: 'Laser' },
        { value: 'ipl', label: 'IPL', labelEn: 'IPL' },
        { value: 'rf', label: 'RF (고주파)', labelEn: 'RF (Radiofrequency)' },
        { value: 'hifu', label: 'HIFU', labelEn: 'HIFU' },
        { value: 'peel', label: '필링', labelEn: 'Peel' },
        { value: 'mts', label: 'MTS/마이크로니들링', labelEn: 'MTS/Microneedling' },
        { value: 'pdrn', label: 'PDRN/연어주사', labelEn: 'PDRN' },
        { value: 'prp', label: 'PRP', labelEn: 'PRP' },
        { value: 'mesotherapy', label: '메조테라피', labelEn: 'Mesotherapy' },
        { value: 'other', label: '기타', labelEn: 'Other' },
      ],
    },
    {
      key: 'procedureDetails',
      label: '시술 상세',
      labelEn: 'Procedure Details',
      type: 'textarea',
      required: true,
      section: 'procedure',
      order: 2,
      placeholder: '사용 제품, 부위별 용량, 테크닉 등',
      placeholderEn: 'Products used, dose per area, technique, etc.',
    },
    {
      key: 'anesthesia',
      label: '마취',
      labelEn: 'Anesthesia',
      type: 'select',
      required: false,
      section: 'procedure',
      order: 3,
      options: [
        { value: 'none', label: '없음', labelEn: 'None' },
        { value: 'topical', label: '도포 마취', labelEn: 'Topical' },
        { value: 'nerve-block', label: '신경차단', labelEn: 'Nerve Block' },
        { value: 'local', label: '국소 마취', labelEn: 'Local' },
      ],
    },
    {
      key: 'productsUsed',
      label: '사용 제품',
      labelEn: 'Products Used',
      type: 'textarea',
      required: false,
      section: 'procedure',
      order: 4,
      placeholder: '브랜드명, 용량 등',
      placeholderEn: 'Brand name, volume, etc.',
    },
    {
      key: 'treatmentAreas',
      label: '시술 부위 상세',
      labelEn: 'Treatment Areas Detail',
      type: 'textarea',
      required: false,
      section: 'procedure',
      order: 5,
      placeholder: '부위별 시술 내용',
      placeholderEn: 'Treatment details per area',
    },
    {
      key: 'immediateResult',
      label: '시술 직후 결과',
      labelEn: 'Immediate Result',
      type: 'textarea',
      required: false,
      section: 'procedure',
      order: 6,
    },
    {
      key: 'complications',
      label: '합병증/부작용',
      labelEn: 'Complications',
      type: 'textarea',
      required: false,
      section: 'procedure',
      order: 7,
      placeholder: '멍, 부종, 통증 등',
      placeholderEn: 'Bruising, swelling, pain, etc.',
    },

    // Follow-up
    {
      key: 'postCareInstructions',
      label: '시술 후 관리 지침',
      labelEn: 'Post-Care Instructions',
      type: 'textarea',
      required: false,
      section: 'followup',
      order: 1,
      placeholder: '주의사항, 금기사항 등',
      placeholderEn: 'Precautions, contraindications, etc.',
    },
    {
      key: 'followUpSchedule',
      label: '재진 일정',
      labelEn: 'Follow-up Schedule',
      type: 'text',
      required: false,
      section: 'followup',
      order: 2,
      placeholder: '예: 2주 후 경과 확인',
      placeholderEn: 'e.g., Follow-up in 2 weeks',
    },
    {
      key: 'outcomeAt1Week',
      label: '1주 후 경과',
      labelEn: 'Outcome at 1 Week',
      type: 'textarea',
      required: false,
      section: 'followup',
      order: 3,
    },
    {
      key: 'outcomeAt1Month',
      label: '1개월 후 경과',
      labelEn: 'Outcome at 1 Month',
      type: 'textarea',
      required: false,
      section: 'followup',
      order: 4,
    },
    {
      key: 'patientSatisfaction',
      label: '환자 만족도',
      labelEn: 'Patient Satisfaction',
      type: 'select',
      required: false,
      section: 'followup',
      order: 5,
      options: [
        { value: 'veryUnsatisfied', label: '매우 불만족', labelEn: 'Very Unsatisfied' },
        { value: 'unsatisfied', label: '불만족', labelEn: 'Unsatisfied' },
        { value: 'neutral', label: '보통', labelEn: 'Neutral' },
        { value: 'satisfied', label: '만족', labelEn: 'Satisfied' },
        { value: 'verySatisfied', label: '매우 만족', labelEn: 'Very Satisfied' },
      ],
    },
    {
      key: 'additionalNotes',
      label: '추가 메모',
      labelEn: 'Additional Notes',
      type: 'textarea',
      required: false,
      section: 'followup',
      order: 6,
    },
    {
      key: 'nextPlanRecommendation',
      label: '추후 시술 권장',
      labelEn: 'Next Plan Recommendation',
      type: 'textarea',
      required: false,
      section: 'followup',
      order: 7,
      placeholder: '유지 시술, 추가 개선 시술 등',
      placeholderEn: 'Maintenance procedures, additional improvements, etc.',
    },
  ],

  aiPrompt: `당신은 미용피부과/피부시술 전문가입니다. 다음 미용시술 기록을 분석하여 구조화된 JSON으로 추출해주세요.

추출할 필드:
- chiefConcern: 주 관심사
- concernAreas: 관심 부위 배열 (forehead/glabella/periorbital/cheek/nose/nasolabial/lip/chin/jawline/neck/fullFace/body)
- skinConcerns: 피부 고민 배열 (wrinkles/finelines/sagging/pigmentation/acneScars/pores/redness/dullness/dehydration/volumeLoss/contour/skinTexture)
- previousProcedures: 이전 시술 이력
- allergies: 알레르기/부작용 이력
- medications: 복용 약물
- expectations: 기대 사항
- fitzpatrickType: Fitzpatrick 타입 (I-VI)
- skinType: 피부 타입 (dry/oily/combination/sensitive/normal)
- glogauScale: Glogau 등급 (I-IV)
- skinCondition: 피부 상태
- facialAnalysis: 안면 분석
- procedureType: 시술 종류 배열 (botox/filler/skinBooster/threadLift/laser/ipl/rf/hifu/peel/mts/pdrn/prp/mesotherapy/other)
- procedureDetails: 시술 상세
- anesthesia: 마취 방법 (none/topical/nerve-block/local)
- productsUsed: 사용 제품
- treatmentAreas: 시술 부위 상세
- immediateResult: 시술 직후 결과
- complications: 합병증/부작용
- postCareInstructions: 시술 후 관리 지침
- followUpSchedule: 재진 일정
- outcomeAt1Week, outcomeAt1Month: 경과
- patientSatisfaction: 환자 만족도 (veryUnsatisfied/unsatisfied/neutral/satisfied/verySatisfied)
- additionalNotes: 추가 메모
- nextPlanRecommendation: 추후 시술 권장

해당 정보가 없으면 null로 설정하세요. 배열 필드는 해당하는 값들의 배열로 반환하세요. JSON만 반환하세요.`,
};
