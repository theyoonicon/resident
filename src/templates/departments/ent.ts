import { DepartmentTemplate } from '../types';

export const entTemplate: DepartmentTemplate = {
  departmentKey: 'ent',
  departmentName: '이비인후과',
  departmentNameEn: 'Otorhinolaryngology (ENT)',
  version: '1.0.0',

  sections: [
    { key: 'history', title: '병력', titleEn: 'History', order: 1 },
    { key: 'ear', title: '귀 (Otology)', titleEn: 'Ear', order: 2 },
    { key: 'nose', title: '코 (Rhinology)', titleEn: 'Nose', order: 3 },
    { key: 'throat', title: '목 (Laryngology)', titleEn: 'Throat', order: 4 },
    { key: 'neck', title: '경부', titleEn: 'Neck', order: 5 },
    { key: 'diagnosis', title: '진단 및 치료', titleEn: 'Diagnosis & Treatment', order: 6 },
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
      placeholder: '예: 청력저하, 코막힘, 인후통',
      placeholderEn: 'e.g., Hearing loss, nasal obstruction, sore throat',
    },
    {
      key: 'region',
      label: '주요 부위',
      labelEn: 'Primary Region',
      type: 'select',
      required: true,
      section: 'history',
      order: 2,
      options: [
        { value: 'ear', label: '귀 (Ear)', labelEn: 'Ear' },
        { value: 'nose', label: '코 (Nose)', labelEn: 'Nose' },
        { value: 'throat', label: '목 (Throat)', labelEn: 'Throat' },
        { value: 'neck', label: '경부 (Neck)', labelEn: 'Neck' },
        { value: 'multiple', label: '복합', labelEn: 'Multiple' },
      ],
    },
    {
      key: 'laterality',
      label: '측면',
      labelEn: 'Laterality',
      type: 'select',
      required: false,
      section: 'history',
      order: 3,
      options: [
        { value: 'right', label: '우측', labelEn: 'Right' },
        { value: 'left', label: '좌측', labelEn: 'Left' },
        { value: 'bilateral', label: '양측', labelEn: 'Bilateral' },
        { value: 'na', label: '해당없음', labelEn: 'N/A' },
      ],
    },
    {
      key: 'duration',
      label: '증상 기간',
      labelEn: 'Duration',
      type: 'text',
      required: false,
      section: 'history',
      order: 4,
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
      key: 'pastHistory',
      label: '과거력',
      labelEn: 'Past History',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 6,
      placeholder: '이전 이비인후과 수술/질환',
      placeholderEn: 'Previous ENT surgeries/diseases',
    },
    {
      key: 'allergies',
      label: '알레르기',
      labelEn: 'Allergies',
      type: 'textarea',
      required: false,
      section: 'history',
      order: 7,
    },

    // Ear
    {
      key: 'earSymptoms',
      label: '귀 증상',
      labelEn: 'Ear Symptoms',
      type: 'multiselect',
      required: false,
      section: 'ear',
      order: 1,
      options: [
        { value: 'hearing-loss', label: '청력저하', labelEn: 'Hearing Loss' },
        { value: 'otalgia', label: '이통', labelEn: 'Otalgia' },
        { value: 'otorrhea', label: '이루', labelEn: 'Otorrhea' },
        { value: 'tinnitus', label: '이명', labelEn: 'Tinnitus' },
        { value: 'vertigo', label: '어지러움', labelEn: 'Vertigo' },
        { value: 'fullness', label: '이충만감', labelEn: 'Aural Fullness' },
        { value: 'itching', label: '가려움', labelEn: 'Itching' },
      ],
    },
    {
      key: 'otoscopyRight',
      label: '이경검사 (우)',
      labelEn: 'Otoscopy Right',
      type: 'textarea',
      required: false,
      section: 'ear',
      order: 2,
      placeholder: '외이도, 고막 상태',
      placeholderEn: 'External auditory canal, tympanic membrane',
    },
    {
      key: 'otoscopyLeft',
      label: '이경검사 (좌)',
      labelEn: 'Otoscopy Left',
      type: 'textarea',
      required: false,
      section: 'ear',
      order: 3,
    },
    {
      key: 'audiometry',
      label: '청력검사',
      labelEn: 'Audiometry',
      type: 'textarea',
      required: false,
      section: 'ear',
      order: 4,
      placeholder: 'PTA, SRT, WRS, Tympanometry',
      placeholderEn: 'PTA, SRT, WRS, Tympanometry',
    },
    {
      key: 'hearingLevel',
      label: '청력 수준',
      labelEn: 'Hearing Level',
      type: 'text',
      required: false,
      section: 'ear',
      order: 5,
      placeholder: 'dB (우/좌)',
      placeholderEn: 'dB (R/L)',
    },
    {
      key: 'vestibularTest',
      label: '전정기능검사',
      labelEn: 'Vestibular Test',
      type: 'textarea',
      required: false,
      section: 'ear',
      order: 6,
      placeholder: 'ENG, VNG, cVEMP, oVEMP',
      placeholderEn: 'ENG, VNG, cVEMP, oVEMP',
    },
    {
      key: 'temporalBoneCT',
      label: '측두골 CT',
      labelEn: 'Temporal Bone CT',
      type: 'textarea',
      required: false,
      section: 'ear',
      order: 7,
    },

    // Nose
    {
      key: 'nasalSymptoms',
      label: '코 증상',
      labelEn: 'Nasal Symptoms',
      type: 'multiselect',
      required: false,
      section: 'nose',
      order: 1,
      options: [
        { value: 'obstruction', label: '코막힘', labelEn: 'Nasal Obstruction' },
        { value: 'rhinorrhea', label: '콧물', labelEn: 'Rhinorrhea' },
        { value: 'sneezing', label: '재채기', labelEn: 'Sneezing' },
        { value: 'epistaxis', label: '비출혈', labelEn: 'Epistaxis' },
        { value: 'hyposmia', label: '후각저하', labelEn: 'Hyposmia' },
        { value: 'postnasal-drip', label: '후비루', labelEn: 'Postnasal Drip' },
        { value: 'facial-pain', label: '안면통', labelEn: 'Facial Pain' },
      ],
    },
    {
      key: 'anteriorRhinoscopy',
      label: '전비경검사',
      labelEn: 'Anterior Rhinoscopy',
      type: 'textarea',
      required: false,
      section: 'nose',
      order: 2,
      placeholder: '비중격, 하비갑개, 비점막',
      placeholderEn: 'Nasal septum, inferior turbinate, nasal mucosa',
    },
    {
      key: 'nasalEndoscopy',
      label: '비내시경',
      labelEn: 'Nasal Endoscopy',
      type: 'textarea',
      required: false,
      section: 'nose',
      order: 3,
      placeholder: '중비도, 후비공, 비인두',
      placeholderEn: 'Middle meatus, posterior nasal aperture, nasopharynx',
    },
    {
      key: 'sinusCT',
      label: '부비동 CT',
      labelEn: 'Sinus CT',
      type: 'textarea',
      required: false,
      section: 'nose',
      order: 4,
    },
    {
      key: 'allergyTest',
      label: '알레르기 검사',
      labelEn: 'Allergy Test',
      type: 'textarea',
      required: false,
      section: 'nose',
      order: 5,
      placeholder: 'Skin prick test, MAST',
      placeholderEn: 'Skin prick test, MAST',
    },
    {
      key: 'smellTest',
      label: '후각검사',
      labelEn: 'Smell Test',
      type: 'text',
      required: false,
      section: 'nose',
      order: 6,
    },

    // Throat
    {
      key: 'throatSymptoms',
      label: '목 증상',
      labelEn: 'Throat Symptoms',
      type: 'multiselect',
      required: false,
      section: 'throat',
      order: 1,
      options: [
        { value: 'sore-throat', label: '인후통', labelEn: 'Sore Throat' },
        { value: 'dysphagia', label: '연하곤란', labelEn: 'Dysphagia' },
        { value: 'odynophagia', label: '연하통', labelEn: 'Odynophagia' },
        { value: 'hoarseness', label: '쉰목소리', labelEn: 'Hoarseness' },
        { value: 'globus', label: '인두이물감', labelEn: 'Globus Sensation' },
        { value: 'cough', label: '기침', labelEn: 'Cough' },
        { value: 'snoring', label: '코골이', labelEn: 'Snoring' },
        { value: 'apnea', label: '수면무호흡', labelEn: 'Sleep Apnea' },
      ],
    },
    {
      key: 'oralCavity',
      label: '구강 검사',
      labelEn: 'Oral Cavity',
      type: 'textarea',
      required: false,
      section: 'throat',
      order: 2,
      placeholder: '구강, 혀, 구개',
      placeholderEn: 'Oral cavity, tongue, palate',
    },
    {
      key: 'oropharynx',
      label: '구인두 검사',
      labelEn: 'Oropharynx',
      type: 'textarea',
      required: false,
      section: 'throat',
      order: 3,
      placeholder: '편도, 후인두벽',
      placeholderEn: 'Tonsils, posterior pharyngeal wall',
    },
    {
      key: 'laryngoscopy',
      label: '후두경검사',
      labelEn: 'Laryngoscopy',
      type: 'textarea',
      required: false,
      section: 'throat',
      order: 4,
      placeholder: '후두개, 성대, 피열연골',
      placeholderEn: 'Epiglottis, vocal cords, arytenoids',
    },
    {
      key: 'stroboscopy',
      label: '스트로보스코피',
      labelEn: 'Stroboscopy',
      type: 'textarea',
      required: false,
      section: 'throat',
      order: 5,
    },
    {
      key: 'voiceAnalysis',
      label: '음성분석',
      labelEn: 'Voice Analysis',
      type: 'textarea',
      required: false,
      section: 'throat',
      order: 6,
    },
    {
      key: 'sleepStudy',
      label: '수면다원검사',
      labelEn: 'Sleep Study',
      type: 'textarea',
      required: false,
      section: 'throat',
      order: 7,
      placeholder: 'AHI, 최저 산소포화도',
      placeholderEn: 'AHI, lowest oxygen saturation',
    },

    // Neck
    {
      key: 'neckMass',
      label: '경부 종물',
      labelEn: 'Neck Mass',
      type: 'textarea',
      required: false,
      section: 'neck',
      order: 1,
      placeholder: '위치, 크기, 성상',
      placeholderEn: 'Location, size, characteristics',
    },
    {
      key: 'lymphNodes',
      label: '림프절',
      labelEn: 'Lymph Nodes',
      type: 'textarea',
      required: false,
      section: 'neck',
      order: 2,
    },
    {
      key: 'thyroidExam',
      label: '갑상선 검사',
      labelEn: 'Thyroid Exam',
      type: 'textarea',
      required: false,
      section: 'neck',
      order: 3,
    },
    {
      key: 'neckUS',
      label: '경부 초음파',
      labelEn: 'Neck Ultrasound',
      type: 'textarea',
      required: false,
      section: 'neck',
      order: 4,
    },
    {
      key: 'neckCT',
      label: '경부 CT/MRI',
      labelEn: 'Neck CT/MRI',
      type: 'textarea',
      required: false,
      section: 'neck',
      order: 5,
    },
    {
      key: 'fnab',
      label: 'FNAB',
      labelEn: 'Fine Needle Aspiration Biopsy',
      type: 'textarea',
      required: false,
      section: 'neck',
      order: 6,
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
      key: 'medicalTreatment',
      label: '약물 치료',
      labelEn: 'Medical Treatment',
      type: 'textarea',
      required: false,
      section: 'diagnosis',
      order: 3,
    },
    {
      key: 'surgicalTreatment',
      label: '수술적 치료',
      labelEn: 'Surgical Treatment',
      type: 'textarea',
      required: false,
      section: 'diagnosis',
      order: 4,
    },
    {
      key: 'voiceTherapy',
      label: '음성치료',
      labelEn: 'Voice Therapy',
      type: 'textarea',
      required: false,
      section: 'diagnosis',
      order: 5,
    },
    {
      key: 'hearingRehab',
      label: '청각재활',
      labelEn: 'Hearing Rehabilitation',
      type: 'textarea',
      required: false,
      section: 'diagnosis',
      order: 6,
      placeholder: '보청기, 인공와우',
      placeholderEn: 'Hearing aids, cochlear implant',
    },
    {
      key: 'plan',
      label: '향후 계획',
      labelEn: 'Plan',
      type: 'textarea',
      required: false,
      section: 'diagnosis',
      order: 7,
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

  aiPrompt: `당신은 이비인후과 전문의입니다. 다음 이비인후과 의무기록을 분석하여 구조화된 JSON으로 추출해주세요.

추출할 필드:
- chiefComplaint: 주소
- region: 주요 부위 (ear/nose/throat/neck/multiple)
- laterality: 측면 (right/left/bilateral/na)
- duration: 증상 기간
- presentIllness: 현병력
- pastHistory: 과거력
- allergies: 알레르기
- earSymptoms: 귀 증상 배열
- otoscopyRight, otoscopyLeft: 이경검사
- audiometry: 청력검사
- hearingLevel: 청력 수준
- vestibularTest: 전정기능검사
- temporalBoneCT: 측두골 CT
- nasalSymptoms: 코 증상 배열
- anteriorRhinoscopy: 전비경검사
- nasalEndoscopy: 비내시경
- sinusCT: 부비동 CT
- allergyTest: 알레르기 검사
- smellTest: 후각검사
- throatSymptoms: 목 증상 배열
- oralCavity: 구강 검사
- oropharynx: 구인두 검사
- laryngoscopy: 후두경검사
- stroboscopy: 스트로보스코피
- voiceAnalysis: 음성분석
- sleepStudy: 수면다원검사
- neckMass: 경부 종물
- lymphNodes: 림프절
- thyroidExam: 갑상선 검사
- neckUS: 경부 초음파
- neckCT: 경부 CT/MRI
- fnab: FNAB
- diagnosis: 진단
- differentialDiagnosis: 감별 진단
- medicalTreatment: 약물 치료
- surgicalTreatment: 수술적 치료
- voiceTherapy: 음성치료
- hearingRehab: 청각재활
- plan: 향후 계획
- followUp: 추적 일정

해당 정보가 없으면 null로 설정하세요. 배열 필드는 해당하는 값들의 배열로 반환하세요. JSON만 반환하세요.`,
};
