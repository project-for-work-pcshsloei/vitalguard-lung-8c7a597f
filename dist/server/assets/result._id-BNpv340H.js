import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { u as useAuth } from "./use-auth-DVHOHR6L.js";
import { s as supabase } from "./client-CZVAA-Hl.js";
import { A as AppHeader } from "./app-header-0F0AWFJG.js";
import { c as cn, B as Button } from "./button-DjOZMqFS.js";
import { ShieldAlert, Home, Activity, History, GraduationCap, User, TrendingUp, AlertTriangle, CheckCircle2, BookOpen, Sparkles, RefreshCw, Cigarette, Wind } from "lucide-react";
import { ResponsiveContainer, LineChart, CartesianGrid, ReferenceArea, XAxis, YAxis, Tooltip, Line } from "recharts";
import { E as ENV_LABELS, H as HISTORY_LABELS, v as vocStatus } from "./risk-CZfZ5S1y.js";
import { R as Route } from "./router-BIuzH-dV.js";
import "@supabase/supabase-js";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@tanstack/react-query";
const SMOKING_LABEL = {
  never: "ไม่เคยสูบ",
  current: "ยังสูบอยู่",
  former: "เคยสูบ (เลิกแล้ว)"
};
const SMOKE_TYPE_LABEL = {
  cigarette: "บุหรี่ธรรมดา",
  ecig: "บุหรี่ไฟฟ้า",
  cannabis: "กัญชา"
};
function buildBreakdown(s, vocs) {
  const items = [];
  const pY = s.smoking.packsPerDay * s.smoking.years;
  if (s.smoking.status === "current") {
    let pts = Math.min(40, pY * 1.5);
    if (s.smoking.types.includes("cannabis")) pts += 15;
    if (s.smoking.types.includes("ecig")) pts += 5;
    if (s.smoking.types.includes("cigarette")) pts += 5;
    items.push({
      label: `การสูบบุหรี่ (${pY.toFixed(1)} pack-years)`,
      points: Math.round(pts),
      icon: Cigarette
    });
  } else if (s.smoking.status === "former") {
    let pts = Math.min(35, pY * 1.2);
    if (s.smoking.yearsSinceQuit > 10) pts *= 0.4;
    else if (s.smoking.yearsSinceQuit > 5) pts *= 0.65;
    if (pts > 0) items.push({
      label: `เคยสูบ (เลิก ${s.smoking.yearsSinceQuit} ปี)`,
      points: Math.round(pts),
      icon: Cigarette
    });
  }
  const envW = {
    asbestos: 8,
    metal: 6,
    mining: 7,
    radon: 5,
    pm25: 4
  };
  s.environment.forEach((k) => {
    if (envW[k]) items.push({
      label: ENV_LABELS[k] ?? k,
      points: envW[k],
      icon: Wind
    });
  });
  if (s.history.includes("chronic_lung")) items.push({
    label: HISTORY_LABELS.chronic_lung,
    points: 8,
    icon: Activity
  });
  if (s.history.includes("family_cancer")) items.push({
    label: HISTORY_LABELS.family_cancer,
    points: 6,
    icon: Activity
  });
  if (s.age >= 65) items.push({
    label: "อายุ ≥ 65 ปี",
    points: 10,
    icon: User
  });
  else if (s.age >= 50) items.push({
    label: "อายุ ≥ 50 ปี",
    points: 5,
    icon: User
  });
  let vocPts = 0;
  for (const [n, v] of Object.entries(vocs)) {
    const st = vocStatus(n, v);
    if (st === "elevated") vocPts += 2;
    else if (st === "high") vocPts += 5;
  }
  vocPts = Math.min(20, vocPts);
  if (vocPts > 0) items.push({
    label: "ค่า VOCs ผิดปกติ",
    points: vocPts,
    icon: Sparkles
  });
  return items.sort((a, b) => b.points - a.points);
}
function ResultPage() {
  const {
    id
  } = Route.useParams();
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [rec, setRec] = useState(null);
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  useEffect(() => {
    if (!loading && !user) navigate({
      to: "/auth"
    });
  }, [user, loading, navigate]);
  useEffect(() => {
    if (!user) return;
    supabase.from("health_records").select("*").eq("id", id).maybeSingle().then(({
      data
    }) => {
      if (data) setRec(data);
    });
    supabase.from("profiles").select("full_name,gender,age").eq("id", user.id).maybeSingle().then(({
      data
    }) => setProfile(data));
    supabase.from("health_records").select("created_at,risk_score").eq("user_id", user.id).order("created_at", {
      ascending: true
    }).limit(20).then(({
      data
    }) => setHistory((data ?? []).map((r, i) => ({
      name: `#${i + 1}`,
      score: Number(r.risk_score)
    }))));
  }, [id, user]);
  const breakdown = useMemo(() => rec ? buildBreakdown(rec.symptoms, rec.voc_values) : [], [rec]);
  if (loading || !rec) return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-50", children: [
    /* @__PURE__ */ jsx(AppHeader, {}),
    /* @__PURE__ */ jsx("div", { className: "p-12 text-center text-muted-foreground", children: "กำลังโหลดผลการวิเคราะห์..." })
  ] });
  const score = Number(rec.risk_score);
  const level = rec.risk_level;
  const isHigh = level === "high";
  const isMed = level === "medium";
  const accent = isHigh ? "#dc2626" : isMed ? "#f97316" : "#16a34a";
  const accentBg = isHigh ? "bg-red-50" : isMed ? "bg-orange-50" : "bg-green-50";
  const accentBorder = isHigh ? "border-red-200" : isMed ? "border-orange-200" : "border-green-200";
  const accentText = isHigh ? "text-red-600" : isMed ? "text-orange-600" : "text-green-600";
  const levelLabel = isHigh ? "ความเสี่ยงสูง" : isMed ? "ความเสี่ยงปานกลาง" : "ความเสี่ยงต่ำ";
  const radius = 70;
  const circ = 2 * Math.PI * radius;
  const dash = score / 100 * circ;
  const age = rec.symptoms?.age ?? profile?.age ?? null;
  const genderLabel = profile?.gender === "male" ? "ชาย" : profile?.gender === "female" ? "หญิง" : "ไม่ระบุ";
  const immediate = isHigh ? ["ปรึกษาแพทย์เฉพาะทางปอดทันทีเพื่อตรวจ Low-dose CT", "หยุดสูบบุหรี่และหลีกเลี่ยงควันบุหรี่มือสองโดยสิ้นเชิง", "ใส่หน้ากาก N95 เมื่อต้องอยู่ในพื้นที่ฝุ่นหรือสารเคมี", "ตรวจสุขภาพปอดประจำทุก 6 เดือน"] : isMed ? ["ลด/เลิกสูบบุหรี่อย่างจริงจังและขอความช่วยเหลือจากคลินิกอดบุหรี่", "ระบายอากาศในบ้านและใช้เครื่องฟอกอากาศเป็นประจำ", "หลีกเลี่ยงพื้นที่ฝุ่น PM2.5 สูง สวมหน้ากากเมื่อจำเป็น", "ตรวจสุขภาพปอดประจำปี ทุก 12 เดือน"] : ["รักษาวิถีชีวิตปลอดบุหรี่และอากาศบริสุทธิ์ต่อไป", "ออกกำลังกายแบบคาร์ดิโอ 150 นาที/สัปดาห์", "รับประทานผัก-ผลไม้สีเข้มเพื่อสารต้านอนุมูลอิสระ", "ตรวจสุขภาพประจำปีตามปกติ"];
  const research = ["งานวิจัยจาก NEJM ยืนยันว่า Low-dose CT ลดอัตราเสียชีวิตจากมะเร็งปอดได้ 20% ในกลุ่มเสี่ยงสูง", "การเลิกบุหรี่นานเกิน 10 ปีลดความเสี่ยงมะเร็งปอดลงได้ถึง 50% (Lancet Oncology)", "ค่า VOCs เช่น Pentane และ Hexanal เป็น biomarker บ่งชี้ oxidative stress ที่สัมพันธ์กับเซลล์มะเร็ง", "การได้รับ Asbestos และโลหะหนัก (นิกเกิล/โครเมียม) จัดเป็น IARC Group 1 ก่อมะเร็งในมนุษย์"];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-50", children: [
    /* @__PURE__ */ jsx(AppHeader, {}),
    /* @__PURE__ */ jsxs("div", { className: "flex", children: [
      /* @__PURE__ */ jsxs("aside", { className: "hidden lg:flex w-60 shrink-0 flex-col gap-1 border-r bg-white p-4 sticky top-0 h-screen", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-2 px-2", children: [
          /* @__PURE__ */ jsx("div", { className: "grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white", children: /* @__PURE__ */ jsx(ShieldAlert, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "font-bold text-blue-700 leading-tight", children: "VitalGuard" }),
            /* @__PURE__ */ jsx("div", { className: "text-[11px] text-slate-500", children: "Lung AI Screening" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(SideLink, { to: "/dashboard", icon: Home, label: "แดชบอร์ด" }),
        /* @__PURE__ */ jsx(SideLink, { to: "/assessment", icon: Activity, label: "ประเมินความเสี่ยง" }),
        /* @__PURE__ */ jsx(SideLink, { to: "/history", icon: History, label: "ประวัติการตรวจ" }),
        /* @__PURE__ */ jsx(SideLink, { to: "/knowledge", icon: GraduationCap, label: "ศูนย์การเรียนรู้" }),
        /* @__PURE__ */ jsx(SideLink, { to: "/profile", icon: User, label: "โปรไฟล์" })
      ] }),
      /* @__PURE__ */ jsxs("main", { className: "flex-1 p-4 md:p-6 space-y-5 max-w-7xl", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl md:text-3xl font-bold text-slate-800", children: "ผลการประเมินความเสี่ยงมะเร็งปอด" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-500 mt-1", children: [
              "วิเคราะห์เมื่อ ",
              new Date(rec.created_at).toLocaleString("th-TH", {
                dateStyle: "long",
                timeStyle: "short"
              })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium", accentBg, accentBorder, accentText), children: [
            /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full", style: {
              background: accent
            } }),
            levelLabel
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardTitle, { icon: TrendingUp, title: "คะแนนความเสี่ยง (Static Score)" }),
            /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-4", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxs("svg", { width: "180", height: "180", className: "-rotate-90", children: [
                /* @__PURE__ */ jsx("circle", { cx: "90", cy: "90", r: radius, stroke: "#e2e8f0", strokeWidth: "14", fill: "none" }),
                /* @__PURE__ */ jsx("circle", { cx: "90", cy: "90", r: radius, stroke: accent, strokeWidth: "14", fill: "none", strokeDasharray: `${dash} ${circ}`, strokeLinecap: "round", style: {
                  transition: "stroke-dasharray 1s ease-out"
                } })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "absolute inset-0 grid place-items-center text-center", children: /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "text-4xl font-bold text-slate-800", children: score }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-slate-500", children: "/ 100" }),
                /* @__PURE__ */ jsx("div", { className: cn("mt-1 text-sm font-semibold", accentText), children: levelLabel })
              ] }) })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2 text-center text-xs", children: [
              /* @__PURE__ */ jsx(Zone, { label: "ต่ำ", range: "0-29", color: "#16a34a", active: !isHigh && !isMed }),
              /* @__PURE__ */ jsx(Zone, { label: "ปานกลาง", range: "30-59", color: "#f97316", active: isMed }),
              /* @__PURE__ */ jsx(Zone, { label: "สูง", range: "60-100", color: "#dc2626", active: isHigh })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { className: cn("border-l-4", isHigh ? "border-l-red-500" : isMed ? "border-l-orange-500" : "border-l-green-500"), children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl", accentBg), children: /* @__PURE__ */ jsx(AlertTriangle, { className: cn("h-5 w-5", accentText) }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("div", { className: cn("text-lg font-bold", accentText), children: levelLabel }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-600 mt-0.5", children: "คำแนะนำเร่งด่วนที่ควรทำทันที" })
              ] })
            ] }),
            /* @__PURE__ */ jsx("ul", { className: "mt-4 space-y-2.5", children: immediate.map((t, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2 text-sm text-slate-700", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: cn("h-5 w-5 shrink-0 mt-0.5", accentText) }),
              /* @__PURE__ */ jsx("span", { children: t })
            ] }, i)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: [
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardTitle, { icon: User, title: "ข้อมูลที่ใช้ในการประเมิน" }),
            /* @__PURE__ */ jsxs("dl", { className: "space-y-3 text-sm", children: [
              /* @__PURE__ */ jsx(Row, { label: "ชื่อ", value: profile?.full_name || "-" }),
              /* @__PURE__ */ jsx(Row, { label: "อายุ", value: age ? `${age} ปี` : "-" }),
              /* @__PURE__ */ jsx(Row, { label: "เพศ", value: genderLabel }),
              /* @__PURE__ */ jsx(Row, { label: "สถานะการสูบ", value: SMOKING_LABEL[rec.symptoms.smoking.status] ?? "-" }),
              rec.symptoms.smoking.types.length > 0 && /* @__PURE__ */ jsx(Row, { label: "ประเภทที่สูบ", value: rec.symptoms.smoking.types.map((t) => SMOKE_TYPE_LABEL[t] ?? t).join(", ") }),
              rec.symptoms.smoking.status !== "never" && /* @__PURE__ */ jsx(Row, { label: "ปริมาณ", value: `${rec.symptoms.smoking.packsPerDay} ซอง/วัน × ${rec.symptoms.smoking.years} ปี` }),
              rec.symptoms.smoking.status === "former" && /* @__PURE__ */ jsx(Row, { label: "เลิกมาแล้ว", value: `${rec.symptoms.smoking.yearsSinceQuit} ปี` }),
              /* @__PURE__ */ jsx(Row, { label: "สิ่งแวดล้อม", value: rec.symptoms.environment.length ? rec.symptoms.environment.map((k) => ENV_LABELS[k] ?? k).join(", ") : "ไม่มีปัจจัยเสี่ยง" }),
              /* @__PURE__ */ jsx(Row, { label: "ประวัติสุขภาพ", value: rec.symptoms.history.length ? rec.symptoms.history.map((k) => HISTORY_LABELS[k] ?? k).join(", ") : "ไม่มี" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardTitle, { icon: Activity, title: "ที่มาของคะแนนความเสี่ยง" }),
            breakdown.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 py-6 text-center", children: "ไม่มีปัจจัยเสี่ยงที่ตรวจพบ — ยอดเยี่ยม!" }) : /* @__PURE__ */ jsxs("ul", { className: "space-y-2", children: [
              breakdown.map((b, i) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 min-w-0", children: [
                  /* @__PURE__ */ jsx(b.icon, { className: "h-4 w-4 shrink-0 text-slate-500" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm text-slate-700 truncate", children: b.label })
                ] }),
                /* @__PURE__ */ jsxs("span", { className: cn("shrink-0 rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums", b.points >= 20 ? "bg-red-100 text-red-700" : b.points >= 8 ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"), children: [
                  "+",
                  b.points
                ] })
              ] }, i)),
              /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between border-t pt-3 mt-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold text-slate-700", children: "คะแนนรวม" }),
                /* @__PURE__ */ jsxs("span", { className: "text-lg font-bold text-blue-700 tabular-nums", children: [
                  score,
                  " / 100"
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardTitle, { icon: BookOpen, title: "คำแนะนำจากงานวิจัยทางการแพทย์" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: research.map((t, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-xl bg-blue-50/60 border border-blue-100 p-4", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 shrink-0 text-blue-600 mt-0.5" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-700 leading-relaxed", children: t })
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardTitle, { icon: Sparkles, title: "วิเคราะห์เชิงลึกโดย AI (VitalGuard Expert)" }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 rounded-2xl bg-slate-50 p-4", children: history.length > 1 ? /* @__PURE__ */ jsx("div", { className: "h-[360px] w-full sm:h-[420px]", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart, { data: history, margin: {
            top: 10,
            right: 10,
            left: -10,
            bottom: 0
          }, children: [
            /* @__PURE__ */ jsx(CartesianGrid, { stroke: "#e2e8f0", strokeDasharray: "3 3" }),
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
          ] }) }) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "ยังไม่มีประวัติเพียงพอสำหรับแสดงกราฟ" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4", children: [
          /* @__PURE__ */ jsx(AlertTriangle, { className: "h-5 w-5 shrink-0 text-amber-600 mt-0.5" }),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-amber-900", children: [
            /* @__PURE__ */ jsx("strong", { children: "คำเตือน:" }),
            " การประเมินนี้เป็นการคัดกรองเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์ โปรดปรึกษาแพทย์เฉพาะทางเพื่อความแม่นยำ"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-center pt-2 pb-6", children: /* @__PURE__ */ jsx(Link, { to: "/assessment", children: /* @__PURE__ */ jsxs(Button, { size: "lg", className: "rounded-full px-10 py-6 text-base font-semibold text-white shadow-lg hover:shadow-xl transition-all", style: {
          background: "linear-gradient(135deg, #2563eb 0%, #f97316 100%)"
        }, children: [
          /* @__PURE__ */ jsx(RefreshCw, { className: "mr-2 h-5 w-5" }),
          "ประเมินอีกครั้ง"
        ] }) }) })
      ] })
    ] })
  ] });
}
function Card({
  children,
  className
}) {
  return /* @__PURE__ */ jsx("div", { className: cn("rounded-2xl bg-white p-5 md:p-6 shadow-sm border border-slate-100", className), children });
}
function CardTitle({
  icon: Icon,
  title,
  inline
}) {
  return /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-2", inline ? "" : "mb-4"), children: [
    /* @__PURE__ */ jsx("div", { className: "grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) }),
    /* @__PURE__ */ jsx("h3", { className: "text-base md:text-lg font-bold text-slate-800", children: title })
  ] });
}
function Row({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3 border-b border-slate-100 pb-2 last:border-0", children: [
    /* @__PURE__ */ jsx("dt", { className: "text-slate-500 shrink-0", children: label }),
    /* @__PURE__ */ jsx("dd", { className: "text-slate-800 font-medium text-right", children: value })
  ] });
}
function Zone({
  label,
  range,
  color,
  active
}) {
  return /* @__PURE__ */ jsxs("div", { className: cn("rounded-xl border p-2 transition", active ? "border-2 shadow-sm" : "border-slate-200 opacity-60"), style: active ? {
    borderColor: color,
    background: `${color}10`
  } : void 0, children: [
    /* @__PURE__ */ jsx("div", { className: "font-semibold", style: {
      color
    }, children: label }),
    /* @__PURE__ */ jsx("div", { className: "text-slate-500", children: range })
  ] });
}
function SideLink({
  to,
  icon: Icon,
  label
}) {
  return /* @__PURE__ */ jsxs(Link, { to, className: "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition", activeProps: {
    className: "bg-blue-50 text-blue-700 font-semibold"
  }, children: [
    /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }),
    label
  ] });
}
export {
  ResultPage as component
};
