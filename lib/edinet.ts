// EDINET API v2 クライアント
// EDINET_API_KEY が未設定の場合はモックデータを返す（DEMO MODE）

import type { Filing, BulkReport, CompanyDetail } from "./types";
import {
  MOCK_RECENT_FILINGS,
  MOCK_BULK_REPORTS,
  MOCK_STATS,
  MOCK_COMPANIES,
  getMockCompanyDetail,
} from "./mock";
import { DOC_TYPE_LABEL } from "./format";

const EDINET_BASE = "https://disclosure.edinet-fsa.go.jp/api/v2";

export function isDemoMode() {
  return !process.env.EDINET_API_KEY;
}

function headers() {
  return { "Subscription-Key": process.env.EDINET_API_KEY! };
}

// ─── 書類一覧取得 ─────────────────────────────────────────────
export async function getFilings(date: string, type?: number): Promise<Filing[]> {
  if (isDemoMode()) return MOCK_RECENT_FILINGS;

  const params = new URLSearchParams({ date, type: type !== undefined ? String(type) : "2" });
  const res = await fetch(`${EDINET_BASE}/documents.json?${params}`, {
    headers: headers(),
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`EDINET API ${res.status}`);
  const json = await res.json();

  return (json.results ?? []).map((r: any) => ({
    docID: r.docID,
    edinetCode: r.edinetCode,
    filerName: r.filerName,
    docType: r.docTypeCode ?? type ?? 2,
    docTypeLabel: DOC_TYPE_LABEL[r.docTypeCode ?? 2] ?? "—",
    periodStart: r.periodStart,
    periodEnd: r.periodEnd,
    submitDateTime: r.submitDateTime,
    docDescription: r.docDescription ?? "",
  }));
}

// ─── 大量保有報告書 ───────────────────────────────────────────
export async function getBulkReports(date?: string): Promise<BulkReport[]> {
  if (isDemoMode()) return MOCK_BULK_REPORTS;

  const d = date ?? new Date().toISOString().slice(0, 10);
  const filings = await getFilings(d, 120);

  // 保有割合・株式数は書類本文（XBRL）の解析が必要でここでは取得できないため、
  // 実データモードでは実数を捏造せず未取得（null）として返す。
  return filings.map((f) => ({
    docID: f.docID,
    reporterName: f.filerName,
    targetCompany: f.docDescription,
    holdingRate: null,
    holdingShares: null,
    submitDateTime: f.submitDateTime,
    changeType: "変更" as const,
  }));
}

// ─── 企業検索 ─────────────────────────────────────────────────
export function searchCompanies(query: string) {
  const q = query.toLowerCase();
  return MOCK_COMPANIES.filter(
    (c) =>
      c.filerName.includes(query) ||
      c.edinetCode.toLowerCase().includes(q) ||
      (c.tickerCode ?? "").includes(query)
  );
}

// ─── 企業詳細 ─────────────────────────────────────────────────
export async function getCompanyDetail(edinetCode: string): Promise<CompanyDetail | null> {
  if (isDemoMode()) return getMockCompanyDetail(edinetCode);

  // 実データモード: 財務数値の算出には書類本文（XBRL）の解析が必要でここでは未対応。
  // 当日の開示書類一覧（有報・四半期）から該当銘柄の実データのみを組み立てて返す。
  // 対象銘柄が本日の開示一覧に含まれない場合は null（404）。
  const today = new Date().toISOString().slice(0, 10);
  const [annual, quarterly] = await Promise.all([
    getFilings(today, 2),
    getFilings(today, 4),
  ]);
  const matched = [...annual, ...quarterly].filter((f) => f.edinetCode === edinetCode);
  if (matched.length === 0) return null;

  return {
    edinetCode,
    filerName: matched[0].filerName,
    financials: [], // 実データモードでは財務数値未提供（XBRL解析が必要）
    recentFilings: matched,
  };
}

// ─── 統計 ─────────────────────────────────────────────────────
export async function getDashboardStats() {
  if (isDemoMode()) return MOCK_STATS;

  const today = new Date().toISOString().slice(0, 10);
  try {
    const [all, bulk] = await Promise.all([
      getFilings(today),
      getBulkReports(today),
    ]);
    return {
      totalFilings: all.length,
      annualReports: all.filter((f) => f.docType === 2).length,
      quarterlyReports: all.filter((f) => f.docType === 4).length,
      bulkReports: bulk.length,
      date: today,
    };
  } catch {
    return MOCK_STATS;
  }
}
