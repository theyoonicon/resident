import { DepartmentTemplate } from '../types';

export const obstetricsTemplate: DepartmentTemplate = {
  departmentKey: 'obstetrics',
  departmentName: '산과',
  departmentNameEn: 'Obstetrics',
  version: '1.0.0',

  sections: [
    { key: 'history', title: '병력', titleEn: 'History', order: 1 },
    { key: 'obstetric-info', title: '산과 정보', titleEn: 'Obstetric Information', order: 2 },
    { key: 'fetal', title: '태아 상태', titleEn: 'Fetal Status', order: 3 },
    { key: 'examination', title: '검사', titleEn: 'Examination', order: 4 },
    { key: 'diagnosis', title: '진단 및 치료', titleEn: 'Diagnosis & Treatment', order: 5 },
    { key: 'delivery', title: '분만 정보', titleEn: 'Delivery Information', order: 6 },
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
      placeholder: '예: 산전 진찰, 진통, 양막파수',
      placeholderEn: 'e.g., Prenatal visit, labor, rupture of membranes',
    },
    {
      key: 'lmp',
      label: 'LMP',
      labelEn: 'Last Menstrual Period',
      type: 'date',
      required: false,
      section: 'history',
      order: 2,
    },
    {
      key: 'menstrualCycle',
      label: '월경 주기',
      labelEn: 'Menstrual Cycle',
      type: 'text',
      required: false,
      section: 'history',
      order: 3,
      placeholder: '예: 28일, 규칙적',
      placeholderEn: 'e.g., 28 days, regular',
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
      key: 'pastObstetricHistory',
      label: '과거 산과력',
      labelEn: 'Past Obstetric History',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 5,
      placeholder: '이전 임신/분만 경과',
      placeholderEn: 'Previous pregnancy/delivery history',
    },
    {
      key: 'familyHistory',
      label: '가족력',
      labelEn: 'Family History',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 6,
    },

    // Obstetric Information
    {
      key: 'gravidity',
      label: 'G (임신 횟수)',
      labelEn: 'Gravidity',
      type: 'number',
      required: true,
      section: 'obstetric-info',
      order: 1,
    },
    {
      key: 'parity',
      label: 'P (분만력)',
      labelEn: 'Parity',
      type: 'text',
      required: false,
      section: 'obstetric-info',
      order: 2,
      placeholder: 'T-P-A-L (만삭-조산-유산-생존)',
      placeholderEn: 'T-P-A-L (Term-Preterm-Abortion-Living)',
    },
    {
      key: 'gestationalAge',
      label: '임신 주수',
      labelEn: 'Gestational Age',
      type: 'text',
      required: true,
      section: 'obstetric-info',
      order: 3,
      placeholder: '예: 38+2 weeks',
      placeholderEn: 'e.g., 38+2 weeks',
    },
    {
      key: 'edd',
      label: '분만예정일 (EDC)',
      labelEn: 'Expected Date of Confinement',
      type: 'date',
      required: false,
      section: 'obstetric-info',
      order: 4,
    },
    {
      key: 'eddBasis',
      label: 'EDC 기준',
      labelEn: 'EDC Basis',
      type: 'select',
      required: false,
      section: 'obstetric-info',
      order: 5,
      options: [
        { value: 'lmp', label: 'LMP 기준', labelEn: 'Based on LMP' },
        { value: 'us-early', label: '초기 초음파', labelEn: 'Early Ultrasound' },
        { value: 'us-late', label: '후기 초음파', labelEn: 'Late Ultrasound' },
        { value: 'ivf', label: 'IVF 날짜', labelEn: 'IVF Date' },
      ],
    },
    {
      key: 'prenatalVisits',
      label: '산전 진찰 횟수',
      labelEn: 'Prenatal Visits',
      type: 'number',
      required: false,
      section: 'obstetric-info',
      order: 6,
    },
    {
      key: 'prenatalCourse',
      label: '산전 경과',
      labelEn: 'Prenatal Course',
      type: 'textarea',
      required: false,
      section: 'obstetric-info',
      order: 7,
      placeholder: '산전 관리 중 특이사항',
      placeholderEn: 'Notable events during prenatal care',
    },
    {
      key: 'riskFactors',
      label: '위험 요인',
      labelEn: 'Risk Factors',
      type: 'multiselect',
      required: false,
      section: 'obstetric-info',
      order: 8,
      options: [
        { value: 'ama', label: '고령 임신 (AMA)', labelEn: 'Advanced Maternal Age' },
        { value: 'gdm', label: '임신성 당뇨 (GDM)', labelEn: 'Gestational Diabetes' },
        { value: 'pih', label: '임신성 고혈압 (PIH)', labelEn: 'Pregnancy-Induced Hypertension' },
        { value: 'preeclampsia', label: '전자간증', labelEn: 'Preeclampsia' },
        { value: 'prev-cs', label: '이전 제왕절개', labelEn: 'Previous C-Section' },
        { value: 'prev-preterm', label: '이전 조산력', labelEn: 'Previous Preterm Birth' },
        { value: 'multiple', label: '다태 임신', labelEn: 'Multiple Pregnancy' },
        { value: 'placenta-previa', label: '전치태반', labelEn: 'Placenta Previa' },
        { value: 'iugr', label: 'IUGR', labelEn: 'IUGR' },
        { value: 'oligohydramnios', label: '양수과소증', labelEn: 'Oligohydramnios' },
        { value: 'polyhydramnios', label: '양수과다증', labelEn: 'Polyhydramnios' },
      ],
    },

    // Fetal Status
    {
      key: 'fetalCount',
      label: '태아 수',
      labelEn: 'Number of Fetuses',
      type: 'select',
      required: false,
      section: 'fetal',
      order: 1,
      options: [
        { value: 'singleton', label: '단태', labelEn: 'Singleton' },
        { value: 'twins', label: '쌍태', labelEn: 'Twins' },
        { value: 'triplets', label: '삼태', labelEn: 'Triplets' },
        { value: 'more', label: '다태 (4+)', labelEn: 'Multiple (4+)' },
      ],
    },
    {
      key: 'fetalPresentation',
      label: '태위',
      labelEn: 'Fetal Presentation',
      type: 'select',
      required: false,
      section: 'fetal',
      order: 2,
      options: [
        { value: 'cephalic', label: '두위 (Cephalic)', labelEn: 'Cephalic' },
        { value: 'breech', label: '둔위 (Breech)', labelEn: 'Breech' },
        { value: 'transverse', label: '횡위 (Transverse)', labelEn: 'Transverse' },
        { value: 'oblique', label: '사위 (Oblique)', labelEn: 'Oblique' },
      ],
    },
    {
      key: 'fetalHeartRate',
      label: '태아 심박수',
      labelEn: 'Fetal Heart Rate',
      type: 'text',
      required: false,
      section: 'fetal',
      order: 3,
      placeholder: 'bpm',
      placeholderEn: 'bpm',
    },
    {
      key: 'fetalMovement',
      label: '태동',
      labelEn: 'Fetal Movement',
      type: 'select',
      required: false,
      section: 'fetal',
      order: 4,
      options: [
        { value: 'good', label: '양호', labelEn: 'Good' },
        { value: 'decreased', label: '감소', labelEn: 'Decreased' },
        { value: 'absent', label: '없음', labelEn: 'Absent' },
      ],
    },
    {
      key: 'estimatedFetalWeight',
      label: '추정 태아 체중 (EFW)',
      labelEn: 'Estimated Fetal Weight',
      type: 'text',
      required: false,
      section: 'fetal',
      order: 5,
      placeholder: 'g',
      placeholderEn: 'g',
    },
    {
      key: 'amnioticFluidIndex',
      label: 'AFI',
      labelEn: 'Amniotic Fluid Index',
      type: 'text',
      required: false,
      section: 'fetal',
      order: 6,
      placeholder: 'cm',
      placeholderEn: 'cm',
    },
    {
      key: 'placentaLocation',
      label: '태반 위치',
      labelEn: 'Placenta Location',
      type: 'select',
      required: false,
      section: 'fetal',
      order: 7,
      options: [
        { value: 'anterior', label: '전벽', labelEn: 'Anterior' },
        { value: 'posterior', label: '후벽', labelEn: 'Posterior' },
        { value: 'fundal', label: '저부', labelEn: 'Fundal' },
        { value: 'lateral', label: '측벽', labelEn: 'Lateral' },
        { value: 'low-lying', label: '저위치', labelEn: 'Low-lying' },
        { value: 'previa', label: '전치태반', labelEn: 'Previa' },
      ],
    },
    {
      key: 'placentaGrade',
      label: '태반 성숙도',
      labelEn: 'Placenta Grade',
      type: 'select',
      required: false,
      section: 'fetal',
      order: 8,
      options: [
        { value: '0', label: 'Grade 0', labelEn: 'Grade 0' },
        { value: '1', label: 'Grade I', labelEn: 'Grade I' },
        { value: '2', label: 'Grade II', labelEn: 'Grade II' },
        { value: '3', label: 'Grade III', labelEn: 'Grade III' },
      ],
    },
    {
      key: 'umbilicalCord',
      label: '제대',
      labelEn: 'Umbilical Cord',
      type: 'text',
      required: false,
      section: 'fetal',
      order: 9,
      placeholder: '3-vessel cord, nuchal cord 유무',
      placeholderEn: '3-vessel cord, nuchal cord presence',
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
      placeholder: 'BP, HR, RR, BT',
      placeholderEn: 'BP, HR, RR, BT',
    },
    {
      key: 'weight',
      label: '체중',
      labelEn: 'Weight',
      type: 'text',
      required: false,
      section: 'examination',
      order: 2,
      placeholder: 'kg (임신 전 체중, 현재 체중)',
      placeholderEn: 'kg (pre-pregnancy weight, current weight)',
    },
    {
      key: 'fundalHeight',
      label: '자궁 저부 높이',
      labelEn: 'Fundal Height',
      type: 'text',
      required: false,
      section: 'examination',
      order: 3,
      placeholder: 'cm',
      placeholderEn: 'cm',
    },
    {
      key: 'cervicalExam',
      label: '자궁경부 검사',
      labelEn: 'Cervical Exam',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 4,
      placeholder: '개대, 소실, Station, Bishop score',
      placeholderEn: 'Dilation, effacement, station, Bishop score',
    },
    {
      key: 'membraneStatus',
      label: '양막 상태',
      labelEn: 'Membrane Status',
      type: 'select',
      required: false,
      section: 'examination',
      order: 5,
      options: [
        { value: 'intact', label: '양막 보존', labelEn: 'Intact' },
        { value: 'srom', label: 'SROM (자연 파막)', labelEn: 'SROM' },
        { value: 'arom', label: 'AROM (인공 파막)', labelEn: 'AROM' },
        { value: 'pprom', label: 'PPROM (조기 양막 파수)', labelEn: 'PPROM' },
      ],
    },
    {
      key: 'contractions',
      label: '자궁 수축',
      labelEn: 'Contractions',
      type: 'text',
      required: false,
      section: 'examination',
      order: 6,
      placeholder: '빈도, 강도, 지속시간',
      placeholderEn: 'Frequency, intensity, duration',
    },
    {
      key: 'nstResult',
      label: 'NST 결과',
      labelEn: 'NST Result',
      type: 'select',
      required: false,
      section: 'examination',
      order: 7,
      options: [
        { value: 'reactive', label: 'Reactive', labelEn: 'Reactive' },
        { value: 'nonreactive', label: 'Non-reactive', labelEn: 'Non-reactive' },
        { value: 'variable', label: 'Variable deceleration', labelEn: 'Variable deceleration' },
        { value: 'late', label: 'Late deceleration', labelEn: 'Late deceleration' },
      ],
    },
    {
      key: 'ultrasoundFindings',
      label: '초음파 소견',
      labelEn: 'Ultrasound Findings',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 8,
      placeholder: 'BPD, FL, AC, EFW',
      placeholderEn: 'BPD, FL, AC, EFW',
    },
    {
      key: 'labResults',
      label: '검사 결과',
      labelEn: 'Lab Results',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 9,
      placeholder: 'CBC, 혈당, 소변검사, GBS 등',
      placeholderEn: 'CBC, glucose, urinalysis, GBS, etc.',
    },
    {
      key: 'screeningResults',
      label: '선별검사 결과',
      labelEn: 'Screening Results',
      type: 'textarea',
      required: false,
      section: 'examination',
      order: 10,
      placeholder: '기형아 검사, NIPT, GDM 검사 등',
      placeholderEn: 'Anomaly screening, NIPT, GDM test, etc.',
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
      key: 'treatment',
      label: '치료/처치',
      labelEn: 'Treatment',
      type: 'textarea',
      required: false,
      section: 'diagnosis',
      order: 2,
    },
    {
      key: 'medications',
      label: '투약',
      labelEn: 'Medications',
      type: 'textarea',
      required: false,
      section: 'diagnosis',
      order: 3,
    },
    {
      key: 'plan',
      label: '향후 계획',
      labelEn: 'Plan',
      type: 'textarea',
      required: false,
      section: 'diagnosis',
      order: 4,
    },

    // Delivery Information
    {
      key: 'deliveryDate',
      label: '분만일시',
      labelEn: 'Delivery Date/Time',
      type: 'text',
      required: false,
      section: 'delivery',
      order: 1,
      placeholder: 'YYYY-MM-DD HH:MM',
      placeholderEn: 'YYYY-MM-DD HH:MM',
    },
    {
      key: 'deliveryType',
      label: '분만 방법',
      labelEn: 'Delivery Type',
      type: 'select',
      required: false,
      section: 'delivery',
      order: 2,
      options: [
        { value: 'nsvd', label: 'NSVD (자연분만)', labelEn: 'NSVD (Vaginal Delivery)' },
        { value: 'cs-elective', label: 'C/S (선택적)', labelEn: 'Elective C-Section' },
        { value: 'cs-emergency', label: 'C/S (응급)', labelEn: 'Emergency C-Section' },
        { value: 'vacuum', label: '흡입분만', labelEn: 'Vacuum Delivery' },
        { value: 'forceps', label: '겸자분만', labelEn: 'Forceps Delivery' },
        { value: 'vbac', label: 'VBAC', labelEn: 'VBAC' },
      ],
    },
    {
      key: 'csIndication',
      label: 'C/S 적응증',
      labelEn: 'C/S Indication',
      type: 'text',
      required: false,
      section: 'delivery',
      order: 3,
    },
    {
      key: 'laborDuration',
      label: '분만 소요시간',
      labelEn: 'Labor Duration',
      type: 'text',
      required: false,
      section: 'delivery',
      order: 4,
      placeholder: '1기, 2기, 3기',
      placeholderEn: '1st stage, 2nd stage, 3rd stage',
    },
    {
      key: 'anesthesia',
      label: '마취',
      labelEn: 'Anesthesia',
      type: 'select',
      required: false,
      section: 'delivery',
      order: 5,
      options: [
        { value: 'none', label: '없음', labelEn: 'None' },
        { value: 'epidural', label: '경막외마취', labelEn: 'Epidural' },
        { value: 'spinal', label: '척추마취', labelEn: 'Spinal' },
        { value: 'general', label: '전신마취', labelEn: 'General' },
        { value: 'local', label: '국소마취', labelEn: 'Local' },
      ],
    },
    {
      key: 'episiotomy',
      label: '회음절개',
      labelEn: 'Episiotomy',
      type: 'select',
      required: false,
      section: 'delivery',
      order: 6,
      options: [
        { value: 'none', label: '없음', labelEn: 'None' },
        { value: 'midline', label: '정중절개', labelEn: 'Midline' },
        { value: 'mediolateral', label: '정중측절개', labelEn: 'Mediolateral' },
      ],
    },
    {
      key: 'perinealLaceration',
      label: '회음 열상',
      labelEn: 'Perineal Laceration',
      type: 'select',
      required: false,
      section: 'delivery',
      order: 7,
      options: [
        { value: 'none', label: '없음', labelEn: 'None' },
        { value: '1st', label: '1도', labelEn: '1st Degree' },
        { value: '2nd', label: '2도', labelEn: '2nd Degree' },
        { value: '3rd', label: '3도', labelEn: '3rd Degree' },
        { value: '4th', label: '4도', labelEn: '4th Degree' },
      ],
    },
    {
      key: 'estimatedBloodLoss',
      label: '출혈량',
      labelEn: 'Estimated Blood Loss',
      type: 'text',
      required: false,
      section: 'delivery',
      order: 8,
      placeholder: 'mL',
      placeholderEn: 'mL',
    },
    {
      key: 'deliveryComplications',
      label: '분만 합병증',
      labelEn: 'Delivery Complications',
      type: 'textarea',
      required: false,
      section: 'delivery',
      order: 9,
    },
    {
      key: 'newbornSex',
      label: '신생아 성별',
      labelEn: 'Newborn Sex',
      type: 'select',
      required: false,
      section: 'delivery',
      order: 10,
      options: [
        { value: 'male', label: '남아', labelEn: 'Male' },
        { value: 'female', label: '여아', labelEn: 'Female' },
      ],
    },
    {
      key: 'birthWeight',
      label: '출생 체중',
      labelEn: 'Birth Weight',
      type: 'text',
      required: false,
      section: 'delivery',
      order: 11,
      placeholder: 'g',
      placeholderEn: 'g',
    },
    {
      key: 'apgarScore',
      label: 'Apgar Score',
      labelEn: 'Apgar Score',
      type: 'text',
      required: false,
      section: 'delivery',
      order: 12,
      placeholder: '1분/5분',
      placeholderEn: '1 min/5 min',
    },
    {
      key: 'newbornStatus',
      label: '신생아 상태',
      labelEn: 'Newborn Status',
      type: 'textarea',
      required: false,
      section: 'delivery',
      order: 13,
    },
    {
      key: 'postpartumCourse',
      label: '산후 경과',
      labelEn: 'Postpartum Course',
      type: 'textarea',
      required: false,
      section: 'delivery',
      order: 14,
    },
  ],

  aiPrompt: `당신은 산과 전문의입니다. 다음 산과 의무기록을 분석하여 구조화된 JSON으로 추출해주세요.

추출할 필드:
- chiefComplaint: 주소
- lmp: LMP (YYYY-MM-DD)
- menstrualCycle: 월경 주기
- pastMedicalHistory: 과거력
- pastObstetricHistory: 과거 산과력
- familyHistory: 가족력
- gravidity: 임신 횟수 (숫자)
- parity: 분만력 (T-P-A-L)
- gestationalAge: 임신 주수
- edd: 분만예정일 (YYYY-MM-DD)
- eddBasis: EDC 기준 (lmp/us-early/us-late/ivf)
- prenatalVisits: 산전 진찰 횟수
- prenatalCourse: 산전 경과
- riskFactors: 위험 요인 배열
- fetalCount: 태아 수 (singleton/twins/triplets/more)
- fetalPresentation: 태위 (cephalic/breech/transverse/oblique)
- fetalHeartRate: 태아 심박수
- fetalMovement: 태동 (good/decreased/absent)
- estimatedFetalWeight: 추정 태아 체중
- amnioticFluidIndex: AFI
- placentaLocation: 태반 위치
- placentaGrade: 태반 성숙도 (0/1/2/3)
- umbilicalCord: 제대
- vitalSigns: 활력징후
- weight: 체중
- fundalHeight: 자궁 저부 높이
- cervicalExam: 자궁경부 검사
- membraneStatus: 양막 상태 (intact/srom/arom/pprom)
- contractions: 자궁 수축
- nstResult: NST 결과
- ultrasoundFindings: 초음파 소견
- labResults: 검사 결과
- screeningResults: 선별검사 결과
- diagnosis: 진단
- treatment: 치료/처치
- medications: 투약
- plan: 향후 계획
- deliveryDate: 분만일시
- deliveryType: 분만 방법 (nsvd/cs-elective/cs-emergency/vacuum/forceps/vbac)
- csIndication: C/S 적응증
- laborDuration: 분만 소요시간
- anesthesia: 마취 (none/epidural/spinal/general/local)
- episiotomy: 회음절개 (none/midline/mediolateral)
- perinealLaceration: 회음 열상 (none/1st/2nd/3rd/4th)
- estimatedBloodLoss: 출혈량
- deliveryComplications: 분만 합병증
- newbornSex: 신생아 성별 (male/female)
- birthWeight: 출생 체중
- apgarScore: Apgar Score
- newbornStatus: 신생아 상태
- postpartumCourse: 산후 경과

해당 정보가 없으면 null로 설정하세요. 배열 필드는 해당하는 값들의 배열로 반환하세요. JSON만 반환하세요.`,
};
