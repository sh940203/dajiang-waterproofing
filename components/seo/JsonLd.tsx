/**
 * 結構化資料（schema.org JSON-LD）。依 Next 官方建議直接輸出 <script>，
 * 並把 `<` 轉成 <，避免內容（多半來自 CMS）裡的字串跳出 script 標籤。
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
