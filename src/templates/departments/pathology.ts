import { DepartmentTemplate } from '../types';

export const pathologyTemplate: DepartmentTemplate = {
  departmentKey: 'pathology',
  departmentName: '병리과',
  departmentNameEn: 'Pathology',
  version: '1.0.0',

  sections: [
    { key: 'specimen', title: '검체 정보', titleEn: 'Specimen Information', order: 1 },
    { key: 'clinical', title: '임상 정보', titleEn: 'Clinical Information', order: 2 },
    { key: 'gross', title: '육안 소견', titleEn: 'Gross Examination', order: 3 },
    { key: 'microscopic', title: '현미경 소견', titleEn: 'Microscopic Examination', order: 4 },
    { key: 'diagnosis', title: '진단', titleEn: 'Diagnosis', order: 5 },
  ],

  fields: [
    // Specimen Information
    {
      key: 'specimenType',
      label: '검체 종류',
      labelEn: 'Specimen Type',
      type: 'select',
      required: true,
      section: 'specimen',
      order: 1,
      options: [
        { value: 'biopsy', label: '생검', labelEn: 'Biopsy' },
        { value: 'excision', label: '절제술', labelEn: 'Excision' },
        { value: 'resection', label: '절제', labelEn: 'Resection' },
        { value: 'cytology', label: '세포검사', labelEn: 'Cytology' },
        { value: 'frozen', label: '동결절편', labelEn: 'Frozen Section' },
        { value: 'autopsy', label: '부검', labelEn: 'Autopsy' },
        { value: 'consultation', label: '의뢰/자문', labelEn: 'Consultation' },
      ],
    },
    {
      key: 'specimenSource',
      label: '검체 부위',
      labelEn: 'Specimen Source',
      type: 'text',
      required: true,
      section: 'specimen',
      order: 2,
      placeholder: '예: Stomach, Colon, Lung',
      placeholderEn: 'e.g., Stomach, Colon, Lung',
    },
    {
      key: 'specimenDescription',
      label: '검체 설명',
      labelEn: 'Specimen Description',
      type: 'text',
      required: false,
      section: 'specimen',
      order: 3,
      placeholder: '예: Gastrectomy, distal',
      placeholderEn: 'e.g., Gastrectomy, distal',
    },
    {
      key: 'laterality',
      label: '측면',
      labelEn: 'Laterality',
      type: 'select',
      required: false,
      section: 'specimen',
      order: 4,
      options: [
        { value: 'right', label: 'Right' },
        { value: 'left', label: 'Left' },
        { value: 'bilateral', label: 'Bilateral' },
        { value: 'na', label: 'N/A' },
      ],
    },
    {
      key: 'receivedDate',
      label: '접수일',
      labelEn: 'Received Date',
      type: 'date',
      required: false,
      section: 'specimen',
      order: 5,
    },
    {
      key: 'fixative',
      label: '고정액',
      labelEn: 'Fixative',
      type: 'text',
      required: false,
      section: 'specimen',
      order: 6,
      placeholder: '예: 10% Formalin',
      placeholderEn: 'e.g., 10% Formalin',
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
    },
    {
      key: 'clinicalDiagnosis',
      label: '임상 진단',
      labelEn: 'Clinical Diagnosis',
      type: 'text',
      required: false,
      section: 'clinical',
      order: 2,
    },
    {
      key: 'previousPathology',
      label: '이전 병리',
      labelEn: 'Previous Pathology',
      type: 'textarea',
      required: false,
      section: 'clinical',
      order: 3,
      placeholder: '이전 조직검사 결과',
      placeholderEn: 'Previous pathology results',
    },
    {
      key: 'treatmentHistory',
      label: '치료력',
      labelEn: 'Treatment History',
      type: 'textarea',
      required: false,
      section: 'clinical',
      order: 4,
      placeholder: '수술, 항암, 방사선 치료 등',
      placeholderEn: 'Surgery, chemotherapy, radiation, etc.',
    },
    {
      key: 'requestingPhysician',
      label: '의뢰의',
      labelEn: 'Requesting Physician',
      type: 'text',
      required: false,
      section: 'clinical',
      order: 5,
    },

    // Gross Examination
    {
      key: 'grossDescription',
      label: '육안 소견',
      labelEn: 'Gross Description',
      type: 'textarea',
      required: true,
      section: 'gross',
      order: 1,
      placeholder: '검체의 육안적 소견을 상세히 기술',
      placeholderEn: 'Detailed gross description of the specimen',
    },
    {
      key: 'specimenSize',
      label: '검체 크기',
      labelEn: 'Specimen Size',
      type: 'text',
      required: false,
      section: 'gross',
      order: 2,
      placeholder: 'cm (length x width x depth)',
      placeholderEn: 'cm (length x width x depth)',
    },
    {
      key: 'tumorSize',
      label: '종양 크기',
      labelEn: 'Tumor Size',
      type: 'text',
      required: false,
      section: 'gross',
      order: 3,
      placeholder: 'cm (최대 직경)',
      placeholderEn: 'cm (greatest dimension)',
    },
    {
      key: 'tumorLocation',
      label: '종양 위치',
      labelEn: 'Tumor Location',
      type: 'text',
      required: false,
      section: 'gross',
      order: 4,
    },
    {
      key: 'tumorAppearance',
      label: '종양 양상',
      labelEn: 'Tumor Appearance',
      type: 'textarea',
      required: false,
      section: 'gross',
      order: 5,
      placeholder: '색상, 경도, 절단면',
      placeholderEn: 'Color, consistency, cut surface',
    },
    {
      key: 'margins',
      label: '절제연',
      labelEn: 'Margins',
      type: 'textarea',
      required: false,
      section: 'gross',
      order: 6,
      placeholder: '근위부, 원위부, 주위 절제연',
      placeholderEn: 'Proximal, distal, circumferential margins',
    },
    {
      key: 'lymphNodes',
      label: '림프절',
      labelEn: 'Lymph Nodes',
      type: 'text',
      required: false,
      section: 'gross',
      order: 7,
      placeholder: '개수, 크기',
      placeholderEn: 'Number, size',
    },
    {
      key: 'sectionsTaken',
      label: '절편 채취',
      labelEn: 'Sections Taken',
      type: 'text',
      required: false,
      section: 'gross',
      order: 8,
      placeholder: '채취한 절편 수 및 부위',
      placeholderEn: 'Number and sites of sections taken',
    },

    // Microscopic Examination
    {
      key: 'microscopicDescription',
      label: '현미경 소견',
      labelEn: 'Microscopic Description',
      type: 'textarea',
      required: true,
      section: 'microscopic',
      order: 1,
      placeholder: '조직학적 소견 상세 기술',
      placeholderEn: 'Detailed histologic findings',
    },
    {
      key: 'tumorType',
      label: '종양 유형',
      labelEn: 'Tumor Type',
      type: 'text',
      required: false,
      section: 'microscopic',
      order: 2,
      placeholder: '예: Adenocarcinoma',
      placeholderEn: 'e.g., Adenocarcinoma',
    },
    {
      key: 'histologicGrade',
      label: '조직학적 등급',
      labelEn: 'Histologic Grade',
      type: 'select',
      required: false,
      section: 'microscopic',
      order: 3,
      options: [
        { value: 'g1', label: 'G1 - Well differentiated', labelEn: 'G1 - Well differentiated' },
        { value: 'g2', label: 'G2 - Moderately differentiated', labelEn: 'G2 - Moderately differentiated' },
        { value: 'g3', label: 'G3 - Poorly differentiated', labelEn: 'G3 - Poorly differentiated' },
        { value: 'g4', label: 'G4 - Undifferentiated', labelEn: 'G4 - Undifferentiated' },
        { value: 'gx', label: 'GX - Grade cannot be assessed', labelEn: 'GX - Grade cannot be assessed' },
        { value: 'low', label: 'Low grade', labelEn: 'Low grade' },
        { value: 'high', label: 'High grade', labelEn: 'High grade' },
      ],
    },
    {
      key: 'invasionDepth',
      label: '침윤 깊이',
      labelEn: 'Depth of Invasion',
      type: 'text',
      required: false,
      section: 'microscopic',
      order: 4,
      placeholder: '예: Muscularis propria',
      placeholderEn: 'e.g., Muscularis propria',
    },
    {
      key: 'lymphovascularInvasion',
      label: '림프혈관 침윤',
      labelEn: 'Lymphovascular Invasion',
      type: 'select',
      required: false,
      section: 'microscopic',
      order: 5,
      options: [
        { value: 'absent', label: 'Absent', labelEn: 'Absent' },
        { value: 'present', label: 'Present', labelEn: 'Present' },
        { value: 'indeterminate', label: 'Indeterminate', labelEn: 'Indeterminate' },
      ],
    },
    {
      key: 'perineuralInvasion',
      label: '신경주위 침윤',
      labelEn: 'Perineural Invasion',
      type: 'select',
      required: false,
      section: 'microscopic',
      order: 6,
      options: [
        { value: 'absent', label: 'Absent', labelEn: 'Absent' },
        { value: 'present', label: 'Present', labelEn: 'Present' },
        { value: 'indeterminate', label: 'Indeterminate', labelEn: 'Indeterminate' },
      ],
    },
    {
      key: 'marginStatus',
      label: '절제연 상태',
      labelEn: 'Margin Status',
      type: 'textarea',
      required: false,
      section: 'microscopic',
      order: 7,
      placeholder: 'Negative/Positive, 거리',
      placeholderEn: 'Negative/Positive, distance',
    },
    {
      key: 'lymphNodeResults',
      label: '림프절 결과',
      labelEn: 'Lymph Node Results',
      type: 'text',
      required: false,
      section: 'microscopic',
      order: 8,
      placeholder: '전이/총개수 (예: 2/15)',
      placeholderEn: 'Positive/total (e.g., 2/15)',
    },
    {
      key: 'ihcResults',
      label: 'IHC 결과',
      labelEn: 'Immunohistochemistry',
      type: 'textarea',
      required: false,
      section: 'microscopic',
      order: 9,
      placeholder: 'ER, PR, HER2, Ki-67, etc.',
      placeholderEn: 'ER, PR, HER2, Ki-67, etc.',
    },
    {
      key: 'molecularResults',
      label: '분자검사 결과',
      labelEn: 'Molecular Results',
      type: 'textarea',
      required: false,
      section: 'microscopic',
      order: 10,
      placeholder: 'MSI, EGFR, KRAS, etc.',
      placeholderEn: 'MSI, EGFR, KRAS, etc.',
    },
    {
      key: 'specialStains',
      label: '특수염색',
      labelEn: 'Special Stains',
      type: 'textarea',
      required: false,
      section: 'microscopic',
      order: 11,
    },

    // Diagnosis
    {
      key: 'finalDiagnosis',
      label: '최종 진단',
      labelEn: 'Final Diagnosis',
      type: 'textarea',
      required: true,
      section: 'diagnosis',
      order: 1,
      placeholder: '병리학적 진단명',
      placeholderEn: 'Pathologic diagnosis',
    },
    {
      key: 'ptnmStage',
      label: 'pTNM 병기',
      labelEn: 'pTNM Stage',
      type: 'text',
      required: false,
      section: 'diagnosis',
      order: 2,
      placeholder: '예: pT2N1M0',
      placeholderEn: 'e.g., pT2N1M0',
    },
    {
      key: 'ajccStage',
      label: 'AJCC Stage',
      labelEn: 'AJCC Stage',
      type: 'text',
      required: false,
      section: 'diagnosis',
      order: 3,
      placeholder: '예: Stage IIB',
      placeholderEn: 'e.g., Stage IIB',
    },
    {
      key: 'synopticReport',
      label: 'Synoptic Report',
      labelEn: 'Synoptic Report',
      type: 'textarea',
      required: false,
      section: 'diagnosis',
      order: 4,
      placeholder: 'CAP protocol 기반 요약',
      placeholderEn: 'Summary based on CAP protocol',
    },
    {
      key: 'differentialDiagnosis',
      label: '감별 진단',
      labelEn: 'Differential Diagnosis',
      type: 'textarea',
      required: false,
      section: 'diagnosis',
      order: 5,
    },
    {
      key: 'comment',
      label: '코멘트',
      labelEn: 'Comment',
      type: 'textarea',
      required: false,
      section: 'diagnosis',
      order: 6,
      placeholder: '추가 소견, 권고사항',
      placeholderEn: 'Additional findings, recommendations',
    },
    {
      key: 'pathologist',
      label: '판독의',
      labelEn: 'Pathologist',
      type: 'text',
      required: false,
      section: 'diagnosis',
      order: 7,
    },
    {
      key: 'reportDate',
      label: '보고일',
      labelEn: 'Report Date',
      type: 'date',
      required: false,
      section: 'diagnosis',
      order: 8,
    },
  ],

  aiPrompt: `당신은 병리과 전문의입니다. 다음 병리 보고서를 분석하여 구조화된 JSON으로 추출해주세요.

추출할 필드:
- specimenType: 검체 종류 (biopsy/excision/resection/cytology/frozen/autopsy/consultation)
- specimenSource: 검체 부위
- specimenDescription: 검체 설명
- laterality: 측면 (right/left/bilateral/na)
- receivedDate: 접수일 (YYYY-MM-DD)
- fixative: 고정액
- clinicalHistory: 임상 정보
- clinicalDiagnosis: 임상 진단
- previousPathology: 이전 병리
- treatmentHistory: 치료력
- requestingPhysician: 의뢰의
- grossDescription: 육안 소견
- specimenSize: 검체 크기
- tumorSize: 종양 크기
- tumorLocation: 종양 위치
- tumorAppearance: 종양 양상
- margins: 절제연
- lymphNodes: 림프절
- sectionsTaken: 절편 채취
- microscopicDescription: 현미경 소견
- tumorType: 종양 유형
- histologicGrade: 조직학적 등급 (g1/g2/g3/g4/gx/low/high)
- invasionDepth: 침윤 깊이
- lymphovascularInvasion: 림프혈관 침윤 (absent/present/indeterminate)
- perineuralInvasion: 신경주위 침윤 (absent/present/indeterminate)
- marginStatus: 절제연 상태
- lymphNodeResults: 림프절 결과
- ihcResults: IHC 결과
- molecularResults: 분자검사 결과
- specialStains: 특수염색
- finalDiagnosis: 최종 진단
- ptnmStage: pTNM 병기
- ajccStage: AJCC Stage
- synopticReport: Synoptic Report
- differentialDiagnosis: 감별 진단
- comment: 코멘트
- pathologist: 판독의
- reportDate: 보고일 (YYYY-MM-DD)

해당 정보가 없으면 null로 설정하세요. JSON만 반환하세요.`,
};
