import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: '評分標準 — 喵評鑑怎麼幫飼料打分數',
  description: '喵評鑑採用加分制，蛋白質、碳水、透明度三大面向累積分數，滿分 100 分。無穀配方額外加分，讓你一眼看出飼料好不好。',
}

const ACCENT = '#3D5A3E'

const SCORE_LEVELS = [
  { range: '80–100', label: '優質主食', bg: '#e8f9ee', color: '#1a7f37', desc: '蛋白質充足、碳水低、資訊透明，適合作為長期日常主食。' },
  { range: '65–79',  label: '不錯的選擇', bg: '#e6f0fb', color: '#1554a0', desc: '整體品質良好，蛋白質或碳水略有不足，日常餵食無虞。' },
  { range: '50–64',  label: '可以接受', bg: '#fff3e0', color: '#b35c00', desc: '基本營養需求可達，碳水偏高或蛋白質普通，建議輪替其他優質飼料。' },
  { range: '50 以下', label: '需謹慎', bg: '#ffeaea', color: '#c0392b', desc: '蛋白質明顯不足或碳水過高，不建議長期單獨餵食。' },
]

const PROTEIN_TIERS = [
  { range: '≥ 50%',   pts: '+30', color: '#1a7f37' },
  { range: '45–49%',  pts: '+26', color: '#3a7d3c' },
  { range: '40–44%',  pts: '+22', color: '#6b9e6f' },
  { range: '35–39%',  pts: '+20', color: '#b35c00' },
  { range: '30–34%',  pts: '+13', color: '#c0702b' },
  { range: '26–29%',  pts: '+7',  color: '#d04020' },
  { range: '< 26%',   pts: '+2',  color: '#c0392b' },
]

const CARB_TIERS = [
  { range: '≤ 10%',  pts: '+15', color: '#1a7f37' },
  { range: '11–20%', pts: '+12', color: '#6b9e6f' },
  { range: '21–30%', pts: '+9',  color: '#b35c00' },
  { range: '31–40%', pts: '+8',  color: '#c0702b' },
  { range: '> 40%',  pts: '+2',  color: '#c0392b' },
]

const FAT_TIERS = [
  { range: '20–40%',          pts: '+10', color: '#1a7f37' },
  { range: '15–19% 或 41–50%', pts: '+7',  color: '#6b9e6f' },
  { range: '9–14%',           pts: '+4',  color: '#b35c00' },
  { range: '< 9% 或 > 50%',   pts: '+1',  color: '#c0392b' },
]

export default function HowWeScorePage() {
  return (
    <main className="min-h-screen" style={{ background: '#f5f5f7' }}>
      <Nav backHref="/" backLabel="返回首頁" title="評分標準" />

      <div className="max-w-2xl mx-auto px-4 pb-16">

        {/* Hero */}
        <div className="text-center pt-10 pb-8">
          <p className="text-xs font-semibold uppercase mb-3" style={{ color: ACCENT, letterSpacing: '0.08em' }}>蛋白質高・碳水低・資訊透明</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3" style={{ letterSpacing: '-0.5px' }}>我們怎麼幫飼料打分數？</h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
            從 <strong>0 分開始累積</strong>，蛋白質高、碳水低、資訊透明——每一項做得好就加分，滿分 100 分。
          </p>
        </div>

        {/* 分數等級 */}
        <p className="text-xs font-semibold uppercase text-gray-400 mb-3" style={{ letterSpacing: '0.08em' }}>分數怎麼看</p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {SCORE_LEVELS.map(s => (
            <div key={s.range} className="p-4 rounded-2xl" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
              <span className="text-lg font-black block mb-1" style={{ color: s.color }}>{s.range}</span>
              <p className="text-sm font-semibold mb-1" style={{ color: s.color }}>{s.label}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* 評分說明 */}
        <p className="text-xs font-semibold uppercase text-gray-400 mb-3" style={{ letterSpacing: '0.08em' }}>評分項目</p>

        {/* 蛋白質 */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
          <div className="px-5 py-4" style={{ borderBottom: '0.5px solid #f3f4f6' }}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">蛋白質含量</p>
              <span className="text-sm font-bold" style={{ color: ACCENT }}>最高 30 分</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">去除水分後計算，貓咪是肉食動物，蛋白質是最重要的指標</p>
          </div>
          <div className="px-5 py-3">
            {PROTEIN_TIERS.map((t, i) => (
              <div key={i} className="flex items-center gap-3 py-2" style={{ borderTop: i > 0 ? '0.5px solid #f9fafb' : 'none' }}>
                <span className="text-sm font-bold shrink-0 w-10 text-right" style={{ color: t.color }}>{t.pts}</span>
                <span className="text-sm text-gray-700">{t.range}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 碳水 */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
          <div className="px-5 py-4" style={{ borderBottom: '0.5px solid #f3f4f6' }}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">碳水化合物</p>
              <span className="text-sm font-bold" style={{ color: ACCENT }}>最高 15 分</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">去除水分後計算，貓咪天生不擅長代謝大量碳水，越低越好</p>
          </div>
          <div className="px-5 py-3">
            {CARB_TIERS.map((t, i) => (
              <div key={i} className="flex items-center gap-3 py-2" style={{ borderTop: i > 0 ? '0.5px solid #f9fafb' : 'none' }}>
                <span className="text-sm font-bold shrink-0 w-10 text-right" style={{ color: t.color }}>{t.pts}</span>
                <span className="text-sm text-gray-700">{t.range}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 脂肪 */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
          <div className="px-5 py-4" style={{ borderBottom: '0.5px solid #f3f4f6' }}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">脂肪含量</p>
              <span className="text-sm font-bold" style={{ color: ACCENT }}>最高 10 分</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">去除水分後計算，適量脂肪提供熱量與皮毛所需的必需脂肪酸，AAFCO 最低標準為 9%</p>
          </div>
          <div className="px-5 py-3">
            {FAT_TIERS.map((t, i) => (
              <div key={i} className="flex items-center gap-3 py-2" style={{ borderTop: i > 0 ? '0.5px solid #f9fafb' : 'none' }}>
                <span className="text-sm font-bold shrink-0 w-10 text-right" style={{ color: t.color }}>{t.pts}</span>
                <span className="text-sm text-gray-700">{t.range}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 透明度 */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
          <div className="px-5 py-4" style={{ borderBottom: '0.5px solid #f3f4f6' }}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">資訊透明度</p>
              <span className="text-sm font-bold" style={{ color: ACCENT }}>最高 30 分</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">品牌願意公開的資訊越多，代表對品質越有信心</p>
          </div>
          <div className="px-5 py-3">
            {[
              { pts: '+18', label: '通過 AAFCO 認證', desc: '美國飼料管理協會認證，代表此配方符合貓咪完整營養需求' },
              { pts: '+7',  label: '公開完整成分列表', desc: '讓消費者知道飼料裡放了什麼' },
              { pts: '+5',  label: '標示灰分含量', desc: '許多品牌不標示，主動標示代表更高透明度' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 py-2.5" style={{ borderTop: i > 0 ? '0.5px solid #f9fafb' : 'none' }}>
                <span className="text-sm font-bold shrink-0 w-10 text-right" style={{ color: ACCENT }}>{item.pts}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 其他加分 */}
        <div className="rounded-2xl overflow-hidden mb-8" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
          <div className="px-5 py-4" style={{ borderBottom: '0.5px solid #f3f4f6' }}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">其他加分</p>
              <span className="text-sm font-bold" style={{ color: ACCENT }}>最高 15 分</span>
            </div>
          </div>
          <div className="px-5 py-3">
            {[
              { pts: '+8', label: '無穀配方', desc: '不含小麥、玉米、米等穀物，更符合貓咪肉食天性' },
              { pts: '+7',  label: '灰分 ≤ 8%', desc: '灰分低代表礦物質比例適中，對腎臟較友善' },
              { pts: '+3',  label: '灰分 8–10%', desc: '略高，一般成貓影響不大，敏感貓咪需留意' },
              { pts: '+0', label: '灰分 > 10%', desc: '偏高，建議腎臟敏感或結石風險的貓咪諮詢獸醫' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 py-2.5" style={{ borderTop: i > 0 ? '0.5px solid #f9fafb' : 'none' }}>
                <span className="text-sm font-bold shrink-0 w-10 text-right" style={{ color: i < 3 ? ACCENT : '#9ca3af' }}>{item.pts}</span>
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
          <p className="text-sm font-semibold mb-3" style={{ color: ACCENT }}>參考國際標準</p>
          <div className="flex flex-col gap-3">
            {[
              { name: 'AAFCO 2024', desc: '美國飼料管理協會，北美最權威的寵物食品標準，設定蛋白質、脂肪等最低需求值，大多數進口飼料以此認證。' },
              { name: 'FEDIAF 2025', desc: '歐洲寵物食品聯盟，歐盟最高寵物食品標準，與 AAFCO 互補。' },
              { name: 'NRC 2006',    desc: '美國國家研究委員會，AAFCO 與 FEDIAF 均以此為科學基礎。' },
            ].map(s => (
              <div key={s.name} className="flex gap-3">
                <span className="text-sm font-bold shrink-0" style={{ color: ACCENT, minWidth: 88 }}>{s.name}</span>
                <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 免責聲明 */}
        <p className="text-xs text-gray-400 text-center leading-relaxed mb-8">
          喵評鑑的評分僅供參考，不構成醫療或獸醫建議。<br />
          資料來源為品牌公開資訊，數值可能隨產品更新而變動。
        </p>

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
