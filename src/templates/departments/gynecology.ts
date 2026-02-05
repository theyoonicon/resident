import { DepartmentTemplate } from '../types';

export const gynecologyTemplate: DepartmentTemplate = {
  departmentKey: 'gynecology',
  departmentName: '부인과',
  departmentNameEn: 'Gynecology',
  version: '1.0.0',

  sections: [
    { key: 'history', title: '병력', titleEn: 'History', order: 1 },
    { key: 'menstrual', title: '월경력', titleEn: 'Menstrual History', order: 2 },
    { key: 'examination', title: '검사', titleEn: 'Examination', order: 3 },
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
      placeholder: '예: 하복부 통증, 비정상 자궁출혈, 질 분비물',
      placeholderEn: 'e.g., Lower abdominal pain, abnormal uterine bleeding, vaginal discharge',
    },
    {
      key: 'duration',
      label: '증상 기간',
      labelEn: 'Duration',
      type: 'text',
      required: false,
      section: 'history',
      order: 2,
    },
    {
      key: 'presentIllness',
      label: '현병력',
      labelEn: 'Present Illness',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 3,
    },
    {
      key: 'pastMedicalHistory',
      label: '과거력',
      labelEn: 'Past Medical History',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 4,
    },
    {
      key: 'pastGynecHistory',
      label: '부인과 병력',
      labelEn: 'Past Gynecologic History',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 5,
      placeholder: '이전 부인과 질환, 수술력',
      placeholderEn: 'Previous gynecologic diseases, surgeries',
    },
    {
      key: 'obstetricHistory',
      label: '산과력 (G-P)',
      labelEn: 'Obstetric History',
      type: 'text',
      required: false,
      section: 'history',
      order: 6,
      placeholder: '예: G2P1',
      placeholderEn: 'e.g., G2P1',
    },
    {
      key: 'sexualHistory',
      label: '성생활력',
      labelEn: 'Sexual History',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 7,
    },
    {
      key: 'contraception',
      label: '피임',
      labelEn: 'Contraception',
      type: 'text',
      required: false,
      section: 'history',
      order: 8,
    },
    {
      key: 'familyHistory',
      label: '가족력',
      labelEn: 'Family History',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 9,
      placeholder: '부인과 암, 유방암 가족력',
      placeholderEn: 'Family history of gynecologic cancer, breast cancer',
    },

    // Menstrual History
    {
      key: 'menarche',
      label: '초경 나이',
      labelEn: 'Menarche',
      type: 'text',
      required: false,
      section: 'menstrual',
      order: 1,
      placeholder: '세',
      placeholderEn: 'years old',
    },
    {
      key: 'lmp',
      label: 'LMP',
      labelEn: 'Last Menstrual Period',
      type: 'date',
      required: false,
      section: 'menstrual',
      order: 2,
    },
    {
      key: 'menstrualCycle',
      label: '월경 주기',
      labelEn: 'Menstrual Cycle',
      type: 'text',
      required: false,
      section: 'menstrual',
      order: 3,
      placeholder: '예: 28일',
      placeholderEn: 'e.g., 28 days',
    },
    {
      key: 'menstrualDuration',
      label: '월경 기간',
      labelEn: 'Menstrual Duration',
      type: 'text',
      required: false,
      section: 'menstrual',
      order: 4,
      placeholder: '예: 5일',
      placeholderEn: 'e.g., 5 days',
    },
    {
      key: 'menstrualAmount',
      label: '월경량',
      labelEn: 'Menstrual Amount',
      type: 'select',
      required: false,
      section: 'menstrual',
      order: 5,
      options: [
        { value: 'scanty', label: '소량', labelEn: 'Scanty' },
        { value: 'normal', label: '보통', labelEn: 'Normal' },
        { value: 'heavy', label: '과다', labelEn: 'Heavy' },
      ],
    },
    {
      key: 'dysmenorrhea',
      label: '월경통',
      labelEn: 'Dysmenorrhea',
      type: 'select',
      required: false,
      section: 'menstrual',
      order: 6,
      options: [
        { value: 'none', label: '없음', labelEn: 'None' },
        { value: 'mild', label: '경미', labelEn: 'Mild' },
        { value: 'moderate', label: '중등도', labelEn: 'Moderate' },
        { value: 'severe', label: '심함', labelEn: 'Severe' },
      ],
    },
    {
      key: 'abnormalBleeding',
      label: '비정상 출혈',
      labelEn: 'Abnormal Bleeding',
      type: 'multiselect',
      required: false,
      section: 'menstrual',
      order: 7,
      options: [
        { value: 'none', label: '없음', labelEn: 'None' },
        { value: 'menorrhagia', label: '월경과다', labelEn: 'Menorrhagia' },
        { value: 'metrorrhagia', label: '부정 자궁출혈', labelEn: 'Metrorrhagia' },
        { value: 'intermenstrual', label: '월경간 출혈', labelEn: 'Intermenstrual Bleeding' },
        { value: 'postcoital', label: '성교 후 출혈', labelEn: 'Postcoital Bleeding' },
        { value: 'postmenopausal', label: '폐경 후 출혈', labelEn: 'Postmenopausal Bleeding' },
      ],
    },
    {
      key: 'menopauseStatus',
      label: '폐경 상태',
      labelEn: 'Menopause Status',
      type: 'select',
      required: false,
      section: 'menstrual',
      order: 8,
      options: [
        { value: 'premenopausal', label: '폐경 전', labelEn: 'Premenopausal' },
        { value: 'perimenopausal', label: '폐경 이행기', labelEn: 'Perimenopausal' },
        { value: 'postmenopausal', label: '폐경 후', labelEn: 'Postmenopausal' },
      ],
    },
    {
      key: 'menopauseAge',
      label: '폐경 나이',
      labelEn: 'Menopause Age',
      type: 'text',
      required: false,
      section: 'menstrual',
      order: 9,
      placeholder: '세',
      placeholderEn: 'years old',
    },
    {
      key: 'hrt',
      label: 'HRT',
      labelEn: 'Hormone Replacement Therapy',
      type: 'text',
      required: false,
      section: 'menstrual',
      order: 10,
    },

    // Examination
    {
      key: 'vitalSigns',
      label: '활력징후',
      labelEn: 'Vital Signs',
      type: 'text',
      required: false,
      section: 'examination',
      order: 1,
    },
    {
      key: 'abdominalExam',
      label: '복부 검사',
      labelEn: 'Abdominal Exam',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 2,
    },
    {
      key: 'speculumExam',
      label: '질경 검사',
      labelEn: 'Speculum Exam',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 3,
      placeholder: '질, 자궁경부 소견',
      placeholderEn: 'Vaginal, cervical findings',
    },
    {
      key: 'bimanualExam',
      label: '쌍수 검사',
      labelEn: 'Bimanual Exam',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 4,
      placeholder: '자궁, 부속기 소견',
      placeholderEn: 'Uterus, adnexa findings',
    },
    {
      key: 'uterusSize',
      label: '자궁 크기',
      labelEn: 'Uterus Size',
      type: 'text',
      required: false,
      section: 'examination',
      order: 5,
    },
    {
      key: 'adnexaFindings',
      label: '부속기 소견',
      labelEn: 'Adnexa Findings',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 6,
    },
    {
      key: 'ultrasoundFindings',
      label: '초음파 소견',
      labelEn: 'Ultrasound Findings',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 7,
      placeholder: '자궁, 난소, 부속기 초음파',
      placeholderEn: 'Uterus, ovary, adnexa ultrasound',
    },
    {
      key: 'endometrialThickness',
      label: '자궁내막 두께',
      labelEn: 'Endometrial Thickness',
      type: 'text',
      required: false,
      section: 'examination',
      order: 8,
      placeholder: 'mm',
      placeholderEn: 'mm',
    },
    {
      key: 'ovarianFindings',
      label: '난소 소견',
      labelEn: 'Ovarian Findings',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 9,
    },
    {
      key: 'papSmear',
      label: 'Pap smear 결과',
      labelEn: 'Pap Smear Result',
      type: 'select',
      required: false,
      section: 'examination',
      order: 10,
      options: [
        { value: 'nilm', label: 'NILM', labelEn: 'NILM' },
        { value: 'ascus', label: 'ASC-US', labelEn: 'ASC-US' },
        { value: 'asch', label: 'ASC-H', labelEn: 'ASC-H' },
        { value: 'lsil', label: 'LSIL', labelEn: 'LSIL' },
        { value: 'hsil', label: 'HSIL', labelEn: 'HSIL' },
        { value: 'agc', label: 'AGC', labelEn: 'AGC' },
        { value: 'cancer', label: 'Cancer', labelEn: 'Cancer' },
      ],
    },
    {
      key: 'hpvTest',
      label: 'HPV 검사',
      labelEn: 'HPV Test',
      type: 'text',
      required: false,
      section: 'examination',
      order: 11,
    },
    {
      key: 'colposcopy',
      label: '질확대경 검사',
      labelEn: 'Colposcopy',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 12,
    },
    {
      key: 'hysteroscopy',
      label: '자궁경 검사',
      labelEn: 'Hysteroscopy',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 13,
    },
    {
      key: 'labResults',
      label: '검사 결과',
      labelEn: 'Lab Results',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 14,
      placeholder: 'CBC, CA-125, HCG, 호르몬 검사 등',
      placeholderEn: 'CBC, CA-125, HCG, hormone levels, etc.',
    },
    {
      key: 'imagingResults',
      label: '영상 검사',
      labelEn: 'Imaging Results',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 15,
      placeholder: 'CT, MRI 등',
      placeholderEn: 'CT, MRI, etc.',
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
      type: 'select',
      required: false,
      section: 'diagnosis',
      order: 2,
      options: [
        { value: 'benign-uterine', label: '자궁 양성 질환', labelEn: 'Benign Uterine Disease' },
        { value: 'benign-ovarian', label: '난소 양성 질환', labelEn: 'Benign Ovarian Disease' },
        { value: 'infection', label: '감염성 질환', labelEn: 'Infection' },
        { value: 'endometriosis', label: '자궁내막증', labelEn: 'Endometriosis' },
        { value: 'infertility', label: '불임', labelEn: 'Infertility' },
        { value: 'malignancy', label: '악성 종양', labelEn: 'Malignancy' },
        { value: 'menstrual-disorder', label: '월경 장애', labelEn: 'Menstrual Disorder' },
        { value: 'pelvic-floor', label: '골반저 질환', labelEn: 'Pelvic Floor Disorder' },
        { value: 'other', label: '기타', labelEn: 'Other' },
      ],
    },
    {
      key: 'differentialDiagnosis',
      label: '감별 진단',
      labelEn: 'Differential Diagnosis',
      type: 'textarea',
      required: false,
      section: 'diagnosis',
      order: 3,
    },
    {
      key: 'pathologyResult',
      label: '조직검사 결과',
      labelEn: 'Pathology Result',
      type: 'textarea',
      required: false,
      section: 'diagnosis',
      order: 4,
    },
    {
      key: 'staging',
      label: '병기',
      labelEn: 'Staging',
      type: 'text',
      required: false,
      section: 'diagnosis',
      order: 5,
      placeholder: 'FIGO staging (악성 종양인 경우)',
      placeholderEn: 'FIGO staging (for malignancy)',
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
      key: 'medicalTreatment',
      label: '약물 치료',
      labelEn: 'Medical Treatment',
      type: 'textarea',
      required: false,
      section: 'treatment',
      order: 2,
      placeholder: '호르몬제, 진통제, 항생제 등',
      placeholderEn: 'Hormones, analgesics, antibiotics, etc.',
    },
    {
      key: 'surgicalTreatment',
      label: '수술적 치료',
      labelEn: 'Surgical Treatment',
      type: 'textarea',
      required: false,
      section: 'treatment',
      order: 3,
    },
    {
      key: 'surgeryType',
      label: '수술 종류',
      labelEn: 'Surgery Type',
      type: 'select',
      required: false,
      section: 'treatment',
      order: 4,
      options: [
        { value: 'hysterectomy-abdominal', label: '복식 자궁적출술', labelEn: 'Abdominal Hysterectomy' },
        { value: 'hysterectomy-vaginal', label: '질식 자궁적출술', labelEn: 'Vaginal Hysterectomy' },
        { value: 'hysterectomy-laparoscopic', label: '복강경 자궁적출술', labelEn: 'Laparoscopic Hysterectomy' },
        { value: 'myomectomy', label: '근종절제술', labelEn: 'Myomectomy' },
        { value: 'cystectomy', label: '낭종절제술', labelEn: 'Cystectomy' },
        { value: 'oophorectomy', label: '난소절제술', labelEn: 'Oophorectomy' },
        { value: 'salpingectomy', label: '난관절제술', labelEn: 'Salpingectomy' },
        { value: 'conization', label: '원추절제술', labelEn: 'Conization' },
        { value: 'leep', label: 'LEEP', labelEn: 'LEEP' },
        { value: 'd-and-c', label: 'D&C', labelEn: 'D&C' },
        { value: 'hysteroscopic', label: '자궁경 수술', labelEn: 'Hysteroscopic Surgery' },
        { value: 'laparoscopy', label: '진단적 복강경', labelEn: 'Diagnostic Laparoscopy' },
        { value: 'other', label: '기타', labelEn: 'Other' },
      ],
    },
    {
      key: 'operativeFindings',
      label: '수술 소견',
      labelEn: 'Operative Findings',
      type: 'textarea',
      required: false,
      section: 'treatment',
      order: 5,
    },
    {
      key: 'chemotherapy',
      label: '항암치료',
      labelEn: 'Chemotherapy',
      type: 'textarea',
      required: false,
      section: 'treatment',
      order: 6,
    },
    {
      key: 'radiotherapy',
      label: '방사선치료',
      labelEn: 'Radiotherapy',
      type: 'textarea',
      required: false,
      section: 'treatment',
      order: 7,
    },
    {
      key: 'complications',
      label: '합병증',
      labelEn: 'Complications',
      type: 'textarea',
      required: false,
      section: 'treatment',
      order: 8,
    },
    {
      key: 'prognosis',
      label: '예후',
      labelEn: 'Prognosis',
      type: 'textarea',
      required: false,
      section: 'treatment',
      order: 9,
    },
    {
      key: 'followUp',
      label: '추적 계획',
      labelEn: 'Follow-up',
      type: 'textarea',
      required: false,
      section: 'treatment',
      order: 10,
    },
  ],

  aiPrompt: `당신은 부인과 전문의입니다. 다음 부인과 의무기록을 분석하여 구조화된 JSON으로 추출해주세요.

추출할 필드:
- chiefComplaint: 주소
- duration: 증상 기간
- presentIllness: 현병력
- pastMedicalHistory: 과거력
- pastGynecHistory: 부인과 병력
- obstetricHistory: 산과력 (G-P)
- sexualHistory: 성생활력
- contraception: 피임
- familyHistory: 가족력
- menarche: 초경 나이
- lmp: LMP (YYYY-MM-DD)
- menstrualCycle: 월경 주기
- menstrualDuration: 월경 기간
- menstrualAmount: 월경량 (scanty/normal/heavy)
- dysmenorrhea: 월경통 (none/mild/moderate/severe)
- abnormalBleeding: 비정상 출혈 배열
- menopauseStatus: 폐경 상태 (premenopausal/perimenopausal/postmenopausal)
- menopauseAge: 폐경 나이
- hrt: HRT
- vitalSigns: 활력징후
- abdominalExam: 복부 검사
- speculumExam: 질경 검사
- bimanualExam: 쌍수 검사
- uterusSize: 자궁 크기
- adnexaFindings: 부속기 소견
- ultrasoundFindings: 초음파 소견
- endometrialThickness: 자궁내막 두께
- ovarianFindings: 난소 소견
- papSmear: Pap smear 결과 (nilm/ascus/asch/lsil/hsil/agc/cancer)
- hpvTest: HPV 검사
- colposcopy: 질확대경 검사
- hysteroscopy: 자궁경 검사
- labResults: 검사 결과
- imagingResults: 영상 검사
- diagnosis: 진단
- diagnosisCategory: 진단 분류
- differentialDiagnosis: 감별 진단
- pathologyResult: 조직검사 결과
- staging: 병기
- treatmentPlan: 치료 계획
- medicalTreatment: 약물 치료
- surgicalTreatment: 수술적 치료
- surgeryType: 수술 종류
- operativeFindings: 수술 소견
- chemotherapy: 항암치료
- radiotherapy: 방사선치료
- complications: 합병증
- prognosis: 예후
- followUp: 추적 계획

해당 정보가 없으면 null로 설정하세요. 배열 필드는 해당하는 값들의 배열로 반환하세요. JSON만 반환하세요.`,
};
