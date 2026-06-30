import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: '評分標準 | 喵評鑑',
  description: '喵評鑑採用科學化評分，從蛋白質含量（50分）、碳水化合物（30分）、AAFCO 國際認證（15分）、灰分透明度（5分）四大面向評比，滿分 100 分。符合 AAFCO/FEDIAF/NRC 國際標準，讓你一眼看出飼料好不好。',
}

const ACCENT = '#3D5A3E'

const SCORE_LEVELS = [
  { range: '75–100', label: '優質主食', bg: '#e8f9ee', color: '#1a7f37', desc: '蛋白質充足、品質認證完整，適合作為長期日常主食。' },
  { range: '60–74',  label: '均衡日常', bg: '#e6f0fb', color: '#1554a0', desc: '整體品質良好，日常餵食無虞，偶爾輪替更好。' },
  { range: '45–59',  label: '基礎配方', bg: '#fff3e0', color: '#b35c00', desc: '基本營養需求可達，建議搭配其他優質飼料輪替。' },
  { range: '45 以下', label: '建議搭配', bg: '#ffeaea', color: '#c0392b', desc: '不建議長期單獨餵食，需搭配其他營養來源。' },
]

const PROTEIN_TIERS = [
  { range: '≥ 50%',   pts: '50', color: '#1a7f37' },
  { range: '45–49%',  pts: '46', color: '#3a7d3c' },
  { range: '40–44%',  pts: '41', color: '#6b9e6f' },
  { range: '35–39%',  pts: '35', color: '#b35c00' },
  { range: '30–34%',  pts: '30', color: '#c0702b' },
  { range: '26–29%',  pts: '18', color: '#d04020' },
  { range: '< 26%',   pts: '5',  color: '#c0392b' },
]

const CARB_TIERS = [
  { range: '≤ 10%',   pts: '30', color: '#1a7f37' },
  { range: '11–20%',  pts: '26', color: '#6b9e6f' },
  { range: '21–30%',  pts: '21', color: '#b35c00' },
  { range: '31–40%',  pts: '18', color: '#c0702b' },
  { range: '41–50%',  pts: '15', color: '#d04020' },
  { range: '> 50%',   pts: '8',  color: '#c0392b' },
]

export default function HowWeScorePage() {
  return (
    <main className="min-h-screen" style={{ background: '#f5f5f7' }}>
      <Nav backHref="/" backLabel="返回首頁" title="評分標準" />

      <div className="max-w-2xl mx-auto px-4 pb-16">

        {/* Hero */}
        <div className="text-center pt-10 pb-8">
          <p className="text-xs font-semibold uppercase mb-3" style={{ color: ACCENT, letterSpacing: '0.08em' }}>參考 AAFCO / FEDIAF / NRC 國際標準</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-3" style={{ letterSpacing: '-0.5px' }}>我們怎麼幫飼料打分數？</h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
            蛋白質、碳水、品質認證三個面向，<strong>滿分 100 分</strong>。<br />
            符合國際獸醫營養標準，皇家、希爾思等大品牌公平評比。
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

        {/* 快速返回 */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="text-sm font-semibold px-5 py-2.5 rounded-full"
            style={{ background: '#fff', border: '0.5px solid #e5e7eb', color: ACCENT }}>
            ← 看飼料評分
          </Link>
        </div>

        {/* 評分說明 */}
        <p className="text-xs font-semibold uppercase text-gray-400 mb-3" style={{ letterSpacing: '0.08em' }}>評分項目</p>

        {/* 蛋白質 */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
          <div className="px-5 py-4" style={{ borderBottom: '0.5px solid #f3f4f6' }}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">蛋白質含量</p>
              <span className="text-sm font-bold" style={{ color: ACCENT }}>最高 50 分</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">去除水分後計算（乾物比）。貓咪是肉食動物，蛋白質是最重要的指標。</p>
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
              <span className="text-sm font-bold" style={{ color: ACCENT }}>最高 30 分</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">去除水分後計算。貓咪天生不擅長代謝大量碳水，越低越好。</p>
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

        {/* 品質指標 */}
        <div className="rounded-2xl overflow-hidden mb-8" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
          <div className="px-5 py-4" style={{ borderBottom: '0.5px solid #f3f4f6' }}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">品質指標</p>
              <span className="text-sm font-bold" style={{ color: ACCENT }}>最高 20 分</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">品牌的研發投入與資訊透明度，反映飼料的整體可信度。</p>
          </div>
          <div className="px-5 py-3">
            {[
              { pts: '15', label: 'AAFCO 或 FEDIAF 認證', desc: '通過美國（AAFCO）或歐盟（FEDIAF）飼料管理協會認證，代表配方符合貓咪完整營養需求最低標準。皇家、希爾斯均持有此認證。' },
              { pts: '5',  label: '標示灰分含量',           desc: '許多品牌不標示灰分（礦物質殘留量），主動標示代表更高透明度，也讓我們能評估腎臟友善程度。' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 py-2.5" style={{ borderTop: i > 0 ? '0.5px solid #f9fafb' : 'none' }}>
                <span className="text-sm font-bold shrink-0 w-10 text-right" style={{ color: ACCENT }}>{item.pts}</span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 實際例子 */}
        <p className="text-xs font-semibold uppercase text-gray-400 mb-3" style={{ letterSpacing: '0.08em' }}>實際計算範例</p>
        <div className="rounded-2xl overflow-hidden mb-8" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
          {[
            { brand: '希爾斯（典型配方）',   p: '35%',  c: '38%', cert: 'AAFCO ✓', ash: '—', sp: 35, sc: 18, sq: 15, total: 68, label: '均衡日常', color: '#1554a0' },
            { brand: '皇家（E42 泌尿道）',   p: '45.6%',c: '24.7%',cert: 'AAFCO ✓', ash: '✓', sp: 46, sc: 26, sq: 20, total: 92, label: '優質主食', color: '#1a7f37' },
            { brand: '高蛋白無穀品牌（示例）',p: '52%',  c: '8%',  cert: 'AAFCO ✓', ash: '✓', sp: 50, sc: 30, sq: 20, total: 100,label: '優質主食', color: '#1a7f37' },
            { brand: '廉價無認證品牌（示例）',p: '28%',  c: '44%', cert: '—',       ash: '—', sp: 18, sc: 15, sq: 0,  total: 33, label: '建議搭配', color: '#c0392b' },
          ].map((ex, i) => (
            <div key={i} className="px-5 py-4" style={{ borderTop: i > 0 ? '0.5px solid #f3f4f6' : 'none' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-800">{ex.brand}</p>
                <span className="text-sm font-bold" style={{ color: ex.color }}>{ex.total}分</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                <span>蛋白質 {ex.p} → <strong>{ex.sp}</strong>分</span>
                <span>碳水 {ex.c} → <strong>{ex.sc}</strong>分</span>
                <span>品質 {ex.cert}／灰分{ex.ash} → <strong>{ex.sq}</strong>分</span>
              </div>
              <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-md font-semibold"
                style={{ background: ex.color + '22', color: ex.color }}>{ex.label}</span>
            </div>
          ))}
        </div>

        {/* 參考標準 */}
        <div className="p-5 rounded-2xl mb-8" style={{ background: '#e8f9ee', border: '0.5px solid #b2e0bb' }}>
          <p className="text-sm font-semibold mb-3" style={{ color: ACCENT }}>參考國際標準</p>
          <div className="flex flex-col gap-3">
            {[
              { name: 'AAFCO 2024', desc: '美國飼料管理協會，北美最權威的寵物食品標準，設定蛋白質、脂肪等最低需求值。' },
              { name: 'FEDIAF 2025', desc: '歐洲寵物食品聯盟，歐盟最高寵物食品標準，與 AAFCO 互補，兩者均計入認證分數。' },
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
          <Link href="/" className="inline-block px-6 py-3 rounded-full text-sm font-semibold text-white"
            style={{ background: ACCENT }}>
            回去看飼料評分
          </Link>
        </div>
      </div>
    </main>
  )
}
