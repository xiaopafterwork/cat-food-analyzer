import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: '所有品牌 | 喵評鑑',
  description: '台灣常見貓飼料品牌一覽，點選品牌查看旗下所有飼料的成分分析與評分。',
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ACCENT = '#3D5A3E'

function getScoreColor(score: number) {
  if (score >= 80) return '#1a7f37'
  if (score >= 65) return '#1554a0'
  if (score >= 50) return '#b35c00'
  return '#c0392b'
}

export default async function BrandsPage() {
  const { data: foods } = await supabase
    .from('cat_foods')
    .select('brand, score_total')

  if (!foods) return null

  // 每個品牌的統計
  const brandMap: Record<string, { count: number; scores: number[] }> = {}
  for (const f of foods) {
    const b = f.brand || '其他'
    if (!brandMap[b]) brandMap[b] = { count: 0, scores: [] }
    brandMap[b].count++
    if (f.score_total != null) brandMap[b].scores.push(f.score_total)
  }

  const brands = Object.entries(brandMap)
    .map(([name, { count, scores }]) => ({
      name,
      count,
      avgScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      topScore: scores.length ? Math.max(...scores) : 0,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)

  return (
    <main className="min-h-screen" style={{ background: '#f5f5f7' }}>
      <Nav backHref="/" />

      <div className="max-w-2xl mx-auto px-4 pb-16">
        <div className="pt-6 pb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">所有品牌</h1>
          <p className="text-sm text-gray-400">共 {brands.length} 個品牌・{foods.length} 款飼料</p>
        </div>

        <div className="flex flex-col gap-2">
          {brands.map(brand => (
            <Link
              key={brand.name}
              href={`/brand/${encodeURIComponent(brand.name)}`}
              className="flex items-center justify-between p-4 rounded-2xl"
              style={{ background: '#fff', border: '0.5px solid #e5e7eb' }}
            >
              <div>
                <p className="font-semibold text-gray-900 mb-0.5">{brand.name}</p>
                <p className="text-xs text-gray-400">{brand.count} 款飼料</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-400 mb-0.5">平均分</p>
                  <p className="font-bold text-lg leading-none" style={{ color: getScoreColor(brand.avgScore) }}>
                    {brand.avgScore}
                  </p>
                </div>
                <svg width="16" height="16" fill="none" stroke="#d1d5db" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm underline underline-offset-2" style={{ color: ACCENT }}>
            查看所有飼料評分 →
          </Link>
        </div>
      </div>
    </main>
  )
}
