import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { u as useAuth } from "./use-auth-DVHOHR6L.js";
import { B as Button } from "./button-DjOZMqFS.js";
import { Stethoscope, Sparkles, Wind, ShieldCheck } from "lucide-react";
import "./client-CZVAA-Hl.js";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
function Landing() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && user) navigate({
      to: "/dashboard"
    });
  }, [user, loading, navigate]);
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", style: {
    background: "var(--gradient-calm)"
  }, children: [
    /* @__PURE__ */ jsxs("header", { className: "container mx-auto flex items-center justify-between px-6 py-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-primary", children: [
        /* @__PURE__ */ jsx(Stethoscope, { className: "h-7 w-7" }),
        /* @__PURE__ */ jsx("span", { className: "text-xl font-semibold", children: "VitalGuard Expert" })
      ] }),
      /* @__PURE__ */ jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "เข้าสู่ระบบ" }) })
    ] }),
    /* @__PURE__ */ jsxs("main", { className: "container mx-auto px-6 pt-12 pb-24", children: [
      /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl text-center", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm text-primary shadow-sm", children: [
          /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
          " ผู้ช่วยคัดกรองอัจฉริยะ"
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "text-4xl font-bold leading-tight text-foreground md:text-5xl", children: [
          "รู้ทันความเสี่ยงมะเร็งปอด",
          /* @__PURE__ */ jsx("br", {}),
          "ก่อนสายเกินไป"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-6 text-lg text-muted-foreground", children: "วิเคราะห์ความเสี่ยงเบื้องต้นด้วยการผสานข้อมูลค่าสารระเหย (VOCs) กับพฤติกรรมและสิ่งแวดล้อม พร้อมคำอธิบายภาษาเข้าใจง่าย จากผู้เชี่ยวชาญ AI" }),
        /* @__PURE__ */ jsx("div", { className: "mt-8 flex flex-wrap justify-center gap-3", children: /* @__PURE__ */ jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsx(Button, { size: "lg", className: "text-base", children: "เริ่มต้นใช้งาน" }) }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mx-auto mt-20 grid max-w-5xl gap-6 md:grid-cols-3", children: [{
        icon: Wind,
        title: "ตรวจค่า VOCs",
        desc: "จำลองค่าสารระเหยในลมหายใจที่อาจบ่งชี้ความเสี่ยง"
      }, {
        icon: Stethoscope,
        title: "วิเคราะห์โดย AI",
        desc: "ผสานข้อมูลพฤติกรรม สิ่งแวดล้อม และพันธุกรรม"
      }, {
        icon: ShieldCheck,
        title: "ปลอดภัยและส่วนตัว",
        desc: "ข้อมูลเข้ารหัส เก็บเฉพาะของคุณเท่านั้น"
      }].map((f) => /* @__PURE__ */ jsxs("div", { className: "rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]", children: [
        /* @__PURE__ */ jsx(f.icon, { className: "mb-3 h-8 w-8 text-primary" }),
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: f.title }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-base text-muted-foreground", children: f.desc })
      ] }, f.title)) })
    ] })
  ] });
}
export {
  Landing as component
};
