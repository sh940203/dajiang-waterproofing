import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** 合併 className，並解決 Tailwind 類別衝突 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
