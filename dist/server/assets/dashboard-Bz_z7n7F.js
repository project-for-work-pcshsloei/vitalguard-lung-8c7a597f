import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { u as useAuth } from "./use-auth-DVHOHR6L.js";
import { s as supabase } from "./client-CZVAA-Hl.js";
import { A as AppHeader } from "./app-header-0F0AWFJG.js";
import { Activity, History, Wind } from "lucide-react";
import { ResponsiveContainer, LineChart, ReferenceArea, XAxis, YAxis, Tooltip, Line } from "recharts";
import "@supabase/supabase-js";
import "./button-DjOZMqFS.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "sonner";
function Dashboard() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [fullName, setFullName] = useState("");
  useEffect(() => {
    if (!loading && !user) navigate({
      to: "/auth"
    });
  }, [user, loading, navigate]);
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle().then(({
      data
    }) => {
      if (data?.full_name) setFullName(data.full_name);
    });
    supabase.from("health_records").select("id,created_at,risk_score,risk_level").eq("user_id", user.id).order("created_at", {
      ascending: true
    }).limit(20).then(({
      data
    }) => setRecords(data ?? []));
  }, [user]);
  if (loading || !user) return null;
  const latest = records[records.length - 1];
  const latestScore = latest ? Number(latest.risk_score) : null;
  const latestLabel = latest ? latest.risk_level === "high" ? "ความเสี่ยงสูง" : latest.risk_level === "medium" ? "ความเสี่ยงปานกลาง" : "ความเสี่ยงต่ำ" : "-";
  const latestStyle = latest ? latest.risk_level === "high" ? "bg-red-50 text-red-700" : latest.risk_level === "medium" ? "bg-orange-50 text-orange-700" : "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500";
  const count = records.length;
  const chartData = records.map((r, i) => ({
    name: `#${i + 1}`,
    score: Number(r.risk_score)
  }));
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-50", children: [
    /* @__PURE__ */ jsx(AppHeader, {}),
    /* @__PURE__ */ jsxs("main", { className: "container mx-auto px-4 py-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-[2rem] bg-white p-8 shadow-[var(--shadow-card)]", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-end md:justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-500", children: [
              "ยินดีต้อนรับ, ",
              (fullName || user.email?.split("@")[0]) ?? "ผู้ใช้ใหม่"
            ] }),
            /* @__PURE__ */ jsx("h1", { className: "mt-2 text-3xl font-bold text-slate-900", children: "สุขภาพของคุณ ในมุมมองเดียว" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-3", children: /* @__PURE__ */ jsxs(Link, { to: "/assessment", className: "inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700", children: [
            /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4" }),
            " เริ่มประเมินครั้งใหม่"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 grid gap-4 xl:grid-cols-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.2em] text-slate-500", children: "คะแนนล่าสุด" }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-end gap-4", children: [
              /* @__PURE__ */ jsx("p", { className: "text-4xl font-bold text-slate-900", children: latestScore !== null ? `${latestScore} / 100` : "-" }),
              /* @__PURE__ */ jsx("span", { className: "rounded-full px-3 py-1 text-sm font-semibold " + latestStyle, children: latestLabel })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-slate-500", children: "ผลการประเมินล่าสุดของคุณ" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.2em] text-slate-500", children: "จำนวนการประเมินทั้งหมด" }),
            /* @__PURE__ */ jsx("p", { className: "mt-4 text-4xl font-bold text-slate-900", children: count }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-slate-500", children: "ครั้งที่คุณทำการตรวจวิเคราะห์" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "rounded-[1.5rem] bg-blue-600 p-6 text-white shadow-sm", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.2em] text-blue-200", children: "เริ่มทำเลย" }),
            /* @__PURE__ */ jsx("h2", { className: "mt-4 text-2xl font-bold", children: "เริ่มประเมินครั้งใหม่" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-blue-100", children: "กดเริ่มเพื่อจำลองค่าเซนเซอร์และตอบแบบสอบถามความเสี่ยง" }),
            /* @__PURE__ */ jsx(Link, { to: "/assessment", className: "mt-6 inline-flex items-center justify-between rounded-full bg-white px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm hover:bg-slate-100", children: "เริ่มทันที →" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-10 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-slate-900", children: "คุณต้องการทำอะไร?" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-6 grid gap-4 lg:grid-cols-2", children: [
            /* @__PURE__ */ jsxs(Link, { to: "/assessment", className: "flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1", children: [
              /* @__PURE__ */ jsx("div", { className: "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white", children: /* @__PURE__ */ jsx(Activity, { className: "h-6 w-6" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-slate-900", children: "ประเมินความเสี่ยงสุขภาพ" }),
                /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-slate-600", children: "ตรวจค่าเซนเซอร์และตอบคำถามเพื่อประเมินความเสี่ยงปอดของคุณ" })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-blue-600", children: "เปิด →" })
            ] }),
            /* @__PURE__ */ jsxs(Link, { to: "/history", className: "flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1", children: [
              /* @__PURE__ */ jsx("div", { className: "inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white", children: /* @__PURE__ */ jsx(History, { className: "h-6 w-6" }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h3", { className: "text-xl font-semibold text-slate-900", children: "ข้อมูลสุขภาพของฉัน" }),
                /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-slate-600", children: "ดูผลการประเมินย้อนหลังและแนวโน้มคะแนนความเสี่ยง" })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-emerald-600", children: "เปิด →" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-10 rounded-[1.5rem] bg-white p-6 shadow-[var(--shadow-card)]", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Wind, { className: "h-5 w-5 text-blue-600" }),
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-semibold", children: "แนวโน้มคะแนนล่าสุด" })
        ] }),
        chartData.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "mt-6 rounded-2xl bg-slate-100 p-8 text-center text-slate-500", children: [
          "ยังไม่มีข้อมูล — ",
          /* @__PURE__ */ jsx(Link, { to: "/assessment", className: "font-semibold text-blue-600", children: "เริ่มประเมินครั้งแรก" })
        ] }) : /* @__PURE__ */ jsx("div", { className: "mt-4 h-80", children: /* @__PURE__ */ jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxs(LineChart, { data: chartData, margin: {
          top: 10,
          right: 10,
          left: -10,
          bottom: 0
        }, children: [
          /* @__PURE__ */ jsx(ReferenceArea, { y1: 0, y2: 30, fill: "#16a34a", fillOpacity: 0.06 }),
          /* @__PURE__ */ jsx(ReferenceArea, { y1: 30, y2: 60, fill: "#f97316", fillOpacity: 0.08 }),
          /* @__PURE__ */ jsx(ReferenceArea, { y1: 60, y2: 100, fill: "#dc2626", fillOpacity: 0.06 }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "name", stroke: "#64748b", fontSize: 12 }),
          /* @__PURE__ */ jsx(YAxis, { domain: [0, 100], stroke: "#64748b", fontSize: 12 }),
          /* @__PURE__ */ jsx(Tooltip, {}),
          /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "score", stroke: "#2563eb", strokeWidth: 3, dot: {
            r: 4,
            fill: "#2563eb"
          } })
        ] }) }) })
      ] })
    ] })
  ] });
}
export {
  Dashboard as component
};
