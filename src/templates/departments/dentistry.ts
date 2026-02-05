import { DepartmentTemplate } from '../types';

export const dentistryTemplate: DepartmentTemplate = {
  departmentKey: 'dentistry',
  departmentName: '치과',
  departmentNameEn: 'Dentistry',
  version: '1.0.0',

  sections: [
    { key: 'history', title: '병력', titleEn: 'History', order: 1 },
    { key: 'examination', title: '구강 검사', titleEn: 'Oral Examination', order: 2 },
    { key: 'radiograph', title: '방사선 검사', titleEn: 'Radiographic Findings', order: 3 },
    { key: 'diagnosis', title: '진단', titleEn: 'Diagnosis', order: 4 },
    { key: 'treatment', title: '치료', titleEn: 'Treatment', order: 5 },
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
      placeholder: '예: 치통, 잇몸 출혈, 시린이',
      placeholderEn: 'e.g., Toothache, gum bleeding, tooth sensitivity',
    },
    {
      key: 'toothLocation',
      label: '해당 치아',
      labelEn: 'Tooth Location',
      type: 'text',
      required: false,
      section: 'history',
      order: 2,
      placeholder: '예: #36, #11-21, 상악 우측',
      placeholderEn: 'e.g., #36, #11-21, upper right',
    },
    {
      key: 'duration',
      label: '증상 기간',
      labelEn: 'Duration',
      type: 'text',
      required: false,
      section: 'history',
      order: 3,
    },
    {
      key: 'painCharacter',
      label: '통증 양상',
      labelEn: 'Pain Character',
      type: 'multiselect',
      required: false,
      section: 'history',
      order: 4,
      options: [
        { value: 'spontaneous', label: '자발통', labelEn: 'Spontaneous' },
        { value: 'provoked', label: '유발통', labelEn: 'Provoked' },
        { value: 'cold', label: '냉자극 통증', labelEn: 'Cold Sensitivity' },
        { value: 'hot', label: '온자극 통증', labelEn: 'Heat Sensitivity' },
        { value: 'chewing', label: '저작 시 통증', labelEn: 'Pain on Chewing' },
        { value: 'night', label: '야간통', labelEn: 'Night Pain' },
        { value: 'radiating', label: '방사통', labelEn: 'Radiating' },
        { value: 'throbbing', label: '박동성 통증', labelEn: 'Throbbing' },
      ],
    },
    {
      key: 'presentIllness',
      label: '현병력',
      labelEn: 'Present Illness',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 5,
    },
    {
      key: 'dentalHistory',
      label: '치과 병력',
      labelEn: 'Dental History',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 6,
      placeholder: '이전 치료 경험, 보철물, 교정 등',
      placeholderEn: 'Previous treatments, prosthetics, orthodontics, etc.',
    },
    {
      key: 'medicalHistory',
      label: '전신 병력',
      labelEn: 'Medical History',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 7,
      placeholder: '고혈압, 당뇨, 골다공증, 항응고제 등',
      placeholderEn: 'Hypertension, diabetes, osteoporosis, anticoagulants, etc.',
    },
    {
      key: 'allergies',
      label: '알레르기',
      labelEn: 'Allergies',
      type: 'text',
      required: false,
      section: 'history',
      order: 8,
      placeholder: '마취제, 항생제, 라텍스 등',
      placeholderEn: 'Anesthetics, antibiotics, latex, etc.',
    },

    // Oral Examination
    {
      key: 'extraoralExam',
      label: '구강 외 검사',
      labelEn: 'Extraoral Examination',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 1,
      placeholder: '안면 비대칭, 부종, 림프절, TMJ',
      placeholderEn: 'Facial asymmetry, swelling, lymph nodes, TMJ',
    },
    {
      key: 'softTissue',
      label: '연조직 검사',
      labelEn: 'Soft Tissue',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 2,
      placeholder: '치은, 점막, 혀, 구개',
      placeholderEn: 'Gingiva, mucosa, tongue, palate',
    },
    {
      key: 'periodontalStatus',
      label: '치주 상태',
      labelEn: 'Periodontal Status',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 3,
      placeholder: '치은 염증, 치주낭 깊이, BOP, 동요도',
      placeholderEn: 'Gingival inflammation, pocket depth, BOP, mobility',
    },
    {
      key: 'toothCondition',
      label: '치아 상태',
      labelEn: 'Tooth Condition',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 4,
      placeholder: '우식, 파절, 변색, 마모',
      placeholderEn: 'Caries, fracture, discoloration, attrition',
    },
    {
      key: 'percussionTest',
      label: '타진 검사',
      labelEn: 'Percussion Test',
      type: 'text',
      required: false,
      section: 'examination',
      order: 5,
      placeholder: '예: #36 (+)',
      placeholderEn: 'e.g., #36 (+)',
    },
    {
      key: 'palpationTest',
      label: '촉진 검사',
      labelEn: 'Palpation Test',
      type: 'text',
      required: false,
      section: 'examination',
      order: 6,
    },
    {
      key: 'vitalityTest',
      label: '치수 생활력 검사',
      labelEn: 'Vitality Test',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 7,
      placeholder: 'Cold test, EPT 결과',
      placeholderEn: 'Cold test, EPT results',
    },
    {
      key: 'occlusion',
      label: '교합',
      labelEn: 'Occlusion',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 8,
      placeholder: 'Angle 분류, 교합 간섭, 조기 접촉',
      placeholderEn: 'Angle classification, occlusal interference, premature contact',
    },
    {
      key: 'tmjExam',
      label: 'TMJ 검사',
      labelEn: 'TMJ Examination',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 9,
      placeholder: '개구량, 클릭음, 압통',
      placeholderEn: 'Opening range, clicking, tenderness',
    },

    // Radiographic Findings
    {
      key: 'periapicalXray',
      label: '치근단 방사선',
      labelEn: 'Periapical X-ray',
      type: 'textarea',
      required: false,
      section: 'radiograph',
      order: 1,
    },
    {
      key: 'panorama',
      label: '파노라마',
      labelEn: 'Panoramic X-ray',
      type: 'textarea',
      required: false,
      section: 'radiograph',
      order: 2,
    },
    {
      key: 'cbct',
      label: 'CBCT',
      labelEn: 'Cone Beam CT',
      type: 'textarea',
      required: false,
      section: 'radiograph',
      order: 3,
    },
    {
      key: 'radiographicFindings',
      label: '방사선 소견',
      labelEn: 'Radiographic Findings',
      type: 'textarea',
      required: false,
      section: 'radiograph',
      order: 4,
      placeholder: '치근단 병소, 치조골 흡수, 매복치 등',
      placeholderEn: 'Periapical lesion, alveolar bone loss, impacted teeth, etc.',
    },

    // Diagnosis
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
      key: 'diagnosisCategory',
      label: '진단 분류',
      labelEn: 'Diagnosis Category',
      type: 'multiselect',
      required: false,
      section: 'diagnosis',
      order: 2,
      options: [
        { value: 'caries', label: '우식', labelEn: 'Caries' },
        { value: 'pulpitis', label: '치수염', labelEn: 'Pulpitis' },
        { value: 'periapical', label: '치근단 병소', labelEn: 'Periapical Lesion' },
        { value: 'periodontal', label: '치주 질환', labelEn: 'Periodontal Disease' },
        { value: 'fracture', label: '치아 파절', labelEn: 'Tooth Fracture' },
        { value: 'impaction', label: '매복치', labelEn: 'Impacted Tooth' },
        { value: 'tmd', label: 'TMD', labelEn: 'TMD' },
        { value: 'mucosal', label: '구강 점막 질환', labelEn: 'Oral Mucosal Disease' },
        { value: 'prosthetic', label: '보철 관련', labelEn: 'Prosthetic Issue' },
        { value: 'orthodontic', label: '교정 관련', labelEn: 'Orthodontic Issue' },
      ],
    },
    {
      key: 'pulpalDiagnosis',
      label: '치수 진단',
      labelEn: 'Pulpal Diagnosis',
      type: 'select',
      required: false,
      section: 'diagnosis',
      order: 3,
      options: [
        { value: 'normal', label: 'Normal pulp', labelEn: 'Normal pulp' },
        { value: 'reversible', label: 'Reversible pulpitis', labelEn: 'Reversible pulpitis' },
        { value: 'irreversible-symptomatic', label: 'Symptomatic irreversible pulpitis', labelEn: 'Symptomatic irreversible pulpitis' },
        { value: 'irreversible-asymptomatic', label: 'Asymptomatic irreversible pulpitis', labelEn: 'Asymptomatic irreversible pulpitis' },
        { value: 'necrosis', label: 'Pulp necrosis', labelEn: 'Pulp necrosis' },
        { value: 'previously-treated', label: 'Previously treated', labelEn: 'Previously treated' },
      ],
    },
    {
      key: 'periapicalDiagnosis',
      label: '치근단 진단',
      labelEn: 'Periapical Diagnosis',
      type: 'select',
      required: false,
      section: 'diagnosis',
      order: 4,
      options: [
        { value: 'normal', label: 'Normal apical tissues', labelEn: 'Normal apical tissues' },
        { value: 'symptomatic', label: 'Symptomatic apical periodontitis', labelEn: 'Symptomatic apical periodontitis' },
        { value: 'asymptomatic', label: 'Asymptomatic apical periodontitis', labelEn: 'Asymptomatic apical periodontitis' },
        { value: 'acute-abscess', label: 'Acute apical abscess', labelEn: 'Acute apical abscess' },
        { value: 'chronic-abscess', label: 'Chronic apical abscess', labelEn: 'Chronic apical abscess' },
      ],
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

    // Treatment
    {
      key: 'treatmentPlan',
      label: '치료 계획',
      labelEn: 'Treatment Plan',
      type: 'textarea',
      required: false,
      section: 'treatment',
      order: 1,
    },
    {
      key: 'treatmentType',
      label: '치료 종류',
      labelEn: 'Treatment Type',
      type: 'multiselect',
      required: false,
      section: 'treatment',
      order: 2,
      options: [
        { value: 'restoration', label: '수복 치료', labelEn: 'Restoration' },
        { value: 'endodontic', label: '근관 치료', labelEn: 'Endodontic' },
        { value: 'extraction', label: '발치', labelEn: 'Extraction' },
        { value: 'periodontal', label: '치주 치료', labelEn: 'Periodontal' },
        { value: 'prosthetic', label: '보철 치료', labelEn: 'Prosthetic' },
        { value: 'implant', label: '임플란트', labelEn: 'Implant' },
        { value: 'orthodontic', label: '교정 치료', labelEn: 'Orthodontic' },
        { value: 'surgery', label: '구강 외과', labelEn: 'Oral Surgery' },
        { value: 'preventive', label: '예방 치료', labelEn: 'Preventive' },
      ],
    },
    {
      key: 'procedurePerformed',
      label: '시행 술식',
      labelEn: 'Procedure Performed',
      type: 'textarea',
      required: false,
      section: 'treatment',
      order: 3,
    },
    {
      key: 'anesthesia',
      label: '마취',
      labelEn: 'Anesthesia',
      type: 'text',
      required: false,
      section: 'treatment',
      order: 4,
      placeholder: '예: 2% lidocaine 1.8mL infiltration',
      placeholderEn: 'e.g., 2% lidocaine 1.8mL infiltration',
    },
    {
      key: 'materialsUsed',
      label: '사용 재료',
      labelEn: 'Materials Used',
      type: 'textarea',
      required: false,
      section: 'treatment',
      order: 5,
      placeholder: '수복재, 시멘트, 임플란트 규격 등',
      placeholderEn: 'Restorative material, cement, implant specifications, etc.',
    },
    {
      key: 'medications',
      label: '처방 약물',
      labelEn: 'Medications',
      type: 'textarea',
      required: false,
      section: 'treatment',
      order: 6,
      placeholder: '항생제, 진통제, 소염제',
      placeholderEn: 'Antibiotics, analgesics, anti-inflammatory',
    },
    {
      key: 'postOpInstructions',
      label: '술후 주의사항',
      labelEn: 'Post-op Instructions',
      type: 'textarea',
      required: false,
      section: 'treatment',
      order: 7,
    },
    {
      key: 'prognosis',
      label: '예후',
      labelEn: 'Prognosis',
      type: 'select',
      required: false,
      section: 'treatment',
      order: 8,
      options: [
        { value: 'favorable', label: '양호', labelEn: 'Favorable' },
        { value: 'questionable', label: '의문', labelEn: 'Questionable' },
        { value: 'unfavorable', label: '불량', labelEn: 'Unfavorable' },
        { value: 'hopeless', label: '발치 대상', labelEn: 'Hopeless' },
      ],
    },
    {
      key: 'followUp',
      label: '다음 내원',
      labelEn: 'Follow-up',
      type: 'text',
      required: false,
      section: 'treatment',
      order: 9,
    },
  ],

  aiPrompt: `당신은 치과 전문의입니다. 다음 치과 의무기록을 분석하여 구조화된 JSON으로 추출해주세요.

추출할 필드:
- chiefComplaint: 주소
- toothLocation: 해당 치아
- duration: 증상 기간
- painCharacter: 통증 양상 배열
- presentIllness: 현병력
- dentalHistory: 치과 병력
- medicalHistory: 전신 병력
- allergies: 알레르기
- extraoralExam: 구강 외 검사
- softTissue: 연조직 검사
- periodontalStatus: 치주 상태
- toothCondition: 치아 상태
- percussionTest: 타진 검사
- palpationTest: 촉진 검사
- vitalityTest: 치수 생활력 검사
- occlusion: 교합
- tmjExam: TMJ 검사
- periapicalXray: 치근단 방사선
- panorama: 파노라마
- cbct: CBCT
- radiographicFindings: 방사선 소견
- diagnosis: 진단
- diagnosisCategory: 진단 분류 배열
- pulpalDiagnosis: 치수 진단 (normal/reversible/irreversible-symptomatic/irreversible-asymptomatic/necrosis/previously-treated)
- periapicalDiagnosis: 치근단 진단 (normal/symptomatic/asymptomatic/acute-abscess/chronic-abscess)
- differentialDiagnosis: 감별 진단
- treatmentPlan: 치료 계획
- treatmentType: 치료 종류 배열
- procedurePerformed: 시행 술식
- anesthesia: 마취
- materialsUsed: 사용 재료
- medications: 처방 약물
- postOpInstructions: 술후 주의사항
- prognosis: 예후 (favorable/questionable/unfavorable/hopeless)
- followUp: 다음 내원

해당 정보가 없으면 null로 설정하세요. 배열 필드는 해당하는 값들의 배열로 반환하세요. JSON만 반환하세요.`,
};
