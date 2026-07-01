import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from "next/link";
import GoogleAnalytics from "@/components/GoogleAnalytics";

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
  metadataBase: new URL('https://meowpj.com'),
  title: "喵評鑑 MEOWPJ — 貓咪飼料與主食罐成分評分",
  description: "你家貓在吃什麼？2,600+ 款飼料和主食罐，每一款都有分數。",
  alternates: { canonical: 'https://meowpj.com' },
  openGraph: {
    siteName: '喵評鑑',
    locale: 'zh_TW',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: '喵評鑑' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: '喵評鑑',
            url: 'https://meowpj.com',
            potentialAction: {
              '@type': 'SearchAction',
              target: { '@type': 'EntryPoint', urlTemplate: 'https://meowpj.com/?q={search_term_string}' },
              'query-input': 'required name=search_term_string',
            },
          }) }}
        />
        {children}
        <footer className="border-t border-gray-100 mt-16 py-10 px-4 bg-white">
          <div className="max-w-2xl mx-auto">
            {/* 頁尾導覽 */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-800">首頁</Link>
              <Link href="/how-we-score" className="text-gray-500 hover:text-gray-800">評分標準</Link>
              <Link href="/request" className="text-gray-500 hover:text-gray-800">新增飼料／主食罐需求</Link>
              <Link href="/privacy" className="text-gray-500 hover:text-gray-800">隱私權政策</Link>
              <a href="mailto:xiaopafterwork@gmail.com" className="text-gray-500 hover:text-gray-800">聯絡我們</a>
            </div>
            {/* 免責聲明 */}
            <div className="space-y-3 text-xs text-gray-400 leading-relaxed">
              <p>
                ⚠️ <strong className="text-gray-500">免責聲明</strong>：本網站所有評分與內容僅供參考，不構成獸醫診斷或醫療建議。若您的貓咪有特殊疾病（腎臟病、糖尿病、消化道疾病等），請務必在更換飼料前諮詢獸醫。
              </p>
              <p>
                📋 <strong className="text-gray-500">資料時效</strong>：飼料配方可能因批次或年份調整，本站資料以收集時為準，實際成分請以產品標示為主。
              </p>
              <p className="text-gray-300">© 2026 喵評鑑 MEOWPJ · 貓咪飼料與主食罐評分平台</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
