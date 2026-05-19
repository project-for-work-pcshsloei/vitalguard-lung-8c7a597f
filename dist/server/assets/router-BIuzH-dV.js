import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { Toaster as Toaster$1 } from "sonner";
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const appCss = "/assets/styles-DUsAvAk6.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$8 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "VitalGuard Expert" },
      { name: "description", content: "ระบบคัดกรองความเสี่ยงมะเร็งปอดด้วย AI" },
      { name: "author", content: "VitalGuard" },
      { property: "og:title", content: "VitalGuard Expert" },
      { property: "og:description", content: "ระบบคัดกรองความเสี่ยงมะเร็งปอดด้วย AI" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "VitalGuard Expert" },
      { name: "twitter:description", content: "ระบบคัดกรองความเสี่ยงมะเร็งปอดด้วย AI" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2f97f156-f8b4-4126-b7e6-14f400b29867/id-preview-d487b4bb--78c4a628-17ab-470c-a2ee-afd83d2ef5af.lovable.app-1778823439887.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/2f97f156-f8b4-4126-b7e6-14f400b29867/id-preview-d487b4bb--78c4a628-17ab-470c-a2ee-afd83d2ef5af.lovable.app-1778823439887.png" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$8.useRouteContext();
  return /* @__PURE__ */ jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(Toaster, { richColors: true, position: "top-center" })
  ] });
}
const $$splitComponentImporter$7 = () => import("./profile-DfwZLnHi.js");
const Route$7 = createFileRoute("/profile")({
  head: () => ({
    meta: [{
      title: "โปรไฟล์ — VitalGuard Expert"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./knowledge-DPdoNLHL.js");
const Route$6 = createFileRoute("/knowledge")({
  head: () => ({
    meta: [{
      title: "ความรู้สู้มะเร็ง — VitalGuard Expert"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./history-t10njA51.js");
const Route$5 = createFileRoute("/history")({
  head: () => ({
    meta: [{
      title: "ประวัติสุขภาพ — VitalGuard Expert"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./dashboard-Bz_z7n7F.js");
const Route$4 = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{
      title: "แดชบอร์ด — VitalGuard Expert"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./auth-Ddaf5fws.js");
const Route$3 = createFileRoute("/auth")({
  head: () => ({
    meta: [{
      title: "เข้าสู่ระบบ — VitalGuard Expert"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./assessment-BTopwQkd.js");
const Route$2 = createFileRoute("/assessment")({
  head: () => ({
    meta: [{
      title: "ประเมินความเสี่ยง — VitalGuard Expert"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./index-hK-_sVxu.js");
const Route$1 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "VitalGuard Expert — คัดกรองความเสี่ยงมะเร็งปอด"
    }, {
      name: "description",
      content: "ระบบคัดกรองความเสี่ยงมะเร็งปอดเบื้องต้น โดยวิเคราะห์ค่าสารระเหย VOCs ร่วมกับพฤติกรรมและสิ่งแวดล้อม"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./result._id-BNpv340H.js");
const Route = createFileRoute("/result/$id")({
  head: () => ({
    meta: [{
      title: "ผลการวิเคราะห์ — VitalGuard"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const ProfileRoute = Route$7.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => Route$8
});
const KnowledgeRoute = Route$6.update({
  id: "/knowledge",
  path: "/knowledge",
  getParentRoute: () => Route$8
});
const HistoryRoute = Route$5.update({
  id: "/history",
  path: "/history",
  getParentRoute: () => Route$8
});
const DashboardRoute = Route$4.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => Route$8
});
const AuthRoute = Route$3.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$8
});
const AssessmentRoute = Route$2.update({
  id: "/assessment",
  path: "/assessment",
  getParentRoute: () => Route$8
});
const IndexRoute = Route$1.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$8
});
const ResultIdRoute = Route.update({
  id: "/result/$id",
  path: "/result/$id",
  getParentRoute: () => Route$8
});
const rootRouteChildren = {
  IndexRoute,
  AssessmentRoute,
  AuthRoute,
  DashboardRoute,
  HistoryRoute,
  KnowledgeRoute,
  ProfileRoute,
  ResultIdRoute
};
const routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route as R,
  router as r
};
