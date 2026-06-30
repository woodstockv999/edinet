// EDINET Explorer — 共通型定義

export interface Company {
  edinetCode: string;    // E12345
  filerName: string;
  tickerCode?: string;   // 7203
  industry?: string;
  marketSegment?: string; // プライム / スタンダード / グロース
}

export interface Filing {
  docID: string;
  edinetCode: string;
  filerName: string;
  docType: number;         // 2=有価証券報告書, 4=四半期, 120=大量保有
  docTypeLabel: string;
  periodStart?: string;
  periodEnd?: string;
  submitDateTime: string;
  docDescription: string;
}

export interface FinancialSnapshot {
  period: string;          // "2025年3月期"
  fiscalYear: string;      // "FY2025"
  netSales: number;        // 売上高（百万円）
  operatingIncome: number; // 営業利益
  ordinaryIncome: number;  // 経常利益
  netIncome: number;       // 当期純利益
  totalAssets: number;     // 総資産
  equity: number;          // 純資産
  cashAndEquiv?: number;   // 現金及び現金同等物
  eps?: number;            // 1株当たり当期純利益（円）
  bps?: number;            // 1株当たり純資産
  roe?: number;            // ROE (%)
  roa?: number;            // ROA (%)
  operatingMargin?: number;// 営業利益率 (%)
}

export interface CompanyDetail extends Company {
  financials: FinancialSnapshot[];
  recentFilings: Filing[];
  description?: string;
}

export interface BulkReport {
  docID: string;
  reporterName: string;    // 大量保有者名
  targetCompany: string;   // 発行者名
  targetCode?: string;     // 銘柄コード
  holdingRate: number;     // 保有割合 (%)
  holdingShares: number;   // 保有株式数（千株）
  submitDateTime: string;
  changeType: "新規" | "増加" | "減少" | "変更";
  previousRate?: number;
}

export interface DashboardStats {
  totalFilings: number;
  annualReports: number;
  quarterlyReports: number;
  bulkReports: number;
  date: string;
}
