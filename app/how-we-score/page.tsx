import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: '評分標準 — 喵評鑑怎麼幫飼料打分數',
  description: '喵評鑑從滿分 100 分出發，依蛋白質乾重、碳水乾重、灰分三大指標扣分，分佈區間寬廣、鑑別力強，對齊 AAFCO 2024 與 CatInfo.org 國際標準。',
}

const ACCENT = '#3D5A3E'

const SCORE_LEVELS = [
  { range: '85–100', label: '優質主食', bg: '#e8f9ee', color: '#1a7f37', desc: '蛋白質充足、碳水極低，適合作為貓咪長期日常主食。' },
  { range: '70–84',  label: '不錯的選擇', bg: '#e6f0fb', color: '#1554a0', desc: '整體品質良好，蛋白質或碳水略有不足，日常餵食無虞。' },
  { range: '50–69',  label: '可以接受', bg: '#fff3e0', color: '#b35c00', desc: '基本需求可達，但碳水偏高或蛋白質不足，建議輪替其他優質飼料。' },
  { range: '50 以下', label: '需謹慎', bg: '#ffeaea', color: '#c0392b', desc: '蛋白質明顯不足或碳水過高，長期單獨餵食不建議，可諮詢獸醫。' },
]

const PROTEIN_TIERS = [
  { range: '≥ 50%',   pts: '不扣分', color: '#1a7f37' },
  { range: '45–49%',  pts: '−5',    color: '#6b9e6f' },
  { range: '40–44%',  pts: '−10',   color: '#b35c00' },
  { range: '35–39%',  pts: '−18',   color: '#c0702b' },
  { range: '30–34%',  pts: '−25',   color: '#d04020' },
  { range: '< 30%',   pts: '−35',   color: '#c0392b' },
]

const CARB_TIERS = [
  { range: '≤ 10%',   pts: '不扣分', color: '#1a7f37' },
  { range: '11–20%',  pts: '−5',    color: '#6b9e6f' },
  { range: '21–30%',  pts: '−15',   color: '#b35c00' },
  { range: '31–40%',  pts: '−25',   color: '#d04020' },
  { range: '> 40%',   pts: '−35',   color: '#c0392b' },
]


export default function HowWeScorePage() {
  return (
    <main className="min-h-screen" style={{ background: '#f5f5f7' }}>
      {/* Nav */}
      <Nav backHref="/" backLabel="返回首頁" title="評分標準" />

      <div className="max-w-2xl mx-auto px-4 pb-16">

        {/* Hero */}
        <div className="text-center pt-10 pb-8">
          <p className="text-xs font-semibold uppercase mb-3" style={{ color: ACCENT, letterSpacing: '0.08em' }}>透明・科學・對齊國際標準</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3" style={{ letterSpacing: '-0.5px' }}>我們怎麼幫飼料打分數？</h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
            喵評鑑的評分完全基於包裝公開資訊，採用 <strong>AAFCO 2024</strong> 與 <strong>CatInfo.org</strong> 國際標準，從滿分 100 分出發，依蛋白質、碳水、灰分扣分。
          </p>
        </div>

        {/* 分數等級 */}
        <p className="text-xs font-semibold uppercase text-gray-400 mb-3" style={{ letterSpacing: '0.08em' }}>分數怎麼看</p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {SCORE_LEVELS.map(s => (
            <div key={s.range} className="p-4 rounded-2xl" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg font-black" style={{ color: s.color }}>{s.range}</span>
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: s.color }}>{s.label}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* 評分邏輯說明 */}
        <p className="text-xs font-semibold uppercase text-gray-400 mb-3" style={{ letterSpacing: '0.08em' }}>評分怎麼算</p>
        <div className="p-5 rounded-2xl mb-4" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
          <p className="text-sm font-semibold text-gray-900 mb-1">從滿分 100 分出發，依指標扣分</p>
          <p className="text-xs text-gray-500 leading-relaxed">蛋白質越高、碳水越低，扣分越少；無穀配方與通過 AAFCO 認證各加 3 分。</p>
        </div>

        {/* 蛋白質乾重 */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
          <div className="px-5 py-4" style={{ borderBottom: '0.5px solid #f3f4f6' }}>
            <p className="font-semibold text-gray-900">蛋白質乾重（DM）</p>
            <p className="text-xs text-gray-400 mt-0.5">去除水分後計算，才能公平比較不同含水量的飼料</p>
          </div>
          <div className="px-5 py-3">
            {PROTEIN_TIERS.map((t, i) => (
              <div key={i} className="flex items-center gap-3 py-2" style={{ borderTop: i > 0 ? '0.5px solid #f9fafb' : 'none' }}>
                <span className="text-xs font-bold shrink-0 w-14 text-right" style={{ color: t.color }}>{t.pts}</span>
                <span className="text-sm text-gray-700">{t.range}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 碳水乾重 */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
          <div className="px-5 py-4" style={{ borderBottom: '0.5px solid #f3f4f6' }}>
            <p className="font-semibold text-gray-900">碳水化合物乾重（DM）</p>
            <p className="text-xs text-gray-400 mt-0.5">由蛋白質、脂肪、灰分、水分推算；貓咪為肉食動物，碳水應盡量低</p>
          </div>
          <div className="px-5 py-3">
            {CARB_TIERS.map((t, i) => (
              <div key={i} className="flex items-center gap-3 py-2" style={{ borderTop: i > 0 ? '0.5px solid #f9fafb' : 'none' }}>
                <span className="text-xs font-bold shrink-0 w-14 text-right" style={{ color: t.color }}>{t.pts}</span>
                <span className="text-sm text-gray-700">{t.range}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 灰分與加分 */}
        <div className="rounded-2xl overflow-hidden mb-8" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
          <div className="px-5 py-4" style={{ borderBottom: '0.5px solid #f3f4f6' }}>
            <p className="font-semibold text-gray-900">其他指標</p>
          </div>
          <div className="px-5 py-3">
            {[
              { pts: '−3', label: '灰分 > 10%', color: '#d04020', desc: '灰分偏高，腎臟敏感貓咪需留意' },
              { pts: '−1', label: '灰分 8–10%', color: '#b35c00', desc: '略高，一般成貓影響不大' },
              { pts: '+3', label: '無穀配方', color: '#1a7f37', desc: '不含小麥、玉米、米等穀物原料' },
              { pts: '+3', label: '通過 AAFCO 認證', color: '#1a7f37', desc: '營養均衡已通過國際標準驗證' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 py-2" style={{ borderTop: i > 0 ? '0.5px solid #f9fafb' : 'none' }}>
                <span className="text-xs font-bold shrink-0 w-8" style={{ color: item.color }}>{item.pts}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 參考標準 */}
        <div className="p-5 rounded-2xl mb-8" style={{ background: '#e8f9ee', border: '0.5px solid #b2e0bb' }}>
          <p className="text-sm font-semibold mb-3" style={{ color: ACCENT }}>📚 參考國際標準</p>
          <div className="flex flex-col gap-2">
            {[
              { name: 'AAFCO 2024', desc: '美國飼料管理協會，北美最權威的寵物食品標準，設定蛋白質、脂肪最低需求值。' },
              { name: 'CatInfo.org', desc: '美國獸醫 Dr. Lisa Pierson 主持，以熱量比分析貓咪理想飲食，建議蛋白質熱量比 > 40%。' },
              { name: 'FEDIAF 2025', desc: '歐洲寵物食品聯盟，歐盟最高寵物食品標準，與 AAFCO 互補。' },
              { name: 'NRC 2006',    desc: '美國國家研究委員會，AAFCO 與 FEDIAF 均以此為科學基礎。' },
            ].map(s => (
              <div key={s.name} className="flex gap-3">
                <span className="text-sm font-bold shrink-0" style={{ color: ACCENT, minWidth: 90 }}>{s.name}</span>
                <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-full text-sm font-semibold text-white"
            style={{ background: ACCENT }}
          >
            回去看飼料評分
          </Link>
        </div>
      </div>
    </main>
  )
}
