import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import * as React from "react";
import { useState, useEffect } from "react";
import { u as useAuth } from "./use-auth-DVHOHR6L.js";
import { s as supabase } from "./client-CZVAA-Hl.js";
import { c as cn, B as Button } from "./button-DjOZMqFS.js";
import { I as Input } from "./input-D_U8fI25.js";
import { L as Label } from "./label-C8WJLhmR.js";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { toast } from "sonner";
import { Stethoscope } from "lucide-react";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.List,
  {
    ref,
    className: cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = TabsPrimitive.List.displayName;
const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const TabsContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Content,
  {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
function AuthPage() {
  const {
    user,
    loading: authLoading
  } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!authLoading && user) navigate({
      to: "/dashboard"
    });
  }, [user, authLoading, navigate]);
  const onLogin = async (e) => {
    e.preventDefault();
    setBusy(true);
    const {
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setBusy(false);
    if (error) toast.error("เข้าสู่ระบบไม่สำเร็จ: " + error.message);
    else {
      toast.success("ยินดีต้อนรับ");
      navigate({
        to: "/dashboard"
      });
    }
  };
  const onSignup = async (e) => {
    e.preventDefault();
    setBusy(true);
    const {
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });
    setBusy(false);
    if (error) toast.error("ลงทะเบียนไม่สำเร็จ: " + error.message);
    else toast.success("ลงทะเบียนสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยัน");
  };
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center px-4", style: {
    background: "var(--gradient-calm)"
  }, children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
    /* @__PURE__ */ jsxs(Link, { to: "/", className: "mb-6 flex items-center justify-center gap-2 text-primary", children: [
      /* @__PURE__ */ jsx(Stethoscope, { className: "h-7 w-7" }),
      /* @__PURE__ */ jsx("span", { className: "text-xl font-semibold", children: "VitalGuard Expert" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-2xl bg-card p-8 shadow-[var(--shadow-soft)]", children: /* @__PURE__ */ jsxs(Tabs, { defaultValue: "login", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "login", children: "เข้าสู่ระบบ" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "signup", children: "ลงทะเบียน" })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "login", children: /* @__PURE__ */ jsxs("form", { onSubmit: onLogin, className: "mt-6 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "login-email", children: "อีเมล" }),
          /* @__PURE__ */ jsx(Input, { id: "login-email", type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "mt-1.5" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "login-pw", children: "รหัสผ่าน" }),
          /* @__PURE__ */ jsx(Input, { id: "login-pw", type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), className: "mt-1.5" })
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: busy, children: busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ" })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "signup", children: /* @__PURE__ */ jsxs("form", { onSubmit: onSignup, className: "mt-6 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "su-email", children: "อีเมล" }),
          /* @__PURE__ */ jsx(Input, { id: "su-email", type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), className: "mt-1.5" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "su-pw", children: "รหัสผ่าน (อย่างน้อย 6 ตัว)" }),
          /* @__PURE__ */ jsx(Input, { id: "su-pw", type: "password", required: true, minLength: 6, value: password, onChange: (e) => setPassword(e.target.value), className: "mt-1.5" })
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: busy, children: busy ? "กำลังลงทะเบียน..." : "ลงทะเบียน" })
      ] }) })
    ] }) })
  ] }) });
}
export {
  AuthPage as component
};
