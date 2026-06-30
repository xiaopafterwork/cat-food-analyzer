import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Nav from '@/components/Nav'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { global: { fetch: (url, opts) => fetch(url, { ...opts, cache: 'no-store' }) } }
)

const ACCENT = '#3D5A3E'

function getScoreBadge(score: number | null) {
  if (!score) return { bg: '#f3f4f6', color: '#6b7280' }
  if (score >= 75) return { bg: '#e8f9ee', color: '#1a7f37' }
  if (score >= 60) return { bg: '#f0f1f3', color: '#5c6370' }
  if (score >= 45) return { bg: '#fff3e0', color: '#b35c00' }
  return { bg: '#ffeaea', color: '#c0392b' }
}

const LIFE_STAGE_LABEL: Record<string, string> = {
  kitten: '幼貓', adult: '成貓', senior: '熟齡貓', all: '全齡',
}

export async function generateMetadata({ params }: { params: { brand: string } }): Promise<Metadata> {
  const brandName = decodeURIComponent(params.brand)
  const { data } = await supabase
    .from('cat_foods')
    .select('brand, score_total')
    .ilike('brand', `%${brandName}%`)
    .order('score_total', { ascending: false })

  const count = data?.length ?? 0
  const topScore = data?.[0]?.score_total ?? 0

  return {
    title: `${brandName} 貓飼料評價｜${count} 款成分分析 - 喵評鑑`,
    description: `${brandName} 所有貓飼料成分分析與評分。共 ${count} 款，最高評分 ${topScore} 分。科學評分、成分透明，台灣貓奴最信賴的飼料分析平台。`,
    alternates: { canonical: `https://meowpj.com/brand/${params.brand}` },
    openGraph: {
      title: `${brandName} 貓飼料評價 | 喵評鑑`,
      description: `${brandName} 共 ${count} 款飼料，最高分 ${topScore} 分`,
      url: `https://meowpj.com/brand/${params.brand}`,
      siteName: '喵評鑑',
      images: [{ url: '/logo.png', width: 512, height: 512, alt: `${brandName} | 喵評鑑` }],
    },
  }
}

export default async function BrandPage({ params }: { params: { brand: string } }) {
  const brandName = decodeURIComponent(params.brand)

  const { data: foods } = await supabase
    .from('cat_foods')
    .select('*')
    .ilike('brand', `%${brandName}%`)
    .order('score_total', { ascending: false })

  if (!foods || foods.length === 0) {
    return (
      <main className="min-h-screen" style={{ background: '#f5f5f7' }}>
        <Nav backHref="/" />
        <div className="max-w-2xl mx-auto px-4 pt-16 text-center text-gray-400">
          找不到「{brandName}」的飼料資料
        </div>
      </main>
    )
  }

  const avgScore = Math.round(foods.reduce((sum, f) => sum + (f.score_total ?? 0), 0) / foods.length)
  const topScore = foods[0].score_total ?? 0
  const grainFreeCount = foods.filter(f => !f.has_grain).length

  const itemListLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${brandName} 貓飼料評分列表`,
    itemListElement: foods.slice(0, 10).map((food, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: food.name,
      url: `https://meowpj.com/food/${food.id}`,
    })),
  }

  return (
    <main className="min-h-screen" style={{ background: '#f5f5f7' }}>
      <Nav backHref="/" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />

      <div className="max-w-2xl mx-auto px-4 pb-16">

        {/* Brand header */}
        <div className="rounded-3xl p-6 mt-4 mb-4" style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{brandName}</h1>
          <p className="text-sm text-gray-400 mb-4">喵評鑑收錄 {foods.length} 款飼料</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-3 rounded-2xl" style={{ background: '#f5f5f7' }}>
              <span className="text-2xl font-bold" style={{ color: ACCENT }}>{avgScore}</span>
              <span className="text-xs text-gray-400 mt-0.5">平均評分</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-2xl" style={{ background: '#f5f5f7' }}>
              <span className="text-2xl font-bold" style={{ color: ACCENT }}>{topScore}</span>
              <span className="text-xs text-gray-400 mt-0.5">最高評分</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-2xl" style={{ background: '#f5f5f7' }}>
              <span className="text-2xl font-bold" style={{ color: ACCENT }}>{grainFreeCount}</span>
              <span className="text-xs text-gray-400 mt-0.5">無穀款數</span>
            </div>
          </div>
        </div>

        {/* Food list */}
        <p className="text-xs font-semibold uppercase text-gray-400 mb-3" style={{ letterSpacing: '0.08em' }}>
          評分排行 <span className="font-normal normal-case">· {foods.length} 款</span>
        </p>

        <div className="flex flex-col gap-3">
          {foods.map(food => {
            const badge = getScoreBadge(food.score_total)
            const summary = typeof food.ai_summary === 'string'
              ? food.ai_summary.split(/[。！？]/)[0]
              : ''
            return (
              <Link
                key={food.id}
                href={`/food/${food.id}`}
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}
              >
                <div
                  className="w-16 h-16 rounded-full flex flex-col items-center justify-center shrink-0 font-bold"
                  style={{ background: badge.bg, color: badge.color }}
                >
                  <span style={{ fontSize: 22, lineHeight: 1.1 }}>{food.score_total ?? '–'}</span>
                  <span style={{ fontSize: 10, opacity: 0.7 }}>/ 100</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate mb-0.5" style={{ fontSize: 15 }}>{food.name}</p>
                  {summary && (
                    <p className="text-xs text-gray-500 mb-1.5 line-clamp-1">{summary}。</p>
                  )}
                  <div className="flex gap-1.5 flex-wrap">
                    {!food.has_grain && (
                      <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#e8f9ee', color: '#1a7f37' }}>無穀</span>
                    )}
                    {food.has_grain && (
                      <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#ffeaea', color: '#c0392b' }}>含穀</span>
                    )}
                    {food.is_aafco_certified && (
                      <span className="text-xs px-2 py-0.5 rounded-md font-semibold" style={{ background: '#3D5A3E', color: '#fff' }}>AAFCO</span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                      {LIFE_STAGE_LABEL[food.life_stage] ?? food.life_stage}
                    </span>
                  </div>
                </div>
                <svg width="16" height="16" fill="none" stroke="#d1d5db" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </Link>
            )
          })}
        </div>

        {/* Back to all */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm underline underline-offset-2" style={{ color: ACCENT }}>
            查看所有飼料評分 →
          </Link>
        </div>
      </div>
    </main>
  )
}
