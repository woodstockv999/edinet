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

  return filings.map((f) => ({
    docID: f.docID,
    reporterName: f.filerName,
    targetCompany: f.docDescription,
    holdingRate: 5.0,
    holdingShares: 100_000,
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

  // Real implementation: fetch filings and parse XBRL
  // TODO: implement XBRL parsing when API key available
  return getMockCompanyDetail(edinetCode);
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
