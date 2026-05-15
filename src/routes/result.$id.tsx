import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, Volume2, VolumeX, CheckCircle2, RefreshCw,
  User, Cigarette, Wind, Activity, TrendingUp, BookOpen, Sparkles,
  ShieldAlert, Stethoscope, Home, History as HistoryIcon, GraduationCap,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceArea, Tooltip, CartesianGrid } from "recharts";
import { ENV_LABELS, HISTORY_LABELS, VOC_META, vocStatus } from "@/lib/risk";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/result/$id")({
  head: () => ({ meta: [{ title: "ผลการวิเคราะห์ — VitalGuard" }] }),
  component: ResultPage,
});

type Symptoms = {
  age: number;
  smoking: { status: string; types: string[]; packsPerDay: number; years: number; yearsSinceQuit: number };
  environment: string[];
  history: string[];
};

type Rec = {
  id: string;
  created_at: string;
  risk_score: number;
  risk_level: string;
  voc_values: Record<string, number>;
  ai_analysis: string | null;
  symptoms: Symptoms;
};

type Profile = { full_name: string | null; gender: string | null; birth_date: string | null };

const SMOKING_LABEL: Record<string, string> = {
  never: "ไม่เคยสูบ", current: "ยังสูบอยู่", former: "เคยสูบ (เลิกแล้ว)",
};
const SMOKE_TYPE_LABEL: Record<string, string> = {
  cigarette: "บุหรี่ธรรมดา", ecig: "บุหรี่ไฟฟ้า", cannabis: "กัญชา",
};

function buildBreakdown(s: Symptoms, vocs: Record<string, number>) {
  const items: { label: string; points: number; icon: typeof Cigarette }[] = [];
  const pY = s.smoking.packsPerDay * s.smoking.years;
  if (s.smoking.status === "current") {
    let pts = Math.min(40, pY * 1.5);
    if (s.smoking.types.includes("cannabis")) pts += 15;
    if (s.smoking.types.includes("ecig")) pts += 5;
    if (s.smoking.types.includes("cigarette")) pts += 5;
    items.push({ label: `การสูบบุหรี่ (${pY.toFixed(1)} pack-years)`, points: Math.round(pts), icon: Cigarette });
  } else if (s.smoking.status === "former") {
    let pts = Math.min(35, pY * 1.2);
    if (s.smoking.yearsSinceQuit > 10) pts *= 0.4;
    else if (s.smoking.yearsSinceQuit > 5) pts *= 0.65;
    if (pts > 0) items.push({ label: `เคยสูบ (เลิก ${s.smoking.yearsSinceQuit} ปี)`, points: Math.round(pts), icon: Cigarette });
  }
  const envW: Record<string, number> = { asbestos: 8, metal: 6, mining: 7, radon: 5, pm25: 4 };
  s.environment.forEach(k => {
    if (envW[k]) items.push({ label: ENV_LABELS[k] ?? k, points: envW[k], icon: Wind });
  });
  if (s.history.includes("chronic_lung")) items.push({ label: HISTORY_LABELS.chronic_lung, points: 8, icon: Activity });
  if (s.history.includes("family_cancer")) items.push({ label: HISTORY_LABELS.family_cancer, points: 6, icon: Activity });
  if (s.age >= 65) items.push({ label: "อายุ ≥ 65 ปี", points: 10, icon: User });
  else if (s.age >= 50) items.push({ label: "อายุ ≥ 50 ปี", points: 5, icon: User });

  let vocPts = 0;
  for (const [n, v] of Object.entries(vocs)) {
    const st = vocStatus(n, v);
    if (st === "elevated") vocPts += 2;
    else if (st === "high") vocPts += 5;
  }
  vocPts = Math.min(20, vocPts);
  if (vocPts > 0) items.push({ label: "ค่า VOCs ผิดปกติ", points: vocPts, icon: Sparkles });

  return items.sort((a, b) => b.points - a.points);
}

function ResultPage() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [rec, setRec] = useState<Rec | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<{ name: string; score: number }[]>([]);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("health_records").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      if (data) setRec(data as unknown as Rec);
    });
    supabase.from("profiles").select("full_name,gender,birth_date").eq("id", user.id).maybeSingle()
      .then(({ data }) => setProfile(data as Profile));
    supabase.from("health_records").select("created_at,risk_score").eq("user_id", user.id).order("created_at", { ascending: true }).limit(20)
      .then(({ data }) => setHistory((data ?? []).map((r, i) => ({ name: `#${i + 1}`, score: Number(r.risk_score) }))));
  }, [id, user]);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(text.replace(/\*\*/g, "").replace(/\[|\]/g, ""));
    u.lang = "th-TH"; u.rate = 0.85; u.pitch = 0.9;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  useEffect(() => () => { if (typeof window !== "undefined") window.speechSynthesis?.cancel(); }, []);

  const breakdown = useMemo(() => rec ? buildBreakdown(rec.symptoms, rec.voc_values) : [], [rec]);

  if (loading || !rec) return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <div className="p-12 text-center text-muted-foreground">กำลังโหลดผลการวิเคราะห์...</div>
    </div>
  );

  const score = Number(rec.risk_score);
  const level = rec.risk_level;
  const isHigh = level === "high";
  const isMed = level === "medium";

  // theme tokens
  const accent = isHigh ? "#dc2626" : isMed ? "#f97316" : "#16a34a";
  const accentBg = isHigh ? "bg-red-50" : isMed ? "bg-orange-50" : "bg-green-50";
  const accentBorder = isHigh ? "border-red-200" : isMed ? "border-orange-200" : "border-green-200";
  const accentText = isHigh ? "text-red-600" : isMed ? "text-orange-600" : "text-green-600";
  const levelLabel = isHigh ? "ความเสี่ยงสูง" : isMed ? "ความเสี่ยงปานกลาง" : "ความเสี่ยงต่ำ";

  // Gauge
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;

  // Age
  const age = rec.symptoms?.age ?? (profile?.birth_date ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear() : null);
  const genderLabel = profile?.gender === "male" ? "ชาย" : profile?.gender === "female" ? "หญิง" : "ไม่ระบุ";

  // Immediate advice based on level
  const immediate = isHigh ? [
    "ปรึกษาแพทย์เฉพาะทางปอดทันทีเพื่อตรวจ Low-dose CT",
    "หยุดสูบบุหรี่และหลีกเลี่ยงควันบุหรี่มือสองโดยสิ้นเชิง",
    "ใส่หน้ากาก N95 เมื่อต้องอยู่ในพื้นที่ฝุ่นหรือสารเคมี",
    "ตรวจสุขภาพปอดประจำทุก 6 เดือน",
  ] : isMed ? [
    "ลด/เลิกสูบบุหรี่อย่างจริงจังและขอความช่วยเหลือจากคลินิกอดบุหรี่",
    "ระบายอากาศในบ้านและใช้เครื่องฟอกอากาศเป็นประจำ",
    "หลีกเลี่ยงพื้นที่ฝุ่น PM2.5 สูง สวมหน้ากากเมื่อจำเป็น",
    "ตรวจสุขภาพปอดประจำปี ทุก 12 เดือน",
  ] : [
    "รักษาวิถีชีวิตปลอดบุหรี่และอากาศบริสุทธิ์ต่อไป",
    "ออกกำลังกายแบบคาร์ดิโอ 150 นาที/สัปดาห์",
    "รับประทานผัก-ผลไม้สีเข้มเพื่อสารต้านอนุมูลอิสระ",
    "ตรวจสุขภาพประจำปีตามปกติ",
  ];

  // Research advice (evidence-based)
  const research = [
    "งานวิจัยจาก NEJM ยืนยันว่า Low-dose CT ลดอัตราเสียชีวิตจากมะเร็งปอดได้ 20% ในกลุ่มเสี่ยงสูง",
    "การเลิกบุหรี่นานเกิน 10 ปีลดความเสี่ยงมะเร็งปอดลงได้ถึง 50% (Lancet Oncology)",
    "ค่า VOCs เช่น Pentane และ Hexanal เป็น biomarker บ่งชี้ oxidative stress ที่สัมพันธ์กับเซลล์มะเร็ง",
    "การได้รับ Asbestos และโลหะหนัก (นิกเกิล/โครเมียม) จัดเป็น IARC Group 1 ก่อมะเร็งในมนุษย์",
  ];

  // Split AI analysis into 3 sections
  const ai = rec.ai_analysis ?? "";
  const sec = (key: string) => {
    const re = new RegExp(`\\*\\*\\[${key}\\]\\*\\*([\\s\\S]*?)(?=\\*\\*\\[|$)`, "m");
    const m = ai.match(re);
    return m?.[1]?.trim() ?? "";
  };
  const aiCurrent = sec("ผลปัจจุบัน") || ai.slice(0, 300);
  const aiResearch = sec("ความรู้จากงานวิจัย");
  const aiAdvice = sec("คำแนะนำ");

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-60 shrink-0 flex-col gap-1 border-r bg-white p-4 sticky top-0 h-screen">
          <div className="mb-4 flex items-center gap-2 px-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-blue-700 leading-tight">VitalGuard</div>
              <div className="text-[11px] text-slate-500">Lung AI Screening</div>
            </div>
          </div>
          <SideLink to="/dashboard" icon={Home} label="แดชบอร์ด" />
          <SideLink to="/assessment" icon={Activity} label="ประเมินความเสี่ยง" />
          <SideLink to="/history" icon={HistoryIcon} label="ประวัติการตรวจ" />
          <SideLink to="/knowledge" icon={GraduationCap} label="ศูนย์การเรียนรู้" />
          <SideLink to="/profile" icon={User} label="โปรไฟล์" />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 space-y-5 max-w-7xl">
          {/* Page header */}
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">ผลการประเมินความเสี่ยงมะเร็งปอด</h1>
              <p className="text-sm text-slate-500 mt-1">
                วิเคราะห์เมื่อ {new Date(rec.created_at).toLocaleString("th-TH", { dateStyle: "long", timeStyle: "short" })}
              </p>
            </div>
            <div className={cn("flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium", accentBg, accentBorder, accentText)}>
              <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
              {levelLabel}
            </div>
          </div>

          {/* Top row: Score + Alert */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Static Score */}
            <Card>
              <CardTitle icon={TrendingUp} title="คะแนนความเสี่ยง (Static Score)" />
              <div className="flex items-center justify-center py-4">
                <div className="relative">
                  <svg width="180" height="180" className="-rotate-90">
                    <circle cx="90" cy="90" r={radius} stroke="#e2e8f0" strokeWidth="14" fill="none" />
                    <circle cx="90" cy="90" r={radius} stroke={accent} strokeWidth="14" fill="none"
                      strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                      style={{ transition: "stroke-dasharray 1s ease-out" }} />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-center">
                    <div>
                      <div className="text-4xl font-bold text-slate-800">{score}</div>
                      <div className="text-xs text-slate-500">/ 100</div>
                      <div className={cn("mt-1 text-sm font-semibold", accentText)}>{levelLabel}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <Zone label="ต่ำ" range="0-29" color="#16a34a" active={!isHigh && !isMed} />
                <Zone label="ปานกลาง" range="30-59" color="#f97316" active={isMed} />
                <Zone label="สูง" range="60-100" color="#dc2626" active={isHigh} />
              </div>
            </Card>

            {/* Alert / immediate advice */}
            <Card className={cn("border-l-4", isHigh ? "border-l-red-500" : isMed ? "border-l-orange-500" : "border-l-green-500")}>
              <div className="flex items-start gap-3">
                <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", accentBg)}>
                  <AlertTriangle className={cn("h-5 w-5", accentText)} />
                </div>
                <div className="flex-1">
                  <div className={cn("text-lg font-bold", accentText)}>{levelLabel}</div>
                  <p className="text-sm text-slate-600 mt-0.5">คำแนะนำเร่งด่วนที่ควรทำทันที</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2.5">
                {immediate.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className={cn("h-5 w-5 shrink-0 mt-0.5", accentText)} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Mid row: Summary + Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card>
              <CardTitle icon={User} title="ข้อมูลที่ใช้ในการประเมิน" />
              <dl className="space-y-3 text-sm">
                <Row label="ชื่อ" value={profile?.full_name || "-"} />
                <Row label="อายุ" value={age ? `${age} ปี` : "-"} />
                <Row label="เพศ" value={genderLabel} />
                <Row label="สถานะการสูบ" value={SMOKING_LABEL[rec.symptoms.smoking.status] ?? "-"} />
                {rec.symptoms.smoking.types.length > 0 && (
                  <Row label="ประเภทที่สูบ" value={rec.symptoms.smoking.types.map(t => SMOKE_TYPE_LABEL[t] ?? t).join(", ")} />
                )}
                {rec.symptoms.smoking.status !== "never" && (
                  <Row label="ปริมาณ" value={`${rec.symptoms.smoking.packsPerDay} ซอง/วัน × ${rec.symptoms.smoking.years} ปี`} />
                )}
                {rec.symptoms.smoking.status === "former" && (
                  <Row label="เลิกมาแล้ว" value={`${rec.symptoms.smoking.yearsSinceQuit} ปี`} />
                )}
                <Row label="สิ่งแวดล้อม" value={rec.symptoms.environment.length ? rec.symptoms.environment.map(k => ENV_LABELS[k] ?? k).join(", ") : "ไม่มีปัจจัยเสี่ยง"} />
                <Row label="ประวัติสุขภาพ" value={rec.symptoms.history.length ? rec.symptoms.history.map(k => HISTORY_LABELS[k] ?? k).join(", ") : "ไม่มี"} />
              </dl>
            </Card>

            <Card>
              <CardTitle icon={Activity} title="ที่มาของคะแนนความเสี่ยง" />
              {breakdown.length === 0 ? (
                <p className="text-sm text-slate-500 py-6 text-center">ไม่มีปัจจัยเสี่ยงที่ตรวจพบ — ยอดเยี่ยม!</p>
              ) : (
                <ul className="space-y-2">
                  {breakdown.map((b, i) => (
                    <li key={i} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <b.icon className="h-4 w-4 shrink-0 text-slate-500" />
                        <span className="text-sm text-slate-700 truncate">{b.label}</span>
                      </div>
                      <span className={cn("shrink-0 rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums",
                        b.points >= 20 ? "bg-red-100 text-red-700" : b.points >= 8 ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700")}>
                        +{b.points}
                      </span>
                    </li>
                  ))}
                  <li className="flex items-center justify-between border-t pt-3 mt-2">
                    <span className="text-sm font-semibold text-slate-700">คะแนนรวม</span>
                    <span className="text-lg font-bold text-blue-700 tabular-nums">{score} / 100</span>
                  </li>
                </ul>
              )}
            </Card>
          </div>

          {/* Research advice */}
          <Card>
            <CardTitle icon={BookOpen} title="คำแนะนำจากงานวิจัยทางการแพทย์" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {research.map((t, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-blue-50/60 border border-blue-100 p-4">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
                  <p className="text-sm text-slate-700 leading-relaxed">{t}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Detailed AI Analysis: 3 columns */}
          <Card>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle icon={Sparkles} title="วิเคราะห์เชิงลึกโดย AI (Onco-Voice Expert)" inline />
              <Button
                variant="outline"
                size="sm"
                onClick={() => ai && speak(ai)}
                className="rounded-full"
              >
                {speaking ? <VolumeX className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />}
                {speaking ? "หยุดอ่าน" : "ฟังเสียง"}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <AnalysisCol
                title="ผลปัจจุบัน"
                icon={Stethoscope}
                tone="orange"
                content={aiCurrent || "—"}
              />
              <AnalysisCol
                title="ความรู้จากงานวิจัย"
                icon={BookOpen}
                tone="white"
                content={aiResearch || "—"}
              />
              <AnalysisCol
                title="แนวโน้ม & คำแนะนำ"
                icon={TrendingUp}
                tone="gray"
                content={aiAdvice || "—"}
              />
            </div>

            {history.length > 1 && (
              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">แนวโน้มคะแนนความเสี่ยง</span>
                </div>
                <div className="h-56">
                  <ResponsiveContainer>
                    <LineChart data={history} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                      <ReferenceArea y1={0} y2={30} fill="#16a34a" fillOpacity={0.06} />
                      <ReferenceArea y1={30} y2={60} fill="#f97316" fillOpacity={0.08} />
                      <ReferenceArea y1={60} y2={100} fill="#dc2626" fillOpacity={0.06} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                      <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: "#2563eb" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </Card>

          {/* Disclaimer */}
          <div className="flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <p className="text-sm text-amber-900">
              <strong>คำเตือน:</strong> การประเมินนี้เป็นการคัดกรองเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์ โปรดปรึกษาแพทย์เฉพาะทางเพื่อความแม่นยำ
            </p>
          </div>

          {/* CTA */}
          <div className="flex justify-center pt-2 pb-6">
            <Link to="/assessment">
              <Button
                size="lg"
                className="rounded-full px-10 py-6 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                style={{ background: "linear-gradient(135deg, #2563eb 0%, #f97316 100%)" }}
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                ประเมินอีกครั้ง
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl bg-white p-5 md:p-6 shadow-sm border border-slate-100", className)}>
      {children}
    </div>
  );
}

function CardTitle({ icon: Icon, title, inline }: { icon: React.ComponentType<{ className?: string }>; title: string; inline?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", inline ? "" : "mb-4")}>
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-base md:text-lg font-bold text-slate-800">{title}</h3>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-0">
      <dt className="text-slate-500 shrink-0">{label}</dt>
      <dd className="text-slate-800 font-medium text-right">{value}</dd>
    </div>
  );
}

function Zone({ label, range, color, active }: { label: string; range: string; color: string; active: boolean }) {
  return (
    <div className={cn("rounded-xl border p-2 transition", active ? "border-2 shadow-sm" : "border-slate-200 opacity-60")}
      style={active ? { borderColor: color, background: `${color}10` } : undefined}>
      <div className="font-semibold" style={{ color }}>{label}</div>
      <div className="text-slate-500">{range}</div>
    </div>
  );
}

function AnalysisCol({
  title, icon: Icon, tone, content,
}: { title: string; icon: React.ComponentType<{ className?: string }>; tone: "orange" | "white" | "gray"; content: string }) {
  const styles = {
    orange: "bg-orange-50 border-orange-200",
    white: "bg-white border-slate-200",
    gray: "bg-slate-100 border-slate-200",
  }[tone];
  const iconColor = {
    orange: "text-orange-600 bg-orange-100",
    white: "text-blue-600 bg-blue-50",
    gray: "text-slate-600 bg-slate-200",
  }[tone];
  return (
    <div className={cn("rounded-2xl border p-4 h-full", styles)}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("grid h-7 w-7 place-items-center rounded-lg", iconColor)}>
          <Icon className="h-4 w-4" />
        </div>
        <h4 className="font-bold text-slate-800">{title}</h4>
      </div>
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}

function SideLink({ to, icon: Icon, label }: { to: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition"
      activeProps={{ className: "bg-blue-50 text-blue-700 font-semibold" }}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}
