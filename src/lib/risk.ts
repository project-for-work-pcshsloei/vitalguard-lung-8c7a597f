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

function randomValue(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function shuffle<T>(arr: T[]) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function simulateVOCs(): Record<string, number> {
  const keys = Object.keys(VOC_META);
  const out: Record<string, number> = {};
  const normalCount = Math.max(4, Math.round(keys.length * 0.6));
  const normalSensors = new Set(shuffle(keys).slice(0, normalCount));

  for (const k of keys) {
    const [n, e] = VOC_META[k].thresholds;
    if (normalSensors.has(k)) {
      // mostly normal, but allow mild elevation in some cases
      const choose = Math.random();
      if (choose < 0.85) {
        out[k] = randomValue(0, Math.max(0.001, n * 0.9));
      } else {
        out[k] = randomValue(n * 0.95, Math.min(e * 0.95, e));
      }
    } else {
      // more elevated/high values for the remaining sensors
      const choose = Math.random();
      if (choose < 0.5) {
        out[k] = randomValue(n * 0.95, Math.min(e * 0.95, e));
      } else {
        out[k] = randomValue(e * 1.0, e * 1.3);
      }
    }
  }
  return out;
}

export function simulateVOCsNormal(): Record<string, number> {
  const keys = Object.keys(VOC_META);
  const out: Record<string, number> = {};
  const elevatedCount = Math.min(3, Math.max(1, Math.round(Math.random() * 3)));
  const elevatedSensors = new Set(shuffle(keys).slice(0, elevatedCount));

  for (const [k, m] of Object.entries(VOC_META)) {
    const [n, e] = m.thresholds;
    if (elevatedSensors.has(k)) {
      const choice = Math.random();
      if (choice < 0.7) {
        out[k] = randomValue(n * 1.02, Math.min(e * 0.85, e));
      } else {
        out[k] = randomValue(Math.max(e * 0.9, n * 1.01), e * 1.05);
      }
    } else {
      out[k] = randomValue(0, Math.max(0.001, n * 0.9));
    }
  }
  return out;
}

export function simulateVOCsRisk(): Record<string, number> {
  const keys = Object.keys(VOC_META);
  const out: Record<string, number> = {};
  const normalCount = Math.max(2, Math.round(Math.random() * 4));
  const normalSensors = new Set(shuffle(keys).slice(0, normalCount));

  for (const [k, m] of Object.entries(VOC_META)) {
    const [n, e] = m.thresholds;
    if (normalSensors.has(k)) {
      out[k] = randomValue(0, Math.max(0.001, n * 0.9));
    } else {
      const choice = Math.random();
      if (choice < 0.35) {
        out[k] = randomValue(n * 1.05, Math.min(e * 0.95, e));
      } else if (choice < 0.75) {
        out[k] = randomValue(e * 1.0, e * 1.25);
      } else {
        out[k] = randomValue(e * 1.2, e * 1.5);
      }
    }
  }
  return out;
}

export type VocStatus = "normal" | "elevated" | "high";
export type VocMeta = {
  unit: string;
  thresholds: [number, number];
  source: string;
  iarc?: string;
};

export const VOC_META: Record<string, VocMeta> = {
  TGS2600: { unit: "ppm", thresholds: [20, 80], source: "เซนเซอร์ TGS2600 วัดควันและไอระเหย" },
  TGS2602: { unit: "ppm", thresholds: [10, 50], source: "เซนเซอร์ TGS2602 เฝ้าดูควันบุหรี่และกลิ่นไม่พึงประสงค์" },
  TGS2611: { unit: "ppm", thresholds: [8, 40], source: "เซนเซอร์ TGS2611 สำหรับแก๊สพิษในอากาศ" },
  TGS2620: { unit: "ppm", thresholds: [10, 45], source: "เซนเซอร์ TGS2620 ตรวจแก๊สอินทรีย์ระเหยง่าย" },
  TGS2612: { unit: "ppm", thresholds: [12, 55], source: "เซนเซอร์ TGS2612 วัดไอระเหยจากสารเคมี" },
  TGS2622: { unit: "ppm", thresholds: [5, 25], source: "เซนเซอร์ TGS2622 ตรวจกลิ่นแอมโมเนียและสารระเหย" },
  MQ2:     { unit: "ppm", thresholds: [100, 300], source: "เซนเซอร์ MQ2 สำหรับไฮโดรคาร์บอนและควัน" },
  MQ3:     { unit: "ppm", thresholds: [30, 120], source: "เซนเซอร์ MQ3 สำหรับแอลกอฮอล์และไอระเหย" },
  MQ4:     { unit: "ppm", thresholds: [40, 160], source: "เซนเซอร์ MQ4 ตรวจมีเทนและแก๊สติดไฟ" },
  MQ5:     { unit: "ppm", thresholds: [20, 90], source: "เซนเซอร์ MQ5 สำหรับก๊าซโพรเพนและไฮโดรคาร์บอน" },
  MQ7:     { unit: "ppm", thresholds: [0.5, 2.5], source: "เซนเซอร์ MQ7 ตรวจคาร์บอนมอนอกไซด์จากควัน" },
  MQ9:     { unit: "ppm", thresholds: [15, 75], source: "เซนเซอร์ MQ9 สำหรับก๊าซบิวเทนและโพรเพน" },
  MQ135:   { unit: "ppm", thresholds: [30, 150], source: "เซนเซอร์ MQ135 สำหรับแก๊สพิษและมลพิษอากาศ" },
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
