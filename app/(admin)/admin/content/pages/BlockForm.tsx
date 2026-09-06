"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormShell, Field } from "@/components/admin/form";
import type { BlockDef } from "@/lib/content/blocks";
import { saveBlock } from "./actions";

type FormState = Record<string, string | string[] | Record<string, string>[]>;

function seedState(def: BlockDef, initial: Record<string, unknown>): FormState {
  const s: FormState = {};
  for (const f of def.fields) {
    const v = initial[f.name];
    if (f.type === "text" || f.type === "textarea") {
      s[f.name] = typeof v === "string" ? v : "";
    } else if (f.type === "stringList") {
      s[f.name] = Array.isArray(v) ? v.map(String) : [];
    } else {
      s[f.name] = Array.isArray(v)
        ? (v as Record<string, string>[]).map((item) =>
            Object.fromEntries(
              f.itemFields.map((sf) => [sf.name, String(item?.[sf.name] ?? "")]),
            ),
          )
        : [];
    }
  }
  return s;
}

export function BlockForm({
  def,
  initial,
}: {
  def: BlockDef;
  initial: Record<string, unknown>;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [state, setState] = useState<FormState>(() => seedState(def, initial));

  const setText = (name: string, value: string) =>
    setState((s) => ({ ...s, [name]: value }));

  const setListItem = (name: string, i: number, value: string) =>
    setState((s) => {
      const arr = [...(s[name] as string[])];
      arr[i] = value;
      return { ...s, [name]: arr };
    });

  const addListItem = (name: string) =>
    setState((s) => ({ ...s, [name]: [...(s[name] as string[]), ""] }));

  const removeListItem = (name: string, i: number) =>
    setState((s) => ({
      ...s,
      [name]: (s[name] as string[]).filter((_, j) => j !== i),
    }));

  const setObjItem = (name: string, i: number, key: string, value: string) =>
    setState((s) => {
      const arr = (s[name] as Record<string, string>[]).map((row, j) =>
        j === i ? { ...row, [key]: value } : row,
      );
      return { ...s, [name]: arr };
    });

  const addObjItem = (name: string, keys: string[]) =>
    setState((s) => ({
      ...s,
      [name]: [
        ...(s[name] as Record<string, string>[]),
        Object.fromEntries(keys.map((k) => [k, ""])),
      ],
    }));

  const removeObjItem = (name: string, i: number) =>
    setState((s) => ({
      ...s,
      [name]: (s[name] as Record<string, string>[]).filter((_, j) => j !== i),
    }));

  const submit = () =>
    start(async () => {
      const res = await saveBlock(def.key, state);
      if (res.ok) {
        toast.success("已儲存");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });

  return (
    <FormShell
      onSubmit={submit}
      pending={pending}
      cancelHref="/admin/content/pages"
      submitLabel="儲存"
    >
      {def.fields.map((f) => {
        if (f.type === "text" || f.type === "textarea") {
          return (
            <Field key={f.name} label={f.label} htmlFor={f.name} hint={f.hint}>
              {f.type === "textarea" ? (
                <Textarea
                  id={f.name}
                  rows={3}
                  value={state[f.name] as string}
                  onChange={(e) => setText(f.name, e.target.value)}
                />
              ) : (
                <Input
                  id={f.name}
                  value={state[f.name] as string}
                  onChange={(e) => setText(f.name, e.target.value)}
                />
              )}
            </Field>
          );
        }

        if (f.type === "stringList") {
          const items = state[f.name] as string[];
          return (
            <div key={f.name} className="grid gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink-800">
                  {f.label}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => addListItem(f.name)}
                >
                  <Plus className="size-4" />
                  {f.itemLabel}
                </Button>
              </div>
              {items.length === 0 && (
                <p className="text-xs text-dim">尚無項目</p>
              )}
              {items.map((val, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Textarea
                    rows={2}
                    value={val}
                    onChange={(e) => setListItem(f.name, i, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeListItem(f.name, i)}
                    className="mt-2 text-dim hover:text-destructive"
                    aria-label="移除"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          );
        }

        // objectList
        const rows = state[f.name] as Record<string, string>[];
        const keys = f.itemFields.map((sf) => sf.name);
        return (
          <div key={f.name} className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink-800">{f.label}</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => addObjItem(f.name, keys)}
              >
                <Plus className="size-4" />
                新增
              </Button>
            </div>
            {rows.map((row, i) => (
              <div
                key={i}
                className="grid gap-2 rounded-md border border-border p-3"
              >
                {f.itemFields.map((sf) => (
                  <Field key={sf.name} label={sf.label} htmlFor={`${f.name}-${i}-${sf.name}`}>
                    {sf.type === "textarea" ? (
                      <Textarea
                        id={`${f.name}-${i}-${sf.name}`}
                        rows={2}
                        value={row[sf.name] ?? ""}
                        onChange={(e) =>
                          setObjItem(f.name, i, sf.name, e.target.value)
                        }
                      />
                    ) : (
                      <Input
                        id={`${f.name}-${i}-${sf.name}`}
                        value={row[sf.name] ?? ""}
                        onChange={(e) =>
                          setObjItem(f.name, i, sf.name, e.target.value)
                        }
                      />
                    )}
                  </Field>
                ))}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeObjItem(f.name, i)}
                    className="text-xs text-dim hover:text-destructive"
                  >
                    移除這組
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </FormShell>
  );
}
