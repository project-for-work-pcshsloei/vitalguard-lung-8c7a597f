import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTTS } from "@/hooks/use-tts";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { analyzeRisk } from "@/lib/ai.functions";
import {
  calcRisk, simulateVOCs, simulateVOCsNormal, simulateVOCsRisk, vocStatus, VOC_META,
  ENV_LABELS, HISTORY_LABELS, type SmokingStatus,
} from "@/lib/risk";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Wind, Loader2, Volume2, RefreshCw, Activity, FlaskConical,
  CircleCheckBig, Sparkles, Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assessment")({
  head: () => ({ meta: [{ title: "ประเมินความเสี่ยง — VitalGuard Expert" }] }),
  component: Assessment,
});

type StepKey = 0 | 1 | 2;

const VOC_ICONS: Record<string, string> = {
  TGS2600: "🧪", TGS2602: "⚗️", TGS2611: "🛢️", TGS2620: "💧",
  TGS2612: "🌬️", TGS2622: "🔥", MQ2: "🫁", MQ3: "🧬",
  MQ4: "🔋", MQ5: "⚡", MQ7: "🚭", MQ9: "🧯", MQ135: "🌫️",
};

const STATUS_STYLES: Record<string, { bg: string; chip: string; label: string }> = {
  normal:   { bg: "bg-emerald-50 border-emerald-200", chip: "bg-emerald-500 text-white", label: "ปกติ" },
  elevated: { bg: "bg-orange-50 border-orange-200", chip: "bg-orange-500 text-white", label: "เริ่มสูง" },
  high:     { bg: "bg-red-50 border-red-200", chip: "bg-red-500 text-white", label: "เสี่ยงสูง" },
};

function Stepper({ step }: { step: StepKey }) {
  const steps = [
    { i: 0, label: "อ่านค่า VOCs", icon: FlaskConical },
    { i: 1, label: "แบบสอบถาม", icon: Activity },
    { i: 2, label: "วิเคราะห์ด้วย AI", icon: Sparkles },
  ];
  return (
    <div className="rounded-3xl bg-white p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-2">
        {steps.map((s, idx) => {
          const done = step > s.i;
          const current = step === s.i;
          const Icon = s.icon;
          return (
            <div key={s.i} className="flex flex-1 items-center gap-3">
              <div className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold transition",
                done && "bg-gradient-to-br from-blue-600 to-orange-500 text-white shadow-lg",
                current && "bg-gradient-to-br from-blue-600 to-orange-500 text-white shadow-lg ring-4 ring-blue-100",
                !done && !current && "bg-slate-100 text-slate-400",
              )}>
                {done ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs text-slate-500">ขั้นตอนที่ {s.i + 1}</div>
                <div className={cn("text-sm font-semibold", current ? "text-slate-900" : "text-slate-500")}>{s.label}</div>
              </div>
              {idx < steps.length - 1 && (
                <div className={cn("ml-auto hidden h-1 flex-1 rounded sm:block", done ? "bg-gradient-to-r from-blue-400 to-orange-400" : "bg-slate-100")} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SpeakButton({ text, id, className }: { text: string; id?: string; className?: string }) {
  const { speak, stop, speakingId } = useTTS();
  const active = speakingId === id;
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); active ? stop() : speak(text, id); }}
      className={cn(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition",
        active ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 hover:bg-blue-100",
        className,
      )}
      aria-label="ฟังเสียงอ่าน"
    >
      <Volume2 className="h-4 w-4" />
    </button>
  );
}

function VOCCard({ name, value }: { name: string; value: number }) {
  const meta = VOC_META[name];
  const status = vocStatus(name, value);
  const style = STATUS_STYLES[status];
  return (
    <div className={cn("relative rounded-2xl border p-4 transition", style.bg)}>
      <div className="absolute right-3 top-3 text-2xl opacity-60">{VOC_ICONS[name] ?? "🔬"}</div>
      <div className="text-xs font-medium text-slate-600">{name}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold tabular-nums text-slate-900">{value}</span>
        <span className="text-xs text-slate-500">{meta.unit}</span>
      </div>
      <div className={cn("mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", style.chip)}>
        {style.label}
      </div>
      <div className="mt-2 text-[11px] leading-snug text-slate-600">
        {meta.iarc ? <span className="font-semibold text-slate-700">{meta.iarc} · </span> : null}
        {meta.source}
      </div>
    </div>
  );
}

type ChoiceOption = { v: string; l: string };
function ChoiceGroup({
  title, options, value, onChange, multi = false,
}: {
  title: string; options: ChoiceOption[];
  value: string | string[]; onChange: (v: any) => void;
  multi?: boolean;
}) {
  const isSelected = (v: string) => multi ? (value as string[]).includes(v) : value === v;
  const toggle = (v: string) => {
    if (multi) {
      const arr = value as string[];
      onChange(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);
    } else onChange(v);
  };
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        <SpeakButton text={title} id={`q-${title}`} />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map(o => {
          const sel = isSelected(o.v);
          return (
            <button
              key={o.v}
              type="button"
              onClick={() => toggle(o.v)}
              className={cn(
                "group flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-medium transition",
                sel
                  ? "border-blue-600 bg-gradient-to-r from-blue-50 to-orange-50 text-slate-900 shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/40",
              )}
            >
              <span className="flex items-center gap-2">
                <span className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border-2 transition",
                  sel ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white",
                )}>
                  {sel && <Check className="h-3 w-3" />}
                </span>
                {o.l}
              </span>
              <SpeakButton text={o.l} id={`opt-${title}-${o.v}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Assessment() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const analyzeFn = useServerFn(analyzeRisk);

  const [step, setStep] = useState<StepKey>(0);
  const [vocs, setVocs] = useState<Record<string, number> | null>(null);
  const [scanTime, setScanTime] = useState<Date | null>(null);
  const [scanning, setScanning] = useState(false);

  const [age, setAge] = useState(45);
  const [smokingStatus, setSmokingStatus] = useState<SmokingStatus>("never");
  const [smokingTypes, setSmokingTypes] = useState<string[]>([]);
  const [packsPerDay, setPacksPerDay] = useState(0);
  const [years, setYears] = useState(0);
  const [yearsSinceQuit, setYearsSinceQuit] = useState(0);
  const [environment, setEnvironment] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    // read age from profile (profile page now stores numeric age)
    supabase.from("profiles").select("age").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.age) setAge(Number(data.age));
    });
  }, [user]);

  const [vocsRiskLevel, setVocsRiskLevel] = useState<"low" | "medium" | "high" | null>(null);

  const simulateNormal = () => {
    setScanning(true);
    setVocs(null);
    setTimeout(() => {
      const s = simulateVOCsNormal();
      setVocs(s);
      setScanTime(new Date());
      setScanning(false);
      const tmp = calcRisk({ age, smoking: { status: "never" as SmokingStatus, types: [], packsPerDay: 0, years: 0, yearsSinceQuit: 0 }, environment: [], history: [], vocs: s });
      setVocsRiskLevel(tmp.level);
    }, 900 + Math.random() * 600);
  };

  const simulateRisk = () => {
    setScanning(true);
    setVocs(null);
    setTimeout(() => {
      const s = simulateVOCsRisk();
      setVocs(s);
      setScanTime(new Date());
      setScanning(false);
      const tmp = calcRisk({ age, smoking: { status: "current" as SmokingStatus, types: ["cigarette"], packsPerDay: 1, years: 10, yearsSinceQuit: 0 }, environment: ["pm25"], history: [], vocs: s });
      setVocsRiskLevel(tmp.level);
    }, 900 + Math.random() * 600);
  };

  const timeStr = useMemo(() => {
    if (!scanTime) return "";
    return scanTime.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  }, [scanTime]);

  const vocsSectionClass = vocsRiskLevel === "high" ? "bg-red-50 border-red-200"
    : vocsRiskLevel === "medium" ? "bg-orange-50 border-orange-200"
    : vocsRiskLevel === "low" ? "bg-emerald-50 border-emerald-200" : "bg-white";

  const isVocStep = step === 0;
  const isSurveyStep = step === 1;

  const goNext = () => {
    if (vocs) setStep(1);
  };

  const goBack = () => setStep(0);

  const onAnalyze = async () => {
    if (!user || !vocs) { toast.error("กรุณาตรวจค่า VOCs ก่อน"); return; }
    setAnalyzing(true);
    setStep(2);
    const { score, level } = calcRisk({
      age,
      smoking: { status: smokingStatus, types: smokingTypes, packsPerDay, years, yearsSinceQuit },
      environment, history, vocs,
    });

    const result = await analyzeFn({
      data: {
        riskScore: score,
        riskLevel: level === "low" ? "ต่ำ" : level === "medium" ? "ปานกลาง" : "สูง",
        vocs,
        smoking: { status: smokingStatus, type: smokingTypes, packsPerDay, years, yearsSinceQuit },
        environment: environment.map(k => ENV_LABELS[k] ?? k),
        history: [...history.map(k => HISTORY_LABELS[k] ?? k), ...symptoms],
        age,
      },
    });

    const { data: rec, error } = await supabase.from("health_records").insert({
      user_id: user.id,
      voc_values: vocs,
      symptoms: { age, smoking: { status: smokingStatus, types: smokingTypes, packsPerDay, years, yearsSinceQuit }, environment, history, symptoms },
      risk_level: level,
      risk_score: score,
      ai_analysis: result.analysis,
    }).select("id").single();

    setAnalyzing(false);
    if (error || !rec) { toast.error("บันทึกผลไม่สำเร็จ"); setStep(1); return; }
    navigate({ to: "/result/$id", params: { id: rec.id } });
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <AppHeader />
      <main className="container mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div>
          <h1 className="bg-gradient-to-r from-blue-700 to-orange-600 bg-clip-text text-3xl font-bold text-transparent">
            ประเมินความเสี่ยงมะเร็งปอด
          </h1>
          <p className="mt-1 text-slate-500">ระบบ Breathomics + แบบประเมินพฤติกรรม</p>
        </div>

        <Stepper step={step} />

        {isVocStep && (
          <section className={cn("rounded-3xl p-6 shadow-[var(--shadow-card)] transition", vocsSectionClass)}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-orange-500 text-white">
                  <Wind className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">ส่วนที่ 1: การจำลองสัญญาณชีวภาพ</h2>
                  <p className="text-sm text-slate-500">สุ่มค่าเซนเซอร์ 13 ตัวตามงานวิจัย พร้อมสีบ่งชี้ภาวะความเสี่ยง</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={simulateNormal} disabled={scanning} variant="outline" size="lg" className="rounded-full">
                  {scanning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />กำลังอ่าน...</> : "สุ่มค่ากลุ่มคนปกติ"}
                </Button>
                <Button onClick={simulateRisk} disabled={scanning} className="rounded-full bg-orange-600 text-white shadow-md hover:bg-orange-700" size="lg">
                  {scanning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />กำลังอ่าน...</> : "สุ่มค่ากลุ่มเสี่ยง"}
                </Button>
              </div>
            </div>

            {!vocs && !scanning && (
              <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
                <FlaskConical className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-2 text-sm text-slate-500">กดปุ่มด้านบนเพื่อสุ่มค่าเซนเซอร์กลุ่มคนปกติหรือกลุ่มเสี่ยง</p>
              </div>
            )}

            {vocs && (
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                {Object.keys(VOC_META).map(name => (
                  <VOCCard key={name} name={name} value={vocs[name] ?? 0} />
                ))}
              </div>
            )}
          </section>
        )}

        {isSurveyStep && (
          <section className="rounded-3xl bg-white p-6 shadow-[var(--shadow-card)] space-y-7">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-blue-600 text-white">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">ส่วนที่ 2: แบบสอบถามความเสี่ยง</h2>
                <p className="text-sm text-slate-500">ตอบคำถามเพื่อให้การคำนวณผลแม่นยำ</p>
              </div>
            </div>

            <ChoiceGroup
              title="คุณเคยสูบบุหรี่หรือไม่"
              value={smokingStatus}
              onChange={(v) => setSmokingStatus(v as SmokingStatus)}
              options={[
                { v: "never", l: "ไม่เคยสูบเลย" },
                { v: "current", l: "ยังสูบอยู่ในตอนนี้" },
                { v: "former", l: "เคยสูบ แต่เลิกแล้ว" },
              ]}
            />

            {smokingStatus !== "never" && (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <div className="mb-2 text-sm font-semibold text-slate-700">จำนวนซอง / วัน</div>
                    <Input type="number" min={0} step={0.5} value={packsPerDay}
                      onChange={(e) => setPacksPerDay(Number(e.target.value))}
                      className="h-12 rounded-2xl border-2 text-lg" />
                  </div>
                  <div>
                    <div className="mb-2 text-sm font-semibold text-slate-700">สูบมากี่ปี</div>
                    <Input type="number" min={0} value={years}
                      onChange={(e) => setYears(Number(e.target.value))}
                      className="h-12 rounded-2xl border-2 text-lg" />
                  </div>
                  {smokingStatus === "former" && (
                    <div>
                      <div className="mb-2 text-sm font-semibold text-slate-700">เลิกมากี่ปีแล้ว</div>
                      <Input type="number" min={0} value={yearsSinceQuit}
                        onChange={(e) => setYearsSinceQuit(Number(e.target.value))}
                        className="h-12 rounded-2xl border-2 text-lg" />
                    </div>
                  )}
                </div>
                <ChoiceGroup
                  title="ประเภทที่สูบ (เลือกได้หลายข้อ)"
                  multi
                  value={smokingTypes}
                  onChange={setSmokingTypes}
                  options={[
                    { v: "cigarette", l: "บุหรี่ธรรมดา" },
                    { v: "ecig", l: "บุหรี่ไฟฟ้า / Vape" },
                    { v: "cannabis", l: "กัญชา (เสี่ยงกว่าบุหรี่ 2 เท่า)" },
                  ]}
                />
              </>
            )}

            <ChoiceGroup
              title="สภาพแวดล้อม / อาชีพที่ต้องเจอเป็นประจำ"
              multi
              value={environment}
              onChange={setEnvironment}
              options={Object.entries(ENV_LABELS).map(([k, l]) => ({ v: k, l }))}
            />

            <ChoiceGroup
              title="ประวัติสุขภาพและพันธุกรรม"
              multi
              value={history}
              onChange={setHistory}
              options={Object.entries(HISTORY_LABELS).map(([k, l]) => ({ v: k, l }))}
            />

            <ChoiceGroup
              title="อาการเบื้องต้นที่พบบ่อย (ถ้ามี)"
              multi
              value={symptoms}
              onChange={setSymptoms}
              options={[
                { v: "ไอเรื้อรังเกิน 3 สัปดาห์", l: "ไอเรื้อรังเกิน 3 สัปดาห์" },
                { v: "ไอเป็นเลือดหรือมีเสมหะปนเลือด", l: "ไอเป็นเลือดหรือมีเสมหะปนเลือด" },
                { v: "เหนื่อยง่าย หายใจลำบาก", l: "เหนื่อยง่าย หายใจลำบาก" },
                { v: "เจ็บหน้าอกเรื้อรัง", l: "เจ็บหน้าอกเรื้อรัง" },
                { v: "น้ำหนักลดโดยไม่ทราบสาเหตุ", l: "น้ำหนักลดโดยไม่ทราบสาเหตุ" },
                { v: "เสียงแหบเรื้อรัง", l: "เสียงแหบเรื้อรัง" },
              ]}
            />
          </section>
        )}

        <div className="sticky bottom-4 z-10">
          {isVocStep && (
            <Button
              size="lg"
              disabled={!vocs}
              onClick={goNext}
              className="h-16 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-orange-600 text-lg font-semibold text-white shadow-xl hover:from-blue-700 hover:to-orange-700"
            >
              {vocs ? "ถัดไป" : "กรุณาสุ่มค่าสำหรับไปขั้นตอนถัดไป"}
            </Button>
          )}
          {isSurveyStep && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="outline"
                size="lg"
                onClick={goBack}
                className="h-16 w-full rounded-2xl border-blue-600 text-blue-600"
              >
                ย้อนกลับ
              </Button>
              <Button
                size="lg"
                disabled={analyzing}
                onClick={onAnalyze}
                className="h-16 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-orange-600 text-lg font-semibold text-white shadow-xl hover:from-blue-700 hover:to-orange-700"
              >
                {analyzing
                  ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />กำลังวิเคราะห์...</>
                  : <><CircleCheckBig className="mr-2 h-5 w-5" />คำนวณผลลัพธ์</>}
              </Button>
            </div>
          )}
          {!vocs && isVocStep && <p className="mt-2 text-center text-sm text-slate-500">กรุณากดสุ่มค่าก่อนเพื่อไปยังขั้นตอนถัดไป</p>}
        </div>
      </main>
    </div>
  );
}
