import Link from "next/link";
import { getDashboardStats, getFilings, getBulkReports, searchCompanies } from "@/lib/edinet";
import { formatSubmitDate, formatJPY, DOC_TYPE_COLOR } from "@/lib/format";
import StatCard from "@/components/StatCard";
import SectionHeader from "@/components/SectionHeader";
import FilingRow from "@/components/FilingRow";
import type { BulkReport } from "@/lib/types";

export const revalidate = 300;

export default async function DashboardPage() {
  const [stats, filings, bulkReports] = await Promise.all([
    getDashboardStats(),
    getFilings(new Date().toISOString().slice(0, 10)),
    getBulkReports(),
  ]);

  const topCompanies = searchCompanies("").slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* デモバナー */}
      <div className="bg-navy-surface border border-navy-mid/30 rounded-lg px-4 py-3 flex items-center gap-3">
        <span className="text-2xs bg-accent text-white font-bold rounded px-1.5 py-0.5 shrink-0">DEMO</span>
        <p className="text-xs text-ink-muted">
          現在はモックデータで動作中です。
          <code className="mx-1 bg-paper-dark px-1 rounded text-2xs">EDINET_API_KEY</code>
          を設定するとリアルタイムデータに切り替わります。
          <a href="https://disclosure.edinet-fsa.go.jp/" target="_blank" rel="noopener noreferrer" className="ml-1 text-accent underline">API申請 →</a>
        </p>
      </div>

      {/* 統計 */}
      <div>
        <SectionHeader title="本日の開示状況" sub={stats.date} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="総開示件数" value={stats.totalFilings.toLocaleString()} sub="本日合計" />
          <StatCard label="有価証券報告書" value={stats.annualReports} sub="年次決算" />
          <StatCard label="四半期報告書" value={stats.quarterlyReports} sub="四半期開示" />
          <StatCard label="大量保有報告書" value={stats.bulkReports} sub="5%ルール報告" accent />
        </div>
      </div>

      {/* 2カラム：最新開示 + 大量保有 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* 最新開示 */}
        <div className="bg-paper-surface border border-paper-border rounded-lg overflow-hidden">
          <div className="bg-navy px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-0.5 h-4 bg-accent rounded-sm" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">最新開示書類</span>
            </div>
            <Link href="/search" className="text-2xs text-navy-muted hover:text-white transition-colors">
              すべて見る →
            </Link>
          </div>
          <div className="divide-y divide-paper-border px-3">
            {filings.slice(0, 12).map((f) => (
              <FilingRow key={f.docID} filing={f} />
            ))}
          </div>
        </div>

        {/* 右カラム */}
        <div className="space-y-6">
          {/* 大量保有 */}
          <div className="bg-paper-surface border border-paper-border rounded-lg overflow-hidden">
            <div className="bg-navy px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-0.5 h-4 bg-accent rounded-sm" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">大量保有報告書</span>
              </div>
              <Link href="/bulk" className="text-2xs text-navy-muted hover:text-white transition-colors">
                全件 →
              </Link>
            </div>
            <div className="divide-y divide-paper-border">
              {bulkReports.slice(0, 5).map((r) => (
                <BulkRow key={r.docID} report={r} />
              ))}
            </div>
          </div>

          {/* 企業ショートカット */}
          <div className="bg-paper-surface border border-paper-border rounded-lg overflow-hidden">
            <div className="bg-navy px-4 py-3 flex items-center gap-2">
              <span className="w-0.5 h-4 bg-accent rounded-sm" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">注目企業</span>
            </div>
            <div className="grid grid-cols-2 gap-px bg-paper-border">
              {topCompanies.map((c) => (
                <Link
                  key={c.edinetCode}
                  href={`/company/${c.edinetCode}`}
                  className="bg-paper-surface px-3 py-3 hover:bg-paper transition-colors"
                >
                  <p className="text-xs font-semibold text-ink truncate">{c.filerName.replace("株式会社", "").replace("グループ", "G")}</p>
                  <p className="text-2xs text-ink-muted mt-0.5">{c.tickerCode} · {c.industry}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BulkRow({ report }: { report: BulkReport }) {
  const changeColor = {
    "新規": "text-pos font-bold",
    "増加": "text-pos",
    "減少": "text-neg",
    "変更": "text-ink-muted",
  }[report.changeType];

  const arrow = { "新規": "NEW", "増加": "▲", "減少": "▼", "変更": "→" }[report.changeType];

  return (
    <div className="px-4 py-3 hover:bg-paper transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-ink truncate">{report.targetCompany}</p>
          <p className="text-2xs text-ink-muted truncate mt-0.5">{report.reporterName}</p>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-sm font-bold tabular-nums ${changeColor}`}>
            {arrow} {report.holdingRate.toFixed(2)}%
          </p>
          {report.previousRate && (
            <p className="text-2xs text-ink-faint">{report.previousRate.toFixed(2)}% →</p>
          )}
        </div>
      </div>
      <p className="text-2xs text-ink-faint mt-1">{formatSubmitDate(report.submitDateTime)}</p>
    </div>
  );
}
