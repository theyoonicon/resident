import { DepartmentTemplate } from '../types';

export const radiologyTemplate: DepartmentTemplate = {
  departmentKey: 'radiology',
  departmentName: '영상의학과',
  departmentNameEn: 'Radiology',
  version: '1.0.0',

  sections: [
    { key: 'study-info', title: '검사 정보', titleEn: 'Study Information', order: 1 },
    { key: 'clinical', title: '임상 정보', titleEn: 'Clinical Information', order: 2 },
    { key: 'findings', title: '판독 소견', titleEn: 'Findings', order: 3 },
    { key: 'impression', title: '결론', titleEn: 'Impression', order: 4 },
  ],

  fields: [
    // Study Information
    {
      key: 'studyDate',
      label: '검사일',
      labelEn: 'Study Date',
      type: 'date',
      required: true,
      section: 'study-info',
      order: 1,
    },
    {
      key: 'modality',
      label: '검사 종류',
      labelEn: 'Modality',
      type: 'select',
      required: true,
      section: 'study-info',
      order: 2,
      options: [
        { value: 'xray', label: 'X-ray (단순촬영)', labelEn: 'X-ray' },
        { value: 'ct', label: 'CT', labelEn: 'CT' },
        { value: 'mri', label: 'MRI', labelEn: 'MRI' },
        { value: 'us', label: 'Ultrasound (초음파)', labelEn: 'Ultrasound' },
        { value: 'fluoro', label: 'Fluoroscopy (투시)', labelEn: 'Fluoroscopy' },
        { value: 'mammo', label: 'Mammography (유방촬영)', labelEn: 'Mammography' },
        { value: 'angio', label: 'Angiography (혈관조영)', labelEn: 'Angiography' },
        { value: 'pet', label: 'PET/CT', labelEn: 'PET/CT' },
        { value: 'nuclear', label: 'Nuclear Medicine (핵의학)', labelEn: 'Nuclear Medicine' },
        { value: 'ir', label: 'Interventional Radiology (중재시술)', labelEn: 'Interventional Radiology' },
      ],
    },
    {
      key: 'examName',
      label: '검사명',
      labelEn: 'Examination Name',
      type: 'text',
      required: true,
      section: 'study-info',
      order: 3,
      placeholder: '예: Chest CT with contrast',
      placeholderEn: 'e.g., Chest CT with contrast',
    },
    {
      key: 'bodyPart',
      label: '검사 부위',
      labelEn: 'Body Part',
      type: 'text',
      required: false,
      section: 'study-info',
      order: 4,
      placeholder: '예: Chest, Abdomen, Brain',
      placeholderEn: 'e.g., Chest, Abdomen, Brain',
    },
    {
      key: 'technique',
      label: '촬영 기법',
      labelEn: 'Technique',
      type: 'textarea',
      required: false,
      section: 'study-info',
      order: 5,
      placeholder: '조영제 사용, 촬영 프로토콜 등',
      placeholderEn: 'Contrast use, imaging protocol, etc.',
    },
    {
      key: 'contrastUsed',
      label: '조영제 사용',
      labelEn: 'Contrast Used',
      type: 'select',
      required: false,
      section: 'study-info',
      order: 6,
      options: [
        { value: 'none', label: '미사용', labelEn: 'None' },
        { value: 'iv', label: 'IV 조영제', labelEn: 'IV Contrast' },
        { value: 'oral', label: '경구 조영제', labelEn: 'Oral Contrast' },
        { value: 'both', label: 'IV + 경구', labelEn: 'IV + Oral' },
        { value: 'other', label: '기타', labelEn: 'Other' },
      ],
    },
    {
      key: 'priorStudy',
      label: '이전 검사',
      labelEn: 'Prior Study for Comparison',
      type: 'text',
      required: false,
      section: 'study-info',
      order: 7,
      placeholder: '비교한 이전 검사 날짜/종류',
      placeholderEn: 'Prior study date/type for comparison',
    },

    // Clinical Information
    {
      key: 'clinicalHistory',
      label: '임상 정보',
      labelEn: 'Clinical History',
      type: 'textarea',
      required: false,
      section: 'clinical',
      order: 1,
      placeholder: '의뢰 시 제공된 임상 정보',
      placeholderEn: 'Clinical information provided at referral',
    },
    {
      key: 'indication',
      label: '검사 목적',
      labelEn: 'Indication',
      type: 'textarea',
      required: false,
      section: 'clinical',
      order: 2,
      placeholder: '예: R/O lung cancer, F/U after treatment',
      placeholderEn: 'e.g., R/O lung cancer, F/U after treatment',
    },
    {
      key: 'referringPhysician',
      label: '의뢰의',
      labelEn: 'Referring Physician',
      type: 'text',
      required: false,
      section: 'clinical',
      order: 3,
    },

    // Findings
    {
      key: 'findings',
      label: '소견',
      labelEn: 'Findings',
      type: 'textarea',
      required: true,
      section: 'findings',
      order: 1,
      placeholder: '영상 소견을 상세히 기술',
      placeholderEn: 'Describe imaging findings in detail',
    },
    {
      key: 'measurements',
      label: '계측치',
      labelEn: 'Measurements',
      type: 'textarea',
      required: false,
      section: 'findings',
      order: 2,
      placeholder: '병변 크기, 길이 등',
      placeholderEn: 'Lesion size, length, etc.',
    },
    {
      key: 'comparison',
      label: '비교 소견',
      labelEn: 'Comparison',
      type: 'textarea',
      required: false,
      section: 'findings',
      order: 3,
      placeholder: '이전 검사와 비교 시 변화',
      placeholderEn: 'Changes compared to prior study',
    },

    // Impression
    {
      key: 'impression',
      label: '결론 (Impression)',
      labelEn: 'Impression',
      type: 'textarea',
      required: true,
      section: 'impression',
      order: 1,
      placeholder: '판독 결론을 간결하게 기술',
      placeholderEn: 'Concise interpretation summary',
    },
    {
      key: 'differentialDiagnosis',
      label: '감별진단',
      labelEn: 'Differential Diagnosis',
      type: 'textarea',
      required: false,
      section: 'impression',
      order: 2,
    },
    {
      key: 'recommendation',
      label: '권고 사항',
      labelEn: 'Recommendation',
      type: 'textarea',
      required: false,
      section: 'impression',
      order: 3,
      placeholder: '추가 검사, 추적 검사 권고 등',
      placeholderEn: 'Additional studies, follow-up recommendations, etc.',
    },
    {
      key: 'acr',
      label: 'ACR 카테고리',
      labelEn: 'ACR Category',
      type: 'select',
      required: false,
      section: 'impression',
      order: 4,
      options: [
        { value: 'birads0', label: 'BI-RADS 0 - 추가검사 필요', labelEn: 'BI-RADS 0 - Incomplete' },
        { value: 'birads1', label: 'BI-RADS 1 - 음성', labelEn: 'BI-RADS 1 - Negative' },
        { value: 'birads2', label: 'BI-RADS 2 - 양성 소견', labelEn: 'BI-RADS 2 - Benign' },
        { value: 'birads3', label: 'BI-RADS 3 - 양성 가능성 높음', labelEn: 'BI-RADS 3 - Probably Benign' },
        { value: 'birads4', label: 'BI-RADS 4 - 악성 의심', labelEn: 'BI-RADS 4 - Suspicious' },
        { value: 'birads5', label: 'BI-RADS 5 - 악성 강력 의심', labelEn: 'BI-RADS 5 - Highly Suspicious' },
        { value: 'birads6', label: 'BI-RADS 6 - 확진된 악성', labelEn: 'BI-RADS 6 - Known Malignancy' },
        { value: 'tirads1', label: 'TI-RADS 1 - 양성', labelEn: 'TI-RADS 1 - Benign' },
        { value: 'tirads2', label: 'TI-RADS 2 - 비의심', labelEn: 'TI-RADS 2 - Not Suspicious' },
        { value: 'tirads3', label: 'TI-RADS 3 - 경미 의심', labelEn: 'TI-RADS 3 - Mildly Suspicious' },
        { value: 'tirads4', label: 'TI-RADS 4 - 중등 의심', labelEn: 'TI-RADS 4 - Moderately Suspicious' },
        { value: 'tirads5', label: 'TI-RADS 5 - 고도 의심', labelEn: 'TI-RADS 5 - Highly Suspicious' },
        { value: 'lirads1', label: 'LI-RADS 1 - 확정 양성', labelEn: 'LI-RADS 1 - Definitely Benign' },
        { value: 'lirads2', label: 'LI-RADS 2 - 양성 가능성', labelEn: 'LI-RADS 2 - Probably Benign' },
        { value: 'lirads3', label: 'LI-RADS 3 - 중간', labelEn: 'LI-RADS 3 - Intermediate' },
        { value: 'lirads4', label: 'LI-RADS 4 - HCC 가능성', labelEn: 'LI-RADS 4 - Probably HCC' },
        { value: 'lirads5', label: 'LI-RADS 5 - 확정 HCC', labelEn: 'LI-RADS 5 - Definitely HCC' },
        { value: 'lungRads1', label: 'Lung-RADS 1 - 음성', labelEn: 'Lung-RADS 1 - Negative' },
        { value: 'lungRads2', label: 'Lung-RADS 2 - 양성', labelEn: 'Lung-RADS 2 - Benign' },
        { value: 'lungRads3', label: 'Lung-RADS 3 - 양성 가능성', labelEn: 'Lung-RADS 3 - Probably Benign' },
        { value: 'lungRads4a', label: 'Lung-RADS 4A - 의심', labelEn: 'Lung-RADS 4A - Suspicious' },
        { value: 'lungRads4b', label: 'Lung-RADS 4B - 악성 의심', labelEn: 'Lung-RADS 4B - Very Suspicious' },
      ],
    },
  ],

  aiPrompt: `당신은 영상의학과 전문의입니다. 다음 영상 판독문을 분석하여 구조화된 JSON으로 추출해주세요.

추출할 필드:
- studyDate: 검사일 (YYYY-MM-DD)
- modality: 검사 종류 (xray/ct/mri/us/fluoro/mammo/angio/pet/nuclear/ir)
- examName: 검사명
- bodyPart: 검사 부위
- technique: 촬영 기법
- contrastUsed: 조영제 사용 (none/iv/oral/both/other)
- priorStudy: 비교한 이전 검사
- clinicalHistory: 임상 정보
- indication: 검사 목적
- referringPhysician: 의뢰의
- findings: 소견 (상세)
- measurements: 계측치
- comparison: 비교 소견
- impression: 결론
- differentialDiagnosis: 감별진단
- recommendation: 권고 사항
- acr: ACR 카테고리 (해당 시)

해당 정보가 없으면 null로 설정하세요. JSON만 반환하세요.`,
};
