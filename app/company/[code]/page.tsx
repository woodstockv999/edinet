import { notFound } from "next/navigation";
import Link from "next/link";
import { getCompanyDetail } from "@/lib/edinet";
import { formatJPY, formatRate, yoyLabel, formatSubmitDate, DOC_TYPE_COLOR } from "@/lib/format";
import { PLChart, BSChart, MarginChart } from "@/components/FinancialChart";
import SectionHeader from "@/components/SectionHeader";
import type { Metadata } from "next";

interface Props { params: Promise<{ code: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const company = await getCompanyDetail(code);
  return { title: company?.filerName ?? code };
}

export default async function CompanyPage({ params }: Props) {
  const { code } = await params;
  const company = await getCompanyDetail(code);
  if (!company) notFound();

  // 実データモードではXBRL未解析のため financials が空の場合がある（getCompanyDetail 参照）
  const hasFinancials = company.financials.length > 0;
  const latest = company.financials[company.financials.length - 1];
  const prev   = company.financials[company.financials.length - 2];

  const kpis = hasFinancials ? [
    { label: "売上高",    value: formatJPY(latest.netSales),        yoy: yoyLabel(latest.netSales, prev?.netSales) },
    { label: "営業利益",  value: formatJPY(latest.operatingIncome), yoy: yoyLabel(latest.operatingIncome, prev?.operatingIncome) },
    { label: "純利益",    value: formatJPY(latest.netIncome),       yoy: yoyLabel(latest.netIncome, prev?.netIncome) },
    { label: "総資産",    value: formatJPY(latest.totalAssets),     yoy: yoyLabel(latest.totalAssets, prev?.totalAssets) },
    { label: "純資産",    value: formatJPY(latest.equity),          yoy: yoyLabel(latest.equity, prev?.equity) },
    { label: "営業利益率",value: formatRate(latest.operatingMargin), yoy: yoyLabel(latest.operatingMargin ?? 0, prev?.operatingMargin) },
    { label: "ROE",      value: formatRate(latest.roe),             yoy: "" },
    { label: "EPS",      value: latest.eps ? `¥${latest.eps.toLocaleString()}` : "—", yoy: yoyLabel(latest.eps ?? 0, prev?.eps) },
  ] : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* ヘッダー */}
      <div className="bg-navy rounded-xl px-6 py-5 flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            {company.tickerCode && (
              <span className="text-2xs bg-white/10 text-navy-muted rounded px-1.5 py-0.5 font-mono">{company.tickerCode}</span>
            )}
            {company.marketSegment && (
              <span className="text-2xs bg-accent/20 text-accent border border-accent/20 rounded px-1.5 py-0.5">{company.marketSegment}</span>
            )}
            {company.industry && (
              <span className="text-2xs text-navy-muted">{company.industry}</span>
            )}
          </div>
          <h1 className="text-xl font-bold text-white">{company.filerName}</h1>
          <p className="text-xs text-navy-muted mt-0.5">EDINET Code: {company.edinetCode}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`https://disclosure.edinet-fsa.go.jp/E01EW/BLMainController.jsp?uji.verb=W1E62021CXW1E62021DSP&uji.bean=ee.bean.parent.EEParentBean&TID=W1E62021&PID=W1E62021&SESSIONKEY=&lgKbn=2&pkbn=0&skbn=1&dskb=&askb=&cfcflg=0&EID=${company.edinetCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xs bg-white/10 hover:bg-white/20 text-white rounded px-3 py-1.5 transition-colors"
          >
            EDINET →
          </Link>
          <Link href="/compare" className="text-2xs bg-accent hover:bg-accent-hover text-white rounded px-3 py-1.5 transition-colors">
            比較に追加
          </Link>
        </div>
      </div>

      {hasFinancials ? (
      <>
      {/* KPIグリッド */}
      <div>
        <SectionHeader title={`財務ハイライト（${latest.period}）`} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kpis.map((k) => {
            const isPos = k.yoy.startsWith("+");
            const isNeg = k.yoy.startsWith("-") || k.yoy.startsWith("▲");
            return (
              <div key={k.label} className="bg-paper-surface border border-paper-border rounded-lg p-3">
                <p className="text-2xs text-ink-faint uppercase tracking-wider">{k.label}</p>
                <p className="text-base font-bold text-ink mt-1 tabular-nums">{k.value}</p>
                {k.yoy && (
                  <p className={`text-2xs mt-0.5 font-medium ${isPos ? "text-pos" : isNeg ? "text-neg" : "text-ink-muted"}`}>
                    {k.yoy} 前年比
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* チャート群 */}
      <div className="space-y-6">
        <div className="bg-paper-surface border border-paper-border rounded-lg p-4">
          <SectionHeader title="売上・利益推移（5年）" sub="億円" />
          <PLChart data={company.financials} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-paper-surface border border-paper-border rounded-lg p-4">
            <SectionHeader title="貸借対照表" sub="億円" />
            <BSChart data={company.financials} />
          </div>
          <div className="bg-paper-surface border border-paper-border rounded-lg p-4">
            <SectionHeader title="収益性指標" sub="%" />
            <MarginChart data={company.financials} />
          </div>
        </div>
      </div>

      {/* 財務テーブル */}
      <div className="bg-paper-surface border border-paper-border rounded-lg overflow-hidden">
        <div className="bg-navy px-4 py-3 flex items-center gap-2">
          <span className="w-0.5 h-4 bg-accent rounded-sm" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">財務サマリー（5年）</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-paper-dark border-b border-paper-border">
              <tr>
                {["期", "売上高", "営業利益", "純利益", "総資産", "純資産", "営業利益率", "ROE"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-ink-muted font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-paper-border">
              {[...company.financials].reverse().map((f, i) => (
                <tr key={f.fiscalYear} className={`hover:bg-paper transition-colors ${i === 0 ? "bg-accent-soft/50" : ""}`}>
                  <td className="px-3 py-2 font-medium text-ink whitespace-nowrap">{f.period}</td>
                  <td className="px-3 py-2 tabular-nums text-right text-ink">{formatJPY(f.netSales)}</td>
                  <td className="px-3 py-2 tabular-nums text-right text-ink">{formatJPY(f.operatingIncome)}</td>
                  <td className="px-3 py-2 tabular-nums text-right text-ink">{formatJPY(f.netIncome)}</td>
                  <td className="px-3 py-2 tabular-nums text-right text-ink-muted">{formatJPY(f.totalAssets)}</td>
                  <td className="px-3 py-2 tabular-nums text-right text-ink-muted">{formatJPY(f.equity)}</td>
                  <td className="px-3 py-2 tabular-nums text-right text-ink">{formatRate(f.operatingMargin)}</td>
                  <td className="px-3 py-2 tabular-nums text-right text-ink">{formatRate(f.roe)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      ) : (
        <div className="bg-paper-surface border border-paper-border rounded-lg p-4 text-xs text-ink-muted">
          財務データは現在取得できません（書類本文の解析が必要なため、実データモードでは未対応です）。
        </div>
      )}

      {/* 最新開示書類 */}
      {company.recentFilings.length > 0 && (
        <div>
          <SectionHeader title="開示書類" />
          <div className="bg-paper-surface border border-paper-border rounded-lg overflow-hidden divide-y divide-paper-border">
            {company.recentFilings.map((f) => {
              const colorCls = DOC_TYPE_COLOR[f.docType] ?? "bg-ink-mid text-white";
              return (
                <div key={f.docID} className="px-4 py-3 hover:bg-paper transition-colors flex items-start gap-3">
                  <span className={`shrink-0 text-2xs font-bold px-1.5 py-0.5 rounded mt-0.5 ${colorCls}`}>
                    {f.docTypeLabel}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink font-medium">{f.docDescription}</p>
                    {f.periodEnd && (
                      <p className="text-2xs text-ink-muted mt-0.5">対象期間: {f.periodEnd}</p>
                    )}
                  </div>
                  <span className="text-2xs text-ink-faint tabular-nums shrink-0">{formatSubmitDate(f.submitDateTime)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
