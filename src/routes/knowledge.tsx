import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/app-header";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/knowledge")({
  head: () => ({ meta: [{ title: "ความรู้สู้มะเร็ง — Onco-Voice Expert" }] }),
  component: KnowledgePage,
});

const articles = [
  {
    title: "VOCs คืออะไร? ทำไมจึงสำคัญต่อการคัดกรองมะเร็งปอด",
    body: "สารอินทรีย์ระเหยง่าย (Volatile Organic Compounds: VOCs) เป็นโมเลกุลที่ออกมากับลมหายใจ งานวิจัยตีพิมพ์ใน Journal of Thoracic Oncology พบว่าผู้ป่วยมะเร็งปอดมักมีค่า Benzene, Pentane และ Toluene สูงกว่าคนทั่วไป การตรวจลมหายใจจึงเป็นหนึ่งในแนวทางคัดกรองที่ไม่รุกล้ำ",
  },
  {
    title: "บุหรี่ไฟฟ้าและกัญชา: ความเสี่ยงที่ถูกประเมินต่ำ",
    body: "ผลศึกษาจาก American Lung Association ระบุว่าควันกัญชามีสารทาร์และสารก่อมะเร็งมากกว่าควันบุหรี่ปกติประมาณ 2 เท่า ส่วนบุหรี่ไฟฟ้าแม้จะปล่อยควันน้อยกว่า แต่มีโลหะหนักและสาร diacetyl ที่ทำลายเนื้อเยื่อปอด",
  },
  {
    title: "ฝุ่น PM2.5 และอาชีพเสี่ยง",
    body: "องค์การอนามัยโลก (WHO) จัดให้มลภาวะทางอากาศและฝุ่น PM2.5 เป็นสารก่อมะเร็งกลุ่ม 1 อาชีพที่สัมผัสฝุ่นซิลิกา (โรงโม่หิน) แร่ใยหิน (รื้อตึกเก่า ซ่อมเบรก) นิกเกิล/โครเมียม (ชุบโลหะ) มีความเสี่ยงสูงกว่าทั่วไป 2-5 เท่า",
  },
  {
    title: "Low-dose CT Scan: เครื่องมือคัดกรองมาตรฐาน",
    body: "หากคุณมีความเสี่ยงสูง การตรวจ Low-dose CT Scan ปีละ 1 ครั้งสามารถลดอัตราการเสียชีวิตจากมะเร็งปอดได้ถึง 20% (อ้างอิง National Lung Screening Trial)",
  },
];

function KnowledgePage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">ความรู้สู้มะเร็ง</h1>
        </div>
        <p className="mt-2 text-muted-foreground">บทความสรุปจากงานวิจัยทางการแพทย์</p>

        <div className="mt-8 space-y-4">
          {articles.map((a, i) => (
            <article key={i} className="rounded-2xl bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="text-xl font-semibold">{a.title}</h2>
              <p className="mt-3 leading-relaxed text-foreground/90">{a.body}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
