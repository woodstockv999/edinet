import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { isDemoMode } from "@/lib/edinet";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", weight: ["400", "500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "EDINET Explorer", template: "%s | EDINET Explorer" },
  description: "EDINET開示情報・財務データ可視化プラットフォーム",
};
export const viewport: Viewport = { themeColor: "#0D1B2A" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={dmSans.variable}>
      <body className="font-sans min-h-screen bg-paper">
        <Nav demoMode={isDemoMode()} />
        <main>{children}</main>
        <footer className="border-t border-paper-border mt-12 py-6 text-center text-2xs text-ink-faint">
          EDINET Explorer — 金融庁 EDINET 公開データを利用 ・ 投資判断の参考のみ
        </footer>
      </body>
    </html>
  );
}
