import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Activity, History, BookOpen, Wind } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceArea, Tooltip } from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "แดชบอร์ด — Onco-Voice Expert" }] }),
  component: Dashboard,
});

type Record = { id: string; created_at: string; risk_score: number; risk_level: string };

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<Record[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("health_records").select("id,created_at,risk_score,risk_level").eq("user_id", user.id).order("created_at", { ascending: true }).limit(20)
      .then(({ data }) => setRecords(data ?? []));
  }, [user]);

  if (loading || !user) return null;

  const chartData = records.map((r, i) => ({ name: `#${i + 1}`, score: Number(r.risk_score) }));

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold">สวัสดี 👋</h1>
        <p className="mt-2 text-muted-foreground">เริ่มต้นดูแลสุขภาพปอดของคุณวันนี้</p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Link to="/assessment" className="group rounded-2xl bg-primary p-6 text-primary-foreground shadow-[var(--shadow-soft)] transition hover:scale-[1.02]">
            <Activity className="h-10 w-10" />
            <h2 className="mt-4 text-xl font-semibold">เริ่มการประเมิน</h2>
            <p className="mt-1 text-sm opacity-90">ตรวจวัดและวิเคราะห์ความเสี่ยง</p>
          </Link>
          <Link to="/history" className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)] transition hover:scale-[1.02]">
            <History className="h-10 w-10 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">ประวัติสุขภาพ</h2>
            <p className="mt-1 text-sm text-muted-foreground">ผลตรวจย้อนหลัง</p>
          </Link>
          <Link to="/knowledge" className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)] transition hover:scale-[1.02]">
            <BookOpen className="h-10 w-10 text-primary" />
            <h2 className="mt-4 text-xl font-semibold">ความรู้สู้มะเร็ง</h2>
            <p className="mt-1 text-sm text-muted-foreground">บทความจากงานวิจัย</p>
          </Link>
        </div>

        <div className="mt-8 rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2">
            <Wind className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">แนวโน้มความเสี่ยงล่าสุด</h2>
          </div>
          {chartData.length === 0 ? (
            <div className="mt-6 rounded-xl bg-muted/50 p-8 text-center text-muted-foreground">
              ยังไม่มีข้อมูล — <Link to="/assessment" className="text-primary underline">เริ่มประเมินครั้งแรก</Link>
            </div>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer>
                <LineChart data={chartData}>
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
          )}
        </div>

        <div className="mt-8 text-center">
          <Link to="/assessment">
            <Button size="lg" className="text-base">เริ่มการประเมินใหม่</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
