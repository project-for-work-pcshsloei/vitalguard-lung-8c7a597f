import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "ประวัติสุขภาพ — VitalGuard Expert" }] }),
  component: HistoryPage,
});

type Rec = { id: string; created_at: string; risk_score: number; risk_level: string };

function HistoryPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<Rec[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("health_records").select("id,created_at,risk_score,risk_level").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setRecords(data ?? []));
  }, [user]);

  if (loading || !user) return null;

  const colorOf = (l: string) => l === "low" ? "bg-success/20 text-success-foreground" : l === "medium" ? "bg-warning/30 text-warning-foreground" : "bg-danger/20 text-danger";
  const labelOf = (l: string) => l === "low" ? "ต่ำ" : l === "medium" ? "ปานกลาง" : "สูง";

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold">ประวัติสุขภาพ</h1>
        <p className="mt-2 text-muted-foreground">การประเมินทั้งหมดของคุณ</p>

        {records.length === 0 ? (
          <div className="mt-8 rounded-2xl bg-card p-12 text-center text-muted-foreground shadow-[var(--shadow-card)]">
            ยังไม่มีประวัติ
            <div className="mt-4"><Link to="/assessment"><Button>เริ่มประเมิน</Button></Link></div>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {records.map(r => (
              <li key={r.id}>
                <Link to="/result/$id" params={{ id: r.id }} className="flex items-center justify-between rounded-xl bg-card p-4 shadow-[var(--shadow-card)] transition hover:scale-[1.01]">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(r.created_at).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-sm font-medium ${colorOf(r.risk_level)}`}>{labelOf(r.risk_level)}</span>
                      <span className="text-xl font-semibold">{Number(r.risk_score)}%</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
