import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { u as useAuth } from "./use-auth-DVHOHR6L.js";
import { s as supabase } from "./client-CZVAA-Hl.js";
import { A as AppHeader } from "./app-header-0F0AWFJG.js";
import { B as Button } from "./button-DjOZMqFS.js";
import { ChevronRight } from "lucide-react";
import "@supabase/supabase-js";
import "sonner";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
function HistoryPage() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  useEffect(() => {
    if (!loading && !user) navigate({
      to: "/auth"
    });
  }, [user, loading, navigate]);
  useEffect(() => {
    if (!user) return;
    supabase.from("health_records").select("id,created_at,risk_score,risk_level").eq("user_id", user.id).order("created_at", {
      ascending: false
    }).then(({
      data
    }) => setRecords(data ?? []));
  }, [user]);
  if (loading || !user) return null;
  const colorOf = (l) => l === "low" ? "bg-success/20 text-success-foreground" : l === "medium" ? "bg-warning/30 text-warning-foreground" : "bg-danger/20 text-danger";
  const labelOf = (l) => l === "low" ? "ต่ำ" : l === "medium" ? "ปานกลาง" : "สูง";
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsx(AppHeader, {}),
    /* @__PURE__ */ jsxs("main", { className: "container mx-auto px-4 py-8 max-w-3xl", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold", children: "ประวัติสุขภาพ" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-muted-foreground", children: "การประเมินทั้งหมดของคุณ" }),
      records.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "mt-8 rounded-2xl bg-card p-12 text-center text-muted-foreground shadow-[var(--shadow-card)]", children: [
        "ยังไม่มีประวัติ",
        /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(Link, { to: "/assessment", children: /* @__PURE__ */ jsx(Button, { children: "เริ่มประเมิน" }) }) })
      ] }) : /* @__PURE__ */ jsx("ul", { className: "mt-6 space-y-3", children: records.map((r) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(Link, { to: "/result/$id", params: {
        id: r.id
      }, className: "flex items-center justify-between rounded-xl bg-card p-4 shadow-[var(--shadow-card)] transition hover:scale-[1.01]", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: new Date(r.created_at).toLocaleString("th-TH", {
            dateStyle: "medium",
            timeStyle: "short"
          }) }),
          /* @__PURE__ */ jsxs("div", { className: "mt-1 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: `rounded-full px-3 py-1 text-sm font-medium ${colorOf(r.risk_level)}`, children: labelOf(r.risk_level) }),
            /* @__PURE__ */ jsxs("span", { className: "text-xl font-semibold", children: [
              Number(r.risk_score),
              "%"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(ChevronRight, { className: "h-5 w-5 text-muted-foreground" })
      ] }) }, r.id)) })
    ] })
  ] });
}
export {
  HistoryPage as component
};
