// 템플릿 필드 타입
export type FieldType = 'text' | 'textarea' | 'select' | 'date' | 'number' | 'checkbox' | 'multiselect';

// 필드 정의
export interface FieldDefinition {
  key: string;
  label: string;
  labelEn?: string;
  type: FieldType;
  required: boolean;
  section: string;
  order: number;
  options?: { value: string; label: string; labelEn?: string }[];
  placeholder?: string;
  placeholderEn?: string;
  defaultValue?: string | number | boolean | string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// 섹션 정의
export interface SectionDefinition {
  key: string;
  title: string;
  titleEn?: string;
  order: number;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

// 과별 템플릿
export interface DepartmentTemplate {
  departmentKey: string;
  departmentName: string;
  departmentNameEn: string;
  version: string;
  sections: SectionDefinition[];
  fields: FieldDefinition[];
  aiPrompt: string;
}

// 과별 데이터 타입 (DB에 저장되는 JSON)
export type DepartmentData = Record<string, string | number | boolean | string[] | null>;

// 과 목록 타입
export type DepartmentKey =
  | 'internal-medicine'
  | 'surgery'
  | 'radiology'
  | 'emergency'
  | 'dermatology'
  | 'cosmetic-dermatology'
  | 'ophthalmology'
  | 'obstetrics'
  | 'gynecology'
  | 'pediatrics'
  | 'ent'
  | 'pathology'
  | 'dentistry';

// 과 정보 (선택 UI용)
export interface DepartmentInfo {
  key: DepartmentKey;
  name: string;
  nameEn: string;
  icon?: string;
}

export const DEPARTMENTS: DepartmentInfo[] = [
  { key: 'internal-medicine', name: '내과', nameEn: 'Internal Medicine' },
  { key: 'surgery', name: '외과', nameEn: 'Surgery' },
  { key: 'radiology', name: '영상의학과', nameEn: 'Radiology' },
  { key: 'emergency', name: '응급의학과', nameEn: 'Emergency Medicine' },
  { key: 'dermatology', name: '피부과', nameEn: 'Dermatology' },
  { key: 'cosmetic-dermatology', name: '미용/피부시술', nameEn: 'Cosmetic Dermatology' },
  { key: 'ophthalmology', name: '안과', nameEn: 'Ophthalmology' },
  { key: 'obstetrics', name: '산과', nameEn: 'Obstetrics' },
  { key: 'gynecology', name: '부인과', nameEn: 'Gynecology' },
  { key: 'pediatrics', name: '소아청소년과', nameEn: 'Pediatrics' },
  { key: 'ent', name: '이비인후과', nameEn: 'ENT' },
  { key: 'pathology', name: '병리과', nameEn: 'Pathology' },
  { key: 'dentistry', name: '치과', nameEn: 'Dentistry' },
];
