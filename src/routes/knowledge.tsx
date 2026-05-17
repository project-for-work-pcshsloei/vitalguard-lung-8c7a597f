import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppHeader } from "@/components/app-header";
import { useTTS } from "@/hooks/use-tts";
import { BookOpen, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/knowledge")({
  head: () => ({ meta: [{ title: "ความรู้สู้มะเร็ง — VitalGuard Expert" }] }),
  component: KnowledgePage,
});

const articles = [
  {
    title: "มะเร็งปอดยังคงเป็นภัยใกล้ตัว",
    body: "งานวิจัยทั้ง 8 ชิ้นสรุปว่ามะเร็งปอดยังเป็นสาเหตุสำคัญของการเสียชีวิต โดยควันบุหรี่ ฝุ่น PM2.5 และก๊าซพิษในอากาศเป็นปัจจัยเสี่ยงหลัก",
  },
  {
    title: "ควันบุหรี่และฝุ่นพิษเพิ่มความเสี่ยง",
    body: "งานวิจัยพบว่าการสูบบุหรี่เป็นปัจจัยเสี่ยงชั้นนำ ส่วนการสัมผัสฝุ่น PM2.5, เรดอน หรือสารเคมีในบ้านเพิ่มโอกาสเกิดมะเร็งปอดอย่างชัดเจน",
  },
  {
    title: "เรดอนในบ้านทำให้เสี่ยงขึ้น",
    body: "งานวิจัยชี้ว่าการระบายอากาศไม่ดีและพื้นที่ใต้ดินทำให้เรดอนสะสม การเปิดหน้าต่างระบายอากาศและลดการใช้พื้นที่ชั้นล่างช่วยลดความเสี่ยงได้",
  },
  {
    title: "เซนเซอร์ VOCs ช่วยคัดกรองเบื้องต้น",
    body: "บทศึกษา VOCs ในลมหายใจพบว่าเซนเซอร์สามารถจับสัญญาณจากสารระเหยที่สัมพันธ์กับเซลล์มะเร็งได้ แต่ต้องการมาตรฐานการเก็บตัวอย่างและการวิเคราะห์ให้แม่นยำขึ้น",
  },
  {
    title: "e-nose ให้ผลเร็วและคัดกรองได้ดี",
    body: "งานวิจัยอุปกรณ์ e-nose พบความแม่นยำสูงเมื่อเทียบกับเครื่องมือมาตรฐาน และสามารถให้ผลได้ภายในเวลาสั้น เหมาะสำหรับการคัดกรองเบื้องต้น",
  },
  {
    title: "เซนเซอร์ TGS/MQ ทำงานได้ดีใกล้เคียงกัน",
    body: "ข้อมูลวิจัยเปรียบเทียบเทคโนโลยีพบว่าเซนเซอร์ TGS และ MQ ให้ผลใกล้เคียงกันเมื่อเทรนโมเดลอย่างถูกต้อง แต่ยังต้องการฐานข้อมูลและมาตรฐานร่วมกัน",
  },
  {
    title: "เลิกบุหรี่ช่วยลดความเสี่ยงได้มาก",
    body: "งานวิจัยยืนยันว่าเลิกบุหรี่นานกว่า 10 ปี ลดความเสี่ยงมะเร็งปอดได้อย่างมีนัยสำคัญ ยิ่งเลิกเร็ว ยิ่งดีกว่า",
  },
  {
    title: "โภชนาการที่ดีเสริมการป้องกัน",
    body: "งานวิจัยด้านโภชนาการพบว่าการกินอาหารที่มีพลังงานและโปรตีนเพียงพอ ช่วยให้ร่างกายแข็งแรงและรับมือกับการรักษาได้ดีขึ้น",
  },
];

function KnowledgePage() {
  const { speak, stop, speakingId } = useTTS();
  const articlesText = useMemo(
    () => articles.map((item) => `${item.title}. ${item.body}`).join("\n"),
    [],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">ศูนย์ความรู้ทั่วไป</h1>
              <p className="mt-2 text-slate-600">สรุปงานวิจัย 8 เรื่องในโฟลเดอร์ my research ด้วยภาษาง่าย ๆ เข้าใจได้ทันที</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => speakingId === "knowledge" ? stop() : speak(articlesText, "knowledge")}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
              speakingId === "knowledge" ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-blue-500 hover:bg-blue-50",
            )}
          >
            {speakingId === "knowledge" ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {speakingId === "knowledge" ? "หยุดอ่าน" : "ฟังบทความ"}
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <ArticleCard
            title="ผลปัจจุบัน"
            text="งานวิจัยยืนยันว่ามะเร็งปอดยังเป็นปัญหาใหญ่ในไทย โดยควันบุหรี่ ฝุ่น PM2.5 และสารเคมีในอากาศเป็นปัจจัยสำคัญที่พบในทุกบทศึกษา"
          />
          <ArticleCard
            title="คำแนะนำเร่งด่วน"
            text="หากคุณมีความเสี่ยงสูงหรือมีอาการไอเรื้อรัง ควรพบแพทย์ทันที, หลีกเลี่ยงควันบุหรี่, ใส่หน้ากากในพื้นที่ฝุ่นมาก และตรวจปอดตามคำแนะนำแพทย์"
          />
          <ArticleCard
            title="คำแนะนำทั่วไป"
            text="ไม่สูบบุหรี่, ระบายอากาศในบ้าน, สวมหน้ากากในพื้นที่ฝุ่น และกินผักผลไม้ให้เพียงพอ เป็นแนวทางที่งานวิจัยแนะนำให้ทำเป็นประจำ"
          />
          <ArticleCard
            title="คำแนะนำจากวิจัย"
            text="ผลวิจัยบอกว่าเลิกบุหรี่เกิน 10 ปีลดความเสี่ยงลงได้มาก, เซนเซอร์ VOCs ใช้คัดกรองเบื้องต้นได้, และโภชนาการที่ดีช่วยเสริมสุขภาพปอด"
          />
        </div>

        <section className="mt-10 space-y-4">
          {articles.map((article, index) => (
            <article key={index} className="rounded-3xl bg-white p-6 shadow-[var(--shadow-card)] border border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">{article.title}</h2>
              <p className="mt-3 text-slate-600 leading-relaxed">{article.body}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

function ArticleCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 text-slate-600 leading-relaxed">{text}</p>
    </div>
  );
}
