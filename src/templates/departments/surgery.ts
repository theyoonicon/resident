import { DepartmentTemplate } from '../types';

export const surgeryTemplate: DepartmentTemplate = {
  departmentKey: 'surgery',
  departmentName: '외과',
  departmentNameEn: 'Surgery',
  version: '1.0.0',

  sections: [
    { key: 'preop', title: '수술 전', titleEn: 'Pre-operative', order: 1 },
    { key: 'operation', title: '수술', titleEn: 'Operation', order: 2 },
    { key: 'postop', title: '수술 후', titleEn: 'Post-operative', order: 3 },
  ],

  fields: [
    // Pre-operative
    {
      key: 'preOpDiagnosis',
      label: '수술 전 진단',
      labelEn: 'Pre-operative Diagnosis',
      type: 'textarea',
      required: true,
      section: 'preop',
      order: 1,
      placeholder: '예: Acute appendicitis',
      placeholderEn: 'e.g., Acute appendicitis',
    },
    {
      key: 'indication',
      label: '수술 적응증',
      labelEn: 'Indication for Surgery',
      type: 'textarea',
      required: true,
      section: 'preop',
      order: 2,
    },
    {
      key: 'comorbidities',
      label: '동반질환',
      labelEn: 'Comorbidities',
      type: 'textarea',
      required: false,
      section: 'preop',
      order: 3,
      placeholder: 'HTN, DM, 심장질환 등',
      placeholderEn: 'HTN, DM, heart disease, etc.',
    },
    {
      key: 'asaClass',
      label: 'ASA 분류',
      labelEn: 'ASA Classification',
      type: 'select',
      required: false,
      section: 'preop',
      order: 4,
      options: [
        { value: '1', label: 'ASA I - 건강한 환자', labelEn: 'ASA I - Healthy patient' },
        { value: '2', label: 'ASA II - 경미한 전신질환', labelEn: 'ASA II - Mild systemic disease' },
        { value: '3', label: 'ASA III - 중증 전신질환', labelEn: 'ASA III - Severe systemic disease' },
        { value: '4', label: 'ASA IV - 생명을 위협하는 전신질환', labelEn: 'ASA IV - Life-threatening disease' },
        { value: '5', label: 'ASA V - 수술 없이는 생존 불가', labelEn: 'ASA V - Moribund patient' },
        { value: '6', label: 'ASA VI - 뇌사 장기기증자', labelEn: 'ASA VI - Brain-dead organ donor' },
      ],
    },
    {
      key: 'preOpLabs',
      label: '수술 전 검사',
      labelEn: 'Pre-operative Labs',
      type: 'textarea',
      required: false,
      section: 'preop',
      order: 5,
      placeholder: 'CBC, Chemistry, Coagulation, CXR, EKG 등',
      placeholderEn: 'CBC, Chemistry, Coagulation, CXR, EKG, etc.',
    },
    {
      key: 'consent',
      label: '동의서',
      labelEn: 'Consent',
      type: 'checkbox',
      required: false,
      section: 'preop',
      order: 6,
    },

    // Operation
    {
      key: 'operationDate',
      label: '수술일',
      labelEn: 'Operation Date',
      type: 'date',
      required: true,
      section: 'operation',
      order: 1,
    },
    {
      key: 'procedureName',
      label: '수술명',
      labelEn: 'Procedure Name',
      type: 'text',
      required: true,
      section: 'operation',
      order: 2,
      placeholder: '예: Laparoscopic appendectomy',
      placeholderEn: 'e.g., Laparoscopic appendectomy',
    },
    {
      key: 'surgeon',
      label: '집도의',
      labelEn: 'Surgeon',
      type: 'text',
      required: false,
      section: 'operation',
      order: 3,
    },
    {
      key: 'anesthesiaType',
      label: '마취 방법',
      labelEn: 'Anesthesia Type',
      type: 'select',
      required: false,
      section: 'operation',
      order: 4,
      options: [
        { value: 'general', label: '전신마취', labelEn: 'General Anesthesia' },
        { value: 'spinal', label: '척추마취', labelEn: 'Spinal Anesthesia' },
        { value: 'epidural', label: '경막외마취', labelEn: 'Epidural Anesthesia' },
        { value: 'regional', label: '부위마취', labelEn: 'Regional Anesthesia' },
        { value: 'local', label: '국소마취', labelEn: 'Local Anesthesia' },
        { value: 'sedation', label: '진정', labelEn: 'Sedation' },
      ],
    },
    {
      key: 'operativeFindings',
      label: '수술 소견',
      labelEn: 'Operative Findings',
      type: 'textarea',
      required: true,
      section: 'operation',
      order: 5,
      placeholder: '수술 중 확인된 소견 상세 기술',
      placeholderEn: 'Detailed description of intraoperative findings',
    },
    {
      key: 'procedureDetail',
      label: '수술 과정',
      labelEn: 'Procedure Details',
      type: 'textarea',
      required: false,
      section: 'operation',
      order: 6,
      placeholder: '수술 단계별 진행 과정',
      placeholderEn: 'Step-by-step procedure description',
    },
    {
      key: 'estimatedBloodLoss',
      label: '출혈량 (EBL)',
      labelEn: 'Estimated Blood Loss',
      type: 'text',
      required: false,
      section: 'operation',
      order: 7,
      placeholder: '예: 50 mL',
      placeholderEn: 'e.g., 50 mL',
    },
    {
      key: 'operationTime',
      label: '수술 시간',
      labelEn: 'Operation Time',
      type: 'text',
      required: false,
      section: 'operation',
      order: 8,
      placeholder: '예: 1시간 30분',
      placeholderEn: 'e.g., 1 hour 30 minutes',
    },
    {
      key: 'specimenSent',
      label: '검체 송부',
      labelEn: 'Specimen Sent',
      type: 'text',
      required: false,
      section: 'operation',
      order: 9,
      placeholder: '조직검사 송부 여부',
      placeholderEn: 'Whether specimen sent for pathology',
    },
    {
      key: 'intraOpComplications',
      label: '수술 중 합병증',
      labelEn: 'Intra-operative Complications',
      type: 'textarea',
      required: false,
      section: 'operation',
      order: 10,
    },

    // Post-operative
    {
      key: 'postOpDiagnosis',
      label: '수술 후 진단',
      labelEn: 'Post-operative Diagnosis',
      type: 'textarea',
      required: true,
      section: 'postop',
      order: 1,
    },
    {
      key: 'postOpCourse',
      label: '수술 후 경과',
      labelEn: 'Post-operative Course',
      type: 'textarea',
      required: false,
      section: 'postop',
      order: 2,
      placeholder: 'POD별 경과 기술',
      placeholderEn: 'Course by POD',
    },
    {
      key: 'complications',
      label: '합병증',
      labelEn: 'Complications',
      type: 'textarea',
      required: false,
      section: 'postop',
      order: 3,
      placeholder: '감염, 출혈, 장마비 등',
      placeholderEn: 'Infection, bleeding, ileus, etc.',
    },
    {
      key: 'pathologyResult',
      label: '조직검사 결과',
      labelEn: 'Pathology Result',
      type: 'textarea',
      required: false,
      section: 'postop',
      order: 4,
    },
    {
      key: 'dischargeDate',
      label: '퇴원일',
      labelEn: 'Discharge Date',
      type: 'date',
      required: false,
      section: 'postop',
      order: 5,
    },
    {
      key: 'dischargePlan',
      label: '퇴원 계획',
      labelEn: 'Discharge Plan',
      type: 'textarea',
      required: false,
      section: 'postop',
      order: 6,
      placeholder: '퇴원 약물, 외래 일정, 주의사항',
      placeholderEn: 'Discharge medications, follow-up schedule, precautions',
    },
  ],

  aiPrompt: `당신은 외과 전문의입니다. 다음 수술 기록/의무기록을 분석하여 구조화된 JSON으로 추출해주세요.

추출할 필드:
- preOpDiagnosis: 수술 전 진단
- indication: 수술 적응증
- comorbidities: 동반질환
- asaClass: ASA 분류 (1-6)
- preOpLabs: 수술 전 검사
- consent: 동의서 취득 여부 (true/false)
- operationDate: 수술일 (YYYY-MM-DD)
- procedureName: 수술명
- surgeon: 집도의
- anesthesiaType: 마취 방법 (general/spinal/epidural/regional/local/sedation)
- operativeFindings: 수술 소견
- procedureDetail: 수술 과정
- estimatedBloodLoss: 출혈량
- operationTime: 수술 시간
- specimenSent: 검체 송부
- intraOpComplications: 수술 중 합병증
- postOpDiagnosis: 수술 후 진단
- postOpCourse: 수술 후 경과
- complications: 합병증
- pathologyResult: 조직검사 결과
- dischargeDate: 퇴원일 (YYYY-MM-DD)
- dischargePlan: 퇴원 계획

해당 정보가 없으면 null로 설정하세요. JSON만 반환하세요.`,
};
