import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "โปรไฟล์ — Onco-Voice Expert" }] }),
  component: ProfilePage,
});

function calcAge(d: string) {
  if (!d) return "";
  const b = new Date(d);
  const diff = Date.now() - b.getTime();
  const age = new Date(diff).getUTCFullYear() - 1970;
  return age >= 0 ? `${age} ปี` : "";
}

function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [busy, setBusy] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setFullName(data.full_name ?? "");
        setBirthDate(data.birth_date ?? "");
        setGender(data.gender ?? "");
      }
      setInitialLoad(false);
    });
  }, [user]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    // Wait for Supabase to confirm before navigating away (prevents page hang)
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      birth_date: birthDate || null,
      gender: gender || null,
      updated_at: new Date().toISOString(),
    });
    setBusy(false);
    if (error) {
      toast.error("บันทึกไม่สำเร็จ: " + error.message);
      return;
    }
    toast.success("บันทึกโปรไฟล์เรียบร้อย");
    navigate({ to: "/dashboard" });
  };

  if (loading || !user || initialLoad) return null;

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-xl">
        <h1 className="text-3xl font-bold">โปรไฟล์ของคุณ</h1>
        <p className="mt-2 text-muted-foreground">ข้อมูลพื้นฐานช่วยให้การประเมินแม่นยำขึ้น</p>

        <form onSubmit={onSave} className="mt-8 space-y-5 rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
          <div>
            <Label htmlFor="name">ชื่อ-นามสกุล</Label>
            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5" placeholder="เช่น สมชาย ใจดี" />
          </div>
          <div>
            <Label htmlFor="bd">วันเกิด</Label>
            <Input id="bd" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mt-1.5" />
            {birthDate && <p className="mt-1 text-sm text-muted-foreground">อายุ: {calcAge(birthDate)}</p>}
          </div>
          <div>
            <Label>เพศ</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="เลือกเพศ" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">ชาย</SelectItem>
                <SelectItem value="female">หญิง</SelectItem>
                <SelectItem value="other">อื่นๆ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy ? "กำลังบันทึก..." : "บันทึก"}
          </Button>
        </form>
      </main>
    </div>
  );
}
