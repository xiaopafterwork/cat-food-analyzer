import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "喵評鑑 — 台灣最完整的貓咪飼料評鑑",
  description: "喵評鑑幫你分析貓飼料成分、評分、優缺點，找到最適合你家貓咪的飼料。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <footer className="border-t border-gray-100 mt-16 py-8 px-4 bg-white">
          <div className="max-w-2xl mx-auto space-y-3 text-xs text-gray-400 leading-relaxed">
            <p>
              ⚠️ <strong className="text-gray-500">免責聲明</strong>：本網站所有評分與內容僅供參考，不構成獸醫診斷或醫療建議。若您的貓咪有特殊疾病（腎臟病、糖尿病、消化道疾病等），請務必在更換飼料前諮詢獸醫。
            </p>
            <p>
              📋 <strong className="text-gray-500">資料時效</strong>：飼料配方可能因批次或年份調整，本站資料以收集時為準，實際成分請以產品標示為主。
            </p>
            <p className="text-gray-300">© 2026 喵評鑑 · 台灣貓咪飼料評鑑平台</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
