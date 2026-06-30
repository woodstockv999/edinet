"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { searchCompanies, getCompanyDetail } from "@/lib/edinet";
import { formatJPY, formatRate } from "@/lib/format";
import type { CompanyDetail } from "@/lib/types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const ALL = searchCompanies("");
const COMPANY_COLORS = ["#0D1B2A", "#C62828", "#15803D"];

function toOku(v: number) { return Math.round(v / 100) / 10; }

const METRICS = [
  { key: "netSales",         label: "売上高",     format: (v: number) => formatJPY(v) },
  { key: "operatingIncome",  label: "営業利益",   format: (v: number) => formatJPY(v) },
  { key: "netIncome",        label: "純利益",     format: (v: number) => formatJPY(v) },
  { key: "operatingMargin",  label: "営業利益率", format: (v: number) => formatRate(v) },
  { key: "roe",              label: "ROE",        format: (v: number) => formatRate(v) },
  { key: "totalAssets",      label: "総資産",     format: (v: number) => formatJPY(v) },
  { key: "equity",           label: "純資産",     format: (v: number) => formatJPY(v) },
] as const;

export default function ComparePage() {
  const [selectedCodes, setSelectedCodes] = useState<string[]>(["E02144", "E02000"]);
  const [companies, setCompanies] = useState<(CompanyDetail | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartMetric, setChartMetric] = useState<"netSales" | "operatingIncome" | "netIncome">("netSales");

  useEffect(() => {
    if (selectedCodes.length === 0) { setCompanies([]); return; }
    setLoading(true);
    Promise.all(selectedCodes.map((code) => getCompanyDetail(code)))
      .then(setCompanies)
      .finally(() => setLoading(false));
  }, [selectedCodes]);

  const addCompany = (code: string) => {
    if (selectedCodes.includes(code) || selectedCodes.length >= 3) return;
    setSelectedCodes((prev) => [...prev, code]);
  };
  const removeCompany = (code: string) => setSelectedCodes((prev) => prev.filter((c) => c !== code));

  const validCompanies = companies.filter(Boolean) as CompanyDetail[];
  const latestFinancials = validCompanies.map((c) => c.financials[c.financials.length - 1]);

  // 売上高推移 比較チャートデータ
  const chartData = (() => {
    const years = ["FY2021", "FY2022", "FY2023", "FY2024", "FY2025"];
    return years.map((fy) => {
      const row: Record<string, any> = { name: fy };
      validCompanies.forEach((c) => {
        const snap = c.financials.find((f) => f.fiscalYear === fy);
        const name = c.filerName.replace("株式会社", "").replace("グループ", "G");
        row[name] = snap ? toOku(snap[chartMetric] as number) : null;
      });
      return row;
    });
  })();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* ヘッダー */}
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-0.5 h-4 bg-accent rounded-sm" />
          <h1 className="text-sm font-bold text-ink uppercase tracking-wide">企業比較</h1>
          <span className="text-xs text-ink-muted">（最大3社）</span>
        </div>

        {/* 選択中 */}
        <div className="flex flex-wrap gap-2 mb-3">
          {validCompanies.map((c, i) => (
            <div key={c.edinetCode} className="flex items-center gap-1.5 bg-paper-surface border border-paper-border rounded-full px-3 py-1">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COMPANY_COLORS[i] }} />
              <span className="text-xs font-medium text-ink">{c.filerName.replace("株式会社", "")}</span>
              <button
                onClick={() => removeCompany(c.edinetCode)}
                className="text-ink-faint hover:text-neg text-sm ml-1 leading-none"
                aria-label="削除"
              >×</button>
            </div>
          ))}
          {selectedCodes.length < 3 && (
            <select
              className="text-xs bg-paper-surface border border-dashed border-paper-border rounded-full px-3 py-1 text-ink-muted focus:outline-none focus:border-navy-muted"
              value=""
              onChange={(e) => addCompany(e.target.value)}
            >
              <option value="">＋ 企業を追加</option>
              {ALL.filter((c) => !selectedCodes.includes(c.edinetCode)).map((c) => (
                <option key={c.edinetCode} value={c.edinetCode}>
                  {c.filerName} ({c.tickerCode})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-ink-muted text-sm">読み込み中...</div>
      )}

      {!loading && validCompanies.length > 0 && (
        <>
          {/* 最新期 比較テーブル */}
          <div className="bg-paper-surface border border-paper-border rounded-lg overflow-hidden">
            <div className="bg-navy px-4 py-3 flex items-center gap-2">
              <span className="w-0.5 h-4 bg-accent rounded-sm" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">最新期 財務比較</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-paper-dark border-b border-paper-border">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-ink-muted font-semibold">指標</th>
                    {validCompanies.map((c, i) => (
                      <th key={c.edinetCode} className="px-4 py-2.5 text-right font-semibold" style={{ color: COMPANY_COLORS[i] }}>
                        <Link href={`/company/${c.edinetCode}`} className="hover:underline">
                          {c.filerName.replace("株式会社", "").replace("グループ", "G")}
                        </Link>
                        <div className="text-ink-faint font-normal text-2xs">{latestFinancials[i]?.period}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-paper-border">
                  {METRICS.map((m) => {
                    const values = latestFinancials.map((f) => f?.[m.key] as number | undefined);
                    const validVals = values.filter((v): v is number => v != null);
                    const maxVal = validVals.length > 0 ? Math.max(...validVals) : null;
                    return (
                      <tr key={m.key} className="hover:bg-paper transition-colors">
                        <td className="px-4 py-2.5 font-medium text-ink-muted">{m.label}</td>
                        {values.map((v, i) => (
                          <td
                            key={i}
                            className={`px-4 py-2.5 tabular-nums text-right font-semibold ${
                              v === maxVal ? "text-accent" : "text-ink"
                            }`}
                          >
                            {v != null ? m.format(v) : "—"}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="px-4 py-2 text-2xs text-ink-faint border-t border-paper-border">
              ※ 赤字はその指標での最高値
            </p>
          </div>

          {/* 推移チャート */}
          <div className="bg-paper-surface border border-paper-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-0.5 h-4 bg-accent rounded-sm" />
                <span className="text-sm font-bold text-ink uppercase tracking-wide">5年推移比較</span>
              </div>
              <div className="flex gap-1">
                {(["netSales", "operatingIncome", "netIncome"] as const).map((m) => {
                  const label = m === "netSales" ? "売上高" : m === "operatingIncome" ? "営業利益" : "純利益";
                  return (
                    <button
                      key={m}
                      onClick={() => setChartMetric(m)}
                      className={`text-2xs px-2.5 py-1 rounded font-medium transition-colors ${
                        chartMetric === m
                          ? "bg-navy text-white"
                          : "bg-paper-dark text-ink-muted hover:text-ink"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E2D8" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#78716C" }} />
                <YAxis tick={{ fontSize: 10, fill: "#78716C" }} tickFormatter={(v) => `${v}億`} />
                <Tooltip
                  formatter={(v: any) => [`${Number(v).toLocaleString()}億円`]}
                  contentStyle={{ background: "#0D1B2A", border: "none", borderRadius: 8, color: "#fff", fontSize: 11 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {validCompanies.map((c, i) => (
                  <Bar
                    key={c.edinetCode}
                    dataKey={c.filerName.replace("株式会社", "").replace("グループ", "G")}
                    fill={COMPANY_COLORS[i]}
                    radius={[2, 2, 0, 0]}
                    opacity={0.85}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {!loading && validCompanies.length === 0 && (
        <div className="text-center py-16 text-ink-muted">
          <p className="text-4xl mb-3">⚖</p>
          <p className="text-sm">比較する企業を選択してください（最大3社）</p>
        </div>
      )}
    </div>
  );
}
