import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Stethoscope, Wind, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Onco-Voice Expert — คัดกรองความเสี่ยงมะเร็งปอด" },
      { name: "description", content: "ระบบคัดกรองความเสี่ยงมะเร็งปอดเบื้องต้น โดยวิเคราะห์ค่าสารระเหย VOCs ร่วมกับพฤติกรรมและสิ่งแวดล้อม" },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-calm)" }}>
      <header className="container mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-primary">
          <Stethoscope className="h-7 w-7" />
          <span className="text-xl font-semibold">Onco-Voice Expert</span>
        </div>
        <Link to="/auth"><Button variant="outline">เข้าสู่ระบบ</Button></Link>
      </header>

      <main className="container mx-auto px-6 pt-12 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm text-primary shadow-sm">
            <Sparkles className="h-4 w-4" /> ผู้ช่วยคัดกรองอัจฉริยะ
          </div>
          <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
            รู้ทันความเสี่ยงมะเร็งปอด<br />ก่อนสายเกินไป
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            วิเคราะห์ความเสี่ยงเบื้องต้นด้วยการผสานข้อมูลค่าสารระเหย (VOCs) กับพฤติกรรมและสิ่งแวดล้อม
            พร้อมคำอธิบายภาษาเข้าใจง่าย จากผู้เชี่ยวชาญ AI
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/auth"><Button size="lg" className="text-base">เริ่มต้นใช้งาน</Button></Link>
          </div>
        </div>

        <div className="mx-auto mt-20 grid max-w-5xl gap-6 md:grid-cols-3">
          {[
            { icon: Wind, title: "ตรวจค่า VOCs", desc: "จำลองค่าสารระเหยในลมหายใจที่อาจบ่งชี้ความเสี่ยง" },
            { icon: Stethoscope, title: "วิเคราะห์โดย AI", desc: "ผสานข้อมูลพฤติกรรม สิ่งแวดล้อม และพันธุกรรม" },
            { icon: ShieldCheck, title: "ปลอดภัยและส่วนตัว", desc: "ข้อมูลเข้ารหัส เก็บเฉพาะของคุณเท่านั้น" },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
              <f.icon className="mb-3 h-8 w-8 text-primary" />
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-base text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
