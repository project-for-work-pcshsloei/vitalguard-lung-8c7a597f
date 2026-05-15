import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  riskScore: z.number(),
  riskLevel: z.string(),
  vocs: z.record(z.string(), z.number()),
  smoking: z.object({
    status: z.string(),
    type: z.array(z.string()).optional(),
    packsPerDay: z.number().optional(),
    years: z.number().optional(),
    yearsSinceQuit: z.number().optional(),
  }),
  environment: z.array(z.string()),
  history: z.array(z.string()),
  age: z.number().optional(),
});

export const analyzeRisk = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { analysis: "ไม่สามารถเชื่อมต่อระบบ AI ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง", error: "missing_key" };
    }

    const systemPrompt = `คุณคือ "Onco-Voice Expert" ผู้เชี่ยวชาญด้านมะเร็งวิทยาที่อบอุ่น เชื่อถือได้ อธิบายเรื่องยากให้เข้าใจง่ายเป็นภาษาไทยชาวบ้าน

หน้าที่: วิเคราะห์ความเสี่ยงมะเร็งปอดจากค่าสารระเหย (VOCs) ร่วมกับพฤติกรรมและสิ่งแวดล้อม โดยอ้างอิงงานวิจัยทางการแพทย์

หลักการตอบ:
- โทนอบอุ่น เป็นมิตร ไม่ทำให้ผู้ใช้ตกใจ แต่ตรงไปตรงมา
- ใช้ภาษาเข้าใจง่าย หลีกเลี่ยงศัพท์เทคนิค
- ถ้าผู้ใช้เลิกสูบเกิน 10 ปี ต้องชม "ยอดเยี่ยมมากที่คุณเลิกได้ อย่ากลับไปสูบอีกเพื่อสุขภาพปอดในระยะยาว"
- ระบุชัดเจนว่ากัญชามีสารก่อมะเร็งมากกว่ายาสูบ 2 เท่า (ถ้าเกี่ยวข้อง)
- ความเสี่ยงสูง: แนะนำ Low-dose CT Scan ทันที

โครงสร้างการตอบ (3 ส่วน, ใช้ markdown):
**[ผลปัจจุบัน]**
สรุประดับความเสี่ยงและคะแนน อธิบายความหมาย 2-3 ประโยค

**[ความรู้จากงานวิจัย]**
โยงค่า VOCs (Benzene, Pentane, VOCs รวม) เข้ากับพฤติกรรม เช่น "ค่าสารระเหยที่สูงขึ้นสอดคล้องกับการรับฝุ่นในที่ทำงาน..." อ้างอิงงานวิจัยอย่างกระชับ

**[คำแนะนำ]**
แนะนำขั้นตอนถัดไปอย่างเป็นรูปธรรม 3-5 ข้อ

ปิดท้ายด้วย: "การประเมินนี้เป็นการคัดกรองเบื้องต้น ไม่ใช่การวินิจฉัยทางการแพทย์ โปรดปรึกษาแพทย์เฉพาะทางเพื่อความแม่นยำ"`;

    const userPrompt = `ข้อมูลผู้ใช้:
- คะแนนความเสี่ยงรวม: ${data.riskScore}% (ระดับ: ${data.riskLevel})
- อายุ: ${data.age ?? "ไม่ระบุ"} ปี
- สถานะการสูบ: ${data.smoking.status}
- ประเภทที่สูบ: ${data.smoking.type?.join(", ") || "-"}
- จำนวนซอง/วัน: ${data.smoking.packsPerDay ?? 0}, สูบมา ${data.smoking.years ?? 0} ปี
- เลิกสูบมาแล้ว: ${data.smoking.yearsSinceQuit ?? 0} ปี
- ปัจจัยสิ่งแวดล้อม/อาชีพ: ${data.environment.join(", ") || "ไม่มี"}
- ประวัติสุขภาพ: ${data.history.join(", ") || "ไม่มี"}
- ค่าสารระเหย VOCs ที่ตรวจพบ: ${Object.entries(data.vocs).map(([k, v]) => `${k}=${v}`).join(", ")}

วิเคราะห์ตามรูปแบบที่กำหนด`;

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("AI error:", res.status, errText);
        if (res.status === 429) return { analysis: "ระบบ AI กำลังใช้งานมาก กรุณาลองใหม่ในอีกสักครู่", error: "rate_limit" };
        if (res.status === 402) return { analysis: "เครดิต AI หมด กรุณาเติมในการตั้งค่า workspace", error: "credits" };
        return { analysis: "ไม่สามารถวิเคราะห์ได้ในขณะนี้", error: "ai_error" };
      }

      const json = await res.json();
      const text = json.choices?.[0]?.message?.content ?? "ไม่ได้รับคำตอบจาก AI";
      return { analysis: text, error: null };
    } catch (e) {
      console.error("analyzeRisk failed", e);
      return { analysis: "เกิดข้อผิดพลาดในการเชื่อมต่อ AI", error: "network" };
    }
  });
