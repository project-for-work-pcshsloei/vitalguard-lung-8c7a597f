import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { s as supabase } from "./client-CZVAA-Hl.js";
import { B as Button } from "./button-DjOZMqFS.js";
import { Stethoscope, Home, Activity, History, User, LogOut } from "lucide-react";
import { toast } from "sonner";
function AppHeader() {
  const navigate = useNavigate();
  const onLogout = async () => {
    await supabase.auth.signOut();
    toast.success("ออกจากระบบแล้ว");
    navigate({ to: "/" });
  };
  return /* @__PURE__ */ jsx("header", { className: "border-b bg-white/95 backdrop-blur sticky top-0 z-20 shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(Stethoscope, { className: "h-6 w-6 text-blue-600" }),
      /* @__PURE__ */ jsx(Link, { to: "/dashboard", className: "text-lg font-semibold text-slate-900", children: "VitalGuard" })
    ] }),
    /* @__PURE__ */ jsxs("nav", { className: "hidden flex-1 items-center justify-center gap-2 md:flex", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/dashboard", className: "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100", children: [
        /* @__PURE__ */ jsx(Home, { className: "h-4 w-4" }),
        " หน้าหลัก"
      ] }),
      /* @__PURE__ */ jsxs(Link, { to: "/assessment", className: "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100", children: [
        /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4" }),
        " ประเมินความเสี่ยง"
      ] }),
      /* @__PURE__ */ jsxs(Link, { to: "/history", className: "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100", children: [
        /* @__PURE__ */ jsx(History, { className: "h-4 w-4" }),
        " ประวัติ"
      ] }),
      /* @__PURE__ */ jsxs(Link, { to: "/profile", className: "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100", children: [
        /* @__PURE__ */ jsx(User, { className: "h-4 w-4" }),
        " โปรไฟล์"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: onLogout, className: "rounded-full", children: [
      /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
      " ออกจากระบบ"
    ] }) })
  ] }) });
}
export {
  AppHeader as A
};
