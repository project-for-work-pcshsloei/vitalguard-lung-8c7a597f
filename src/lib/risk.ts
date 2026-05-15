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

  // VOCs contribution
  const benzene = vocs.Benzene ?? 0;
  const pentane = vocs.Pentane ?? 0;
  const total = (vocs.Benzene ?? 0) + (vocs.Pentane ?? 0) + (vocs.Acetone ?? 0) + (vocs.Toluene ?? 0);
  score += Math.min(8, benzene * 0.4);
  score += Math.min(5, pentane * 0.3);
  score += Math.min(5, total * 0.05);

  score = Math.max(0, Math.min(100, Math.round(score)));

  let level: "low" | "medium" | "high" = "low";
  if (score >= 60) level = "high";
  else if (score >= 30) level = "medium";

  return { score, level, packYears };
}

export function simulateVOCs(): Record<string, number> {
  const r = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 10) / 10;
  return {
    Benzene: r(0.5, 12),
    Pentane: r(1, 15),
    Acetone: r(2, 25),
    Toluene: r(0.5, 10),
    Isoprene: r(1, 8),
  };
}

export const RISK_LABEL: Record<string, string> = {
  low: "ต่ำ",
  medium: "ปานกลาง",
  high: "สูง",
};
