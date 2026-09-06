"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { USER_ROLES, userRoleLabel } from "@/lib/validation/user";
import { resetUserPassword, setUserActive, setUserRole } from "./actions";

const selectCls =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function UserControls({
  id,
  role,
  active,
  isSelf,
}: {
  id: string;
  role: string;
  active: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [roleVal, setRoleVal] = useState(role);
  const [pw, setPw] = useState("");

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, ok: string) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(ok);
        router.refresh();
      } else {
        toast.error(res.error ?? "操作失敗");
      }
    });

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <span className="text-sm font-medium text-ink-800">角色</span>
        <select
          className={selectCls}
          value={roleVal}
          disabled={pending || isSelf}
          onChange={(e) => {
            const next = e.target.value;
            setRoleVal(next);
            run(() => setUserRole(id, next), "角色已更新");
          }}
        >
          {USER_ROLES.map((r) => (
            <option key={r} value={r}>
              {userRoleLabel[r]}
            </option>
          ))}
        </select>
        {isSelf && (
          <p className="text-xs text-dim">不能更改自己的角色。</p>
        )}
      </div>

      <div className="grid gap-2">
        <span className="text-sm font-medium text-ink-800">帳號狀態</span>
        <div className="flex items-center gap-3">
          <span className="text-sm text-foreground/80">
            目前：{active ? "啟用中" : "已停用"}
          </span>
          <Button
            type="button"
            size="sm"
            variant={active ? "outline" : "default"}
            disabled={pending || isSelf}
            onClick={() =>
              run(
                () => setUserActive(id, !active),
                active ? "已停用" : "已啟用",
              )
            }
          >
            {active ? "停用此帳號" : "重新啟用"}
          </Button>
        </div>
        {isSelf && (
          <p className="text-xs text-dim">不能停用自己的帳號。</p>
        )}
        {!isSelf && active && (
          <p className="text-xs text-dim">停用後對方會立即被登出。</p>
        )}
      </div>

      <div className="grid gap-2">
        <span className="text-sm font-medium text-ink-800">重設密碼</span>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            autoComplete="off"
            placeholder="新密碼（至少 8 個字）"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <Button
            type="button"
            size="sm"
            disabled={pending || pw.length < 8}
            onClick={() =>
              run(async () => {
                const res = await resetUserPassword(id, pw);
                if (res.ok) setPw("");
                return res;
              }, "密碼已重設")
            }
          >
            重設
          </Button>
        </div>
        <p className="text-xs text-dim">重設後對方所有登入階段會失效。</p>
      </div>
    </div>
  );
}
