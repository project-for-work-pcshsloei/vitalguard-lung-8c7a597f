// Risk scoring logic
export type SmokingStatus = "never" | "current" | "former";
export type SmokingInput = {
  status: SmokingStatus;
  types: string[]; // 'cigarette' | 'ecig' | 'cannabis'
  packsPerDay: number;
  years: number;
  yearsSinceQuit: number;
};

export type AssessmentInput = {
  age: number;
  smoking: SmokingInput;
  environment: string[]; // keys: asbestos, metal, mining, radon, pm25
  history: string[]; // chronic_lung, family_cancer
  vocs: Record<string, number>;
};

export const ENV_LABELS: Record<string, string> = {
  asbestos: "ฝุ่นจากการรื้อตึกเก่า/งานฝ้าเพดาน/หลังคา/ซ่อมเบรก-คลัตช์",
  metal: "งานชุบโลหะ/เชื่อมเหล็ก/ผลิตสแตนเลส/โรงฟอกหนัง",
  mining: "ฝุ่นจากการเจาะดิน-หิน/โรงโม่หิน/โรงแต่งแร่",
  radon: "อยู่ห้องใต้ดินหรือชั้นล่างที่อากาศไม่ถ่ายเท",
  pm25: "พื้นที่ฝุ่น PM2.5 สูงเป็นประจำ",
};

export const HISTORY_LABELS: Record<string, string> = {
  chronic_lung: "โรคปอดเรื้อรัง (เช่น COPD, หอบหืดรุนแรง)",
  family_cancer: "ครอบครัวเป็นมะเร็งก่อนอายุ 65",
};

export function calcRisk(input: AssessmentInput) {
  let score = 0;
  const { smoking, environment, history, vocs } = input;

  // Smoking — highest weight (max ~55)
  const packYears = smoking.packsPerDay * smoking.years;
  let smokingScore = 0;
  if (smoking.status === "current") {
    smokingScore = Math.min(40, packYears * 1.5);
    if (smoking.types.includes("cannabis")) smokingScore += 15; // 2x risk
    if (smoking.types.includes("ecig")) smokingScore += 5;
    if (smoking.types.includes("cigarette")) smokingScore += 5;
  } else if (smoking.status === "former") {
    let base = Math.min(35, packYears * 1.2);
    if (smoking.yearsSinceQuit > 10) base *= 0.4;
    else if (smoking.yearsSinceQuit > 5) base *= 0.65;
    smokingScore = base;
  }
  score += smokingScore;

  // Environment — moderate weight
  const envWeights: Record<string, number> = {
    asbestos: 8, metal: 6, mining: 7, radon: 5, pm25: 4,
  };
  environment.forEach(k => { score += envWeights[k] ?? 0; });

  // History
  if (history.includes("chronic_lung")) score += 8;
  if (history.includes("family_cancer")) score += 6;

  // Age
  if (input.age >= 50) score += 5;
  if (input.age >= 65) score += 5;

  // VOCs contribution — based on threshold exceedance count
  let vocPts = 0;
  for (const [name, value] of Object.entries(vocs)) {
    const s = vocStatus(name, value);
    if (s === "elevated") vocPts += 2;
    else if (s === "high") vocPts += 5;
  }
  score += Math.min(20, vocPts);

  score = Math.max(0, Math.min(100, Math.round(score)));

  let level: "low" | "medium" | "high" = "low";
  if (score >= 60) level = "high";
  else if (score >= 30) level = "medium";

  return { score, level, packYears };
}

export function simulateVOCs(): Record<string, number> {
  const r = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100;
  return {
    Benzene: r(0.02, 0.8),
    Formaldehyde: r(0.01, 0.15),
    Toluene: r(0.05, 1.2),
    Acetone: r(0.3, 3.0),
    Isoprene: r(0.05, 0.6),
    Pentane: r(0.05, 0.8),
    Hexanal: r(0.01, 0.4),
    "2-Butanone": r(0.02, 0.5),
  };
}

export type VocStatus = "normal" | "elevated" | "high";
export type VocMeta = {
  unit: string;
  thresholds: [number, number];
  source: string;
  iarc?: string;
};

export const VOC_META: Record<string, VocMeta> = {
  Benzene:       { unit: "ppm", thresholds: [0.1, 0.5],   source: "ควันบุหรี่ / น้ำมันเชื้อเพลิง", iarc: "IARC กลุ่ม 1" },
  Formaldehyde:  { unit: "ppm", thresholds: [0.05, 0.1],  source: "เฟอร์นิเจอร์ MDF / ควันบุหรี่",  iarc: "IARC กลุ่ม 1" },
  Toluene:       { unit: "ppm", thresholds: [0.2, 1.0],   source: "ทินเนอร์ / สีทาบ้าน / โรงงาน" },
  Acetone:       { unit: "ppm", thresholds: [0.8, 2.0],   source: "เมตาบอลิซึม / น้ำยาล้างเล็บ" },
  Isoprene:      { unit: "ppm", thresholds: [0.2, 0.45],  source: "Biomarker มะเร็งปอด" },
  Pentane:       { unit: "ppm", thresholds: [0.2, 0.5],   source: "Biomarker oxidative stress" },
  Hexanal:       { unit: "ppm", thresholds: [0.05, 0.15], source: "Biomarker มะเร็งปอด (lipid peroxidation)" },
  "2-Butanone":  { unit: "ppm", thresholds: [0.1, 0.3],   source: "Biomarker มะเร็งปอด" },
};

export function vocStatus(name: string, value: number): VocStatus {
  const meta = VOC_META[name];
  if (!meta) return "normal";
  const [n, e] = meta.thresholds;
  if (value <= n) return "normal";
  if (value <= e) return "elevated";
  return "high";
}

export const RISK_LABEL: Record<string, string> = {
  low: "ต่ำ",
  medium: "ปานกลาง",
  high: "สูง",
};
