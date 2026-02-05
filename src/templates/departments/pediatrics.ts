import { DepartmentTemplate } from '../types';

export const pediatricsTemplate: DepartmentTemplate = {
  departmentKey: 'pediatrics',
  departmentName: '소아청소년과',
  departmentNameEn: 'Pediatrics',
  version: '1.0.0',

  sections: [
    { key: 'patient-info', title: '환아 정보', titleEn: 'Patient Information', order: 1 },
    { key: 'history', title: '병력', titleEn: 'History', order: 2 },
    { key: 'growth', title: '성장 발달', titleEn: 'Growth & Development', order: 3 },
    { key: 'examination', title: '진찰', titleEn: 'Examination', order: 4 },
    { key: 'diagnosis', title: '진단 및 치료', titleEn: 'Diagnosis & Treatment', order: 5 },
  ],

  fields: [
    // Patient Information
    {
      key: 'ageDetail',
      label: '연령 상세',
      labelEn: 'Age Detail',
      type: 'text',
      required: true,
      section: 'patient-info',
      order: 1,
      placeholder: '예: 3세 4개월, 생후 45일',
      placeholderEn: 'e.g., 3 years 4 months, 45 days old',
    },
    {
      key: 'correctedAge',
      label: '교정 연령',
      labelEn: 'Corrected Age',
      type: 'text',
      required: false,
      section: 'patient-info',
      order: 2,
      placeholder: '미숙아의 경우',
      placeholderEn: 'For premature infants',
    },
    {
      key: 'chiefComplaint',
      label: '주소',
      labelEn: 'Chief Complaint',
      type: 'text',
      required: true,
      section: 'patient-info',
      order: 3,
      placeholder: '예: 발열, 기침 3일',
      placeholderEn: 'e.g., Fever, cough for 3 days',
    },
    {
      key: 'informant',
      label: '병력 제공자',
      labelEn: 'Informant',
      type: 'text',
      required: false,
      section: 'patient-info',
      order: 4,
      placeholder: '예: 어머니',
      placeholderEn: 'e.g., Mother',
    },

    // History
    {
      key: 'birthHistory',
      label: '출생력',
      labelEn: 'Birth History',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 1,
      placeholder: '재태주수, 출생체중, 분만방법, 신생아 문제',
      placeholderEn: 'GA, birth weight, delivery method, neonatal issues',
    },
    {
      key: 'gestationalAge',
      label: '재태주수',
      labelEn: 'Gestational Age at Birth',
      type: 'text',
      required: false,
      section: 'history',
      order: 2,
      placeholder: '예: 38+2 weeks',
      placeholderEn: 'e.g., 38+2 weeks',
    },
    {
      key: 'birthWeight',
      label: '출생 체중',
      labelEn: 'Birth Weight',
      type: 'text',
      required: false,
      section: 'history',
      order: 3,
      placeholder: 'g',
      placeholderEn: 'g',
    },
    {
      key: 'neonatalProblems',
      label: '신생아기 문제',
      labelEn: 'Neonatal Problems',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 4,
      placeholder: '황달, 호흡곤란, NICU 입원 등',
      placeholderEn: 'Jaundice, respiratory distress, NICU stay, etc.',
    },
    {
      key: 'feedingHistory',
      label: '수유력',
      labelEn: 'Feeding History',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 5,
      placeholder: '모유/분유, 이유식, 현재 식이',
      placeholderEn: 'Breast/formula, weaning, current diet',
    },
    {
      key: 'presentIllness',
      label: '현병력',
      labelEn: 'Present Illness',
      type: 'textarea',
      required: true,
      section: 'history',
      order: 6,
    },
    {
      key: 'pastMedicalHistory',
      label: '과거력',
      labelEn: 'Past Medical History',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 7,
      placeholder: '입원력, 수술력, 만성질환',
      placeholderEn: 'Hospitalizations, surgeries, chronic diseases',
    },
    {
      key: 'allergies',
      label: '알레르기',
      labelEn: 'Allergies',
      type: 'text',
      required: false,
      section: 'history',
      order: 8,
    },
    {
      key: 'medications',
      label: '현재 복용약',
      labelEn: 'Current Medications',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 9,
    },
    {
      key: 'familyHistory',
      label: '가족력',
      labelEn: 'Family History',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 10,
    },
    {
      key: 'socialHistory',
      label: '사회력',
      labelEn: 'Social History',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 11,
      placeholder: '어린이집/학교, 형제, 보육 환경',
      placeholderEn: 'Daycare/school, siblings, care environment',
    },

    // Growth & Development
    {
      key: 'currentWeight',
      label: '현재 체중',
      labelEn: 'Current Weight',
      type: 'text',
      required: false,
      section: 'growth',
      order: 1,
      placeholder: 'kg (백분위수 포함)',
      placeholderEn: 'kg (include percentile)',
    },
    {
      key: 'currentHeight',
      label: '현재 신장',
      labelEn: 'Current Height',
      type: 'text',
      required: false,
      section: 'growth',
      order: 2,
      placeholder: 'cm (백분위수 포함)',
      placeholderEn: 'cm (include percentile)',
    },
    {
      key: 'headCircumference',
      label: '두위',
      labelEn: 'Head Circumference',
      type: 'text',
      required: false,
      section: 'growth',
      order: 3,
      placeholder: 'cm (백분위수 포함)',
      placeholderEn: 'cm (include percentile)',
    },
    {
      key: 'bmi',
      label: 'BMI',
      labelEn: 'BMI',
      type: 'text',
      required: false,
      section: 'growth',
      order: 4,
    },
    {
      key: 'growthConcerns',
      label: '성장 평가',
      labelEn: 'Growth Assessment',
      type: 'textarea',
      required: false,
      section: 'growth',
      order: 5,
      placeholder: '성장곡선 추이, 이상 소견',
      placeholderEn: 'Growth curve trends, abnormalities',
    },
    {
      key: 'developmentalMilestones',
      label: '발달 이정표',
      labelEn: 'Developmental Milestones',
      type: 'textarea',
      required: false,
      section: 'growth',
      order: 6,
      placeholder: '대운동, 소운동, 언어, 사회성',
      placeholderEn: 'Gross motor, fine motor, language, social',
    },
    {
      key: 'developmentalConcerns',
      label: '발달 우려',
      labelEn: 'Developmental Concerns',
      type: 'textarea',
      required: false,
      section: 'growth',
      order: 7,
    },
    {
      key: 'vaccination',
      label: '예방접종',
      labelEn: 'Vaccination',
      type: 'textarea',
      required: false,
      section: 'growth',
      order: 8,
      placeholder: '접종 현황, 미접종 항목',
      placeholderEn: 'Vaccination status, pending vaccines',
    },

    // Examination
    {
      key: 'vitalSigns',
      label: '활력징후',
      labelEn: 'Vital Signs',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 1,
      placeholder: 'BP, HR, RR, BT, SpO2',
      placeholderEn: 'BP, HR, RR, BT, SpO2',
    },
    {
      key: 'generalAppearance',
      label: '전신 상태',
      labelEn: 'General Appearance',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 2,
      placeholder: '활동성, 영양상태, 수분상태',
      placeholderEn: 'Activity, nutrition, hydration status',
    },
    {
      key: 'skin',
      label: '피부',
      labelEn: 'Skin',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 3,
    },
    {
      key: 'heent',
      label: 'HEENT',
      labelEn: 'Head, Eyes, Ears, Nose, Throat',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 4,
      placeholder: '대천문, 고막, 인두, 편도',
      placeholderEn: 'Fontanelle, tympanic membrane, pharynx, tonsils',
    },
    {
      key: 'neck',
      label: '경부',
      labelEn: 'Neck',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 5,
      placeholder: '림프절, 경직',
      placeholderEn: 'Lymph nodes, stiffness',
    },
    {
      key: 'chest',
      label: '흉부',
      labelEn: 'Chest/Lungs',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 6,
    },
    {
      key: 'heart',
      label: '심장',
      labelEn: 'Heart',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 7,
      placeholder: '심음, 잡음',
      placeholderEn: 'Heart sounds, murmur',
    },
    {
      key: 'abdomen',
      label: '복부',
      labelEn: 'Abdomen',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 8,
    },
    {
      key: 'genitalia',
      label: '외음부',
      labelEn: 'Genitalia',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 9,
    },
    {
      key: 'musculoskeletal',
      label: '근골격계',
      labelEn: 'Musculoskeletal',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 10,
    },
    {
      key: 'neurological',
      label: '신경학적 검사',
      labelEn: 'Neurological',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 11,
    },
    {
      key: 'labResults',
      label: '검사 결과',
      labelEn: 'Lab Results',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 12,
    },
    {
      key: 'imagingResults',
      label: '영상 검사',
      labelEn: 'Imaging',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 13,
    },

    // Diagnosis & Treatment
    {
      key: 'diagnosis',
      label: '진단',
      labelEn: 'Diagnosis',
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
      key: 'treatment',
      label: '치료',
      labelEn: 'Treatment',
      type: 'textarea',
      required: false,
      section: 'diagnosis',
      order: 3,
    },
    {
      key: 'medications',
      label: '처방',
      labelEn: 'Medications',
      type: 'textarea',
      required: false,
      section: 'diagnosis',
      order: 4,
      placeholder: '용량은 체중 기준으로',
      placeholderEn: 'Dose based on body weight',
    },
    {
      key: 'parentEducation',
      label: '보호자 교육',
      labelEn: 'Parent Education',
      type: 'textarea',
      required: false,
      section: 'diagnosis',
      order: 5,
    },
    {
      key: 'plan',
      label: '향후 계획',
      labelEn: 'Plan',
      type: 'textarea',
      required: false,
      section: 'diagnosis',
      order: 6,
    },
    {
      key: 'disposition',
      label: '처치',
      labelEn: 'Disposition',
      type: 'select',
      required: false,
      section: 'diagnosis',
      order: 7,
      options: [
        { value: 'discharge', label: '귀가', labelEn: 'Discharge' },
        { value: 'admission', label: '입원', labelEn: 'Admission' },
        { value: 'picu', label: 'PICU', labelEn: 'PICU' },
        { value: 'nicu', label: 'NICU', labelEn: 'NICU' },
        { value: 'transfer', label: '전원', labelEn: 'Transfer' },
      ],
    },
    {
      key: 'followUp',
      label: '추적 일정',
      labelEn: 'Follow-up',
      type: 'text',
      required: false,
      section: 'diagnosis',
      order: 8,
    },
  ],

  aiPrompt: `당신은 소아청소년과 전문의입니다. 다음 소아과 의무기록을 분석하여 구조화된 JSON으로 추출해주세요.

추출할 필드:
- ageDetail: 연령 상세
- correctedAge: 교정 연령
- chiefComplaint: 주소
- informant: 병력 제공자
- birthHistory: 출생력
- gestationalAge: 재태주수
- birthWeight: 출생 체중
- neonatalProblems: 신생아기 문제
- feedingHistory: 수유력
- presentIllness: 현병력
- pastMedicalHistory: 과거력
- allergies: 알레르기
- medications: 현재 복용약
- familyHistory: 가족력
- socialHistory: 사회력
- currentWeight: 현재 체중
- currentHeight: 현재 신장
- headCircumference: 두위
- bmi: BMI
- growthConcerns: 성장 평가
- developmentalMilestones: 발달 이정표
- developmentalConcerns: 발달 우려
- vaccination: 예방접종
- vitalSigns: 활력징후
- generalAppearance: 전신 상태
- skin, heent, neck, chest, heart, abdomen, genitalia, musculoskeletal, neurological: 신체 검사
- labResults: 검사 결과
- imagingResults: 영상 검사
- diagnosis: 진단
- differentialDiagnosis: 감별 진단
- treatment: 치료
- medications: 처방
- parentEducation: 보호자 교육
- plan: 향후 계획
- disposition: 처치 (discharge/admission/picu/nicu/transfer)
- followUp: 추적 일정

해당 정보가 없으면 null로 설정하세요. JSON만 반환하세요.`,
};
