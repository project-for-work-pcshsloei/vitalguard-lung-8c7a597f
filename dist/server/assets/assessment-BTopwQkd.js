import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useRouter, isRedirect, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { u as useAuth } from "./use-auth-DVHOHR6L.js";
import { u as useTTS } from "./use-tts-Cq_vMUy6.js";
import { s as supabase } from "./client-CZVAA-Hl.js";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, a as createServerFn } from "./server-C1-paTiy.js";
import { z } from "zod";
import { V as VOC_META, E as ENV_LABELS, H as HISTORY_LABELS, s as simulateVOCsNormal, c as calcRisk, a as simulateVOCsRisk, v as vocStatus } from "./risk-CZfZ5S1y.js";
import { A as AppHeader } from "./app-header-0F0AWFJG.js";
import { B as Button, c as cn } from "./button-DjOZMqFS.js";
import { I as Input } from "./input-D_U8fI25.js";
import { Wind, Loader2, FlaskConical, Activity, CircleCheckBig, Sparkles, Check, Volume2 } from "lucide-react";
import { toast } from "sonner";
import "@supabase/supabase-js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
function useServerFn(serverFn) {
  const router = useRouter();
  return React.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router.stores.location.get();
        return router.navigate(router.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const InputSchema = z.object({
  riskScore: z.number(),
  riskLevel: z.string(),
  vocs: z.record(z.string(), z.number()),
  smoking: z.object({
    status: z.string(),
    type: z.array(z.string()).optional(),
    packsPerDay: z.number().optional(),
    years: z.number().optional(),
    yearsSinceQuit: z.number().optional()
  }),
  environment: z.array(z.string()),
  history: z.array(z.string()),
  age: z.number().optional()
});
const analyzeRisk = createServerFn({
  method: "POST"
}).inputValidator((input) => InputSchema.parse(input)).handler(createSsrRpc("c6e7131ee654e8291980c17a496f1dba90e37f55b10d5f98911cc890905b8604"));
const VOC_ICONS = {
  TGS2600: "🧪",
  TGS2602: "⚗️",
  TGS2611: "🛢️",
  TGS2620: "💧",
  TGS2612: "🌬️",
  TGS2622: "🔥",
  MQ2: "🫁",
  MQ3: "🧬",
  MQ4: "🔋",
  MQ5: "⚡",
  MQ7: "🚭",
  MQ9: "🧯",
  MQ135: "🌫️"
};
const STATUS_STYLES = {
  normal: {
    bg: "bg-emerald-50 border-emerald-200",
    chip: "bg-emerald-500 text-white",
    label: "ปกติ"
  },
  elevated: {
    bg: "bg-orange-50 border-orange-200",
    chip: "bg-orange-500 text-white",
    label: "เริ่มสูง"
  },
  high: {
    bg: "bg-red-50 border-red-200",
    chip: "bg-red-500 text-white",
    label: "เสี่ยงสูง"
  }
};
function Stepper({
  step
}) {
  const steps = [{
    i: 0,
    label: "อ่านค่า VOCs",
    icon: FlaskConical
  }, {
    i: 1,
    label: "แบบสอบถาม",
    icon: Activity
  }, {
    i: 2,
    label: "วิเคราะห์ด้วย AI",
    icon: Sparkles
  }];
  return /* @__PURE__ */ jsx("div", { className: "rounded-3xl bg-white p-6 shadow-[var(--shadow-card)]", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between gap-2", children: steps.map((s, idx) => {
    const done = step > s.i;
    const current = step === s.i;
    const Icon = s.icon;
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-1 items-center gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold transition", done && "bg-gradient-to-br from-blue-600 to-orange-500 text-white shadow-lg", current && "bg-gradient-to-br from-blue-600 to-orange-500 text-white shadow-lg ring-4 ring-blue-100", !done && !current && "bg-slate-100 text-slate-400"), children: done ? /* @__PURE__ */ jsx(Check, { className: "h-5 w-5" }) : /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxs("div", { className: "hidden sm:block", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-slate-500", children: [
          "ขั้นตอนที่ ",
          s.i + 1
        ] }),
        /* @__PURE__ */ jsx("div", { className: cn("text-sm font-semibold", current ? "text-slate-900" : "text-slate-500"), children: s.label })
      ] }),
      idx < steps.length - 1 && /* @__PURE__ */ jsx("div", { className: cn("ml-auto hidden h-1 flex-1 rounded sm:block", done ? "bg-gradient-to-r from-blue-400 to-orange-400" : "bg-slate-100") })
    ] }, s.i);
  }) }) });
}
function SpeakButton({
  text,
  id,
  className
}) {
  const {
    speak,
    stop,
    speakingId
  } = useTTS();
  const active = speakingId === id;
  return /* @__PURE__ */ jsx("button", { type: "button", onClick: (e) => {
    e.stopPropagation();
    active ? stop() : speak(text, id);
  }, className: cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition", active ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600 hover:bg-blue-100", className), "aria-label": "ฟังเสียงอ่าน", children: /* @__PURE__ */ jsx(Volume2, { className: "h-4 w-4" }) });
}
function VOCCard({
  name,
  value
}) {
  const meta = VOC_META[name];
  const status = vocStatus(name, value);
  const style = STATUS_STYLES[status];
  return /* @__PURE__ */ jsxs("div", { className: cn("relative rounded-2xl border p-4 transition", style.bg), children: [
    /* @__PURE__ */ jsx("div", { className: "absolute right-3 top-3 text-2xl opacity-60", children: VOC_ICONS[name] ?? "🔬" }),
    /* @__PURE__ */ jsx("div", { className: "text-xs font-medium text-slate-600", children: name }),
    /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-baseline gap-1", children: [
      /* @__PURE__ */ jsx("span", { className: "text-3xl font-bold tabular-nums text-slate-900", children: value }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-slate-500", children: meta.unit })
    ] }),
    /* @__PURE__ */ jsx("div", { className: cn("mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", style.chip), children: style.label }),
    /* @__PURE__ */ jsxs("div", { className: "mt-2 text-[11px] leading-snug text-slate-600", children: [
      meta.iarc ? /* @__PURE__ */ jsxs("span", { className: "font-semibold text-slate-700", children: [
        meta.iarc,
        " · "
      ] }) : null,
      meta.source
    ] })
  ] });
}
function ChoiceGroup({
  title,
  options,
  value,
  onChange,
  multi = false
}) {
  const isSelected = (v) => multi ? value.includes(v) : value === v;
  const toggle = (v) => {
    if (multi) {
      const arr = value;
      onChange(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    } else onChange(v);
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold text-slate-800", children: title }),
      /* @__PURE__ */ jsx(SpeakButton, { text: title, id: `q-${title}` })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid gap-2 sm:grid-cols-2", children: options.map((o) => {
      const sel = isSelected(o.v);
      return /* @__PURE__ */ jsxs("button", { type: "button", onClick: () => toggle(o.v), className: cn("group flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3.5 text-left text-sm font-medium transition", sel ? "border-blue-600 bg-gradient-to-r from-blue-50 to-orange-50 text-slate-900 shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/40"), children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: cn("flex h-5 w-5 items-center justify-center rounded-full border-2 transition", sel ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white"), children: sel && /* @__PURE__ */ jsx(Check, { className: "h-3 w-3" }) }),
          o.l
        ] }),
        /* @__PURE__ */ jsx(SpeakButton, { text: o.l, id: `opt-${title}-${o.v}` })
      ] }, o.v);
    }) })
  ] });
}
function Assessment() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const analyzeFn = useServerFn(analyzeRisk);
  const [step, setStep] = useState(0);
  const [vocs, setVocs] = useState(null);
  const [scanTime, setScanTime] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [age, setAge] = useState(45);
  const [smokingStatus, setSmokingStatus] = useState("never");
  const [smokingTypes, setSmokingTypes] = useState([]);
  const [packsPerDay, setPacksPerDay] = useState(0);
  const [years, setYears] = useState(0);
  const [yearsSinceQuit, setYearsSinceQuit] = useState(0);
  const [environment, setEnvironment] = useState([]);
  const [history, setHistory] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  useEffect(() => {
    if (!loading && !user) navigate({
      to: "/auth"
    });
  }, [user, loading, navigate]);
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("age").eq("id", user.id).maybeSingle().then(({
      data
    }) => {
      if (data?.age) setAge(Number(data.age));
    });
  }, [user]);
  const [vocsRiskLevel, setVocsRiskLevel] = useState(null);
  const simulateNormal = () => {
    setScanning(true);
    setVocs(null);
    setTimeout(() => {
      const s = simulateVOCsNormal();
      setVocs(s);
      setScanTime(/* @__PURE__ */ new Date());
      setScanning(false);
      const tmp = calcRisk({
        age,
        smoking: {
          status: "never",
          types: [],
          packsPerDay: 0,
          years: 0,
          yearsSinceQuit: 0
        },
        environment: [],
        history: [],
        vocs: s
      });
      setVocsRiskLevel(tmp.level);
    }, 900 + Math.random() * 600);
  };
  const simulateRisk = () => {
    setScanning(true);
    setVocs(null);
    setTimeout(() => {
      const s = simulateVOCsRisk();
      setVocs(s);
      setScanTime(/* @__PURE__ */ new Date());
      setScanning(false);
      const tmp = calcRisk({
        age,
        smoking: {
          status: "current",
          types: ["cigarette"],
          packsPerDay: 1,
          years: 10,
          yearsSinceQuit: 0
        },
        environment: ["pm25"],
        history: [],
        vocs: s
      });
      setVocsRiskLevel(tmp.level);
    }, 900 + Math.random() * 600);
  };
  useMemo(() => {
    if (!scanTime) return "";
    return scanTime.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }, [scanTime]);
  const vocsSectionClass = vocsRiskLevel === "high" ? "bg-red-50 border-red-200" : vocsRiskLevel === "medium" ? "bg-orange-50 border-orange-200" : vocsRiskLevel === "low" ? "bg-emerald-50 border-emerald-200" : "bg-white";
  const isVocStep = step === 0;
  const isSurveyStep = step === 1;
  const goNext = () => {
    if (vocs) setStep(1);
  };
  const goBack = () => setStep(0);
  const onAnalyze = async () => {
    if (!user || !vocs) {
      toast.error("กรุณาตรวจค่า VOCs ก่อน");
      return;
    }
    setAnalyzing(true);
    setStep(2);
    const {
      score,
      level
    } = calcRisk({
      age,
      smoking: {
        status: smokingStatus,
        types: smokingTypes,
        packsPerDay,
        years,
        yearsSinceQuit
      },
      environment,
      history,
      vocs
    });
    const result = await analyzeFn({
      data: {
        riskScore: score,
        riskLevel: level === "low" ? "ต่ำ" : level === "medium" ? "ปานกลาง" : "สูง",
        vocs,
        smoking: {
          status: smokingStatus,
          type: smokingTypes,
          packsPerDay,
          years,
          yearsSinceQuit
        },
        environment: environment.map((k) => ENV_LABELS[k] ?? k),
        history: [...history.map((k) => HISTORY_LABELS[k] ?? k), ...symptoms],
        age
      }
    });
    const {
      data: rec,
      error
    } = await supabase.from("health_records").insert({
      user_id: user.id,
      voc_values: vocs,
      symptoms: {
        age,
        smoking: {
          status: smokingStatus,
          types: smokingTypes,
          packsPerDay,
          years,
          yearsSinceQuit
        },
        environment,
        history,
        symptoms
      },
      risk_level: level,
      risk_score: score,
      ai_analysis: result.analysis
    }).select("id").single();
    setAnalyzing(false);
    if (error || !rec) {
      toast.error("บันทึกผลไม่สำเร็จ");
      setStep(1);
      return;
    }
    navigate({
      to: "/result/$id",
      params: {
        id: rec.id
      }
    });
  };
  if (loading || !user) return null;
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#F8FAFC]", children: [
    /* @__PURE__ */ jsx(AppHeader, {}),
    /* @__PURE__ */ jsxs("main", { className: "container mx-auto max-w-5xl space-y-6 px-4 py-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "bg-gradient-to-r from-blue-700 to-orange-600 bg-clip-text text-3xl font-bold text-transparent", children: "ประเมินความเสี่ยงมะเร็งปอด" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-slate-500", children: "ระบบ Breathomics + แบบประเมินพฤติกรรม" })
      ] }),
      /* @__PURE__ */ jsx(Stepper, { step }),
      isVocStep && /* @__PURE__ */ jsxs("section", { className: cn("rounded-3xl p-6 shadow-[var(--shadow-card)] transition", vocsSectionClass), children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-orange-500 text-white", children: /* @__PURE__ */ jsx(Wind, { className: "h-6 w-6" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-900", children: "ส่วนที่ 1: การจำลองสัญญาณชีวภาพ" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "สุ่มค่าเซนเซอร์ 13 ตัวตามงานวิจัย พร้อมสีบ่งชี้ภาวะความเสี่ยง" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-3", children: [
            /* @__PURE__ */ jsx(Button, { onClick: simulateNormal, disabled: scanning, variant: "outline", size: "lg", className: "rounded-full", children: scanning ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
              "กำลังอ่าน..."
            ] }) : "สุ่มค่ากลุ่มคนปกติ" }),
            /* @__PURE__ */ jsx(Button, { onClick: simulateRisk, disabled: scanning, className: "rounded-full bg-orange-600 text-white shadow-md hover:bg-orange-700", size: "lg", children: scanning ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
              "กำลังอ่าน..."
            ] }) : "สุ่มค่ากลุ่มเสี่ยง" })
          ] })
        ] }),
        !vocs && !scanning && /* @__PURE__ */ jsxs("div", { className: "mt-6 rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center", children: [
          /* @__PURE__ */ jsx(FlaskConical, { className: "mx-auto h-10 w-10 text-slate-300" }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-slate-500", children: "กดปุ่มด้านบนเพื่อสุ่มค่าเซนเซอร์กลุ่มคนปกติหรือกลุ่มเสี่ยง" })
        ] }),
        vocs && /* @__PURE__ */ jsx("div", { className: "mt-6 grid grid-cols-2 gap-3 md:grid-cols-4", children: Object.keys(VOC_META).map((name) => /* @__PURE__ */ jsx(VOCCard, { name, value: vocs[name] ?? 0 }, name)) })
      ] }),
      isSurveyStep && /* @__PURE__ */ jsxs("section", { className: "rounded-3xl bg-white p-6 shadow-[var(--shadow-card)] space-y-7", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-blue-600 text-white", children: /* @__PURE__ */ jsx(Activity, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-slate-900", children: "ส่วนที่ 2: แบบสอบถามความเสี่ยง" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500", children: "ตอบคำถามเพื่อให้การคำนวณผลแม่นยำ" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(ChoiceGroup, { title: "คุณเคยสูบบุหรี่หรือไม่", value: smokingStatus, onChange: (v) => setSmokingStatus(v), options: [{
          v: "never",
          l: "ไม่เคยสูบเลย"
        }, {
          v: "current",
          l: "ยังสูบอยู่ในตอนนี้"
        }, {
          v: "former",
          l: "เคยสูบ แต่เลิกแล้ว"
        }] }),
        smokingStatus !== "never" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-3", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "mb-2 text-sm font-semibold text-slate-700", children: "จำนวนซอง / วัน" }),
              /* @__PURE__ */ jsx(Input, { type: "number", min: 0, step: 0.5, value: packsPerDay, onChange: (e) => setPacksPerDay(Number(e.target.value)), className: "h-12 rounded-2xl border-2 text-lg" })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "mb-2 text-sm font-semibold text-slate-700", children: "สูบมากี่ปี" }),
              /* @__PURE__ */ jsx(Input, { type: "number", min: 0, value: years, onChange: (e) => setYears(Number(e.target.value)), className: "h-12 rounded-2xl border-2 text-lg" })
            ] }),
            smokingStatus === "former" && /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "mb-2 text-sm font-semibold text-slate-700", children: "เลิกมากี่ปีแล้ว" }),
              /* @__PURE__ */ jsx(Input, { type: "number", min: 0, value: yearsSinceQuit, onChange: (e) => setYearsSinceQuit(Number(e.target.value)), className: "h-12 rounded-2xl border-2 text-lg" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(ChoiceGroup, { title: "ประเภทที่สูบ (เลือกได้หลายข้อ)", multi: true, value: smokingTypes, onChange: setSmokingTypes, options: [{
            v: "cigarette",
            l: "บุหรี่ธรรมดา"
          }, {
            v: "ecig",
            l: "บุหรี่ไฟฟ้า / Vape"
          }, {
            v: "cannabis",
            l: "กัญชา (เสี่ยงกว่าบุหรี่ 2 เท่า)"
          }] })
        ] }),
        /* @__PURE__ */ jsx(ChoiceGroup, { title: "สภาพแวดล้อม / อาชีพที่ต้องเจอเป็นประจำ", multi: true, value: environment, onChange: setEnvironment, options: Object.entries(ENV_LABELS).map(([k, l]) => ({
          v: k,
          l
        })) }),
        /* @__PURE__ */ jsx(ChoiceGroup, { title: "ประวัติสุขภาพและพันธุกรรม", multi: true, value: history, onChange: setHistory, options: Object.entries(HISTORY_LABELS).map(([k, l]) => ({
          v: k,
          l
        })) }),
        /* @__PURE__ */ jsx(ChoiceGroup, { title: "อาการเบื้องต้นที่พบบ่อย (ถ้ามี)", multi: true, value: symptoms, onChange: setSymptoms, options: [{
          v: "ไอเรื้อรังเกิน 3 สัปดาห์",
          l: "ไอเรื้อรังเกิน 3 สัปดาห์"
        }, {
          v: "ไอเป็นเลือดหรือมีเสมหะปนเลือด",
          l: "ไอเป็นเลือดหรือมีเสมหะปนเลือด"
        }, {
          v: "เหนื่อยง่าย หายใจลำบาก",
          l: "เหนื่อยง่าย หายใจลำบาก"
        }, {
          v: "เจ็บหน้าอกเรื้อรัง",
          l: "เจ็บหน้าอกเรื้อรัง"
        }, {
          v: "น้ำหนักลดโดยไม่ทราบสาเหตุ",
          l: "น้ำหนักลดโดยไม่ทราบสาเหตุ"
        }, {
          v: "เสียงแหบเรื้อรัง",
          l: "เสียงแหบเรื้อรัง"
        }] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "sticky bottom-4 z-10", children: [
        isVocStep && /* @__PURE__ */ jsx(Button, { size: "lg", disabled: !vocs, onClick: goNext, className: "h-16 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-orange-600 text-lg font-semibold text-white shadow-xl hover:from-blue-700 hover:to-orange-700", children: vocs ? "ถัดไป" : "กรุณาสุ่มค่าสำหรับไปขั้นตอนถัดไป" }),
        isSurveyStep && /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", size: "lg", onClick: goBack, className: "h-16 w-full rounded-2xl border-blue-600 text-blue-600", children: "ย้อนกลับ" }),
          /* @__PURE__ */ jsx(Button, { size: "lg", disabled: analyzing, onClick: onAnalyze, className: "h-16 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-orange-600 text-lg font-semibold text-white shadow-xl hover:from-blue-700 hover:to-orange-700", children: analyzing ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-5 w-5 animate-spin" }),
            "กำลังวิเคราะห์..."
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(CircleCheckBig, { className: "mr-2 h-5 w-5" }),
            "คำนวณผลลัพธ์"
          ] }) })
        ] }),
        !vocs && isVocStep && /* @__PURE__ */ jsx("p", { className: "mt-2 text-center text-sm text-slate-500", children: "กรุณากดสุ่มค่าก่อนเพื่อไปยังขั้นตอนถัดไป" })
      ] })
    ] })
  ] });
}
export {
  Assessment as component
};
