import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Activity, History, BookOpen, Wind } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceArea, Tooltip } from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "แดชบอร์ด — VitalGuard Expert" }] }),
  component: Dashboard,
});

type Record = { id: string; created_at: string; risk_score: number; risk_level: string };

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<Record[]>([]);
  const [fullName, setFullName] = useState<string>("");

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data?.full_name) setFullName(data.full_name);
    });
    supabase.from("health_records").select("id,created_at,risk_score,risk_level").eq("user_id", user.id).order("created_at", { ascending: true }).limit(20)
      .then(({ data }) => setRecords(data ?? []));
  }, [user]);

  if (loading || !user) return null;

  const latest = records[records.length - 1];
  const latestScore = latest ? Number(latest.risk_score) : null;
  const latestLabel = latest ? (latest.risk_level === "high" ? "ความเสี่ยงสูง" : latest.risk_level === "medium" ? "ความเสี่ยงปานกลาง" : "ความเสี่ยงต่ำ") : "-";
  const latestStyle = latest ? (latest.risk_level === "high" ? "bg-red-50 text-red-700" : latest.risk_level === "medium" ? "bg-orange-50 text-orange-700" : "bg-emerald-50 text-emerald-700") : "bg-slate-100 text-slate-500";
  const count = records.length;
  const chartData = records.map((r, i) => ({ name: `#${i + 1}`, score: Number(r.risk_score) }));

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="rounded-[2rem] bg-white p-8 shadow-[var(--shadow-card)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-slate-500">ยินดีต้อนรับ, {(fullName || user.email?.split("@")[0]) ?? "ผู้ใช้ใหม่"}</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">สุขภาพของคุณ ในมุมมองเดียว</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/assessment" className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700">
                <Activity className="h-4 w-4" /> เริ่มประเมินครั้งใหม่
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-3">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">คะแนนล่าสุด</h2>
              <div className="mt-4 flex items-end gap-4">
                <p className="text-4xl font-bold text-slate-900">{latestScore !== null ? `${latestScore} / 100` : "-"}</p>
                <span className={"rounded-full px-3 py-1 text-sm font-semibold " + latestStyle}>{latestLabel}</span>
              </div>
              <p className="mt-3 text-sm text-slate-500">ผลการประเมินล่าสุดของคุณ</p>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">จำนวนการประเมินทั้งหมด</h2>
              <p className="mt-4 text-4xl font-bold text-slate-900">{count}</p>
              <p className="mt-3 text-sm text-slate-500">ครั้งที่คุณทำการตรวจวิเคราะห์</p>
            </div>

            <div className="rounded-[1.5rem] bg-blue-600 p-6 text-white shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-200">เริ่มทำเลย</p>
              <h2 className="mt-4 text-2xl font-bold">เริ่มประเมินครั้งใหม่</h2>
              <p className="mt-2 text-sm text-blue-100">กดเริ่มเพื่อจำลองค่าเซนเซอร์และตอบแบบสอบถามความเสี่ยง</p>
              <Link to="/assessment" className="mt-6 inline-flex items-center justify-between rounded-full bg-white px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm hover:bg-slate-100">
                เริ่มทันที →
              </Link>
            </div>
          </div>

          <div className="mt-10 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">คุณต้องการทำอะไร?</h2>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <Link to="/assessment" className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">ประเมินความเสี่ยงสุขภาพ</h3>
                  <p className="mt-2 text-sm text-slate-600">ตรวจค่าเซนเซอร์และตอบคำถามเพื่อประเมินความเสี่ยงปอดของคุณ</p>
                </div>
                <span className="text-sm font-semibold text-blue-600">เปิด →</span>
              </Link>
              <Link to="/history" className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
                  <History className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">ข้อมูลสุขภาพของฉัน</h3>
                  <p className="mt-2 text-sm text-slate-600">ดูผลการประเมินย้อนหลังและแนวโน้มคะแนนความเสี่ยง</p>
                </div>
                <span className="text-sm font-semibold text-emerald-600">เปิด →</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-[1.5rem] bg-white p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">แนวโน้มคะแนนล่าสุด</h2>
          </div>
          {chartData.length === 0 ? (
            <div className="mt-6 rounded-2xl bg-slate-100 p-8 text-center text-slate-500">
              ยังไม่มีข้อมูล — <Link to="/assessment" className="font-semibold text-blue-600">เริ่มประเมินครั้งแรก</Link>
            </div>
          ) : (
            <div className="mt-4 h-80">
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
          )}
        </div>
      </main>
    </div>
  );
}
