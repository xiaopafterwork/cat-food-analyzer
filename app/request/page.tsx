import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: '新增飼料需求 — 喵評鑑',
  description: '找不到你家貓咪吃的飼料？告訴我們，我們盡快加入評鑑！',
}

const ACCENT = '#1B3A5C'

export default function RequestPage() {
  return (
    <main className="min-h-screen" style={{ background: '#f5f5f7' }}>
      {/* Nav */}
      <Nav backHref="/" backLabel="返回首頁" title="新增飼料需求" />

      <div className="max-w-2xl mx-auto px-4 pb-16">

        {/* Hero */}
        <div className="text-center pt-10 pb-8">
          <div className="text-4xl mb-4">🐱</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3" style={{ letterSpacing: '-0.5px' }}>
            找不到你家貓咪的飼料或主食罐？
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
            告訴我們你想看哪款飼料或主食罐的評分，我們會盡快加入資料庫！
          </p>
        </div>

        {/* 寄信卡片 */}
        <div className="rounded-3xl p-6 mb-6" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
          <p className="text-sm font-semibold text-gray-900 mb-1">📧 寄信告訴我們</p>
          <p className="text-xs text-gray-400 mb-5 leading-relaxed">
            請寄信到以下信箱，附上飼料品牌與品名，我們會優先安排評鑑。
          </p>

          {/* Email 區塊 */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl mb-5"
            style={{ background: '#f5f5f7', border: '0.5px solid #e5e7eb' }}
          >
            <span className="text-sm font-medium text-gray-700">xiaopafterwork@gmail.com</span>
            <a
              href="mailto:xiaopafterwork@gmail.com?subject=新增飼料需求&body=品牌名稱：%0A飼料品名：%0A購買通路（選填）：%0A其他備註（選填）："
              className="text-xs font-semibold px-3 py-1.5 rounded-full text-white shrink-0"
              style={{ background: ACCENT }}
            >
              點此寄信
            </a>
          </div>

          {/* 信件範本 */}
          <p className="text-xs text-gray-400 mb-2">建議信件內容包含：</p>
          <div className="rounded-xl p-4 text-xs leading-relaxed" style={{ background: '#f9fafb', color: '#374151', fontFamily: 'monospace' }}>
            <p>主旨：新增飼料需求</p>
            <br />
            <p>品牌名稱：例如 法米納 / Farmina</p>
            <p>飼料品名：例如 N&D 無穀雞肉石榴成貓配方</p>
            <p>購買通路（選填）：momo、PChome、寵物店…</p>
            <p>其他備註（選填）：例如我家貓有腎臟病，想看這款</p>
          </div>
        </div>

        {/* 說明卡片 */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: '⚡', title: '盡快上線', desc: '收到需求後，通常在 1–2 週內完成評鑑並上線。' },
            { icon: '🔍', title: '資料來源', desc: '我們從官方包裝及品牌官網取得成分資料，確保準確。' },
            { icon: '📊', title: '公正評分', desc: '所有飼料採用相同標準評分，不因品牌或通路而有所不同。' },
            { icon: '💬', title: '歡迎回饋', desc: '發現評分有誤或資料過期，也歡迎來信告知！' },
          ].map(item => (
            <div key={item.title} className="p-4 rounded-2xl" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
              <div className="text-xl mb-2">{item.icon}</div>
              <p className="text-sm font-semibold text-gray-900 mb-1">{item.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* 已有 67 款 */}
        <div
          className="text-center px-6 py-6 rounded-2xl"
          style={{ background: '#EEF3F8', border: '0.5px solid #C8D9E8' }}
        >
          <p className="text-sm text-gray-700 mb-3">
            目前已有 <strong style={{ color: ACCENT }}>2,600+ 款</strong> 飼料完成評鑑
          </p>
          <Link
            href="/"
            className="inline-block px-5 py-2 rounded-full text-sm font-semibold text-white"
            style={{ background: ACCENT }}
          >
            瀏覽所有飼料評分
          </Link>
        </div>
      </div>
    </main>
  )
}
