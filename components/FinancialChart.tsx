"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import type { FinancialSnapshot } from "@/lib/types";

interface Props {
  data: FinancialSnapshot[];
}

function toOku(v: number) { return Math.round(v / 100) / 10; } // 百万→億

const COLORS = {
  sales:    "#0D1B2A",
  opIncome: "#C62828",
  netIncome:"#4A6FA5",
  assets:   "#78716C",
  equity:   "#15803D",
};

// カスタムツールチップ
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy text-white text-xs rounded-lg shadow-xl p-3 border border-navy-mid min-w-[160px]">
      <p className="font-bold text-white mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between gap-3">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono">{Number(p.value).toLocaleString()}億円</span>
        </div>
      ))}
    </div>
  );
}

// 売上・利益 複合チャート
export function PLChart({ data }: Props) {
  const chartData = data.map((d) => ({
    name: d.fiscalYear,
    "売上高":   toOku(d.netSales),
    "営業利益": toOku(d.operatingIncome),
    "純利益":   toOku(d.netIncome),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E7E2D8" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#78716C" }} />
        <YAxis tick={{ fontSize: 10, fill: "#78716C" }} tickFormatter={(v) => `${v}億`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="売上高" fill={COLORS.sales} radius={[2, 2, 0, 0]} opacity={0.85} />
        <Line dataKey="営業利益" stroke={COLORS.opIncome} strokeWidth={2.5} dot={{ r: 3 }} />
        <Line dataKey="純利益"   stroke={COLORS.netIncome} strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// 資産・純資産エリアチャート
export function BSChart({ data }: Props) {
  const chartData = data.map((d) => ({
    name: d.fiscalYear,
    "総資産": toOku(d.totalAssets),
    "純資産": toOku(d.equity),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="assets" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={COLORS.assets} stopOpacity={0.3} />
            <stop offset="95%" stopColor={COLORS.assets} stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="equity" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={COLORS.equity} stopOpacity={0.4} />
            <stop offset="95%" stopColor={COLORS.equity} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E7E2D8" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#78716C" }} />
        <YAxis tick={{ fontSize: 10, fill: "#78716C" }} tickFormatter={(v) => `${v}億`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Area type="monotone" dataKey="総資産" stroke={COLORS.assets} fill="url(#assets)" strokeWidth={2} />
        <Area type="monotone" dataKey="純資産" stroke={COLORS.equity} fill="url(#equity)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ROE/営業利益率 折れ線
export function MarginChart({ data }: Props) {
  const chartData = data.map((d) => ({
    name: d.fiscalYear,
    "営業利益率(%)": d.operatingMargin ?? 0,
    "ROE(%)":       d.roe ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E7E2D8" />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#78716C" }} />
        <YAxis tick={{ fontSize: 10, fill: "#78716C" }} tickFormatter={(v) => `${v}%`} />
        <Tooltip formatter={(v: any) => `${Number(v).toFixed(1)}%`} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line dataKey="営業利益率(%)" stroke={COLORS.opIncome} strokeWidth={2.5} dot={{ r: 3 }} />
        <Line dataKey="ROE(%)"       stroke={COLORS.netIncome} strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
