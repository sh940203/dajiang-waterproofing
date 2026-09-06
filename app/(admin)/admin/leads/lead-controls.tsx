"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { UserPlus, HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { LEAD_STATUSES } from "@/lib/validation/lead";
import {
  convertLeadToCustomer,
  convertLeadToProject,
  deleteLead,
  setLeadNote,
  setLeadStatus,
} from "./actions";

export function LeadDeleteButton({ id }: { id: string }) {
  return (
    <DeleteButton
      onDelete={() => deleteLead(id)}
      redirectTo="/admin/leads"
      label="刪除詢價"
      description="會一併刪除已上傳的現場照片，且無法復原。已轉出的客戶／工程不受影響。"
    />
  );
}

const selectCls =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function LeadStatusSelect({
  id,
  value,
}: {
  id: string;
  value: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [val, setVal] = useState(value);

  return (
    <select
      className={selectCls}
      value={val}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        setVal(next);
        start(async () => {
          const res = await setLeadStatus(id, next);
          if (res.ok) {
            toast.success("狀態已更新");
            router.refresh();
          } else {
            setVal(value);
            toast.error(res.error);
          }
        });
      }}
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

export function LeadNote({
  id,
  initial,
}: {
  id: string;
  initial: string;
}) {
  const [note, setNote] = useState(initial);
  const [pending, start] = useTransition();
  const dirty = note !== initial;

  return (
    <div className="grid gap-2">
      <Textarea
        rows={4}
        value={note}
        placeholder="跟進紀錄：已致電、約定勘驗時間、報價金額…"
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="secondary"
          disabled={!dirty || pending}
          onClick={() =>
            start(async () => {
              const res = await setLeadNote(id, note);
              if (res.ok) toast.success("備註已儲存");
              else toast.error(res.error);
            })
          }
        >
          {pending ? "儲存中…" : "儲存備註"}
        </Button>
      </div>
    </div>
  );
}

export function LeadConvert({
  id,
  customerId,
  projectId,
}: {
  id: string;
  customerId: string | null;
  projectId: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  const run = (
    fn: (id: string) => Promise<{ ok: boolean; id?: string; error?: string }>,
    to: (rid: string) => string,
  ) =>
    start(async () => {
      const res = await fn(id);
      if (res.ok && res.id) {
        toast.success("已建立，帶入詢價資料");
        router.push(to(res.id));
      } else {
        toast.error(res.error ?? "建立失敗");
      }
    });

  return (
    <div className="grid gap-2">
      {customerId ? (
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/customers/${customerId}`}>
            <UserPlus className="size-4" />
            檢視已建立的客戶
          </Link>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() =>
            run(convertLeadToCustomer, (rid) => `/admin/customers/${rid}`)
          }
        >
          <UserPlus className="size-4" />
          建立客戶
        </Button>
      )}

      {projectId ? (
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/projects/${projectId}`}>
            <HardHat className="size-4" />
            檢視已建立的工程
          </Link>
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() =>
            run(convertLeadToProject, (rid) => `/admin/projects/${rid}`)
          }
        >
          <HardHat className="size-4" />
          建立工程
        </Button>
      )}
    </div>
  );
}
