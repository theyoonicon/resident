import { DepartmentTemplate, DepartmentKey, DEPARTMENTS } from './types';
import { internalMedicineTemplate } from './departments/internal-medicine';
import { surgeryTemplate } from './departments/surgery';
import { radiologyTemplate } from './departments/radiology';
import { emergencyTemplate } from './departments/emergency';
import { dermatologyTemplate } from './departments/dermatology';
import { cosmeticDermatologyTemplate } from './departments/cosmetic-dermatology';
import { ophthalmologyTemplate } from './departments/ophthalmology';
import { obstetricsTemplate } from './departments/obstetrics';
import { gynecologyTemplate } from './departments/gynecology';
import { pediatricsTemplate } from './departments/pediatrics';
import { entTemplate } from './departments/ent';
import { pathologyTemplate } from './departments/pathology';
import { dentistryTemplate } from './departments/dentistry';

// 템플릿 레지스트리
const templateRegistry: Record<DepartmentKey, DepartmentTemplate> = {
  'internal-medicine': internalMedicineTemplate,
  'surgery': surgeryTemplate,
  'radiology': radiologyTemplate,
  'emergency': emergencyTemplate,
  'dermatology': dermatologyTemplate,
  'cosmetic-dermatology': cosmeticDermatologyTemplate,
  'ophthalmology': ophthalmologyTemplate,
  'obstetrics': obstetricsTemplate,
  'gynecology': gynecologyTemplate,
  'pediatrics': pediatricsTemplate,
  'ent': entTemplate,
  'pathology': pathologyTemplate,
  'dentistry': dentistryTemplate,
};

// 템플릿 가져오기
export function getTemplate(departmentKey: DepartmentKey): DepartmentTemplate {
  const template = templateRegistry[departmentKey];
  if (!template) {
    throw new Error(`Template not found for department: ${departmentKey}`);
  }
  return template;
}

// 모든 템플릿 가져오기
export function getAllTemplates(): DepartmentTemplate[] {
  return Object.values(templateRegistry);
}

// 과 키로 과 정보 가져오기
export function getDepartmentInfo(departmentKey: DepartmentKey) {
  return DEPARTMENTS.find((d) => d.key === departmentKey);
}

// 템플릿 버전 가져오기 (DB 저장용)
export function getTemplateVersion(departmentKey: DepartmentKey): string {
  const template = getTemplate(departmentKey);
  return `${departmentKey}:${template.version}`;
}

// AI 프롬프트 가져오기
export function getAiPrompt(departmentKey: DepartmentKey): string {
  const template = getTemplate(departmentKey);
  return template.aiPrompt;
}

// 타입 및 상수 re-export
export * from './types';
export {
  internalMedicineTemplate,
  surgeryTemplate,
  radiologyTemplate,
  emergencyTemplate,
  dermatologyTemplate,
  cosmeticDermatologyTemplate,
  ophthalmologyTemplate,
  obstetricsTemplate,
  gynecologyTemplate,
  pediatricsTemplate,
  entTemplate,
  pathologyTemplate,
  dentistryTemplate,
};
