import { DepartmentTemplate } from '../types';

export const dermatologyTemplate: DepartmentTemplate = {
  departmentKey: 'dermatology',
  departmentName: '피부과',
  departmentNameEn: 'Dermatology',
  version: '1.0.0',

  sections: [
    { key: 'history', title: '병력', titleEn: 'History', order: 1 },
    { key: 'examination', title: '피부 소견', titleEn: 'Skin Examination', order: 2 },
    { key: 'diagnosis', title: '진단', titleEn: 'Diagnosis', order: 3 },
    { key: 'treatment', title: '치료', titleEn: 'Treatment', order: 4 },
  ],

  fields: [
    // History
    {
      key: 'chiefComplaint',
      label: '주소',
      labelEn: 'Chief Complaint',
      type: 'text',
      required: true,
      section: 'history',
      order: 1,
      placeholder: '예: 얼굴 발진, 가려움증',
      placeholderEn: 'e.g., Facial rash, itching',
    },
    {
      key: 'duration',
      label: '유병 기간',
      labelEn: 'Duration',
      type: 'text',
      required: false,
      section: 'history',
      order: 2,
      placeholder: '예: 2주 전 발생',
      placeholderEn: 'e.g., Onset 2 weeks ago',
    },
    {
      key: 'progression',
      label: '경과',
      labelEn: 'Progression',
      type: 'select',
      required: false,
      section: 'history',
      order: 3,
      options: [
        { value: 'stable', label: '변화 없음', labelEn: 'Stable' },
        { value: 'improving', label: '호전 중', labelEn: 'Improving' },
        { value: 'worsening', label: '악화 중', labelEn: 'Worsening' },
        { value: 'fluctuating', label: '좋아졌다 나빠졌다 반복', labelEn: 'Fluctuating' },
      ],
    },
    {
      key: 'symptoms',
      label: '동반 증상',
      labelEn: 'Associated Symptoms',
      type: 'multiselect',
      required: false,
      section: 'history',
      order: 4,
      options: [
        { value: 'pruritus', label: '가려움 (소양증)', labelEn: 'Pruritus' },
        { value: 'pain', label: '통증', labelEn: 'Pain' },
        { value: 'burning', label: '작열감', labelEn: 'Burning' },
        { value: 'discharge', label: '삼출물/진물', labelEn: 'Discharge' },
        { value: 'bleeding', label: '출혈', labelEn: 'Bleeding' },
        { value: 'none', label: '없음', labelEn: 'None' },
      ],
    },
    {
      key: 'triggers',
      label: '유발/악화 요인',
      labelEn: 'Triggers',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 5,
      placeholder: '음식, 약물, 햇빛, 스트레스 등',
      placeholderEn: 'Food, medication, sunlight, stress, etc.',
    },
    {
      key: 'previousTreatment',
      label: '이전 치료',
      labelEn: 'Previous Treatment',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 6,
      placeholder: '이전에 시도한 치료 및 반응',
      placeholderEn: 'Previous treatments and responses',
    },
    {
      key: 'skinHistory',
      label: '피부 질환력',
      labelEn: 'Skin Disease History',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 7,
      placeholder: '아토피, 건선, 알레르기 등',
      placeholderEn: 'Atopy, psoriasis, allergy, etc.',
    },
    {
      key: 'familyHistory',
      label: '가족력',
      labelEn: 'Family History',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 8,
    },

    // Skin Examination
    {
      key: 'location',
      label: '병변 위치',
      labelEn: 'Location',
      type: 'textarea',
      required: true,
      section: 'examination',
      order: 1,
      placeholder: '예: 얼굴 양측, 목, 전완부',
      placeholderEn: 'e.g., Bilateral face, neck, forearms',
    },
    {
      key: 'distribution',
      label: '분포',
      labelEn: 'Distribution',
      type: 'select',
      required: false,
      section: 'examination',
      order: 2,
      options: [
        { value: 'localized', label: '국소성', labelEn: 'Localized' },
        { value: 'generalized', label: '전신성', labelEn: 'Generalized' },
        { value: 'symmetric', label: '대칭성', labelEn: 'Symmetric' },
        { value: 'asymmetric', label: '비대칭성', labelEn: 'Asymmetric' },
        { value: 'dermatomal', label: '피부분절성', labelEn: 'Dermatomal' },
        { value: 'acral', label: '말단부', labelEn: 'Acral' },
        { value: 'truncal', label: '체간부', labelEn: 'Truncal' },
        { value: 'flexural', label: '굴측부', labelEn: 'Flexural' },
        { value: 'extensor', label: '신측부', labelEn: 'Extensor' },
        { value: 'photodistributed', label: '광노출부', labelEn: 'Photodistributed' },
      ],
    },
    {
      key: 'primaryLesion',
      label: '일차 병변',
      labelEn: 'Primary Lesion',
      type: 'multiselect',
      required: true,
      section: 'examination',
      order: 3,
      options: [
        { value: 'macule', label: '반점 (Macule)', labelEn: 'Macule' },
        { value: 'patch', label: '반 (Patch)', labelEn: 'Patch' },
        { value: 'papule', label: '구진 (Papule)', labelEn: 'Papule' },
        { value: 'plaque', label: '판 (Plaque)', labelEn: 'Plaque' },
        { value: 'nodule', label: '결절 (Nodule)', labelEn: 'Nodule' },
        { value: 'tumor', label: '종양 (Tumor)', labelEn: 'Tumor' },
        { value: 'vesicle', label: '수포 (Vesicle)', labelEn: 'Vesicle' },
        { value: 'bulla', label: '대수포 (Bulla)', labelEn: 'Bulla' },
        { value: 'pustule', label: '농포 (Pustule)', labelEn: 'Pustule' },
        { value: 'wheal', label: '팽진 (Wheal)', labelEn: 'Wheal' },
        { value: 'cyst', label: '낭종 (Cyst)', labelEn: 'Cyst' },
      ],
    },
    {
      key: 'secondaryLesion',
      label: '이차 병변',
      labelEn: 'Secondary Lesion',
      type: 'multiselect',
      required: false,
      section: 'examination',
      order: 4,
      options: [
        { value: 'scale', label: '인설 (Scale)', labelEn: 'Scale' },
        { value: 'crust', label: '가피 (Crust)', labelEn: 'Crust' },
        { value: 'erosion', label: '미란 (Erosion)', labelEn: 'Erosion' },
        { value: 'ulcer', label: '궤양 (Ulcer)', labelEn: 'Ulcer' },
        { value: 'excoriation', label: '찰상 (Excoriation)', labelEn: 'Excoriation' },
        { value: 'fissure', label: '균열 (Fissure)', labelEn: 'Fissure' },
        { value: 'lichenification', label: '태선화 (Lichenification)', labelEn: 'Lichenification' },
        { value: 'atrophy', label: '위축 (Atrophy)', labelEn: 'Atrophy' },
        { value: 'scar', label: '반흔 (Scar)', labelEn: 'Scar' },
      ],
    },
    {
      key: 'color',
      label: '색상',
      labelEn: 'Color',
      type: 'multiselect',
      required: false,
      section: 'examination',
      order: 5,
      options: [
        { value: 'erythematous', label: '홍반성', labelEn: 'Erythematous' },
        { value: 'hyperpigmented', label: '과색소침착', labelEn: 'Hyperpigmented' },
        { value: 'hypopigmented', label: '저색소침착', labelEn: 'Hypopigmented' },
        { value: 'violaceous', label: '자주색', labelEn: 'Violaceous' },
        { value: 'yellow', label: '황색', labelEn: 'Yellow' },
        { value: 'brown', label: '갈색', labelEn: 'Brown' },
        { value: 'black', label: '흑색', labelEn: 'Black' },
        { value: 'white', label: '백색', labelEn: 'White' },
      ],
    },
    {
      key: 'size',
      label: '크기',
      labelEn: 'Size',
      type: 'text',
      required: false,
      section: 'examination',
      order: 6,
      placeholder: '예: 0.5-2cm',
      placeholderEn: 'e.g., 0.5-2cm',
    },
    {
      key: 'shape',
      label: '모양',
      labelEn: 'Shape',
      type: 'multiselect',
      required: false,
      section: 'examination',
      order: 7,
      options: [
        { value: 'round', label: '원형', labelEn: 'Round' },
        { value: 'oval', label: '타원형', labelEn: 'Oval' },
        { value: 'annular', label: '환상', labelEn: 'Annular' },
        { value: 'linear', label: '선상', labelEn: 'Linear' },
        { value: 'serpiginous', label: '사행성', labelEn: 'Serpiginous' },
        { value: 'irregular', label: '불규칙', labelEn: 'Irregular' },
        { value: 'targetoid', label: '과녁 모양', labelEn: 'Targetoid' },
      ],
    },
    {
      key: 'border',
      label: '경계',
      labelEn: 'Border',
      type: 'select',
      required: false,
      section: 'examination',
      order: 8,
      options: [
        { value: 'well-defined', label: '명확', labelEn: 'Well-defined' },
        { value: 'ill-defined', label: '불명확', labelEn: 'Ill-defined' },
        { value: 'raised', label: '융기', labelEn: 'Raised' },
        { value: 'irregular', label: '불규칙', labelEn: 'Irregular' },
      ],
    },
    {
      key: 'surface',
      label: '표면',
      labelEn: 'Surface',
      type: 'text',
      required: false,
      section: 'examination',
      order: 9,
      placeholder: '예: 매끄러움, 거침, 사마귀 모양',
      placeholderEn: 'e.g., Smooth, rough, verrucous',
    },
    {
      key: 'nailFindings',
      label: '손발톱 소견',
      labelEn: 'Nail Findings',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 10,
    },
    {
      key: 'hairFindings',
      label: '모발 소견',
      labelEn: 'Hair Findings',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 11,
    },
    {
      key: 'mucosalFindings',
      label: '점막 소견',
      labelEn: 'Mucosal Findings',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 12,
    },

    // Diagnosis
    {
      key: 'clinicalDiagnosis',
      label: '임상 진단',
      labelEn: 'Clinical Diagnosis',
      type: 'textarea',
      required: true,
      section: 'diagnosis',
      order: 1,
    },
    {
      key: 'differentialDiagnosis',
      label: '감별 진단',
      labelEn: 'Differential Diagnosis',
      type: 'textarea',
      required: false,
      section: 'diagnosis',
      order: 2,
    },
    {
      key: 'biopsyResult',
      label: '조직검사 결과',
      labelEn: 'Biopsy Result',
      type: 'textarea',
      required: false,
      section: 'diagnosis',
      order: 3,
    },
    {
      key: 'labTests',
      label: '검사 결과',
      labelEn: 'Lab Tests',
      type: 'textarea',
      required: false,
      section: 'diagnosis',
      order: 4,
      placeholder: 'KOH, 우드등, 알레르기 검사 등',
      placeholderEn: 'KOH, Wood lamp, allergy tests, etc.',
    },

    // Treatment
    {
      key: 'topicalTreatment',
      label: '외용제',
      labelEn: 'Topical Treatment',
      type: 'textarea',
      required: false,
      section: 'treatment',
      order: 1,
      placeholder: '연고, 크림, 로션 등',
      placeholderEn: 'Ointment, cream, lotion, etc.',
    },
    {
      key: 'systemicTreatment',
      label: '전신 치료',
      labelEn: 'Systemic Treatment',
      type: 'textarea',
      required: false,
      section: 'treatment',
      order: 2,
      placeholder: '경구약, 주사제 등',
      placeholderEn: 'Oral medication, injections, etc.',
    },
    {
      key: 'proceduralTreatment',
      label: '시술',
      labelEn: 'Procedural Treatment',
      type: 'textarea',
      required: false,
      section: 'treatment',
      order: 3,
      placeholder: '레이저, 냉동치료, 광선치료 등',
      placeholderEn: 'Laser, cryotherapy, phototherapy, etc.',
    },
    {
      key: 'patientEducation',
      label: '환자 교육',
      labelEn: 'Patient Education',
      type: 'textarea',
      required: false,
      section: 'treatment',
      order: 4,
      placeholder: '피부 관리, 악화 요인 회피 등',
      placeholderEn: 'Skin care, avoidance of triggers, etc.',
    },
    {
      key: 'followUp',
      label: '추적 계획',
      labelEn: 'Follow-up',
      type: 'text',
      required: false,
      section: 'treatment',
      order: 5,
      placeholder: '예: 2주 후 재진',
      placeholderEn: 'e.g., Follow-up in 2 weeks',
    },
  ],

  aiPrompt: `당신은 피부과 전문의입니다. 다음 피부과 의무기록을 분석하여 구조화된 JSON으로 추출해주세요.

추출할 필드:
- chiefComplaint: 주소
- duration: 유병 기간
- progression: 경과 (stable/improving/worsening/fluctuating)
- symptoms: 동반 증상 배열 (pruritus/pain/burning/discharge/bleeding/none)
- triggers: 유발/악화 요인
- previousTreatment: 이전 치료
- skinHistory: 피부 질환력
- familyHistory: 가족력
- location: 병변 위치
- distribution: 분포
- primaryLesion: 일차 병변 배열
- secondaryLesion: 이차 병변 배열
- color: 색상 배열
- size: 크기
- shape: 모양 배열
- border: 경계
- surface: 표면
- nailFindings, hairFindings, mucosalFindings: 부속기 소견
- clinicalDiagnosis: 임상 진단
- differentialDiagnosis: 감별 진단
- biopsyResult: 조직검사 결과
- labTests: 검사 결과
- topicalTreatment: 외용제
- systemicTreatment: 전신 치료
- proceduralTreatment: 시술
- patientEducation: 환자 교육
- followUp: 추적 계획

해당 정보가 없으면 null로 설정하세요. 배열 필드는 해당하는 값들의 배열로 반환하세요. JSON만 반환하세요.`,
};
