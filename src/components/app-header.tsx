import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Stethoscope, LogOut, User as UserIcon, Home } from "lucide-react";
import { toast } from "sonner";

export function AppHeader() {
  const navigate = useNavigate();
  const onLogout = async () => {
    await supabase.auth.signOut();
    toast.success("ออกจากระบบแล้ว");
    navigate({ to: "/" });
  };
  return (
    <header className="border-b bg-card/80 backdrop-blur sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/dashboard" className="flex items-center gap-2 text-primary">
          <Stethoscope className="h-6 w-6" />
          <span className="text-lg font-semibold">Onco-Voice</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link to="/dashboard"><Button variant="ghost" size="sm"><Home className="h-4 w-4" /></Button></Link>
          <Link to="/profile"><Button variant="ghost" size="sm"><UserIcon className="h-4 w-4" /></Button></Link>
          <Button variant="ghost" size="sm" onClick={onLogout}><LogOut className="h-4 w-4" /></Button>
        </nav>
      </div>
    </header>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
