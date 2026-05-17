import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Stethoscope, LogOut, Home, Activity, History, User } from "lucide-react";
import { toast } from "sonner";

export function AppHeader() {
  const navigate = useNavigate();
  const onLogout = async () => {
    await supabase.auth.signOut();
    toast.success("ออกจากระบบแล้ว");
    navigate({ to: "/" });
  };
  return (
    <header className="border-b bg-white/95 backdrop-blur sticky top-0 z-20 shadow-sm">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <Stethoscope className="h-6 w-6 text-blue-600" />
          <Link to="/dashboard" className="text-lg font-semibold text-slate-900">VitalGuard</Link>
        </div>
        <nav className="hidden flex-1 items-center justify-center gap-2 md:flex">
          <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            <Home className="h-4 w-4" /> หน้าหลัก
          </Link>
          <Link to="/assessment" className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            <Activity className="h-4 w-4" /> ประเมินความเสี่ยง
          </Link>
          <Link to="/history" className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            <History className="h-4 w-4" /> ประวัติ
          </Link>
          <Link to="/profile" className="inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            <User className="h-4 w-4" /> โปรไฟล์
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onLogout} className="rounded-full">
            <LogOut className="h-4 w-4" /> ออกจากระบบ
          </Button>
        </div>
      </div>
    </header>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
