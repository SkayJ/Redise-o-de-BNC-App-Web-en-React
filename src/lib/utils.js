import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function parseMoneyValue(value) {
  const normalized = String(value ?? "").replace(/\s+/g, "");
  if (!normalized) return 0;

  const cleaned = normalized.replace(/\./g, "").replace(",", ".");
  return Number.parseFloat(cleaned) || 0;
}

export function formatMoneyInput(value) {
  const raw = String(value ?? "").replace(/\s+/g, "");
  if (!raw) return "";

  const sanitized = raw.replace(/[^\d,\.]/g, "");
  if (!sanitized) return "";

  const lastSeparatorIndex = Math.max(sanitized.lastIndexOf(","), sanitized.lastIndexOf("."));
  if (lastSeparatorIndex === -1) {
    const integerPart = sanitized.replace(/[.,]/g, "");
    if (!integerPart) return "";
    const formatted = Number(integerPart).toLocaleString("de-DE");
    return `${formatted},00`;
  }

  const integerPart = sanitized.slice(0, lastSeparatorIndex).replace(/[.,]/g, "");
  const decimalPart = sanitized.slice(lastSeparatorIndex + 1).replace(/[.,]/g, "").slice(0, 2);

  if (!integerPart && !decimalPart) return "";

  const formattedInteger = integerPart ? Number(integerPart).toLocaleString("de-DE") : "0";
  return `${formattedInteger},${decimalPart.padEnd(2, "0")}`;
}

export function formatMoneyDisplay(value, currency = "VES") {
  const numeric = Number(value || 0);
  const locale = currency === "USD" ? "en-US" : "es-VE";
  return numeric.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const isIframe = typeof window !== "undefined" ? window.self !== window.top : false;
