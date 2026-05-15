import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Volume2, VolumeX, Stethoscope } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceArea, Tooltip } from "recharts";

export const Route = createFileRoute("/result/$id")({
  head: () => ({ meta: [{ title: "ผลการวิเคราะห์ — Onco-Voice Expert" }] }),
  component: ResultPage,
});

type Rec = {
  id: string;
  created_at: string;
  risk_score: number;
  risk_level: string;
  voc_values: Record<string, number>;
  ai_analysis: string | null;
};

function ResultPage() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [rec, setRec] = useState<Rec | null>(null);
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
    u.lang = "th-TH";
    u.rate = 0.85;
    u.pitch = 0.9;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  };

  useEffect(() => () => { if (typeof window !== "undefined") window.speechSynthesis?.cancel(); }, []);

  if (loading || !rec) return <div className="min-h-screen"><AppHeader /><div className="p-8 text-center text-muted-foreground">กำลังโหลด...</div></div>;

  const score = Number(rec.risk_score);
  const level = rec.risk_level;
  const color = level === "low" ? "var(--color-success)" : level === "medium" ? "var(--color-warning)" : "var(--color-danger)";
  const bg = level === "low" ? "oklch(0.95 0.05 150)" : level === "medium" ? "oklch(0.96 0.06 85)" : "oklch(0.95 0.06 25)";
  const label = level === "low" ? "ต่ำ" : level === "medium" ? "ปานกลาง" : "สูง";

  // Gauge SVG
  const radius = 80;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {/* Disclaimer */}
        <div className="flex items-start gap-3 rounded-xl bg-warning/15 border border-warning/30 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning-foreground" />
          <p className="text-sm">
            <strong>คำเตือน:</strong> การประเมินนี้เป็นการคัดกรองเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์ โปรดปรึกษาแพทย์เฉพาะทางเพื่อความแม่นยำ
          </p>
        </div>

        {/* Section 1: Current result */}
        <section className="rounded-2xl p-8 shadow-[var(--shadow-card)]" style={{ backgroundColor: bg }}>
          <h2 className="text-center text-xl font-semibold">ผลการประเมินปัจจุบัน</h2>
          <div className="mt-6 flex flex-col items-center">
            <svg width="200" height="200" className="-rotate-90">
              <circle cx="100" cy="100" r={radius} stroke="oklch(1 0 0 / 0.4)" strokeWidth="16" fill="none" />
              <circle cx="100" cy="100" r={radius} stroke={color} strokeWidth="16" fill="none"
                strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                style={{ transition: "stroke-dasharray 1s ease-out" }} />
            </svg>
            <div className="-mt-[120px] text-center">
              <div className="text-5xl font-bold" style={{ color }}>{score}%</div>
              <div className="mt-1 text-lg font-medium">ความเสี่ยง: {label}</div>
            </div>
          </div>
          {level === "high" && (
            <div className="mt-20 flex items-start gap-2 rounded-xl bg-card/80 p-4">
              <Stethoscope className="h-5 w-5 shrink-0 text-danger" />
              <p className="text-sm"><strong>แนะนำให้ตรวจ Low-dose CT Scan ทันที</strong> และพบแพทย์ผู้เชี่ยวชาญด้านปอดเพื่อประเมินอย่างละเอียด</p>
            </div>
          )}
          {level !== "high" && <div className="mt-20" />}
        </section>

        {/* Section 2: AI analysis with click to speak */}
        <section className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">คำแนะนำจาก AI</h2>
            <Button variant="outline" size="sm" onClick={() => rec.ai_analysis && speak(rec.ai_analysis)}>
              {speaking ? <VolumeX className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />}
              {speaking ? "หยุดอ่าน" : "อ่านออกเสียง"}
            </Button>
          </div>
          <div
            onClick={() => rec.ai_analysis && speak(rec.ai_analysis)}
            className="mt-4 cursor-pointer rounded-xl bg-secondary/40 p-5 leading-relaxed whitespace-pre-wrap hover:bg-secondary/60 transition"
            title="คลิกเพื่อให้ AI อ่านออกเสียง"
          >
            {rec.ai_analysis || "ไม่มีคำวิเคราะห์"}
          </div>
        </section>

        {/* Section 3: Trend chart */}
        {history.length > 1 && (
          <section className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-xl font-semibold">แนวโน้มความเสี่ยง</h2>
            <p className="text-sm text-muted-foreground">เปรียบเทียบกับการประเมินก่อนหน้า</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer>
                <LineChart data={history}>
                  <ReferenceArea y1={0} y2={30} fill="oklch(0.7 0.17 150)" fillOpacity={0.12} />
                  <ReferenceArea y1={30} y2={60} fill="oklch(0.82 0.16 85)" fillOpacity={0.15} />
                  <ReferenceArea y1={60} y2={100} fill="oklch(0.62 0.23 25)" fillOpacity={0.12} />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="oklch(0.55 0.14 240)" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        <div className="flex gap-3">
          <Link to="/dashboard" className="flex-1"><Button variant="outline" className="w-full">กลับหน้าหลัก</Button></Link>
          <Link to="/assessment" className="flex-1"><Button className="w-full">ประเมินใหม่</Button></Link>
        </div>
      </main>
    </div>
  );
}
