import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { analyzeRisk } from "@/lib/ai.functions";
import { calcRisk, simulateVOCs, ENV_LABELS, HISTORY_LABELS, type SmokingStatus } from "@/lib/risk";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Wind, Cigarette, FlaskConical, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/assessment")({
  head: () => ({ meta: [{ title: "ประเมินความเสี่ยง — Onco-Voice Expert" }] }),
  component: Assessment,
});

function Assessment() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const analyzeFn = useServerFn(analyzeRisk);

  const [vocs, setVocs] = useState<Record<string, number> | null>(null);
  const [scanning, setScanning] = useState(false);

  const [age, setAge] = useState(45);
  const [smokingStatus, setSmokingStatus] = useState<SmokingStatus>("never");
  const [smokingTypes, setSmokingTypes] = useState<string[]>([]);
  const [packsPerDay, setPacksPerDay] = useState(0);
  const [years, setYears] = useState(0);
  const [yearsSinceQuit, setYearsSinceQuit] = useState(0);
  const [environment, setEnvironment] = useState<string[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("birth_date").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.birth_date) {
        const a = new Date().getFullYear() - new Date(data.birth_date).getFullYear();
        if (a > 0) setAge(a);
      }
    });
  }, [user]);

  const startScan = () => {
    setScanning(true);
    setVocs(null);
    setTimeout(() => {
      setVocs(simulateVOCs());
      setScanning(false);
    }, 1500);
  };

  const toggle = (arr: string[], setArr: (v: string[]) => void, key: string) => {
    setArr(arr.includes(key) ? arr.filter(k => k !== key) : [...arr, key]);
  };

  const onAnalyze = async () => {
    if (!user) return;
    if (!vocs) { toast.error("กรุณากดสุ่มค่าสารระเหยก่อน"); return; }
    setAnalyzing(true);
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
        history: history.map(k => HISTORY_LABELS[k] ?? k),
        age,
      },
    });

    const { data: rec, error } = await supabase.from("health_records").insert({
      user_id: user.id,
      voc_values: vocs,
      symptoms: { age, smoking: { status: smokingStatus, types: smokingTypes, packsPerDay, years, yearsSinceQuit }, environment, history },
      risk_level: level,
      risk_score: score,
      ai_analysis: result.analysis,
    }).select("id").single();

    setAnalyzing(false);
    if (error || !rec) { toast.error("บันทึกผลไม่สำเร็จ"); return; }
    navigate({ to: "/result/$id", params: { id: rec.id } });
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">ประเมินความเสี่ยงมะเร็งปอด</h1>
          <p className="mt-2 text-muted-foreground">ทำตามขั้นตอนด้านล่างทีละข้อ</p>
        </div>

        {/* Section 1 */}
        <section className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">1. ตรวจค่าสารระเหย (VOCs)</h2>
          </div>
          <p className="mt-2 text-muted-foreground">กดปุ่มเพื่อจำลองการตรวจลมหายใจ</p>
          <Button onClick={startScan} disabled={scanning} className="mt-4" size="lg">
            {scanning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />กำลังตรวจ...</> : <><Wind className="mr-2 h-4 w-4" />เริ่มการตรวจ (จำลองค่า)</>}
          </Button>
          {vocs && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {Object.entries(vocs).map(([k, v]) => (
                <div key={k} className="rounded-xl bg-secondary p-3 text-center">
                  <div className="text-xs text-muted-foreground">{k}</div>
                  <div className="text-lg font-semibold">{v}</div>
                  <div className="text-xs text-muted-foreground">ppb</div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2 */}
        <section className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)] space-y-6">
          <div className="flex items-center gap-2">
            <Cigarette className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">2. แบบสอบถามพฤติกรรม</h2>
          </div>

          <div>
            <Label>อายุของคุณ</Label>
            <Input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="mt-1.5 w-32" />
          </div>

          <div>
            <Label className="text-base">สถานะการสูบบุหรี่</Label>
            <RadioGroup value={smokingStatus} onValueChange={(v) => setSmokingStatus(v as SmokingStatus)} className="mt-2 space-y-2">
              {[
                { v: "never", l: "ไม่เคยสูบ" },
                { v: "current", l: "สูบอยู่ปัจจุบัน" },
                { v: "former", l: "เคยสูบแต่เลิกแล้ว" },
              ].map(o => (
                <div key={o.v} className="flex items-center gap-2">
                  <RadioGroupItem value={o.v} id={o.v} />
                  <Label htmlFor={o.v} className="font-normal cursor-pointer">{o.l}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {smokingStatus !== "never" && (
            <>
              <div>
                <Label className="text-base">ประเภทที่สูบ (เลือกได้หลายข้อ)</Label>
                <div className="mt-2 space-y-2">
                  {[
                    { k: "cigarette", l: "บุหรี่ธรรมดา 🚬" },
                    { k: "ecig", l: "บุหรี่ไฟฟ้า (e-cigarette)" },
                    { k: "cannabis", l: "กัญชา (มีสารก่อมะเร็งมากกว่ายาสูบ 2 เท่า)" },
                  ].map(o => (
                    <div key={o.k} className="flex items-center gap-2">
                      <Checkbox id={`t-${o.k}`} checked={smokingTypes.includes(o.k)} onCheckedChange={() => toggle(smokingTypes, setSmokingTypes, o.k)} />
                      <Label htmlFor={`t-${o.k}`} className="font-normal cursor-pointer">{o.l}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>จำนวนซอง/วัน</Label>
                  <Input type="number" min={0} step={0.5} value={packsPerDay} onChange={(e) => setPacksPerDay(Number(e.target.value))} className="mt-1.5" />
                </div>
                <div>
                  <Label>ระยะเวลาที่สูบ (ปี)</Label>
                  <Input type="number" min={0} value={years} onChange={(e) => setYears(Number(e.target.value))} className="mt-1.5" />
                </div>
                {smokingStatus === "former" && (
                  <div>
                    <Label>เลิกสูบมาแล้ว (ปี)</Label>
                    <Input type="number" min={0} value={yearsSinceQuit} onChange={(e) => setYearsSinceQuit(Number(e.target.value))} className="mt-1.5" />
                  </div>
                )}
              </div>
            </>
          )}

          <div>
            <Label className="text-base">สิ่งแวดล้อม / อาชีพ (เลือกได้หลายข้อ)</Label>
            <div className="mt-2 space-y-2">
              {Object.entries(ENV_LABELS).map(([k, l]) => (
                <div key={k} className="flex items-start gap-2">
                  <Checkbox id={`e-${k}`} checked={environment.includes(k)} onCheckedChange={() => toggle(environment, setEnvironment, k)} className="mt-1" />
                  <Label htmlFor={`e-${k}`} className="font-normal cursor-pointer leading-relaxed">{l}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base">ประวัติสุขภาพ</Label>
            <div className="mt-2 space-y-2">
              {Object.entries(HISTORY_LABELS).map(([k, l]) => (
                <div key={k} className="flex items-start gap-2">
                  <Checkbox id={`h-${k}`} checked={history.includes(k)} onCheckedChange={() => toggle(history, setHistory, k)} className="mt-1" />
                  <Label htmlFor={`h-${k}`} className="font-normal cursor-pointer leading-relaxed">{l}</Label>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="text-center">
          <Button size="lg" className="w-full text-lg py-7" onClick={onAnalyze} disabled={analyzing || !vocs}>
            {analyzing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />กำลังวิเคราะห์ด้วย AI...</> : "คำนวณและวิเคราะห์ผล"}
          </Button>
          {!vocs && <p className="mt-2 text-sm text-muted-foreground">กรุณากดตรวจค่า VOCs ก่อน</p>}
        </section>
      </main>
    </div>
  );
}
