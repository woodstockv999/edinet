// 数値・日付フォーマットユーティリティ

/** 百万円 → "4,200億円" or "12.3兆円" */
export function formatJPY(million: number | undefined | null): string {
  if (million == null) return "—";
  const abs = Math.abs(million);
  const sign = million < 0 ? "▲" : "";
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}兆円`;
  if (abs >= 10_000)    return `${sign}${Math.round(abs / 100).toLocaleString()}億円`;
  if (abs >= 100)       return `${sign}${(abs / 100).toFixed(1)}億円`;
  return `${sign}${abs.toLocaleString()}百万円`;
}

/** 百万円 → 億円（チャート軸ラベル用） */
export function toOku(million: number): number {
  return Math.round(million / 100) / 10; // 億円
}

/** 利益率 */
export function formatRate(rate: number | undefined | null): string {
  if (rate == null) return "—";
  return `${rate.toFixed(1)}%`;
}

/** 前年比変化 */
export function yoy(current: number, prev: number): number {
  if (!prev) return 0;
  return ((current - prev) / Math.abs(prev)) * 100;
}

/** 前年比テキスト */
export function yoyLabel(current: number, prev?: number): string {
  if (!prev) return "";
  const pct = yoy(current, prev);
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

/** submitDateTime を "MM/DD HH:mm" */
export function formatSubmitDate(dt: string): string {
  const d = new Date(dt);
  return d.toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** periodEnd を "YYYY年M月期" */
export function formatPeriod(end?: string): string {
  if (!end) return "";
  const d = new Date(end);
  return `${d.getFullYear()}年${d.getMonth() + 1}月期`;
}

/** 株式数（千株） → "1,234万株" */
export function formatShares(thousands: number): string {
  if (thousands >= 100_000) return `${(thousands / 100_000).toFixed(1)}千万株`;
  if (thousands >= 10_000)  return `${(thousands / 10_000).toFixed(1)}百万株`;
  if (thousands >= 1_000)   return `${(thousands / 1_000).toFixed(1)}万株`;
  return `${thousands.toLocaleString()}千株`;
}

export const DOC_TYPE_LABEL: Record<number, string> = {
  2:   "有価証券報告書",
  3:   "半期報告書",
  4:   "四半期報告書",
  5:   "臨時報告書",
  10:  "有価証券届出書",
  120: "大量保有報告書",
  121: "大量保有報告書（変更）",
  130: "親会社等状況報告書",
};

export const DOC_TYPE_COLOR: Record<number, string> = {
  2:   "bg-navy text-white",
  3:   "bg-navy-mid text-white",
  4:   "bg-navy-mid text-white",
  5:   "bg-ink-mid text-white",
  10:  "bg-ink text-white",
  120: "bg-accent text-white",
  121: "bg-accent text-white",
};
