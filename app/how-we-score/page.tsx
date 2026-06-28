import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: '評分標準 — 喵評鑑怎麼幫飼料打分數',
  description: '喵評鑑採用成分（40分）、營養（30分）、透明度（30分）三大維度評分，對齊 AAFCO 2024 與 CatInfo.org 國際標準。',
}

const ACCENT = '#3D5A3E'

const SCORE_LEVELS = [
  { range: '80–100', label: '強力推薦', bg: '#e8f9ee', color: '#1a7f37', desc: '成分優秀、蛋白質充足、資訊透明，適合作為長期主食。' },
  { range: '65–79',  label: '不錯的選擇', bg: '#e6f0fb', color: '#1554a0', desc: '整體品質良好，可能在某一維度稍有不足，日常餵食無虞。' },
  { range: '50–64',  label: '可以接受', bg: '#fff3e0', color: '#b35c00', desc: '基本需求可達，但有明顯改善空間，建議搭配其他優質飼料輪替。' },
  { range: '50 以下', label: '需謹慎', bg: '#ffeaea', color: '#c0392b', desc: '存在成分疑慮或蛋白質不足，建議尋找替代品或諮詢獸醫。' },
]

const DIMENSIONS = [
  {
    title: '成分評分', max: 40, color: '#1a7f37',
    items: [
      { label: '第一成分是肉類', pts: '+10', desc: '成分列表第一位為雞肉、鮭魚等具名肉類（非「肉粉」或「動物副產品」）。' },
      { label: '蛋白質來源多樣', pts: '+10', desc: '含兩種以上具名肉類來源，降低單一蛋白質過敏風險。' },
      { label: '無 4D 肉品', pts: '+10', desc: '不含來源不明的「動物副產品」，肉類來源可追溯。' },
      { label: '無過敏原穀物', pts: '+5',  desc: '不含小麥麩質、玉米麩質等常見過敏原成分。' },
      { label: '無人工色素防腐劑', pts: '+5', desc: '不含 BHA、BHT、乙氧基喹等人工防腐劑。' },
    ],
    penalty: [
      { label: '含穀物（小麥、玉米）', pts: '−5', desc: '穀物會提高碳水化合物含量，不符合貓咪肉食天性。' },
      { label: '含來源不明肉粉', pts: '−10', desc: '「動物粉」等模糊標示，品質無法追溯。' },
    ],
  },
  {
    title: '營養評分', max: 30, color: '#1554a0',
    items: [
      { label: '蛋白質乾重 ≥ 40%', pts: '+13', desc: '對齊 CatInfo.org 建議，高蛋白才符合貓咪肉食天性。' },
      { label: '蛋白質乾重 26–39%', pts: '+7',  desc: '符合 AAFCO 成貓最低標準，基本需求足夠。' },
      { label: '脂肪乾重 15–35%', pts: '+4',   desc: '適量脂肪提供熱量與皮毛所需必需脂肪酸。' },
      { label: '碳水乾重 ≤ 10%', pts: '+8',    desc: '低碳水符合貓咪代謝特性，有助於控制血糖。' },
      { label: '碳水乾重 10–20%', pts: '+4',   desc: '中等碳水，尚在可接受範圍。' },
    ],
    penalty: [
      { label: '灰分 > 9%', pts: '−1',  desc: '略高，腎臟敏感貓咪需留意。' },
      { label: '灰分 > 11%', pts: '−3', desc: '明顯偏高，有腎臟或結石風險者應先諮詢獸醫。' },
    ],
  },
  {
    title: '透明度評分', max: 30, color: '#6b7280',
    items: [
      { label: '通過 AAFCO 認證', pts: '+15', desc: '配方經 AAFCO（美國飼料管理協會）完整性驗證，營養均衡有保障。' },
      { label: '標示灰分含量', pts: '+5',    desc: '主動標示灰分，顯示品牌對成分透明度的重視。' },
      { label: '標示來源地/工廠', pts: '+5', desc: '可追溯製造來源，品質管控更可信。' },
      { label: '標示水分含量', pts: '+5',    desc: '有水分數據才能進行乾物比換算，評分更精確。' },
    ],
    penalty: [],
  },
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
            喵評鑑的評分完全基於包裝公開資訊，採用 <strong>AAFCO 2024</strong> 與 <strong>CatInfo.org</strong> 國際標準，三大維度滿分 100 分。
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

        {/* 三大維度 */}
        <p className="text-xs font-semibold uppercase text-gray-400 mb-3" style={{ letterSpacing: '0.08em' }}>三大評分維度</p>
        <div className="flex flex-col gap-4 mb-8">
          {DIMENSIONS.map(dim => (
            <div key={dim.title} className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
              {/* 標題 */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '0.5px solid #f3f4f6' }}>
                <span className="font-semibold text-gray-900">{dim.title}</span>
                <span className="text-sm font-bold" style={{ color: dim.color }}>滿分 {dim.max} 分</span>
              </div>
              {/* 加分 */}
              <div className="px-5 py-3">
                <p className="text-xs text-gray-400 mb-2">加分項目</p>
                {dim.items.map((item, i) => (
                  <div key={i} className="flex gap-3 py-2" style={{ borderTop: i > 0 ? '0.5px solid #f9fafb' : 'none' }}>
                    <span className="text-xs font-bold shrink-0 w-8" style={{ color: dim.color }}>{item.pts}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.label}</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* 扣分 */}
              {dim.penalty.length > 0 && (
                <div className="px-5 py-3" style={{ background: '#fffbfb', borderTop: '0.5px solid #f3f4f6' }}>
                  <p className="text-xs text-red-400 mb-2">扣分項目</p>
                  {dim.penalty.map((item, i) => (
                    <div key={i} className="flex gap-3 py-2" style={{ borderTop: i > 0 ? '0.5px solid #fef2f2' : 'none' }}>
                      <span className="text-xs font-bold shrink-0 w-8 text-red-400">{item.pts}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.label}</p>
                        <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
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
