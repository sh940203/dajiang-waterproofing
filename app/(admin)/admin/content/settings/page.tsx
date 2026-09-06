import { PageHeader } from "@/components/admin/PageHeader";
import { getSiteSettings } from "@/lib/content/db";
import { SETTING_FIELDS } from "@/lib/validation/settings";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "網站設定" };
export const dynamic = "force-dynamic";

type CoreValue = { element: string; label: string; summary: string };

function parseCoreValues(raw: string | undefined): CoreValue[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.map((x) => ({
      element: String(x.element ?? ""),
      label: String(x.label ?? ""),
      summary: String(x.summary ?? ""),
    }));
  } catch {
    return [];
  }
}

export default async function SettingsPage() {
  const settings = await getSiteSettings();
  const initialValues = Object.fromEntries(
    SETTING_FIELDS.map((f) => [f.key, settings[f.key] ?? ""]),
  );

  return (
    <>
      <PageHeader
        title="網站設定"
        description="聯絡方式留空的欄位，前台不會顯示"
      />
      <SettingsForm
        initialValues={initialValues}
        initialCoreValues={parseCoreValues(settings.coreValues)}
      />
    </>
  );
}
