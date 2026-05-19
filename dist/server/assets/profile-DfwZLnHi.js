import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useState, useEffect } from "react";
import { u as useAuth } from "./use-auth-DVHOHR6L.js";
import { s as supabase } from "./client-CZVAA-Hl.js";
import { A as AppHeader } from "./app-header-0F0AWFJG.js";
import { c as cn, B as Button } from "./button-DjOZMqFS.js";
import { I as Input } from "./input-D_U8fI25.js";
import { L as Label } from "./label-C8WJLhmR.js";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsx(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
function ProfilePage() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [busy, setBusy] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  useEffect(() => {
    if (!loading && !user) navigate({
      to: "/auth"
    });
  }, [user, loading, navigate]);
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({
      data
    }) => {
      if (data) {
        setFullName(data.full_name ?? "");
        setAge(data.age ?? "");
        setGender(data.gender ?? "");
      }
      setInitialLoad(false);
    });
  }, [user]);
  const onSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    const {
      error
    } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      age: age || null,
      gender: gender || null,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    setBusy(false);
    if (error) {
      toast.error("บันทึกไม่สำเร็จ: " + error.message);
      return;
    }
    toast.success("บันทึกโปรไฟล์เรียบร้อย");
    navigate({
      to: "/dashboard"
    });
  };
  if (loading || !user || initialLoad) return null;
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen", children: [
    /* @__PURE__ */ jsx(AppHeader, {}),
    /* @__PURE__ */ jsxs("main", { className: "container mx-auto px-4 py-8 max-w-xl", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold", children: "โปรไฟล์ของคุณ" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-muted-foreground", children: "ข้อมูลพื้นฐานช่วยให้การประเมินแม่นยำขึ้น" }),
      /* @__PURE__ */ jsxs("form", { onSubmit: onSave, className: "mt-8 space-y-5 rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "ชื่อ-นามสกุล" }),
          /* @__PURE__ */ jsx(Input, { id: "name", value: fullName, onChange: (e) => setFullName(e.target.value), className: "mt-1.5", placeholder: "เช่น สมชาย ใจดี" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "age", children: "อายุ (ปี)" }),
          /* @__PURE__ */ jsx(Input, { id: "age", type: "number", value: age, onChange: (e) => setAge(e.target.value ? Number(e.target.value) : ""), className: "mt-1.5" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "กรุณากรอกอายุเพื่อใช้ในการประเมิน" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "เพศ" }),
          /* @__PURE__ */ jsxs(Select, { value: gender, onValueChange: setGender, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "mt-1.5", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "เลือกเพศ" }) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "male", children: "ชาย" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "female", children: "หญิง" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "other", children: "อื่นๆ" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", size: "lg", disabled: busy, children: busy ? "กำลังบันทึก..." : "บันทึก" })
      ] })
    ] })
  ] });
}
export {
  ProfilePage as component
};
