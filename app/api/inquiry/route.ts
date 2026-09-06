import { NextResponse } from "next/server";
import { inquirySchema } from "@/lib/schemas";
import { getDb } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import {
  checkImage,
  extForType,
  getMediaBucket,
  MAX_FILES_PER_LEAD,
  putObject,
} from "@/lib/storage/r2";

/**
 * 預約詢價合併表單的接收端點。
 * 接受 `multipart/form-data`（含現場照片）或 `application/json`（無照片）。
 * 寫入 Turso `leads`（status「待處理」）＋ 照片上傳 R2。**不發任何通知。**
 */
export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  let fields: Record<string, unknown> = {};
  const photoFiles: File[] = [];

  if (contentType.includes("multipart/form-data")) {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json(
        { ok: false, message: "資料格式錯誤" },
        { status: 400 },
      );
    }
    for (const [k, v] of form.entries()) {
      if (k === "photos") {
        if (v instanceof File && v.size > 0) photoFiles.push(v);
      } else if (typeof v === "string") {
        fields[k] = v;
      }
    }
  } else {
    try {
      fields = (await request.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json(
        { ok: false, message: "資料格式錯誤" },
        { status: 400 },
      );
    }
  }

  // 蜜罐命中（在 schema 驗證前先攔）：假裝成功，不做任何事
  if (typeof fields.company === "string" && fields.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const parsed = inquirySchema.safeParse(fields);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "表單驗證未通過",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- 排除蜜罐欄位
  const { company: _honeypot, ...lead } = parsed.data;

  const leadId = crypto.randomUUID();

  // 照片：盡力上傳，個別失敗不影響整筆詢價（前端已先擋型別／大小）
  const photoKeys: string[] = [];
  const bucket = getMediaBucket();
  if (bucket && photoFiles.length > 0) {
    for (const file of photoFiles.slice(0, MAX_FILES_PER_LEAD)) {
      if (!checkImage(file).ok) continue;
      const key = `leads/${leadId}/${crypto.randomUUID()}.${extForType(file.type)}`;
      try {
        await putObject(key, await file.arrayBuffer(), file.type);
        photoKeys.push(key);
      } catch (err) {
        console.warn("[inquiry] 照片上傳失敗，略過：", err);
      }
    }
  } else if (!bucket && photoFiles.length > 0) {
    console.warn(
      "[inquiry] 收到照片但 R2 MEDIA 未綁定，僅寫入文字內容",
    );
  }

  try {
    await getDb()
      .insert(leads)
      .values({
        id: leadId,
        name: lead.name,
        contact: lead.contact,
        address: lead.address,
        serviceType: lead.serviceType,
        preferredTime: lead.preferredTime || null,
        description: lead.description,
        photoKeys,
      });
  } catch (err) {
    console.error("[inquiry] 寫入 leads 失敗：", err);
    return NextResponse.json(
      { ok: false, message: "系統忙碌，請稍後再試或直接來電。" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "已收到您的詢問，我們會盡快與您聯繫。",
  });
}

export function GET() {
  return NextResponse.json(
    { ok: false, message: "此端點僅接受表單送出（POST）" },
    { status: 405 },
  );
}
