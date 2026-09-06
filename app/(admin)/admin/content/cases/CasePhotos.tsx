"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { uploadCasePhoto, deleteCasePhoto } from "./actions";

type Photo = {
  id: string;
  beforeUrl: string | null;
  afterUrl: string | null;
  caption: string | null;
};

export function CasePhotos({
  caseId,
  photos,
  r2Bound,
}: {
  caseId: string;
  photos: Photo[];
  r2Bound: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [caption, setCaption] = useState("");
  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);

  const upload = () => {
    const fd = new FormData();
    const b = beforeRef.current?.files?.[0];
    const a = afterRef.current?.files?.[0];
    if (!b && !a) {
      toast.error("請至少選一張圖片");
      return;
    }
    if (b) fd.append("before", b);
    if (a) fd.append("after", a);
    fd.append("caption", caption);
    start(async () => {
      const res = await uploadCasePhoto(caseId, fd);
      if (res.ok) {
        toast.success("已上傳");
        setCaption("");
        if (beforeRef.current) beforeRef.current.value = "";
        if (afterRef.current) afterRef.current.value = "";
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  };

  const remove = (id: string) =>
    start(async () => {
      const res = await deleteCasePhoto(id);
      if (res.ok) {
        toast.success("已刪除");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });

  return (
    <div className="grid gap-4">
      {!r2Bound && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-amber-700">
          R2 尚未綁定，暫時無法上傳。部署前建立 <code>dajiang-media</code> bucket
          後即可使用（本機開發環境已可用）。
        </p>
      )}

      <div className="grid gap-3 rounded-lg border border-border p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-xs text-dim">
            施工前
            <input
              ref={beforeRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="text-sm text-dim file:mr-3 file:rounded-full file:border-0 file:bg-ink-50 file:px-3 file:py-1.5 file:text-xs file:text-ink-700"
            />
          </label>
          <label className="grid gap-1 text-xs text-dim">
            施工後
            <input
              ref={afterRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="text-sm text-dim file:mr-3 file:rounded-full file:border-0 file:bg-ink-50 file:px-3 file:py-1.5 file:text-xs file:text-ink-700"
            />
          </label>
        </div>
        <Input
          placeholder="圖說（選填）"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
        <div className="flex justify-end">
          <Button type="button" size="sm" onClick={upload} disabled={pending}>
            <Upload className="size-4" />
            {pending ? "處理中…" : "上傳這組"}
          </Button>
        </div>
      </div>

      {photos.length === 0 ? (
        <p className="text-sm text-dim">尚未上傳照片</p>
      ) : (
        <ul className="grid gap-3">
          {photos.map((p) => (
            <li
              key={p.id}
              className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center"
            >
              <Thumb label="施工前" url={p.beforeUrl} />
              <Thumb label="施工後" url={p.afterUrl} />
              <div className="flex items-center gap-3">
                {p.caption && (
                  <span className="text-xs text-dim">{p.caption}</span>
                )}
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  disabled={pending}
                  className="text-dim hover:text-destructive"
                  aria-label="刪除這組"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Thumb({ label, url }: { label: string; url: string | null }) {
  return (
    <div className="grid gap-1">
      <span className="text-xs text-dim">{label}</span>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={label}
          className="aspect-[4/3] w-full rounded-md border border-border object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex aspect-[4/3] w-full items-center justify-center rounded-md border border-dashed border-border text-xs text-dim">
          無
        </div>
      )}
    </div>
  );
}
