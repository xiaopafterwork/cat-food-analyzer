import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: '關於喵評鑑 | 喵評鑑',
  description: '因為一隻挑食的貓和一張看不懂的成分表，所以有了喵評鑑。',
  openGraph: {
    title: '關於喵評鑑 | 喵評鑑',
    description: '因為一隻挑食的貓，所以有了喵評鑑。',
    url: 'https://meowpj.com/about',
    siteName: '喵評鑑',
  },
}

const ACCENT = '#1B3A5C'

export default async function AboutPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) } }
  )
  const { count } = await supabase.from('cat_foods').select('id', { count: 'exact', head: true })
  const foodCount = count ?? 2600

  const { data: brandData } = await supabase.from('cat_foods').select('brand')
  const brandSet: Record<string, boolean> = {}
  for (const f of brandData ?? []) { if (f.brand) brandSet[f.brand] = true }
  const brandCount = Object.keys(brandSet).length
  return (
    <main className="min-h-screen" style={{ background: '#f5f5f7' }}>
      <Nav backHref="/" backLabel="返回首頁" />

      <div className="max-w-2xl mx-auto px-4 pb-16">

        {/* Hero */}
        <div className="pt-10 pb-8 text-center">
          <p className="text-xs font-semibold uppercase mb-3" style={{ color: ACCENT, letterSpacing: '0.08em' }}>
            Our Story
          </p>
          <h1 className="text-3xl font-bold text-gray-900" style={{ letterSpacing: '-0.5px' }}>
            關於喵評鑑
          </h1>
        </div>

        {/* 故事主體 */}
        <div
          className="rounded-3xl px-7 py-8 mb-6"
          style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}
        >
          <div className="text-base text-gray-700 leading-[1.95] space-y-5">
            <p>嗨，我是小P。</p>

            <p>我養了一隻超級挑食的貓。</p>

            <p>
              牠吃飯從來不給面子——<br />
              這款吃兩口不吃、那款聞一下走掉，<br />
              買回來的飼料堆滿整個櫃子。
            </p>

            <p>
              有一天我認真翻了成分表，<br />
              才發現自己完全看不懂。<br />
              蛋白質多少算高？碳水超過多少要擔心？<br />
              第一個原料寫「禽肉」，到底是什麼肉？
            </p>

            <p>
              我白天上班做產品，<br />
              下班的時間就用來研究這些。<br />
              沒什麼特別的原因，<br />
              就是懶得每次買飼料都要自己查一遍。
            </p>

            <p>於是就有了喵評鑑。</p>

            <p>
              把每一款飼料的成分表拆開來，<br />
              用一個分數告訴你這款值不值得買。<br />
              不是要說服你，<br />
              是因為我自己也需要這個東西。
            </p>

            <p>
              現在我家那隻挑食的貓，<br />
              終於吃到了真正適合牠的飼料。
            </p>

            <p>希望喵評鑑也能幫你找到。</p>

            <p className="font-medium text-gray-500">— 小P</p>
          </div>
        </div>

        {/* 數據小卡 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { num: `${foodCount}款`, label: '收錄飼料與主食罐' },
            { num: `${brandCount}個`, label: '收錄品牌' },
            { num: '免費', label: '永遠對貓奴' },
          ].map(item => (
            <div
              key={item.label}
              className="rounded-2xl p-4 text-center"
              style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}
            >
              <p className="text-2xl font-black mb-1" style={{ color: ACCENT }}>{item.num}</p>
              <p className="text-xs text-gray-400 leading-snug">{item.label}</p>
            </div>
          ))}
        </div>

        {/* 聯絡 */}
        <div
          className="rounded-2xl p-5 mb-6 flex items-center justify-between gap-4"
          style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}
        >
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-0.5">有飼料想讓我們分析？</p>
            <p className="text-xs text-gray-400">歡迎來信或使用需求表單告訴我們</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href="/request"
              className="text-xs font-semibold px-3 py-2 rounded-full"
              style={{ background: '#f3f4f6', color: '#374151' }}
            >
              需求表單
            </Link>
            <a
              href="mailto:xiaopafterwork@gmail.com"
              className="text-xs font-semibold px-3 py-2 rounded-full text-white"
              style={{ background: ACCENT }}
            >
              聯絡小P
            </a>
          </div>
        </div>

        {/* 返回首頁 */}
        <div className="text-center">
          <Link
            href="/"
            className="text-sm font-semibold px-5 py-2.5 rounded-full"
            style={{ background: '#fff', border: '0.5px solid #e5e7eb', color: ACCENT }}
          >
            看飼料評分 →
          </Link>
        </div>
      </div>
    </main>
  )
}
