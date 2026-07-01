import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import FoodDetailClient from './FoodDetailClient'

export const revalidate = 86400 // ISR：第一次點擊時建立快取，24小時後自動更新

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = getSupabase()
  const { data: food } = await supabase
    .from('cat_foods')
    .select('name, brand, score_total, score_label, protein_dm_pct, carb_dm_pct, ai_summary')
    .eq('id', params.id)
    .single()

  if (!food) return { title: '飼料評分 | 喵評鑑' }

  const summary = typeof food.ai_summary === 'string'
    ? food.ai_summary.split(/[。！？]/)[0]
    : ''

  const ogDesc = `${food.name}拿了 ${food.score_total} 分。蛋白質 ${food.protein_dm_pct?.toFixed(1) ?? '–'}%、碳水 ${food.carb_dm_pct?.toFixed(1) ?? '–'}%，評語在這裡。`
  const seoDesc = `${food.name}成分分析。蛋白質（乾重）${food.protein_dm_pct?.toFixed(1) ?? '–'}%、碳水${food.carb_dm_pct?.toFixed(1) ?? '–'}%，喵評鑑綜合評分 ${food.score_total} 分（${food.score_label}）。${summary ? summary + '。' : ''}喵評鑑 — 成分透明、科學評分。`

  return {
    title: `${food.name} 評分 ${food.score_total} 分 | 喵評鑑`,
    description: seoDesc.slice(0, 155),
    alternates: { canonical: `https://meowpj.com/food/${params.id}` },
    openGraph: {
      title: `${food.name} 評分 ${food.score_total} 分 | 喵評鑑`,
      description: ogDesc.slice(0, 100),
      url: `https://meowpj.com/food/${params.id}`,
      siteName: '喵評鑑',
      images: [{ url: '/logo.png', width: 512, height: 512, alt: food.name }],
    },
  }
}

export default async function FoodDetailPage({ params }: { params: { id: string } }) {
  const supabase = getSupabase()
  const [{ data: food }, { data: reviews }] = await Promise.all([
    supabase.from('cat_foods').select('*').eq('id', params.id).single(),
    supabase.from('reviews').select('id, nickname, rating, body, created_at')
      .eq('food_id', params.id).eq('status', 'approved')
      .order('created_at', { ascending: false }),
  ])

  if (!food) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-400">
        <p className="text-base">找不到此項目</p>
        <a href="/" className="text-sm font-semibold px-5 py-2.5 rounded-full text-white" style={{ background: '#1B3A5C' }}>
          返回首頁
        </a>
      </div>
    )
  }

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: food.name,
      brand: { '@type': 'Brand', name: food.brand },
      review: {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: String(food.score_total ?? 0),
          bestRating: '100',
          worstRating: '0',
        },
        author: { '@type': 'Organization', name: '喵評鑑' },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首頁', item: 'https://meowpj.com' },
        { '@type': 'ListItem', position: 2, name: food.brand, item: `https://meowpj.com/brand/${encodeURIComponent(food.brand)}` },
        { '@type': 'ListItem', position: 3, name: food.name, item: `https://meowpj.com/food/${food.id}` },
      ],
    },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd[0]) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd[1]) }} />
      <FoodDetailClient food={food} reviews={reviews ?? []} />
    </>
  )
}
