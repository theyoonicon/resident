import { prisma } from "@/lib/prisma";

const sampleRawContent = `65 y/o male with pneumonia

C.C: Cough, fever for 5 days
O/S: Started 5 days ago
P.I: Cough started 5 days ago, initially dry but productive with purulent sputum since 3 days ago.
Persistent fever above 38.5°C with chills. Right chest pain (worse with breathing)
Anorexia, general weakness (+)

P.Hx: HTN (+) - Amlodipine 5mg qd
DM (+) - Metformin 500mg bid
COPD (+) - Tiotropium inhaler
Ex-smoker (30 pack-years, quit 5 years ago)

V/S: BP 100/60, HR 102, RR 24, BT 38.8, SpO2 91% (RA)

P/E: Acute ill-looking
Lung: Crackles at Rt. lower lung field, decreased breath sound
Heart: Regular, no murmur

Lab: WBC 15,200 (Seg 85%), CRP 18.5, PCT 2.1
ABG: pH 7.45, pCO2 32, pO2 58, HCO3 22

Chest X-ray: RLL consolidation with air-bronchogram

A: Community-acquired pneumonia, CURB-65 score 3 (High risk)

P:
1. Admission to general ward
2. O2 supply via nasal cannula 3L/min
3. Ceftriaxone 2g IV q24h + Azithromycin 500mg IV qd
4. Hydration
5. Chest PA f/u after 48-72hrs`;

const sampleDepartmentData = {
  chiefComplaint: "Cough, fever for 5 days",
  hpiNarrative: `Cough started 5 days ago, initially dry but productive with purulent sputum since 3 days ago.
Persistent fever above 38.5°C with chills. Right chest pain (worse with breathing)
Anorexia, general weakness (+)`,
  pastMedicalHistory: `HTN (+) - Amlodipine 5mg qd
DM (+) - Metformin 500mg bid
COPD (+) - Tiotropium inhaler
Ex-smoker (30 pack-years, quit 5 years ago)`,
  bloodPressure: "100/60 mmHg",
  heartRate: "102 bpm",
  respiratoryRate: "24 /min",
  temperature: "38.8 °C",
  oxygenSaturation: "91% (RA)",
  generalAppearance: "Acute ill-looking",
  chest: "Crackles at Rt. lower lung field, decreased breath sound",
  heart: "Regular, no murmur",
  cbcResults: "WBC 15,200 (Seg 85%), CRP 18.5, PCT 2.1",
  otherTests: "ABG: pH 7.45, pCO2 32, pO2 58, HCO3 22",
  imagingResults: "Chest X-ray: RLL consolidation with air-bronchogram",
  assessment: "Community-acquired pneumonia, CURB-65 score 3 (High risk)",
  plan: `1. Admission to general ward
2. O2 supply via nasal cannula 3L/min
3. Ceftriaxone 2g IV q24h + Azithromycin 500mg IV qd
4. Hydration
5. Chest PA f/u after 48-72hrs`,
  disposition: "admission",
};

const sampleTags = ["Pneumonia", "Internal Medicine", "Sample"];

export async function createSampleCaseForUser(userId: string) {
  try {
    const existingCase = await prisma.case.findFirst({
      where: {
        userId,
        title: "Sample Case: Community-Acquired Pneumonia",
      },
    });

    if (existingCase) {
      return null;
    }

    const tagRecords = await Promise.all(
      sampleTags.map(async (tagName) => {
        return prisma.caseTag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        });
      })
    );

    const sampleCase = await prisma.case.create({
      data: {
        userId,
        title: "Sample Case: Community-Acquired Pneumonia",
        department: "internal-medicine",
        rawContent: sampleRawContent,
        departmentData: sampleDepartmentData,
        templateVersion: "internal-medicine:1.0.0",
        date: new Date(),
        chiefComplaint: sampleDepartmentData.chiefComplaint,
        diagnosis: sampleDepartmentData.assessment,
        treatment: sampleDepartmentData.plan,
        tags: {
          create: tagRecords.map((tag) => ({
            tagId: tag.id,
          })),
        },
      },
      include: {
        tags: { include: { tag: true } },
        images: true,
      },
    });

    return sampleCase;
  } catch (error) {
    console.error(`Failed to create sample case for user ${userId}:`, error);
    return null;
  }
}
